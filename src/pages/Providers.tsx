import { useState } from 'react';
import { submitProviderLead, type ProviderLead } from '../lib/integrations';
import { Button, Eyebrow, Chip } from '../components/ui';
import { HaloMark } from '../components/Logo';

const TIERS = [
  {
    name: 'Free listing',
    price: '$0',
    cadence: 'forever',
    highlight: false,
    blurb: 'Get matched with clients who fit. No cost, no catch.',
    features: [
      'Verified profile in the directory',
      'Appear in client match results',
      'Specialty, approach & values tags',
      'Direct inquiry inbox',
    ],
    cta: 'Start free',
  },
  {
    name: 'Verified Pro',
    price: '$29',
    cadence: '/mo',
    highlight: true,
    blurb: 'Stand out and convert more of the right inquiries.',
    features: [
      'Everything in Free',
      'Priority ranking on ties',
      'Availability & calendar sync',
      'Client-fit insights on each inquiry',
      'Notifications via email, SMS, or Slack',
    ],
    cta: 'Start 30-day trial',
  },
  {
    name: 'Featured',
    price: '$89',
    cadence: '/mo',
    highlight: false,
    blurb: 'Maximum visibility for growing practices and groups.',
    features: [
      'Everything in Verified Pro',
      'Featured placement in your area',
      'Multi-clinician group profiles',
      'Intake form + dedicated support',
    ],
    cta: 'Talk to us',
  },
];

