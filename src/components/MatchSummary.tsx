import { useEffect, useState } from 'react';
import { narrateMatch } from '../lib/integrations';
import type { MatchResult } from '../lib/types';

// A one-paragraph, plain-language read of the match — the warm lead-in above the
// numeric breakdown. The score and the breakdown stay the source of truth (they
// render separately, straight from the matcher); this is purely supplementary.
// If the summarizer is off or fails, the component renders nothing, so the
// breakdown below it is never blocked on the model.

export function MatchSummary({ match }: { match: MatchResult }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Re-summarize when the therapist or the score changes. Guarded against
  // setting state after unmount / a stale response winning a race.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setSummary(null);

    narrateMatch(match)
      .then((res) => {
        if (!active) return;
        setSummary(res.ok && res.summary ? res.summary : null);
      })
      .catch(() => {
        if (active) setSummary(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.therapist.id, match.score]);

  if (loading) {
    return (
      <div className="mt-5 space-y-2" aria-hidden="true">
        <div className="h-2.5 w-full animate-pulse rounded-full bg-track" />
        <div className="h-2.5 w-5/6 animate-pulse rounded-full bg-track" />
        <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-track" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <p className="mt-5 rounded-control bg-track/40 px-4 py-3 text-meta leading-relaxed text-ink/80">
      {summary}
    </p>
  );
}

export default MatchSummary;
