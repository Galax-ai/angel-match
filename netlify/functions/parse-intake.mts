// ─────────────────────────────────────────────────────────────────────────
// parse-intake — server-side free-text → structured quiz preferences.
//
// This is the first real backend seam in TherapyScore (everything in
// src/lib/integrations.ts is still a stub). It takes a sentence or two a
// person types in their own words ("anxious since a breakup, want someone
// faith-aware, evenings, on BCBS") and maps it onto the SAME controlled
// vocabulary the multiple-choice quiz uses, so the existing deterministic
// matcher (src/lib/match.ts) runs unchanged afterward. The model parses; it
// never scores and never diagnoses.
//
// Why this lives server-side (and not in the browser like the quiz):
//   HIPAA — free narrative is far closer to client health information than the
//   fixed-choice quiz answers, which are in-memory preferences. The model call
//   and the ANTHROPIC_API_KEY stay on the server. We deliberately DO NOT log
//   the intake text. For production this Function must run on BAA-covered
//   infrastructure before it touches identifiable client data.
//
// Model: Claude Fable 5 — thinking is always on (no `thinking` param), no
// sampling params, depth via output_config.effort, and structured outputs
// guarantee the JSON matches the schema below. Requires 30-day data retention
// (Fable 5 is not available under zero-data-retention).
// ─────────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';

// The controlled vocabulary — kept in sync with src/lib/types.ts. Duplicated
// here (not imported) so the Function bundles independently of the React app.
const CONCERNS = [
  'anxiety', 'depression', 'trauma', 'relationships', 'grief',
  'stress-burnout', 'identity', 'addiction', 'eating', 'family',
] as const;
const MODALITIES = [
  'CBT', 'DBT', 'EMDR', 'Psychodynamic', 'ACT', 'IFS',
  'Person-Centered', 'Mindfulness', 'Couples', 'Faith-Based',
] as const;
const VALUES = [
  'secular', 'christian', 'jewish', 'muslim', 'buddhist', 'lds',
  'lgbtq-affirming', 'culturally-responsive', 'veteran-informed',
] as const;
const SCHEDULING = ['weekday-daytime', 'evenings', 'weekends', 'flexible'] as const;

// Structured-output schema. Every field is required with a natural "unknown"
// representation (empty array, or the same sentinels the quiz uses:
// 'no-preference' / '' / false), so the result drops straight into the quiz's
// update(partial) call with no null handling. budgetMax is plain integer
// (structured outputs don't support numeric min/max — we clamp client-side).
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    concerns: { type: 'array', items: { type: 'string', enum: CONCERNS } },
    modalities: { type: 'array', items: { type: 'string', enum: MODALITIES } },
    valuesImportance: { type: 'string', enum: ['essential', 'preferred', 'no-preference'] },
    values: { type: 'array', items: { type: 'string', enum: VALUES } },
    budgetMax: { type: 'integer' },
    usesInsurance: { type: 'boolean' },
    insurance: { type: 'string' },
    city: { type: 'string' },
    state: { type: 'string' },
    delivery: { type: 'string', enum: ['in-person', 'remote', 'mobile', 'no-preference'] },
    genderPref: { type: 'string', enum: ['female', 'male', 'nonbinary', 'no-preference'] },
    scheduling: { type: 'array', items: { type: 'string', enum: SCHEDULING } },
  },
  required: [
    'concerns', 'modalities', 'valuesImportance', 'values', 'budgetMax',
    'usesInsurance', 'insurance', 'city', 'state', 'delivery', 'genderPref',
    'scheduling',
  ],
} as const;

const SYSTEM = `You map a person's free-text description of what they're looking for in a therapist onto a fixed set of preference fields. This powers an intake shortcut: the structured result pre-fills a matching quiz that the person then reviews and edits.

Rules:
- Only set a field when the text clearly supports it. When something isn't mentioned, use its "unknown" default: empty array for lists; 'no-preference' for valuesImportance, delivery, and genderPref; '' for insurance, city, state; false for usesInsurance; and 200 for budgetMax.
- Map to the closest item(s) in the allowed vocabulary. "Panic attacks" → anxiety. "Can't get over my divorce" → grief and/or relationships. "Someone who shares my faith" → set valuesImportance and the matching value tag. Don't invent specifics the person didn't say.
- 'state' is a two-letter US state code only if the person names their state; otherwise ''.
- usesInsurance is true only if they mention using insurance or name a plan; put the plan name (e.g. "Blue Cross Blue Shield", "Aetna") in 'insurance'.
- You are extracting stated preferences, not assessing or diagnosing anyone. Do not infer a clinical condition the person didn't describe.`;

interface IntakeResult {
  concerns: string[];
  modalities: string[];
  valuesImportance: string;
  values: string[];
  budgetMax: number;
  usesInsurance: boolean;
  insurance: string;
  city: string;
  state: string;
  delivery: string;
  genderPref: string;
  scheduling: string[];
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Not configured — the UI treats this as "feature off" and falls back to
    // the manual quiz, so it's a soft failure, not an error.
    return json({ ok: false, error: 'unconfigured' }, 503);
  }

  let text: string;
  try {
    const body = (await req.json()) as { text?: unknown };
    text = typeof body.text === 'string' ? body.text.trim() : '';
  } catch {
    return json({ ok: false, error: 'Invalid request body' }, 400);
  }

  if (text.length < 3) {
    return json({ ok: false, error: 'Please describe what you’re looking for.' }, 400);
  }
  // Bound input; this is an intake blurb, not a document.
  if (text.length > 2000) text = text.slice(0, 2000);

  const client = new Anthropic({ apiKey });

  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model: 'claude-fable-5',
      max_tokens: 1024,
      // Fable 5: omit `thinking` (always on); control depth via effort.
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: SCHEMA },
      },
      system: SYSTEM,
      messages: [{ role: 'user', content: text }],
    });
  } catch (err) {
    const status = err instanceof Anthropic.APIError ? err.status ?? 502 : 502;
    return json({ ok: false, error: 'The intake parser is unavailable right now.' }, status);
  }

  // Fable 5 can decline via a safety classifier — a 200 with stop_reason
  // "refusal". Check before reading content.
  if (message.stop_reason === 'refusal') {
    return json({ ok: false, error: 'We couldn’t read that — try the quiz instead.' }, 422);
  }

  const textBlock = message.content.find(
    (b): b is Anthropic.TextBlock => b.type === 'text',
  );
  if (!textBlock) {
    return json({ ok: false, error: 'No result.' }, 502);
  }

  let answers: IntakeResult;
  try {
    answers = JSON.parse(textBlock.text) as IntakeResult;
  } catch {
    return json({ ok: false, error: 'Could not parse the result.' }, 502);
  }

  return json({ ok: true, answers });
};

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
