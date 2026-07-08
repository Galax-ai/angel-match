import { useState } from 'react';
import { ScoreGauge } from '../components/ScoreGauge';
import { Avatar } from '../components/Avatar';
import { ButtonLink, Eyebrow, Chip, VerifiedBadge } from '../components/ui';
import { MatchBreakdown } from '../components/MatchBreakdown';
import type { MatchFactor } from '../lib/types';

// ── Hero ─────────────────────────────────────────────────────────────────────

const HERO_FACTORS: MatchFactor[] = [
  { label: 'What you’re seeking', earned: 32, possible: 32, hit: true, detail: '' },
  { label: 'Values & faith alignment', earned: 20, possible: 20, hit: true, detail: '' },
  { label: 'Cost & insurance', earned: 14, possible: 16, hit: true, detail: '' },
  { label: 'Availability', earned: 8, possible: 8, hit: true, detail: '' },
];

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      {/* soft back panel for depth */}
      <div
        aria-hidden="true"
        className="absolute -right-6 -top-6 h-full w-full rounded-panel bg-track/60"
      />
      {/* main match card */}
      <div className="relative rounded-panel border border-line bg-surface p-6 shadow-pop sm:p-7">
        <div className="flex items-center gap-4">
          <Avatar name="Dr. Maya Okafor" id="maya-okafor" size={60} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-body font-semibold text-ink">Dr. Maya Okafor</h3>
              <VerifiedBadge />
            </div>
            <p className="text-meta text-muted">PsyD · she/her · Brooklyn, NY</p>
          </div>
          <ScoreGauge value={94} size={66} caption="match" />
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          <Chip tone="primary">Anxiety</Chip>
          <Chip tone="primary">Burnout</Chip>
          <Chip tone="primary">Values aligned</Chip>
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <p className="mb-3 text-fine font-semibold uppercase tracking-[0.1em] text-muted">
            Why you matched
          </p>
          <MatchBreakdown factors={HERO_FACTORS} compact />
        </div>
      </div>

      {/* floating availability chip — third layer, its own shadow */}
      <div className="absolute -bottom-5 -left-4 flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 shadow-elev sm:-left-8">
        <span className="h-2 w-2 rounded-full bg-ink/35" aria-hidden="true" />
        <span className="text-meta font-medium text-ink">Open this week</span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section>
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-28 lg:pt-24">
        <div>
          <Eyebrow>Find the therapist who fits</Eyebrow>
          <h1 className="mt-4 text-[clamp(2.6rem,6vw,4.25rem)] font-extrabold leading-[1.04] tracking-[-0.025em] text-heading">
            Finding the right therapist shouldn’t feel like guessing.
          </h1>
          <p className="mt-6 max-w-xl text-lead leading-relaxed text-ink/80">
            Answer a few questions and see therapists ranked by a transparent compatibility score —
            matched on what you’re facing, how they work, your values, budget, and real availability.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/match" size="lg">
              Find a therapist
            </ButtonLink>
            <ButtonLink to="/#how" variant="secondary" size="lg">
              See how it works
            </ButtonLink>
          </div>
          <p className="mt-5 text-meta text-muted">
            Free · No account needed · ~5 minutes · Your answers stay on your device.
          </p>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

