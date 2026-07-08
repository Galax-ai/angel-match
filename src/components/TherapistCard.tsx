import { Link } from 'react-router-dom';
import type { MatchResult, Therapist } from '../lib/types';
import { CONCERN_LABEL } from '../lib/options';
import { ScoreGauge } from './ScoreGauge';
import { Avatar } from './Avatar';
import { Chip, VerifiedBadge, ButtonLink } from './ui';

// One directory card. Renders with a match gauge when a `match` is supplied
// (post-quiz), or as a plain directory card (browse mode) otherwise.

function DeliveryLine({ t }: { t: Therapist }) {
  const labels: Record<string, string> = {
    'in-person': 'In person',
    remote: 'Remote',
    mobile: 'Mobile',
  };
  return <>{t.delivery.map((d) => labels[d]).join(' · ')}</>;
}

export function TherapistCard({
  therapist,
  match,
}: {
  therapist: Therapist;
  match?: MatchResult;
}) {
  const t = therapist;
  return (
    <article className="group relative flex flex-col rounded-card border border-line bg-surface p-5 transition-shadow hover:shadow-card sm:p-6">
      <div className="flex items-start gap-4">
        <Avatar name={t.name} id={t.id} photoUrl={t.photoUrl} size={64} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lead font-semibold text-ink">
                <Link to={`/therapist/${t.id}`} className="hover:underline focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {t.name}
                </Link>
              </h3>
              <p className="mt-0.5 text-meta text-muted">
                {t.credentials.map((c) => c.abbrev).join(', ')} · {t.pronouns} ·{' '}
                {t.city}, {t.state}
              </p>
            </div>

            {match && (
              <div className="relative z-10 shrink-0">
                {/* Static on the directory grid — a wall of simultaneously
                    animating gauges reads busier than premium. The hero and
                    profile gauges keep the animation. */}
                <ScoreGauge
                  value={match.score}
                  size={58}
                  caption=""
                  animate={false}
                  ariaLabel={`${match.score}% match with ${t.name}`}
                />
              </div>
            )}
          </div>

          <p className="mt-2 line-clamp-2 text-body leading-snug text-ink/80">{t.headline}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {match?.factors.find((f) => f.label === 'Values & faith alignment')?.hit && (
          <Chip tone="primary">Values aligned</Chip>
        )}
        {t.concerns.slice(0, 3).map((c) => (
          <Chip key={c}>{CONCERN_LABEL[c]}</Chip>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-y-2 border-t border-line pt-4 text-meta text-muted">
        <span><DeliveryLine t={t} /></span>
        <span>{t.slidingScale ? 'Sliding scale' : `$${t.sessionRate}/session`}</span>
        <span>
          {t.acceptingClients ? (
            <span className="font-medium text-ink">{t.nextAvailable}</span>
          ) : (
            <span>Waitlist</span>
          )}
        </span>
        <span>★ {t.rating.toFixed(1)} ({t.reviewCount})</span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        {t.verified ? <VerifiedBadge /> : <span />}
        <ButtonLink to={`/therapist/${t.id}`} variant="secondary" size="sm" className="relative z-10">
          View profile
        </ButtonLink>
      </div>
    </article>
  );
}

export default TherapistCard;
