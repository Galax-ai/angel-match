import { useId } from 'react';
import { Link } from 'react-router-dom';

// The wordmark sets the name with a halo floating over the leading "A" — the
// signature of AngelMatch. <HaloMark> is the same idea as a standalone glyph,
// reused as a small brand icon around the app (kept static, never animated).

export function HaloMark({ size = 28 }: { size?: number }) {
  const gid = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <defs>
        {/* bright pink → deep magenta: a tilted ring of living light */}
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6B8A" />
          <stop offset="55%" stopColor="#FE2C55" />
          <stop offset="100%" stopColor="#C8127B" />
        </linearGradient>
      </defs>
      {/* the halo — a flat, tilted ring seen in light perspective */}
      <ellipse
        cx="14"
        cy="7.2"
        rx="9.7"
        ry="3"
        stroke={`url(#${gid})`}
        strokeWidth="2.2"
        transform="rotate(-11 14 7.2)"
      />
      {/* the "A" beneath it — inherits the theme ink so it flips in dark mode */}
      <path
        d="M14 11 L8.5 23 M14 11 L19.5 23 M10.6 19.2 H17.4"
        stroke="var(--color-ink)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The leading "A" of the wordmark with a halo set just above its apex. Drawn as
// a real SVG ellipse stroke (an open ring, tilted in perspective) and sized in
// `em` so the halo tracks the A at any font-size.
export function HaloA() {
  const gid = useId();
  return (
    <span className="relative inline-block">
      <svg
        aria-hidden="true"
        viewBox="0 0 100 30"
        className="pointer-events-none absolute left-1/2 top-[-0.30em] w-[0.82em] -translate-x-1/2 overflow-visible"
        style={{ filter: 'drop-shadow(0 0.01em 0.16em rgba(254,44,85,0.45))' }}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-primary-light)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
        </defs>
        <ellipse
          cx="50"
          cy="15"
          rx="44"
          ry="11"
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="5.5"
          transform="rotate(-10 50 15)"
        />
      </svg>
      A
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className ?? ''}`}
      aria-label="AngelMatch home"
    >
      <span className="text-[1.375rem] font-extrabold leading-none tracking-[-0.03em] text-ink">
        <HaloA />
        ngel<span className="text-primary">Match</span>
        <sup className="ml-[0.08em] align-super text-[0.4em] font-semibold tracking-normal text-ink/40">
          ™
        </sup>
      </span>
    </Link>
  );
}

export default Logo;
