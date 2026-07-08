import { useState } from 'react';
import { cn } from './ui';

// Initials avatar. Real photos slot in via `photoUrl` when present; until then
// we render a calm, deterministic monogram so the directory still feels human.

// Self-contained monogram tiles — magenta/charcoal on both light & dark canvas.
const TINTS = [
  { bg: '#FFE3EA', fg: '#C8127B' },
  { bg: '#FE2C55', fg: '#FFFFFF' },
  { bg: '#2A2A31', fg: '#FF8AA3' },
  { bg: '#1B1B20', fg: '#F6F6F7' },
];

function initials(name: string): string {
  return name
    .replace(/^(Dr\.|Pastor|Rev\.)\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function Avatar({
  name,
  id,
  photoUrl,
  size = 56,
  className,
}: {
  name: string;
  id: string;
  photoUrl?: string;
  size?: number;
  className?: string;
}) {
  const tint = TINTS[hash(id) % TINTS.length];
  const [imgFailed, setImgFailed] = useState(false);

  if (photoUrl && !imgFailed) {
    return (
      <img
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setImgFailed(true)}
        className={cn('rounded-full bg-track object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', className)}
      style={{
        width: size,
        height: size,
        background: tint.bg,
        color: tint.fg,
        fontSize: Math.round(size * 0.38),
        letterSpacing: '-0.02em',
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}

export default Avatar;
