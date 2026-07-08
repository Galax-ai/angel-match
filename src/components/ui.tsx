import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

// Small shared primitives so buttons, pills, and chips stay consistent.

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-control font-medium text-body leading-none transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed select-none';

// Uniform body text across all buttons — size is expressed through padding,
// not font-size, so button labels stay on the type ramp.
const sizes = {
  md: 'px-5 py-3',
  lg: 'px-6 py-3.5',
  sm: 'px-3.5 py-2',
} as const;

const variants = {
  // Gradient stays within the primary range so white-on-button contrast holds (AA);
  // the depth + soft lift make the primary CTA the striking, on-brand moment.
  primary:
    'bg-gradient-to-b from-primary to-primary-600 text-white shadow-[0_8px_22px_-10px_rgba(224,30,69,0.7)] hover:from-primary-600 hover:to-primary-600 hover:shadow-[0_10px_26px_-10px_rgba(224,30,69,0.8)]',
  secondary: 'bg-surface text-ink border border-line hover:border-primary/40 hover:bg-track/40',
  ghost: 'text-ink hover:bg-track/50',
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: CommonProps & { to: string }) {
  return (
    <Link to={to} className={cn(base, sizes[size], variants[variant], className)}>
      {children}
    </Link>
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}: CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { type?: 'button' | 'submit' | 'reset' }) {
  return (
    <button
      type={type}
      className={cn(base, sizes[size], variants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-fine font-semibold uppercase tracking-[0.16em] text-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Chip({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'primary';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-track/55 text-ink/75',
    primary: 'bg-track/80 text-ink/90',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-fine font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Verified checkmark used on credentialed providers. */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-track/70 px-2 py-0.5 text-fine font-medium text-ink/75',
        className,
      )}
      title="License & credentials verified by AngelMatch"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 12l2 2 4-4"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      </svg>
      Verified
    </span>
  );
}
