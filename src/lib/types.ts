// ─────────────────────────────────────────────────────────────────────────
// Domain types for AngelMatch.
//
// IMPORTANT (HIPAA): nothing in this module is PHI. Therapist records are
// public directory data. Quiz answers are *preferences*, held in memory only
// (see QuizContext) — they are never persisted or transmitted in this build.
// When a real backend attaches, anything derived from a logged-in client must
// be treated as PHI and stored only in BAA-covered infrastructure.
// ─────────────────────────────────────────────────────────────────────────

/** What a person is primarily seeking help with. */
export type Concern =
  | 'anxiety'
  | 'depression'
  | 'trauma'
  | 'relationships'
  | 'grief'
  | 'stress-burnout'
  | 'identity'
  | 'addiction'
  | 'eating'
  | 'family';

/** Therapeutic approaches / modalities. */
export type Modality =
  | 'CBT'
  | 'DBT'
  | 'EMDR'
  | 'Psychodynamic'
  | 'ACT'
  | 'IFS'
  | 'Person-Centered'
  | 'Mindfulness'
  | 'Couples'
  | 'Faith-Based';

/** How sessions are delivered. */
export type Delivery = 'in-person' | 'remote' | 'mobile';

/** Optional values / faith alignment — a genuinely underserved match dimension. */
export type ValueTag =
  | 'secular'
  | 'christian'
  | 'jewish'
  | 'muslim'
  | 'buddhist'
  | 'lds'
  | 'lgbtq-affirming'
  | 'culturally-responsive'
  | 'veteran-informed';

export type Gender = 'female' | 'male' | 'nonbinary';

export interface Credential {
  /** e.g. "LCSW", "PsyD", "LMFT", "LPC" */
  abbrev: string;
  /** Full title, e.g. "Licensed Clinical Social Worker" */
  label: string;
}

export interface AvailabilitySlot {
  day: string; // "Mon"
  times: string[]; // ["9:00 AM", "4:30 PM"]
}

export interface Therapist {
  id: string;
  name: string;
  pronouns: string;
  gender: Gender;
  /** Headshot — initials avatar is generated from the name; photoUrl optional. */
  photoUrl?: string;
  credentials: Credential[];
  /** State license — shown with a verified badge in the directory. */
  licenseNumber: string;
  licenseState: string;
  /** True once AngelMatch has verified the license + malpractice coverage. */
  verified: boolean;
  yearsExperience: number;
  headline: string; // one-line positioning
  bio: string;
  city: string;
  state: string;
  concerns: Concern[];
  modalities: Modality[];
  delivery: Delivery[];
  values: ValueTag[];
  /** Insurance networks accepted; "Self-pay" always implied. */
  insurance: string[];
  /** Out-of-pocket session rate in USD (sliding-scale floor). */
  sessionRate: number;
  slidingScale: boolean;
  acceptingClients: boolean;
  /** Soonest bookable, human-readable, e.g. "This week". */
  nextAvailable: string;
  availability: AvailabilitySlot[];
  languages: string[];
  rating: number; // 0–5, directory rating (not a match score)
  reviewCount: number;
}

// ── Quiz ───────────────────────────────────────────────────────────────────

export type DeliveryPref = Delivery | 'no-preference';
export type GenderPref = Gender | 'no-preference';
export type ValuesImportance = 'essential' | 'preferred' | 'no-preference';

export interface QuizAnswers {
  concerns: Concern[];
  modalities: Modality[]; // may be empty → "help me choose"
  valuesImportance: ValuesImportance;
  values: ValueTag[]; // only meaningful when importance !== 'no-preference'
  budgetMax: number; // max per-session out-of-pocket they'll consider
  usesInsurance: boolean;
  insurance: string; // network name when usesInsurance
  city: string;
  state: string;
  delivery: DeliveryPref;
  genderPref: GenderPref;
  scheduling: ('weekday-daytime' | 'evenings' | 'weekends' | 'flexible')[];
}

/** The empty quiz, used to seed in-memory state. */
export const emptyAnswers: QuizAnswers = {
  concerns: [],
  modalities: [],
  valuesImportance: 'no-preference',
  values: [],
  budgetMax: 200,
  usesInsurance: false,
  insurance: '',
  city: '',
  state: '',
  delivery: 'no-preference',
  genderPref: 'no-preference',
  scheduling: [],
};

// ── Match result ─────────────────────────────────────────────────────────────

/** One scored, human-readable reason a therapist did (or didn't) fit. */
export interface MatchFactor {
  label: string;
  /** Points earned on this factor. */
  earned: number;
  /** Points possible on this factor. */
  possible: number;
  /** Short explanation surfaced in the UI for transparency. */
  detail: string;
  hit: boolean;
}

export interface MatchResult {
  therapist: Therapist;
  /** 0–100 compatibility score — the signature number. */
  score: number;
  factors: MatchFactor[];
}
