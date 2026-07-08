import type { Concern, Modality, ValueTag, Delivery } from './types';

// Shared, labeled option lists used by both the quiz and the directory filters,
// so labels never drift between screens.

export const CONCERN_OPTIONS: { value: Concern; label: string; hint: string }[] = [
  { value: 'anxiety', label: 'Anxiety', hint: 'Worry, panic, overthinking' },
  { value: 'depression', label: 'Depression', hint: 'Low mood, numbness, fatigue' },
  { value: 'trauma', label: 'Trauma & PTSD', hint: 'Past events that still echo' },
  { value: 'relationships', label: 'Relationships', hint: 'Partners, dating, conflict' },
  { value: 'grief', label: 'Grief & loss', hint: 'Death, divorce, big change' },
  { value: 'stress-burnout', label: 'Stress & burnout', hint: 'Work, caregiving, overload' },
  { value: 'identity', label: 'Identity & self', hint: 'Who you are, life direction' },
  { value: 'addiction', label: 'Addiction & recovery', hint: 'Substances, habits, sobriety' },
  { value: 'eating', label: 'Eating & body image', hint: 'Food, weight, body' },
  { value: 'family', label: 'Family & parenting', hint: 'Kids, parents, dynamics' },
];

export const MODALITY_OPTIONS: { value: Modality; label: string; hint: string }[] = [
  { value: 'CBT', label: 'CBT', hint: 'Practical, skills-based, structured' },
  { value: 'DBT', label: 'DBT', hint: 'Emotion regulation & distress tolerance' },
  { value: 'EMDR', label: 'EMDR', hint: 'Trauma reprocessing' },
  { value: 'Psychodynamic', label: 'Psychodynamic', hint: 'Insight into deeper patterns' },
  { value: 'ACT', label: 'ACT', hint: 'Values & acceptance' },
  { value: 'IFS', label: 'IFS / parts work', hint: 'Working with inner "parts"' },
  { value: 'Person-Centered', label: 'Person-centered', hint: 'Warm, you lead the way' },
  { value: 'Mindfulness', label: 'Mindfulness', hint: 'Present-focused, somatic' },
  { value: 'Couples', label: 'Couples', hint: 'Relationship-focused' },
  { value: 'Faith-Based', label: 'Faith-integrated', hint: 'Spirituality in the room' },
];

export const VALUE_OPTIONS: { value: ValueTag; label: string }[] = [
  { value: 'secular', label: 'Secular / non-religious' },
  { value: 'christian', label: 'Christian' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'buddhist', label: 'Buddhist' },
  {
    value: 'lds',
    label: 'Member of The Church of Jesus Christ of Latter-day Saints',
  },
  { value: 'lgbtq-affirming', label: 'LGBTQ+ affirming' },
  { value: 'culturally-responsive', label: 'Culturally responsive' },
  { value: 'veteran-informed', label: 'Veteran-informed' },
];

export const DELIVERY_OPTIONS: { value: Delivery; label: string; hint: string }[] = [
  { value: 'in-person', label: 'In person', hint: 'Face to face at an office' },
  { value: 'remote', label: 'Remote', hint: 'Video or phone' },
  { value: 'mobile', label: 'Mobile', hint: 'Therapist comes to you' },
];

export const INSURANCE_OPTIONS = [
  'Aetna',
  'Anthem',
  'Blue Cross Blue Shield',
  'Cigna',
  'Kaiser',
  'United',
  'TRICARE',
  'Oxford',
  'Other',
];

export const VALUE_LABEL: Record<ValueTag, string> = Object.fromEntries(
  VALUE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ValueTag, string>;

export const CONCERN_LABEL: Record<Concern, string> = Object.fromEntries(
  CONCERN_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Concern, string>;
