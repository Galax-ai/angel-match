// ─────────────────────────────────────────────────────────────────────────
// Integration seams.
//
// Everything here is a STUB for the v1 front-end build. The signatures are the
// contract the next pass implements; the UI already calls these so wiring a
// real backend is a swap, not a refactor. Nothing here persists or transmits
// data in this build.
//
// HIPAA: the moment any of these touch client-identifying health data, they
// must run server-side against BAA-covered infrastructure. The quiz answers
// that flow through the app today are in-memory preferences only (see
// QuizContext) and are deliberately never sent anywhere.
// ─────────────────────────────────────────────────────────────────────────

import type {
  QuizAnswers,
  Concern,
  Modality,
  ValueTag,
  DeliveryPref,
  GenderPref,
  ValuesImportance,
  MatchResult,
} from './types';

// ── Free-text intake → structured preferences (Claude Fable 5) ───────────────
// The ONE seam here that is already wired to a real backend: a person can
// describe what they want in their own words instead of clicking through the
// quiz, and Fable 5 maps it onto the same controlled vocabulary the quiz uses
// (see netlify/functions/parse-intake.mts). The model only PARSES — the
// deterministic matcher (lib/match.ts) is unchanged. Because free narrative is
// closer to health data than the fixed-choice answers, the model call runs
// server-side; the browser only ever sends the text and receives a partial set
// of quiz answers back.

const CONCERN_SET = new Set<Concern>([
  'anxiety', 'depression', 'trauma', 'relationships', 'grief',
  'stress-burnout', 'identity', 'addiction', 'eating', 'family',
]);
const MODALITY_SET = new Set<Modality>([
  'CBT', 'DBT', 'EMDR', 'Psychodynamic', 'ACT', 'IFS',
  'Person-Centered', 'Mindfulness', 'Couples', 'Faith-Based',
]);
const VALUE_SET = new Set<ValueTag>([
  'secular', 'christian', 'jewish', 'muslim', 'buddhist', 'lds',
  'lgbtq-affirming', 'culturally-responsive', 'veteran-informed',
]);
const SCHEDULING_SET = new Set<QuizAnswers['scheduling'][number]>([
  'weekday-daytime', 'evenings', 'weekends', 'flexible',
]);

export interface ParseIntakeResult {
  ok: boolean;
  /** Only the fields the model could infer; merge with update(). */
  answers?: Partial<QuizAnswers>;
  /** Present when ok is false; safe to show the user. */
  error?: string;
  /** True when the feature isn't configured (no API key) — fall back silently. */
  unconfigured?: boolean;
}

/** Keep only valid enum members, so bad data can never reach the matcher. */
function keepValid<T>(input: unknown, valid: Set<T>): T[] {
  if (!Array.isArray(input)) return [];
  return input.filter((v): v is T => valid.has(v as T));
}

/**
 * Send a free-text description to the server-side Fable 5 parser and get back a
 * partial set of quiz answers. Defensively validated client-side: every value
 * is re-checked against the allowed vocabulary and the budget is clamped to the
 * quiz's slider range, so a surprising payload degrades to "fewer fields filled"
 * rather than a broken quiz.
 */
