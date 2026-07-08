import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import {
  CONCERN_OPTIONS,
  MODALITY_OPTIONS,
  VALUE_OPTIONS,
  DELIVERY_OPTIONS,
  INSURANCE_OPTIONS,
} from '../lib/options';
import type {
  Concern,
  Modality,
  ValueTag,
  DeliveryPref,
  GenderPref,
  ValuesImportance,
  QuizAnswers,
} from '../lib/types';
import { parseIntake } from '../lib/integrations';
import { Button } from '../components/ui';
import { HaloMark } from '../components/Logo';

// ─────────────────────────────────────────────────────────────────────────
// The matching quiz: one question per screen, fully keyboard-navigable.
// Answers are held in the in-memory QuizContext (never persisted).
// ─────────────────────────────────────────────────────────────────────────

type StepId =
  | 'concerns'
  | 'modalities'
  | 'valuesImportance'
  | 'values'
  | 'cost'
  | 'location'
  | 'delivery'
  | 'gender'
  | 'scheduling';

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

// ── Reusable option controls ────────────────────────────────────────────────

function OptionGrid({
  children,
  cols = 2,
}: {
  children: ReactNode;
  cols?: 1 | 2;
}) {
  return (
    <div className={`grid gap-3 ${cols === 2 ? 'sm:grid-cols-2' : ''}`} role="group">
      {children}
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  multi,
  label,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  multi: boolean;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onClick}
      className={`flex items-start gap-3 rounded-card border p-4 text-left transition-colors ${
        selected
          ? 'border-primary bg-primary/[0.06] ring-1 ring-primary/30'
          : 'border-line bg-surface hover:border-primary/40'
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${
          multi ? 'rounded-[6px]' : 'rounded-full'
        } ${selected ? 'border-primary bg-primary text-white' : 'border-line bg-surface'}`}
      >
        {selected && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-body font-medium text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-meta leading-snug text-muted">{hint}</span>}
      </span>
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Match() {
  const { answers, update, setCompleted } = useQuiz();
  const navigate = useNavigate();
  const [stepId, setStepId] = useState<StepId>('concerns');

  // Order is dynamic: the dedicated "values" screen only appears when the user
  // says values matter.
  const order = useMemo<StepId[]>(() => {
    const base: StepId[] = ['concerns', 'modalities', 'valuesImportance'];
    if (answers.valuesImportance !== 'no-preference') base.push('values');
    base.push('cost', 'location', 'delivery', 'gender', 'scheduling');
    return base;
  }, [answers.valuesImportance]);

  const index = Math.max(0, order.indexOf(stepId));
  const total = order.length;
  const isLast = index === total - 1;

  const canAdvance = (): boolean => {
    switch (stepId) {
      case 'concerns':
        return answers.concerns.length > 0;
      case 'values':
        return answers.values.length > 0;
      case 'location':
        return answers.state.trim().length > 0;
      default:
        return true; // every other step is optional / has a default
    }
  };

  const goNext = () => {
    if (!canAdvance()) return;
    if (isLast) {
      setCompleted(true);
      navigate('/match/results');
      return;
    }
    setStepId(order[Math.min(order.length - 1, index + 1)]);
  };

  const goBack = () => {
    if (index === 0) {
      navigate('/');
      return;
    }
    setStepId(order[index - 1]);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[680px] flex-col px-5 py-8 sm:py-12">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between text-meta text-muted">
          <span className="inline-flex items-center gap-2">
            <HaloMark size={18} /> Step {index + 1} of {total}
          </span>
          <span>~{Math.max(1, Math.ceil((total - index) * 0.6))} min left</span>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-track">
          <div
            className="h-full rounded-full bg-ink transition-[width] duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <form
        className="flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          goNext();
        }}
      >
        <div className="flex-1">
          {stepId === 'concerns' && (
            <Step
              title="What brings you here?"
              subtitle="Pick anything that resonates — you can choose more than one."
            >
              <IntakeBox onFilled={update} />
              <OptionGrid>
                {CONCERN_OPTIONS.map((o) => (
                  <OptionButton
                    key={o.value}
                    multi
                    selected={answers.concerns.includes(o.value)}
                    onClick={() => update({ concerns: toggle<Concern>(answers.concerns, o.value) })}
                    label={o.label}
                    hint={o.hint}
                  />
                ))}
              </OptionGrid>
            </Step>
          )}

          {stepId === 'modalities' && (
            <Step
              title="Any approach you’re drawn to?"
              subtitle="Totally optional — leave this blank and we’ll help you choose."
            >
              <OptionGrid>
                {MODALITY_OPTIONS.map((o) => (
                  <OptionButton
                    key={o.value}
                    multi
                    selected={answers.modalities.includes(o.value)}
                    onClick={() => update({ modalities: toggle<Modality>(answers.modalities, o.value) })}
                    label={o.label}
                    hint={o.hint}
                  />
                ))}
              </OptionGrid>
            </Step>
          )}

          {stepId === 'valuesImportance' && (
            <Step
              title="Do values or faith matter in your match?"
              subtitle="Plenty of people want a therapist who shares their faith, culture, or affirms who they are. Just as many don’t. Both are right."
            >
              <OptionGrid cols={1}>
                {(
                  [
                    ['essential', 'Yes — it’s essential', 'Only show me therapists who genuinely fit.'],
                    ['preferred', 'I’d prefer it', 'Nice to have, but not a dealbreaker.'],
                    ['no-preference', 'Doesn’t matter to me', 'Skip this — judge on everything else.'],
                  ] as [ValuesImportance, string, string][]
                ).map(([val, label, hint]) => (
                  <OptionButton
                    key={val}
                    multi={false}
                    selected={answers.valuesImportance === val}
                    onClick={() =>
                      update({
                        valuesImportance: val,
                        values: val === 'no-preference' ? [] : answers.values,
                      })
                    }
                    label={label}
                    hint={hint}
                  />
                ))}
              </OptionGrid>
            </Step>
          )}

          {stepId === 'values' && (
            <Step
              title="Which of these fit?"
              subtitle="Choose any that matter to you. This is the dimension most directories skip."
            >
              <OptionGrid>
                {VALUE_OPTIONS.map((o) => (
                  <OptionButton
                    key={o.value}
                    multi
                    selected={answers.values.includes(o.value)}
                    onClick={() => update({ values: toggle<ValueTag>(answers.values, o.value) })}
                    label={o.label}
                  />
                ))}
              </OptionGrid>
            </Step>
          )}

          {stepId === 'cost' && (
            <Step
              title="What works for your budget?"
              subtitle="We’ll factor in sliding-scale options automatically."
            >
              <div className="space-y-7">
                <div className="rounded-card border border-line bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="budget" className="text-body font-medium text-ink">
                      Max per session
                    </label>
                    <span className="text-lead font-semibold tabular-nums text-ink">
                      ${answers.budgetMax}
                      {answers.budgetMax >= 300 ? '+' : ''}
                    </span>
                  </div>
                  <input
                    id="budget"
                    type="range"
                    min={60}
                    max={300}
                    step={10}
                    value={answers.budgetMax}
                    onChange={(e) => update({ budgetMax: Number(e.target.value) })}
                    className="mt-4 w-full accent-[var(--color-primary)]"
                  />
                  <div className="mt-1 flex justify-between text-fine text-muted">
                    <span>$60</span>
                    <span>$300+</span>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-body font-medium text-ink">Are you using insurance?</p>
                  <div className="flex gap-3">
                    {[
                      ['Yes', true],
                      ['No / self-pay', false],
                    ].map(([label, val]) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => update({ usesInsurance: val as boolean })}
                        className={`flex-1 rounded-control border px-4 py-3 text-body font-medium transition-colors ${
                          answers.usesInsurance === val
                            ? 'border-primary bg-primary/[0.06] text-ink ring-1 ring-primary/30'
                            : 'border-line bg-surface text-ink/80 hover:border-primary/40'
                        }`}
                      >
                        {label as string}
                      </button>
                    ))}
                  </div>

                  {answers.usesInsurance && (
                    <div className="mt-4">
                      <label htmlFor="insurance" className="text-meta font-medium text-ink">
                        Insurance network
                      </label>
                      <select
                        id="insurance"
                        value={answers.insurance}
                        onChange={(e) => update({ insurance: e.target.value })}
                        className="mt-1.5 w-full rounded-control border border-line bg-surface px-3.5 py-3 text-body text-ink outline-none focus:border-primary"
                      >
                        <option value="">Select your insurer…</option>
                        {INSURANCE_OPTIONS.map((i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </Step>
          )}

          {stepId === 'location' && (
            <Step
              title="Where are you?"
              subtitle="Therapists are licensed by state, so this helps us match correctly. Remote sessions still need a same-state license."
            >
              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <div>
                  <label htmlFor="city" className="text-meta font-medium text-ink">
                    City <span className="text-muted">(optional)</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    autoComplete="address-level2"
                    value={answers.city}
                    onChange={(e) => update({ city: e.target.value })}
                    placeholder="Brooklyn"
                    className="mt-1.5 w-full rounded-control border border-line bg-surface px-3.5 py-3 text-body text-ink outline-none placeholder:text-muted/60 focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="text-meta font-medium text-ink">
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    maxLength={2}
                    value={answers.state}
                    onChange={(e) => update({ state: e.target.value.toUpperCase().slice(0, 2) })}
                    placeholder="NY"
                    className="mt-1.5 w-full rounded-control border border-line bg-surface px-3.5 py-3 text-body uppercase text-ink outline-none placeholder:text-muted/60 focus:border-primary"
                  />
                </div>
              </div>
            </Step>
          )}

          {stepId === 'delivery' && (
            <Step title="How would you like to meet?" subtitle="Pick what fits your life.">
              <OptionGrid>
                {DELIVERY_OPTIONS.map((o) => (
                  <OptionButton
                    key={o.value}
                    multi={false}
                    selected={answers.delivery === o.value}
                    onClick={() => update({ delivery: o.value as DeliveryPref })}
                    label={o.label}
                    hint={o.hint}
                  />
                ))}
                <OptionButton
                  multi={false}
                  selected={answers.delivery === 'no-preference'}
                  onClick={() => update({ delivery: 'no-preference' })}
                  label="No preference"
                  hint="Show me all formats"
                />
              </OptionGrid>
            </Step>
          )}

          {stepId === 'gender' && (
            <Step
              title="Any preference for who you see?"
              subtitle="Some people feel more at ease with a particular therapist. Entirely up to you."
            >
              <OptionGrid>
                {(
                  [
                    ['female', 'Woman'],
                    ['male', 'Man'],
                    ['nonbinary', 'Non-binary'],
                    ['no-preference', 'No preference'],
                  ] as [GenderPref, string][]
                ).map(([val, label]) => (
                  <OptionButton
                    key={val}
                    multi={false}
                    selected={answers.genderPref === val}
                    onClick={() => update({ genderPref: val })}
                    label={label}
                  />
                ))}
              </OptionGrid>
            </Step>
          )}

          {stepId === 'scheduling' && (
            <Step
              title="When are you usually free?"
              subtitle="Last one. Choose any that work — this helps us surface real availability."
            >
              <OptionGrid>
                {(
                  [
                    ['weekday-daytime', 'Weekday daytime'],
                    ['evenings', 'Evenings'],
                    ['weekends', 'Weekends'],
                    ['flexible', 'I’m flexible'],
                  ] as [(typeof answers.scheduling)[number], string][]
                ).map(([val, label]) => (
                  <OptionButton
                    key={val}
                    multi
                    selected={answers.scheduling.includes(val)}
                    onClick={() => update({ scheduling: toggle(answers.scheduling, val) })}
                    label={label}
                  />
                ))}
              </OptionGrid>
            </Step>
          )}
        </div>

        {/* Controls */}
        <div className="sticky bottom-0 mt-10 flex items-center justify-between gap-4 border-t border-line bg-canvas/90 py-4 backdrop-blur">
          <Button type="button" variant="ghost" onClick={goBack}>
            ← Back
          </Button>
          <div className="flex items-center gap-3">
            {!canAdvance() && stepId === 'concerns' && (
              <span className="hidden text-meta text-muted sm:inline">Pick at least one</span>
            )}
            <Button type="submit" disabled={!canAdvance()} size="lg">
              {isLast ? 'See my matches' : 'Continue'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Free-text intake shortcut (Claude Fable 5) ───────────────────────────────
// Optional alternative to clicking through every screen: describe things in
// your own words and Fable 5 pre-fills the quiz, which you then review and
// edit. Falls back invisibly to the manual flow if the parser isn't configured
// (no API key) or errors. See lib/integrations.ts → parseIntake.

const HOW_MANY_FILLED = (a: Partial<QuizAnswers>): number =>
  [
    a.concerns?.length,
    a.modalities?.length,
    a.values?.length,
    a.scheduling?.length,
    a.valuesImportance && a.valuesImportance !== 'no-preference' ? 1 : 0,
    a.delivery && a.delivery !== 'no-preference' ? 1 : 0,
    a.genderPref && a.genderPref !== 'no-preference' ? 1 : 0,
    a.usesInsurance ? 1 : 0,
    a.state ? 1 : 0,
  ].filter(Boolean).length;

function IntakeBox({ onFilled }: { onFilled: (patch: Partial<QuizAnswers>) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Hidden once dismissed (e.g. unconfigured) so it never nags.
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  const submit = async () => {
    if (status === 'loading' || text.trim().length < 3) return;
    setStatus('loading');
    setMessage('');
    const result = await parseIntake(text);
    if (result.unconfigured) {
      setHidden(true);
      return;
    }
    if (!result.ok || !result.answers) {
      setStatus('error');
      setMessage(result.error ?? 'Couldn’t read that — try selecting below instead.');
      return;
    }
    onFilled(result.answers);
    const n = HOW_MANY_FILLED(result.answers);
    setStatus('done');
    setMessage(
      n > 0
        ? `Filled in ${n} answer${n === 1 ? '' : 's'} from that. Review and adjust anything below.`
        : 'Nothing specific to pull from that — select below to continue.',
    );
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-meta font-medium text-ink/80 transition-colors hover:border-primary/40 hover:text-ink"
      >
        <HaloMark size={15} />
        Prefer to type it out? Describe it in your own words
      </button>
    );
  }

  return (
    <div className="mb-7 rounded-card border border-line bg-surface p-4 sm:p-5">
      <label htmlFor="intake" className="block text-body font-medium text-ink">
        Describe what you’re looking for
      </label>
      <p className="mt-1 text-meta leading-snug text-muted">
        A sentence or two is plenty — we’ll pre-fill the quiz, and you stay in control of every
        answer. Nothing here is stored.
      </p>
      <textarea
        id="intake"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
        }}
        placeholder="e.g. Anxious since a breakup, would like someone who shares my faith, evenings work best, I have Blue Cross."
        className="mt-3 w-full resize-y rounded-control border border-line bg-canvas px-3.5 py-3 text-body leading-relaxed text-ink outline-none placeholder:text-muted/60 focus:border-primary"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span
          className={`text-meta ${status === 'error' ? 'text-rose-600' : 'text-muted'}`}
          aria-live="polite"
        >
          {message}
        </span>
        <Button
          type="button"
          size="sm"
          onClick={submit}
          disabled={status === 'loading' || text.trim().length < 3}
        >
          {status === 'loading' ? 'Reading…' : 'Pre-fill the quiz'}
        </Button>
      </div>
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h1 className="text-[clamp(1.6rem,3.5vw,2.1rem)] font-extrabold leading-tight text-heading">
        {title}
      </h1>
      {subtitle && <p className="mt-2.5 text-body leading-relaxed text-muted">{subtitle}</p>}
      <div className="mt-7">{children}</div>
    </div>
  );
}
