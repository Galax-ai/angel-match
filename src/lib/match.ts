import type {
  MatchFactor,
  MatchResult,
  QuizAnswers,
  Therapist,
  ValueTag,
} from './types';
import { therapists } from './therapists';

// ─────────────────────────────────────────────────────────────────────────
// The match algorithm.
//
// This is intentionally a transparent, explainable weighted function — NOT a
// black box. Each dimension contributes a fixed number of possible points;
// the sum of `possible` across all factors is 100, so the final score reads
// directly as a "% match". Every factor returns a human-readable `detail`
// string that the UI surfaces, so a user (or therapist) can always see *why*
// a score is what it is.
//
// When a user expresses "no preference" on a dimension, that dimension awards
// full credit — it neither helps nor hurts any therapist, which keeps the
// remaining factors meaningful.
//
// SEAM: a future version could learn weights from outcome data (kept-booking,
// retention) behind a BAA-covered service. The interface — (answers,
// therapist) → {score, factors} — should stay identical so the UI is unchanged.
// ─────────────────────────────────────────────────────────────────────────

const WEIGHTS = {
  concerns: 32,
  modalities: 14,
  values: 20,
  cost: 16,
  delivery: 10,
  availability: 8,
} as const;

const VALUE_LABELS: Record<ValueTag, string> = {
  secular: 'Secular',
  christian: 'Christian',
  jewish: 'Jewish',
  muslim: 'Muslim',
  buddhist: 'Buddhist',
  lds: 'Latter-day Saints',
  'lgbtq-affirming': 'LGBTQ+ affirming',
  'culturally-responsive': 'Culturally responsive',
  'veteran-informed': 'Veteran-informed',
};

function round(n: number): number {
  return Math.round(n);
}

/** Does the therapist's insurance list plausibly include the user's network? */
function takesInsurance(t: Therapist, network: string): boolean {
  const n = network.trim().toLowerCase();
  if (!n) return false;
  return t.insurance.some((ins) => ins.toLowerCase().includes(n) || n.includes(ins.toLowerCase()));
}

function takesOutOfNetwork(t: Therapist): boolean {
  return t.insurance.some((ins) => /out-of-network|self-pay/i.test(ins));
}

// ── Per-dimension scorers ────────────────────────────────────────────────────

function scoreConcerns(a: QuizAnswers, t: Therapist): MatchFactor {
  const possible = WEIGHTS.concerns;
  if (a.concerns.length === 0) {
    return {
      label: 'What you’re seeking',
      earned: possible,
      possible,
      hit: true,
      detail: 'No specific focus selected — scored neutrally.',
    };
  }
  const matched = a.concerns.filter((c) => t.concerns.includes(c));
  const frac = matched.length / a.concerns.length;
  const earned = round(possible * frac);
  return {
    label: 'What you’re seeking',
    earned,
    possible,
    hit: frac >= 0.5,
    detail:
      matched.length === 0
        ? 'Works in adjacent areas, but not your main focus.'
        : `Specializes in ${matched.length} of your ${a.concerns.length} focus area${a.concerns.length > 1 ? 's' : ''}.`,
  };
}

function scoreModalities(a: QuizAnswers, t: Therapist): MatchFactor {
  const possible = WEIGHTS.modalities;
  if (a.modalities.length === 0) {
    return {
      label: 'Therapy approach',
      earned: possible,
      possible,
      hit: true,
      detail: 'You asked us to help choose — scored neutrally.',
    };
  }
  const matched = a.modalities.filter((m) => t.modalities.includes(m));
  const frac = matched.length / a.modalities.length;
  const earned = round(possible * frac);
  return {
    label: 'Therapy approach',
    earned,
    possible,
    hit: frac > 0,
    detail:
      matched.length === 0
        ? 'Uses different approaches than you preferred.'
        : `Offers ${matched.join(', ')}.`,
  };
}

function scoreValues(a: QuizAnswers, t: Therapist): MatchFactor {
  const possible = WEIGHTS.values;
  if (a.valuesImportance === 'no-preference' || a.values.length === 0) {
    return {
      label: 'Values & faith alignment',
      earned: possible,
      possible,
      hit: true,
      detail: 'No values preference set — scored neutrally.',
    };
  }
  const matched = a.values.filter((v) => t.values.includes(v));
  const frac = matched.length / a.values.length;
  const matchedLabels = matched.map((v) => VALUE_LABELS[v]).join(', ');

  if (a.valuesImportance === 'essential') {
    const earned = round(possible * frac);
    return {
      label: 'Values & faith alignment',
      earned,
      possible,
      hit: frac > 0,
      detail:
        frac === 0
          ? 'Marked essential, but no shared values listed.'
          : frac === 1
            ? `Fully aligned: ${matchedLabels}.`
            : `Partly aligned: ${matchedLabels}.`,
    };
  }
  // 'preferred' — a miss is softened (still earns a base), a hit is rewarded.
  const earned = round(8 + 12 * frac);
  return {
    label: 'Values & faith alignment',
    earned,
    possible,
    hit: frac > 0,
    detail:
      frac === 0
        ? 'No shared values listed, but you marked this a preference, not a must.'
        : `Shares ${matchedLabels}.`,
  };
}