// ── How it works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Answer a few questions',
      body: 'About five minutes — what you’re seeking, how you like to work, your budget, values, and schedule. No account, no pressure.',
    },
    {
      n: '02',
      title: 'See your ranked matches',
      body: 'Every therapist gets a compatibility score you can actually read — with the specific reasons behind the number, not a black box.',
    },
    {
      n: '03',
      title: 'Connect and book',
      body: 'Compare profiles, check real availability and verified credentials, and reach out to the people who genuinely fit.',
    },
  ];
  return (
    <section id="how" className="scroll-mt-20 border-t border-line bg-surface">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
        <div className="max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.9rem,3.5vw,2.75rem)] font-bold text-ink">
            Three steps from overwhelmed to matched.
          </h2>
        </div>
        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="relative">
              <div className="flex items-center gap-3">
                <span className="text-body font-semibold tabular-nums text-ink">{s.n}</span>
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-title font-semibold text-ink">{s.title}</h3>
              <p className="mt-2.5 text-body leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ── Why AngelMatch (alternating feature rows) ──────────────────────────────

function FeatureRow({
  eyebrow,
  title,
  body,
  visual,
  flip = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  visual: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={flip ? 'lg:order-2' : ''}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="mt-3 text-[clamp(1.5rem,2.6vw,2rem)] font-semibold text-ink">{title}</h3>
        <p className="mt-4 max-w-md text-body leading-relaxed text-muted">{body}</p>
      </div>
      <div className={flip ? 'lg:order-1' : ''}>{visual}</div>
    </div>
  );
}

function WhySection() {
  return (
    <section id="why" className="scroll-mt-20">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
        <div className="max-w-2xl">
          <Eyebrow>Why AngelMatch</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.9rem,3.5vw,2.75rem)] font-bold text-ink">
            Matching that goes deeper than a search bar.
          </h2>
          <p className="mt-4 text-lead leading-relaxed text-muted">
            Directories give you a list. We give you a ranking — and show our work.
          </p>
        </div>

        <div className="mt-16 space-y-20 lg:space-y-28">
          <FeatureRow
            eyebrow="Granular matching"
            title="A score you can actually read."
            body="We weigh what you’re facing, the therapist’s approach, your budget and insurance, how you want to meet, and when you’re free — then show exactly how each factor added up. No mystery, no “trust us.”"
            visual={
              <div className="rounded-card border border-line bg-surface p-6 shadow-elev">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-meta font-semibold uppercase tracking-[0.1em] text-muted">
                    Match breakdown
                  </p>
                  <ScoreGauge value={91} size={52} caption="" />
                </div>
                <MatchBreakdown factors={HERO_FACTORS} />
              </div>
            }
          />

          <FeatureRow
            flip
            eyebrow="Values & faith alignment"
            title="The dimension other directories bury."
            body="Wanting a therapist who shares your faith, understands your culture, or is genuinely LGBTQ+ affirming isn’t a footnote — it’s often the whole reason a match works. We treat it as a first-class filter you can make essential, preferred, or skip entirely."
            visual={
              <div className="rounded-card border border-line bg-surface p-7 shadow-elev">
                <p className="text-meta font-semibold uppercase tracking-[0.1em] text-muted">
                  Find someone who gets it
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    'Christian',
                    'Jewish',
                    'Muslim',
                    'Buddhist',
                    'Latter-day Saints',
                    'Secular',
                    'LGBTQ+ affirming',
                    'Culturally responsive',
                    'Veteran-informed',
                  ].map((v, i) => (
                    <Chip key={v} tone={i % 3 === 0 ? 'primary' : 'neutral'}>
                      {v}
                    </Chip>
                  ))}
                </div>
                <p className="mt-5 text-body leading-relaxed text-muted">
                  Mark it <span className="font-medium text-ink">essential</span> and we’ll only rank
                  therapists who truly fit.
                </p>
              </div>
            }
          />

          <FeatureRow
            eyebrow="Verified & available"
            title="Real credentials. Real openings."
            body="Every therapist is license-verified before they’re listed, with credentials and license numbers shown openly. And the availability you see reflects who’s actually taking new clients — so you spend less time chasing dead ends."
            visual={
              <div className="space-y-3">
                {[
                  { n: 'Sarah Bensen, LCSW', id: 'sarah-bensen', meta: 'EMDR · Trauma', next: 'This week' },
                  { n: 'Daniel Reyes, LMFT', id: 'daniel-reyes', meta: 'Couples', next: 'Next week' },
                ].map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-elev"
                  >
                    <Avatar name={p.n} id={p.id} size={48} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-body font-semibold text-ink">{p.n}</p>
                        <VerifiedBadge />
                      </div>
                      <p className="text-meta text-muted">{p.meta}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-track px-3 py-1 text-fine font-medium text-ink/80">
                      {p.next}
                    </span>
                  </div>
                ))}
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}

// ── Provider strip ───────────────────────────────────────────────────────────

