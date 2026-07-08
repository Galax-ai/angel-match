import type { MatchFactor } from '../lib/types';

// Transparent score breakdown. The whole point of AngelMatch is that the
// number is explainable — this renders each weighted factor, what it earned,
// and the plain-language reason.

export function MatchBreakdown({
  factors,
  compact = false,
}: {
  factors: MatchFactor[];
  compact?: boolean;
}) {
  return (
    <ul className={compact ? 'space-y-2.5' : 'space-y-4'}>
      {factors.map((f) => {
        const pct = f.possible === 0 ? 0 : Math.round((f.earned / f.possible) * 100);
        return (
          <li key={f.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="flex items-center gap-1.5 text-meta font-medium text-ink">
                <span
                  aria-hidden="true"
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    f.hit ? 'bg-ink/70' : 'bg-track'
                  }`}
                />
                {f.label}
              </span>
              <span className="shrink-0 text-fine font-medium tabular-nums text-muted">
                {f.earned}/{f.possible}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-track">
              <div
                className="h-full rounded-full bg-ink/80 transition-[width] duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            {!compact && <p className="mt-1.5 text-meta leading-snug text-muted">{f.detail}</p>}
          </li>
        );
      })}
    </ul>
  );
}

export default MatchBreakdown;