function LeadForm() {
  const [form, setForm] = useState<ProviderLead>({
    name: '',
    email: '',
    practice: '',
    state: '',
    specialties: '',
    notifyVia: 'email',
  });
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');

  const set = (patch: Partial<ProviderLead>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    await submitProviderLead(form);
    setState('done');
  };

  if (state === 'done') {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-track text-ink/80">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-4 text-title font-semibold text-ink">Thanks, {form.name.split(' ')[0]}.</h3>
        <p className="mt-2 text-body text-muted">
          We’ll reach out at {form.email} to verify your credentials and get your profile live.
        </p>
      </div>
    );
  }

  const field =
    'mt-1.5 w-full rounded-control border border-line bg-surface px-3.5 py-3 text-body text-ink outline-none placeholder:text-muted/60 focus:border-primary';

  return (
    <form
      onSubmit={submit}
      className="rounded-card border border-line bg-surface p-6 shadow-elev sm:p-8"
    >
      <h3 className="text-title font-semibold text-ink">Claim your free listing</h3>
      <p className="mt-1.5 text-body text-muted">
        Takes two minutes. We verify every provider before they go live.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="p-name" className="text-meta font-medium text-ink">
            Full name
          </label>
          <input
            id="p-name"
            required
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Jordan Ellis, LCSW"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="p-email" className="text-meta font-medium text-ink">
            Work email
          </label>
          <input
            id="p-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="you@practice.com"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="p-practice" className="text-meta font-medium text-ink">
            Practice name
          </label>
          <input
            id="p-practice"
            value={form.practice}
            onChange={(e) => set({ practice: e.target.value })}
            placeholder="Still Waters Counseling"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="p-state" className="text-meta font-medium text-ink">
            Licensed state
          </label>
          <input
            id="p-state"
            maxLength={2}
            value={form.state}
            onChange={(e) => set({ state: e.target.value.toUpperCase().slice(0, 2) })}
            placeholder="CA"
            className={`${field} uppercase`}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="p-spec" className="text-meta font-medium text-ink">
          Specialties
        </label>
        <input
          id="p-spec"
          value={form.specialties}
          onChange={(e) => set({ specialties: e.target.value })}
          placeholder="Anxiety, trauma, couples…"
          className={field}
        />
      </div>

      <div className="mt-4">
        <span className="text-meta font-medium text-ink">Notify me about inquiries via</span>
        <div className="mt-2 flex gap-2">
          {(['email', 'sms', 'slack'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => set({ notifyVia: v })}
              className={`flex-1 rounded-control border px-3 py-2.5 text-body font-medium capitalize transition-colors ${
                form.notifyVia === v
                  ? 'border-primary bg-primary/[0.06] text-ink ring-1 ring-primary/30'
                  : 'border-line bg-surface text-ink/80 hover:border-primary/40'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={state === 'sending'} className="mt-6 w-full">
        {state === 'sending' ? 'Submitting…' : 'Claim free listing'}
      </Button>
      <p className="mt-3 text-center text-fine text-muted">
        No client health data is ever stored here. We’ll only use this to set up your profile.
      </p>
    </form>
  );
}

export default function Providers() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <Eyebrow>For therapists</Eyebrow>
            <h1 className="mt-4 text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[1.05] text-heading">
              Get matched with clients you’re built to help.
            </h1>
            <p className="mt-5 max-w-xl text-lead leading-relaxed text-muted">
              Stop fielding inquiries that were never a fit. AngelMatch matches people to you on
              specialty, approach, values, budget, and availability — so the clients who reach out
              are the ones you can genuinely help.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <Chip tone="primary">Free to list</Chip>
              <Chip tone="primary">Verified providers only</Chip>
              <Chip>You control your availability</Chip>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="rounded-card border border-line bg-canvas p-6 shadow-pop">
              <div className="flex items-center gap-3">
                <HaloMark size={30} />
                <p className="text-meta font-semibold uppercase tracking-[0.1em] text-muted">
                  New inquiry
                </p>
              </div>
              <p className="mt-4 text-body leading-relaxed text-ink">
                “Seeking <span className="font-medium text-ink">trauma / EMDR</span>, remote,
                evenings, uses <span className="font-medium text-ink">BCBS</span>, prefers a
                culturally-responsive therapist.”
              </p>
              <div className="mt-5 flex items-center justify-between rounded-control bg-track px-4 py-3">
                <span className="text-body font-medium text-ink">Fit with your profile</span>
                <span className="text-lead font-semibold text-ink">95%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              t: 'Better-fit inquiries',
              d: 'Every lead arrives pre-matched on the things that actually determine fit — so you say “yes” more often and screen less.',
            },
            {
              t: 'Less time wasted',
              d: 'No more 20-minute consults that end in “I don’t take that insurance.” The match handles the deal-breakers up front.',
            },
            {
              t: 'Show what makes you, you',
              d: 'Faith, culture, lived experience, and approach are first-class fields here — not buried in a bio nobody reads.',
            },
          ].map((b) => (
            <div key={b.t} className="rounded-card border border-line bg-surface p-6">
              <div className="mb-4">
                <HaloMark size={26} />
              </div>
              <h3 className="text-lead font-semibold text-ink">{b.t}</h3>
              <p className="mt-2 text-body leading-relaxed text-muted">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Simple pricing</Eyebrow>
            <h2 className="mt-4 text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold text-ink">
              Start free. Upgrade only if it’s working.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-card border bg-surface p-7 ${
                  tier.highlight
                    ? 'border-primary shadow-pop ring-1 ring-primary/30'
                    : 'border-line'
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-fine font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lead font-semibold text-ink">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[34px] font-semibold tracking-[-0.02em] text-ink">
                    {tier.price}
                  </span>
                  <span className="text-body text-muted">{tier.cadence}</span>
                </div>
                <p className="mt-2 text-body leading-relaxed text-muted">{tier.blurb}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-body text-ink/80">
                      <svg
                        className="mt-0.5 shrink-0 text-ink/45"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#claim"
                  className={`mt-7 inline-flex w-full items-center justify-center rounded-control px-5 py-3 text-body font-medium transition-colors ${
                    tier.highlight
                      ? 'bg-primary text-white hover:bg-primary-600'
                      : 'border border-line bg-surface text-ink hover:border-primary/40'
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-meta text-muted">
            Payments are processed securely via Stripe. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Lead capture */}
      <section id="claim" className="scroll-mt-20 bg-canvas">
        <div className="mx-auto grid max-w-[1100px] items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
          <div>
            <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold text-ink">
              List your practice in minutes.
            </h2>
            <p className="mt-4 max-w-md text-body leading-relaxed text-muted">
              Join verified therapists getting matched with clients who actually fit. Free to start —
              we’ll verify your license and have you live within a couple of days.
            </p>
            <ul className="mt-6 space-y-3 text-body text-ink/80">
              {['License-verified before you go live', 'You set your own availability and rates', 'Notifications your way — email, SMS, or Slack'].map(
                (x) => (
                  <li key={x} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" aria-hidden="true" />
                    {x}
                  </li>
                ),
              )}
            </ul>
          </div>
          <LeadForm />
        </div>
      </section>
    </>
  );
}
