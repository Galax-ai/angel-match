// ─────────────────────────────────────────────────────────────────────────
// narrate-match — turn a deterministic match breakdown into one warm sentence.
//
// The matcher (src/lib/match.ts) is the source of truth: it computes the score
// and the per-factor breakdown. This function does NOT score, re-weight, or
// decide anything — it only renders the numbers it is handed into plain
// language ("you matched here because… one thing to ask about is…"). The score
// and factors are passed in and echoed back by the UI unchanged; the model is
// explicitly told it may not invent facts or contradict the numbers.
//
// Model: Claude Haiku 4.5 — this is short, structured-input → short-prose
// generation, the cheap end of the model range (a frontier model would be
// wasteful here; the intake PARSER is the one spot that earns Fable 5). Haiku
// 4.5 does not support the `effort` parameter and runs without a `thinking`
// block — a plain Messages call.
//
// No PHI: the payload is an anonymized compatibility score and factor labels
// derived from in-memory quiz *preferences* — the same risk class as the
// client-side matcher. It still runs server-side so the ANTHROPIC_API_KEY never
// reaches the browser. We do not log the payload.
// ─────────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';

interface FactorInput {
  label: string;
  earned: number;
  possible: number;
  hit: boolean;
  detail: string;
}

const SYSTEM = `You write ONE short, warm paragraph explaining why a therapist fits a person's stated preferences, working only from a compatibility score and its factor breakdown that you are given.

Rules:
- Use only the facts in the breakdown. Never invent specialties, credentials, availability, prices, or numbers that aren't provided.
- The score is authoritative. Refer to it naturally; never recompute it or imply a different number.
- Lead with what fit well (the factors that earned all or most of their points). Then, if a factor earned little or none, mention it once, gently, as "something to check" or "worth asking about" — not as a flaw or a warning.
- 2 to 3 sentences. Address the person as "you". No preamble, no bullet points, no markdown, no headings.
- Warm and clear, not salesy. Do not use the therapist's name more than once.
- This describes preference fit only. Do not give clinical, therapeutic, or medical advice, and do not call it a recommendation.`;

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Not configured — the UI treats this as "feature off" and simply omits the
    // summary, so it's a soft failure, not an error.
    return json({ ok: false, error: 'unconfigured' }, 503);
  }

  let therapistName: string;
  let score: number;
  let factors: FactorInput[];
  try {
    const body = (await req.json()) as {
      therapistName?: unknown;
      score?: unknown;
      factors?: unknown;
    };
    therapistName = typeof body.therapistName === 'string' ? body.therapistName.slice(0, 80) : '';
    score = typeof body.score === 'number' && Number.isFinite(body.score) ? body.score : NaN;
    factors = Array.isArray(body.factors)
      ? (body.factors as unknown[]).slice(0, 12).map(coerceFactor).filter((f): f is FactorInput => f !== null)
      : [];
  } catch {
    return json({ ok: false, error: 'Invalid request body' }, 400);
  }

  if (!therapistName || Number.isNaN(score) || factors.length === 0) {
    return json({ ok: false, error: 'Missing score or breakdown.' }, 400);
  }

  const userContent = JSON.stringify({
    therapist: therapistName,
    overallScore: Math.round(score),
    factors: factors.map((f) => ({
      factor: f.label,
      earned: f.earned,
      possible: f.possible,
      fit: f.hit ? 'strong' : 'partial-or-none',
      note: f.detail,
    })),
  });

  const client = new Anthropic({ apiKey });

  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      system: SYSTEM,
      messages: [{ role: 'user', content: userContent }],
    });
  } catch (err) {
    const status = err instanceof Anthropic.APIError ? err.status ?? 502 : 502;
    return json({ ok: false, error: 'The match summary is unavailable right now.' }, status);
  }

  // Claude 4+ can decline via a safety classifier — a 200 with stop_reason
  // "refusal". Check before reading content.
  if (message.stop_reason === 'refusal') {
    return json({ ok: false, error: 'Couldn’t summarize this match.' }, 422);
  }

  const summary = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  if (!summary) {
    return json({ ok: false, error: 'No summary.' }, 502);
  }

  return json({ ok: true, summary });
};

/** Keep a factor only if it has the shape the prompt expects. */
function coerceFactor(input: unknown): FactorInput | null {
  if (typeof input !== 'object' || input === null) return null;
  const f = input as Record<string, unknown>;
  if (
    typeof f.label !== 'string' ||
    typeof f.earned !== 'number' ||
    typeof f.possible !== 'number' ||
    typeof f.hit !== 'boolean' ||
    typeof f.detail !== 'string'
  ) {
    return null;
  }
  return {
    label: f.label.slice(0, 80),
    earned: f.earned,
    possible: f.possible,
    hit: f.hit,
    detail: f.detail.slice(0, 200),
  };
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