export async function parseIntake(text: string): Promise<ParseIntakeResult> {
  let res: Response;
  try {
    res = await fetch('/.netlify/functions/parse-intake', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch {
    return { ok: false, error: 'Couldn’t reach the intake parser.' };
  }

  if (res.status === 503) {
    return { ok: false, unconfigured: true };
  }

  let payload: { ok?: boolean; answers?: Record<string, unknown>; error?: string };
  try {
    payload = await res.json();
  } catch {
    return { ok: false, error: 'Unexpected response from the intake parser.' };
  }

  if (!res.ok || !payload.ok || !payload.answers) {
    return { ok: false, error: payload.error ?? 'Couldn’t read that.' };
  }

  const raw = payload.answers;
  const answers: Partial<QuizAnswers> = {};

  answers.concerns = keepValid<Concern>(raw.concerns, CONCERN_SET);
  answers.modalities = keepValid<Modality>(raw.modalities, MODALITY_SET);
  answers.values = keepValid<ValueTag>(raw.values, VALUE_SET);
  answers.scheduling = keepValid(raw.scheduling, SCHEDULING_SET);

  if (
    raw.valuesImportance === 'essential' ||
    raw.valuesImportance === 'preferred' ||
    raw.valuesImportance === 'no-preference'
  ) {
    answers.valuesImportance = raw.valuesImportance as ValuesImportance;
  }
  if (['in-person', 'remote', 'mobile', 'no-preference'].includes(raw.delivery as string)) {
    answers.delivery = raw.delivery as DeliveryPref;
  }
  if (['female', 'male', 'nonbinary', 'no-preference'].includes(raw.genderPref as string)) {
    answers.genderPref = raw.genderPref as GenderPref;
  }

  if (typeof raw.budgetMax === 'number' && Number.isFinite(raw.budgetMax)) {
    answers.budgetMax = Math.min(300, Math.max(60, Math.round(raw.budgetMax / 10) * 10));
  }
  if (typeof raw.usesInsurance === 'boolean') answers.usesInsurance = raw.usesInsurance;
  if (typeof raw.insurance === 'string') answers.insurance = raw.insurance.slice(0, 60);
  if (typeof raw.city === 'string') answers.city = raw.city.slice(0, 60);
  if (typeof raw.state === 'string') {
    answers.state = raw.state.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  }

  return { ok: true, answers };
}

// ── Match breakdown → plain-language summary (Claude Haiku 4.5) ──────────────
// A supplement to the transparent breakdown, not a replacement: the matcher
// (lib/match.ts) computes the authoritative score and factors, and this only
// narrates them into one warm sentence ("you matched here because…"). The score
// and factors shown in the UI come straight from the matcher — the model never
// changes the number. Runs server-side (see netlify/functions/narrate-match.mts)
// to keep the API key off the client; degrades silently when unconfigured.

export interface NarrateMatchResult {
  ok: boolean;
  /** The plain-language paragraph; present when ok. */
  summary?: string;
  /** Present when ok is false; safe to show or (usually) ignore. */
  error?: string;
  /** True when the feature isn't configured (no API key) — omit silently. */
  unconfigured?: boolean;
}

/**
 * Ask the server-side Haiku summarizer to describe why a therapist matched,
 * given the deterministic result. The result object is the matcher's output;
 * we send only the score and the (already user-facing) factor breakdown — never
 * identifying data. A failure is non-fatal: the breakdown still renders on its
 * own, so callers can drop the summary on any error.
 */
export async function narrateMatch(match: MatchResult): Promise<NarrateMatchResult> {
  let res: Response;
  try {
    res = await fetch('/.netlify/functions/narrate-match', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        therapistName: match.therapist.name,
        score: match.score,
        factors: match.factors.map((f) => ({
          label: f.label,
          earned: f.earned,
          possible: f.possible,
          hit: f.hit,
          detail: f.detail,
        })),
      }),
    });
  } catch {
    return { ok: false, error: 'Couldn’t reach the summarizer.' };
  }

  if (res.status === 503) {
    return { ok: false, unconfigured: true };
  }

  let payload: { ok?: boolean; summary?: string; error?: string };
  try {
    payload = await res.json();
  } catch {
    return { ok: false, error: 'Unexpected response from the summarizer.' };
  }

  if (!res.ok || !payload.ok || typeof payload.summary !== 'string') {
    return { ok: false, error: payload.error ?? 'Couldn’t summarize this match.' };
  }

  return { ok: true, summary: payload.summary };
}

// ── Auth (Supabase is already a dependency; wire real auth here) ─────────────
// SEAM: import { createClient } from '@supabase/supabase-js' and gate booking,
// saved matches, and the provider dashboard behind a session.
export interface AuthSeam {
  signInWithEmail(email: string): Promise<void>;
  signOut(): Promise<void>;
}

// ── Booking / calendar sync (Google Calendar, Cal.com, etc.) ─────────────────
export interface BookingRequest {
  therapistId: string;
  /** Preferred contact — collected only with explicit consent, server-side. */
  contactEmail?: string;
  note?: string;
}

/** Stub: today this just resolves. Real impl creates a hold + calendar event. */
export async function requestBooking(req: BookingRequest): Promise<{ ok: boolean }> {
  // SEAM: POST to a BAA-covered endpoint that checks real availability and
  // creates a tentative calendar event (Google Calendar / Outlook / Cal.com).
  console.info('[stub] requestBooking', req);
  return { ok: true };
}

/** Join the early-access waitlist for booking (no PHI collected). */
export async function joinWaitlist(input: {
  therapistId: string;
  email: string;
}): Promise<{ ok: boolean }> {
  // SEAM: store email against an interest list (BAA-covered). For now: no-op.
  console.info('[stub] joinWaitlist', input);
  return { ok: true };
}

// ── Payments (Stripe) ────────────────────────────────────────────────────────
// SEAM: VITE_STRIPE_PUBLISHABLE_KEY is already in .env.example. Provider
// premium tiers and (later) session payments attach here.
export type ProviderTier = 'free' | 'verified' | 'featured';

export async function startProviderCheckout(tier: ProviderTier): Promise<{ url: string | null }> {
  console.info('[stub] startProviderCheckout', tier);
  return { url: null };
}

// ── Provider lead capture + notifications (email / SMS / Slack — their choice) ─
export interface ProviderLead {
  name: string;
  email: string;
  practice: string;
  state: string;
  specialties: string;
  notifyVia: 'email' | 'sms' | 'slack';
}

export async function submitProviderLead(lead: ProviderLead): Promise<{ ok: boolean }> {
  // SEAM: persist the lead and notify the provider via their chosen channel.
  console.info('[stub] submitProviderLead', lead);
  return { ok: true };
}

// ── Matching backend ─────────────────────────────────────────────────────────
// Today matching runs fully client-side over mock data (see lib/match.ts), so
// quiz preferences never leave the browser. SEAM: when scoring moves server-
// side (to use private provider data or learned weights), send only the minimal
// preference payload below — never identifying health data — over a BAA-covered
// channel.
export type MatchRequestPayload = Pick<
  QuizAnswers,
  'concerns' | 'modalities' | 'values' | 'valuesImportance' | 'delivery' | 'state'
>;
