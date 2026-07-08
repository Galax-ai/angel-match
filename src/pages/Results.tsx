import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { rankMatches } from '../lib/match';
import { therapists } from '../lib/therapists';
import type { Delivery, MatchResult } from '../lib/types';
import { TherapistCard } from '../components/TherapistCard';
import { ButtonLink, Chip } from '../components/ui';
import { DELIVERY_OPTIONS } from '../lib/options';

type SortKey = 'match' | 'rating' | 'price' | 'availability';

const AVAIL_RANK: Record<string, number> = { 'This week': 0, 'Next week': 1, Waitlist: 3 };

export default function Results() {
  const { answers, completed } = useQuiz();

  // Build the base list. After the quiz → scored & ranked. Direct visit (browse
  // mode) → the full directory, unscored.
  const ranked: MatchResult[] = useMemo(
    () => (completed ? rankMatches(answers) : []),
    [completed, answers],
  );
  const browse = !completed;

  const [sort, setSort] = useState<SortKey>(completed ? 'match' : 'rating');
  const [deliveryFilter, setDeliveryFilter] = useState<Delivery[]>([]);
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  const rows = useMemo(() => {
    // Normalize to {therapist, match?} rows.
    let list = browse
      ? therapists.map((t) => ({ therapist: t, match: undefined as MatchResult | undefined }))
      : ranked.map((m) => ({ therapist: m.therapist, match: m }));

    if (deliveryFilter.length > 0) {
      list = list.filter((r) => deliveryFilter.some((d) => r.therapist.delivery.includes(d)));
    }
    if (acceptingOnly) {
      list = list.filter((r) => r.therapist.acceptingClients);
    }

    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case 'match':
          return (b.match?.score ?? 0) - (a.match?.score ?? 0);
        case 'rating':
          return b.therapist.rating - a.therapist.rating;
        case 'price':
          return a.therapist.sessionRate - b.therapist.sessionRate;
        case 'availability':
          return (
            (AVAIL_RANK[a.therapist.nextAvailable] ?? 2) -
            (AVAIL_RANK[b.therapist.nextAvailable] ?? 2)
          );
        default:
          return 0;
      }
    });
    return sorted;
  }, [browse, ranked, deliveryFilter, acceptingOnly, sort]);

  const topScore = ranked[0]?.score;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-[clamp(1.8rem,3.6vw,2.6rem)] font-extrabold text-heading">
            {completed ? 'Your matches' : 'Browse therapists'}
          </h1>
          <p className="mt-2.5 text-body leading-relaxed text-muted">
            {completed ? (
              <>
                {rows.length} verified therapists, ranked by fit
                {topScore != null && (
                  <>
                    {' '}
                    — your top match is <span className="font-semibold text-ink">{topScore}%</span>
                  </>
                )}
                . Open any profile to see exactly why.
              </>
            ) : (
              <>
                {rows.length} verified therapists. Want them ranked for you?{' '}
                <Link to="/match" className="font-medium text-ink underline underline-offset-2 hover:opacity-70">
                  Take the 5-minute match →
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="sort" className="text-meta text-muted">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-control border border-line bg-surface px-3 py-2.5 text-body font-medium text-ink outline-none focus:border-primary"
          >
            {completed && <option value="match">Best match</option>}
            <option value="rating">Highest rated</option>
            <option value="price">Lowest price</option>
            <option value="availability">Soonest available</option>
          </select>
        </div>
      </div>

      {/* Browse-mode prompt banner */}
      {browse && (
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-card border border-line bg-track/40 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-body font-medium text-ink">See these ranked for your needs.</p>
            <p className="text-body text-muted">
              Answer a few questions and each profile gets a personalized match score.
            </p>
          </div>
          <ButtonLink to="/match" size="sm">
            Start matching
          </ButtonLink>
        </div>
      )}

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-meta font-medium text-muted">Filter:</span>
        {DELIVERY_OPTIONS.map((o) => {
          const active = deliveryFilter.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() =>
                setDeliveryFilter((prev) =>
                  active ? prev.filter((d) => d !== o.value) : [...prev, o.value],
                )
              }
              className={`rounded-full border px-3.5 py-1.5 text-meta font-medium transition-colors ${
                active
                  ? 'border-primary bg-primary text-white'
                  : 'border-line bg-surface text-ink/80 hover:border-primary/40'
              }`}
            >
              {o.label}
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={acceptingOnly}
          onClick={() => setAcceptingOnly((v) => !v)}
          className={`rounded-full border px-3.5 py-1.5 text-meta font-medium transition-colors ${
            acceptingOnly
              ? 'border-primary bg-primary text-white'
              : 'border-line bg-surface text-ink/80 hover:border-primary/40'
          }`}
        >
          Accepting now
        </button>
        {(deliveryFilter.length > 0 || acceptingOnly) && (
          <button
            type="button"
            onClick={() => {
              setDeliveryFilter([]);
              setAcceptingOnly(false);
            }}
            className="ml-1 text-meta font-medium text-ink underline underline-offset-2 hover:opacity-70"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results grid */}
      {rows.length === 0 ? (
        <div className="mt-16 rounded-card border border-line bg-surface p-12 text-center">
          <p className="text-body font-medium text-ink">No therapists match those filters.</p>
          <p className="mt-2 text-body text-muted">Try clearing a filter to see more people.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => (
            <TherapistCard key={r.therapist.id} therapist={r.therapist} match={r.match} />
          ))}
        </div>
      )}

      {/* Footnote */}
      <p className="mx-auto mt-12 max-w-2xl text-center text-meta leading-relaxed text-muted">
        Match scores reflect fit with your stated preferences, not a clinical recommendation. In a
        crisis, call or text <span className="font-medium text-ink">988</span>.{' '}
        {completed && (
          <Chip tone="neutral" className="ml-1 align-middle">
            Answers stay on your device
          </Chip>
        )}
      </p>
    </div>
  );
}