function ProviderStrip() {
  return (
    <section className="bg-feature text-offwhite">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_1fr] lg:py-20">
        <div>
          <span className="text-fine font-medium uppercase tracking-[0.16em] text-offwhite/55">
            For therapists
          </span>
          <h2 className="mt-3 text-[clamp(1.7rem,3vw,2.4rem)] font-bold text-offwhite">
            Fewer mismatched inquiries. More clients you’re built to help.
          </h2>
          <p className="mt-4 max-w-xl text-body leading-relaxed text-offwhite/70">
            When people are matched on specialty, approach, and values up front, the inquiries you get
            are the ones worth your time. List your practice free — and only hear from clients who fit.
          </p>
        </div>
        <div className="flex flex-col gap-4 lg:items-end">
          <div className="grid w-full grid-cols-2 gap-4">
            {[
              { stat: 'Better-fit', label: 'client inquiries' },
              { stat: 'Less time', label: 'on screening calls' },
            ].map((s) => (
              <div key={s.label} className="rounded-card border border-offwhite/15 bg-canvas/5 p-5">
                <div className="text-title font-semibold text-offwhite">{s.stat}</div>
                <div className="mt-1 text-meta text-offwhite/70">{s.label}</div>
              </div>
            ))}
          </div>
          <ButtonLink to="/providers" variant="primary" size="lg" className="w-full lg:w-auto">
            List your practice
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

// ── Trust / FAQ ──────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'How does the match score work?',
    a: 'Your score is a transparent weighted sum across six dimensions: what you’re seeking (the most heavily weighted), therapy approach, values and faith alignment, cost and insurance, how you meet, and availability. Each factor contributes a fixed share of 100 points, and we show you exactly what each one earned — so the number is always explainable, never a black box.',
  },
  {
    q: 'Is this private? What about my health information?',
    a: 'Your quiz answers never leave your device in this version — they live only in your browser for the session and are never saved to an account, a cookie, or our servers. AngelMatch is a matching and directory service, not a healthcare provider. When we add features like booking, anything sensitive will be handled by HIPAA-compliant, BAA-covered infrastructure.',
  },
  {
    q: 'What does the score not mean?',
    a: 'A high score means a therapist is a strong fit for your stated preferences — not a clinical recommendation, diagnosis, or guarantee of outcome. Therapy is a relationship; the score is a smarter starting point, not a substitute for your own judgment after an intro call.',
  },
  {
    q: 'Are the therapists verified?',
    a: 'Yes. Every therapist is license-verified before they appear in the directory, and we show their credentials and license number openly. We only list providers in good standing.',
  },
  {
    q: 'Does it cost anything?',
    a: 'Matching is completely free for people seeking care — no account required. Therapists can list a free profile, with optional premium tiers for added visibility.',
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-20 border-t border-line bg-surface">
      <div className="mx-auto max-w-[820px] px-5 py-20 sm:px-8 lg:py-28">
        <div className="text-center">
          <Eyebrow>Trust &amp; transparency</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.9rem,3.5vw,2.75rem)] font-bold text-ink">
            What the score means — and what it doesn’t.
          </h2>
        </div>
        <div className="mt-12 divide-y divide-line border-y border-line">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-body font-medium text-ink">{f.q}</span>
                    <span
                      className={`shrink-0 text-muted transition-transform duration-200 ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                </h3>
                {isOpen && (
                  <p className="-mt-1 pb-6 pr-8 text-body leading-relaxed text-muted">{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="mx-auto max-w-[1200px] px-5 pb-8 pt-20 sm:px-8 lg:pt-28">
      <div className="relative overflow-hidden rounded-panel border border-line bg-surface px-6 py-16 text-center sm:px-12">
        <div className="mx-auto mb-7 w-fit">
          <ScoreGauge value={92} size={104} caption="match" />
        </div>
        <h2 className="mx-auto max-w-2xl text-[clamp(1.9rem,3.5vw,2.75rem)] font-bold text-ink">
          Stop scrolling directories. Start with a fit.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lead leading-relaxed text-muted">
          Take the five-minute match and see who actually lines up with what you need.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink to="/match" size="lg">
            Find a therapist
          </ButtonLink>
          <ButtonLink to="/providers" variant="secondary" size="lg">
            List your practice
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <WhySection />
      <ProviderStrip />
      <FAQ />
      <FinalCTA />
    </>
  );
}
