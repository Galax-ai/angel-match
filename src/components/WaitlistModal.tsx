import { useEffect, useRef, useState } from 'react';
import type { Therapist } from '../lib/types';
import { joinWaitlist } from '../lib/integrations';
import { Button } from './ui';

// Stubbed "Book" flow. Real booking/calendar sync attaches in lib/integrations
// (requestBooking). For now we capture interest only — and only an email, with
// no health data — via the joinWaitlist stub.

export function WaitlistModal({
  therapist,
  onClose,
}: {
  therapist: Therapist;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState('sending');
    await joinWaitlist({ therapistId: therapist.id, email: email.trim() });
    setState('done');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-title"
        className="w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {state === 'done' ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-track text-ink/80">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 id="waitlist-title" className="mt-4 text-title font-bold text-ink">
              You’re on the list
            </h2>
            <p className="mt-2 text-body text-muted">
              We’ll email you the moment direct booking with {therapist.name.split(' ')[0]} opens.
              No spam, ever.
            </p>
            <Button onClick={onClose} className="mt-6 w-full">
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-fine font-semibold uppercase tracking-[0.14em] text-muted">
                  Coming soon
                </span>
                <h2 id="waitlist-title" className="mt-1 text-title font-bold text-ink">
                  Book with {therapist.name.split(' ').slice(0, 2).join(' ')}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 -mt-1 rounded-lg p-2 text-muted hover:bg-track/50 hover:text-ink"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <p className="mt-3 text-body leading-relaxed text-muted">
              Direct booking is rolling out now. Leave your email and we’ll let you know the second
              you can schedule — you’ll be first in line.
            </p>

            <form onSubmit={submit} className="mt-5">
              <label htmlFor="waitlist-email" className="text-meta font-medium text-ink">
                Email address
              </label>
              <input
                ref={firstFieldRef}
                id="waitlist-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-1.5 w-full rounded-control border border-line bg-canvas px-3.5 py-3 text-body text-ink outline-none placeholder:text-muted/70 focus:border-primary"
              />
              <Button type="submit" disabled={state === 'sending'} className="mt-4 w-full">
                {state === 'sending' ? 'Adding you…' : 'Notify me'}
              </Button>
              <p className="mt-3 text-center text-fine text-muted">
                We never collect health information here. See our HIPAA posture.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default WaitlistModal;