function scoreCost(a: QuizAnswers, t: Therapist): MatchFactor {
  const possible = WEIGHTS.cost;
  if (a.usesInsurance && a.insurance) {
    if (takesInsurance(t, a.insurance)) {
      return {
        label: 'Cost & insurance',
        earned: possible,
        possible,
        hit: true,
        detail: `In-network with ${a.insurance}.`,
      };
    }
    if (takesOutOfNetwork(t)) {
      return {
        label: 'Cost & insurance',
        earned: round(possible * 0.5),
        possible,
        hit: false,
        detail: `Not in ${a.insurance}, but offers out-of-network (superbill).`,
      };
    }
    return {
      label: 'Cost & insurance',
      earned: round(possible * 0.15),
      possible,
      hit: false,
      detail: `Doesn’t take ${a.insurance}.`,
    };
  }

  // Self-pay: compare effective rate to budget.
  const effectiveRate = t.slidingScale ? Math.round(t.sessionRate * 0.7) : t.sessionRate;
  if (effectiveRate <= a.budgetMax) {
    return {
      label: 'Cost & budget',
      earned: possible,
      possible,
      hit: true,
      detail: t.slidingScale
        ? `Sliding scale fits your $${a.budgetMax} budget.`
        : `$${t.sessionRate}/session is within your $${a.budgetMax} budget.`,
    };
  }
  const ratio = Math.max(0, Math.min(1, a.budgetMax / effectiveRate));
  return {
    label: 'Cost & budget',
    earned: round(possible * ratio),
    possible,
    hit: false,
    detail: `$${t.sessionRate}/session is above your $${a.budgetMax} budget${
      t.slidingScale ? ' (sliding scale may help)' : ''
    }.`,
  };
}

function scoreDelivery(a: QuizAnswers, t: Therapist): MatchFactor {
  const possible = WEIGHTS.delivery;
  const sameState = !a.state || a.state.toLowerCase() === t.state.toLowerCase();

  if (a.delivery === 'no-preference') {
    const ok = t.delivery.includes('remote') || sameState;
    return {
      label: 'How you meet',
      earned: ok ? possible : round(possible * 0.6),
      possible,
      hit: ok,
      detail: ok ? 'Offers a format that works for you.' : `Based in ${t.city}, ${t.state}.`,
    };
  }

  if (a.delivery === 'remote') {
    const ok = t.delivery.includes('remote');
    return {
      label: 'How you meet',
      earned: ok ? possible : 0,
      possible,
      hit: ok,
      detail: ok ? 'Sees clients remotely.' : 'In-person only.',
    };
  }

  // in-person or mobile — needs the format AND (for those) the right area.
  const offersFormat = t.delivery.includes(a.delivery);
  if (offersFormat && sameState) {
    return {
      label: 'How you meet',
      earned: possible,
      possible,
      hit: true,
      detail: `Offers ${a.delivery} sessions in ${t.city}, ${t.state}.`,
    };
  }
  if (offersFormat) {
    return {
      label: 'How you meet',
      earned: round(possible * 0.3),
      possible,
      hit: false,
      detail: `Offers ${a.delivery}, but is in ${t.state} (you’re in ${a.state}).`,
    };
  }
  return {
    label: 'How you meet',
    earned: 0,
    possible,
    hit: false,
    detail: `Doesn’t offer ${a.delivery} sessions.`,
  };
}

function scoreAvailability(_a: QuizAnswers, t: Therapist): MatchFactor {
  const possible = WEIGHTS.availability;
  if (!t.acceptingClients) {
    return {
      label: 'Availability',
      earned: 0,
      possible,
      hit: false,
      detail: 'Not accepting new clients — waitlist only.',
    };
  }
  const earned =
    t.nextAvailable === 'This week' ? possible : t.nextAvailable === 'Next week' ? round(possible * 0.75) : round(possible * 0.5);
  return {
    label: 'Availability',
    earned,
    possible,
    hit: t.nextAvailable === 'This week',
    detail: `Next opening: ${t.nextAvailable.toLowerCase()}.`,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Score a single therapist against the quiz answers. */
export function scoreTherapist(answers: QuizAnswers, therapist: Therapist): MatchResult {
  const factors: MatchFactor[] = [
    scoreConcerns(answers, therapist),
    scoreModalities(answers, therapist),
    scoreValues(answers, therapist),
    scoreCost(answers, therapist),
    scoreDelivery(answers, therapist),
    scoreAvailability(answers, therapist),
  ];
  const earned = factors.reduce((s, f) => s + f.earned, 0);
  const possible = factors.reduce((s, f) => s + f.possible, 0);
  const score = Math.max(0, Math.min(100, round((earned / possible) * 100)));
  return { therapist, score, factors };
}

/** Rank the full directory against the quiz answers, best first. */
export function rankMatches(answers: QuizAnswers): MatchResult[] {
  return therapists
    .map((t) => scoreTherapist(answers, t))
    .sort((a, b) => b.score - a.score || b.therapist.rating - a.therapist.rating);
}
