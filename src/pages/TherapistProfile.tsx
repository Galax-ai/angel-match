import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTherapist } from '../lib/therapists';
import { scoreTherapist } from '../lib/match';
import { useQuiz } from '../context/QuizContext';
import { CONCERN_LABEL, VALUE_LABEL } from '../lib/options';
import { Avatar } from '../components/Avatar';
import { ScoreGauge } from '../components/ScoreGauge';
import { MatchBreakdown } from '../components/MatchBreakdown';
import { MatchSummary } from '../components/MatchSummary';
import { WaitlistModal } from '../components/WaitlistModal';
import { Button, ButtonLink, Chip, VerifiedBadge } from '../components/ui';
import NotFound from './NotFound';

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-meta font-semibold uppercase tracking-[0.1em] text-muted">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function TherapistProfile() {
  const { id } = useParams<{ id: string }>();
  const { answers, completed } = useQuiz();
  const [showBook, setShowBook] = useState(false);

  const therapist = id ? getTherapist(id) : undefined;

  // Score relative to the user's quiz answers when we have them.
  const match = useMemo(
    () => (therapist && completed ? scoreTherapist(answers, therapist) : undefined),
    [therapist, completed, answers],
  );

  if (!therapist) return <NotFound />;
  const t = therapist;

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-8 sm:px-8 sm:py-12">
      <Link
        to={completed ? '/match/results' : '/match/results'}
        className="inline-flex items-center gap-1.5 text-body font-medium text-muted hover:text-ink"
      >
        ← Back to {completed ? 'your matches' : 'directory'}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-14">
        {/* Main column */}
        <div>
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar name={t.name} id={t.id} photoUrl={t.photoUrl} size={88} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[clamp(1.7rem,3vw,2.2rem)] font-extrabold text-heading">{t.name}</h1>
                {t.verified && <VerifiedBadge />}
              </div>
              <p className="mt-1 text-body text-muted">
                {t.credentials.map((c) => c.abbrev).join(', ')} · {t.pronouns} · {t.yearsExperience}{' '}
                yrs experience
              </p>
              <p className="mt-3 text-lead font-medium leading-snug text-ink">{t.headline}</p>
              <div className="mt-3 flex items-center gap-3 text-body text-muted">
                <span>★ {t.rating.toFixed(1)}</span>
                <span aria-hidden>·</span>
                <span>{t.reviewCount} reviews</span>
                <span aria-hidden>·</span>
                <span>
                  {t.city}, {t.state}
                </span>
              </div>
            </div>
          </header>

          <hr className="my-8 border-line" />

          <div className="space-y-8">
            <Section title="About">
              <p className="text-body leading-relaxed text-ink/80">{t.bio}</p>
            </Section>

            <Section title="Specialties">
              <div className="flex flex-wrap gap-2">
                {t.concerns.map((c) => (
                  <Chip key={c} tone="primary">
                    {CONCERN_LABEL[c]}
                  </Chip>
                ))}
              </div>
            </Section>

            <Section title="Approaches">
              <div className="flex flex-wrap gap-2">
                {t.modalities.map((m) => (
                  <Chip key={m}>{m}</Chip>
                ))}
              </div>
            </Section>

            <Section title="Values & faith">
              <div className="flex flex-wrap gap-2">
                {t.values.map((v) => (
                  <Chip key={v} tone="primary">
                    {VALUE_LABEL[v]}
                  </Chip>
                ))}
              </div>
            </Section>

            <div className="grid gap-8 sm:grid-cols-2">
              <Section title="Credentials">
                <ul className="space-y-2">
                  {t.credentials.map((c) => (
                    <li key={c.abbrev} className="text-body text-ink">
                      <span className="font-medium">{c.abbrev}</span>{' '}
                      <span className="text-muted">— {c.label}</span>
                    </li>
                  ))}
                  <li className="pt-1 text-meta text-muted">
                    License {t.licenseNumber} ({t.licenseState}) ·{' '}
                    <span className="font-medium text-ink/70">verified</span>
                  </li>
                  <li className="text-meta text-muted">
                    Languages: {t.languages.join(', ')}
                  </li>
                </ul>
              </Section>

              <Section title="Insurance & fees">
                <ul className="space-y-1.5 text-body text-ink">
                  <li>
                    <span className="font-medium">${t.sessionRate}</span>
                    <span className="text-muted"> / session</span>
                    {t.slidingScale && <span className="text-muted"> · sliding scale available</span>}
                  </li>
                  {t.insurance.map((i) => (
                    <li key={i} className="text-body text-muted">
                      {i}
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            <Section title="Availability">
              <p className="mb-3 text-body">
                {t.acceptingClients ? (
                  <span className="font-medium text-ink">Accepting new clients · {t.nextAvailable}</span>
                ) : (
                  <span className="text-muted">Not currently accepting new clients — join the waitlist.</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {t.availability.map((slot) => (
                  <div
                    key={slot.day}
                    className="rounded-control border border-line bg-surface px-3.5 py-2.5 text-center"
                  >
                    <div className="text-fine font-semibold uppercase tracking-wide text-muted">
                      {slot.day}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {slot.times.map((tm) => (
                        <div key={tm} className="text-meta text-ink">
                          {tm}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>

        {/* Sticky booking sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-line bg-surface p-6 shadow-elev">
            {match ? (
              <>
                <div className="flex flex-col items-center text-center">
                  <ScoreGauge value={match.score} size={132} caption="match" />
                  <p className="mt-3 text-body text-muted">
                    Based on your match answers
                  </p>
                </div>
                <MatchSummary match={match} />
                <div className="mt-5 border-t border-line pt-5">
                  <p className="mb-3 text-fine font-semibold uppercase tracking-[0.1em] text-muted">
                    Why this score
                  </p>
                  <MatchBreakdown factors={match.factors} />
                </div>
              </>
            ) : (
              <div className="text-center">
                <ScoreGauge value={0} size={120} showValue={false} animate={false} />
                <p className="mt-4 text-body font-medium text-ink">See your match score</p>
                <p className="mt-1.5 text-body leading-relaxed text-muted">
                  Take the 5-minute match to see how well {t.name.split(' ')[0]} fits your needs.
                </p>
                <ButtonLink to="/match" variant="secondary" size="sm" className="mt-4 w-full">
                  Start matching
                </ButtonLink>
              </div>
            )}

            <Button onClick={() => setShowBook(true)} size="lg" className="mt-6 w-full">
              {t.acceptingClients ? 'Book a session' : 'Join waitlist'}
            </Button>
            <p className="mt-3 text-center text-fine text-muted">
              Direct booking is rolling out — we’ll notify you.
            </p>
          </div>
        </aside>
      </div>

      {showBook && <WaitlistModal therapist={t} onClose={() => setShowBook(false)} />}
    </div>
  );
}
