import { useEffect, useId, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// ScoreGauge — the signature element of AngelMatch.
//
// A circular ring filled to a 0–100 value. Used three ways:
//   • the logo motif (small, no number)
//   • the headline match number on results & profiles (large, animated)
//   • inline score chips
//
// Pure SVG, no dependencies, fully scalable. Animates on mount by tweening the
// ring's stroke-dashoffset, and respects prefers-reduced-motion (jumps to the
// final value with no animation).
// ─────────────────────────────────────────────────────────────────────────

export interface ScoreGaugeProps {
  /** 0–100 */
  value: number;
  /** Outer pixel size of the square SVG. */
  size?: number;
  /** Ring thickness. */
  strokeWidth?: number;
  /** Show the numeric value in the center. */
  showValue?: boolean;
  /** Small caption under the value, e.g. "match". */
  caption?: string;
  /** Animate the ring + counter on mount. */
  animate?: boolean;
  className?: string;
  /** Accessible label override. */
  ariaLabel?: string;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

export function ScoreGauge({
  value,
  size = 160,
  strokeWidth,
  showValue = true,
  caption,
  animate = true,
  className,
  ariaLabel,
}: ScoreGaugeProps) {
  const target = Math.max(0, Math.min(100, Math.round(value)));
  const gradientId = useId();
  const sw = strokeWidth ?? Math.max(6, Math.round(size * 0.085));
  const radius = (size - sw) / 2;
  const circumference = 2 * Math.PI * radius;

  const [progress, setProgress] = useState(() => (animate ? 0 : target));
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!animate || prefersReducedMotion()) {
      setProgress(target);
      return;
    }
    const duration = 900;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(target * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, animate]);

  const dashoffset = circumference * (1 - progress / 100);
  const fontSize = Math.round(size * 0.3);
  const captionSize = Math.round(size * 0.1);

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: 'relative', lineHeight: 1 }}
      role="img"
      aria-label={ariaLabel ?? `${target} out of 100 match`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          {/* Deep magenta sweeping into bright pink -- the brand fill. */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B01062" />
            <stop offset="40%" stopColor="#FE2C55" />
            <stop offset="72%" stopColor="#FF6B8A" />
            <stop offset="100%" stopColor="#FFA6BC" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-track)"
          strokeWidth={sw}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: prefersReducedMotion() ? 'none' : undefined }}
        />
      </svg>
      {showValue && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize,
              fontWeight: 700,
              color: 'var(--color-ink)',
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {Math.round(progress)}
            <span style={{ fontSize: Math.round(fontSize * 0.45), color: 'var(--color-muted)' }}>%</span>
          </span>
          {caption && (
            <span
              style={{
                fontSize: captionSize,
                fontWeight: 500,
                color: 'var(--color-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginTop: Math.round(size * 0.02),
              }}
            >
              {caption}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ScoreGauge;
