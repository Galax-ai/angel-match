import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Logo, HaloA } from './Logo';
import { AngelIcon } from './AngelIcon';
import { ButtonLink } from './ui';
import { ThemeToggle } from './ThemeToggle';

const NAV = [
  { to: '/match/results', label: 'Browse therapists' },
  { to: '/match', label: 'How it works', hash: '/#how' },
  { to: '/providers', label: 'For therapists' },
];

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [loc.pathname]);

  // Collapse the wordmark to the angel icon once the page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
        {scrolled ? (
          <Link
            to="/"
            aria-label="AngelMatch home"
            className="inline-flex items-center text-ink transition-opacity duration-200"
          >
            <AngelIcon height={30} />
          </Link>
        ) : (
          <Logo />
        )}

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.hash ?? item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-body font-medium transition-colors ${
                  isActive && !item.hash ? 'text-ink font-semibold' : 'text-ink/65 hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <ThemeToggle className="ml-1" />
          <ButtonLink to="/match" size="sm" className="ml-1">
            Find a therapist
          </ButtonLink>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="-mr-2 inline-flex items-center justify-center rounded-lg p-2 text-ink"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-canvas px-5 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.hash ?? item.to}
                className="rounded-lg px-3 py-2.5 text-body font-medium text-ink/80 hover:bg-track/50"
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink to="/match" className="mt-2 w-full">
              Find a therapist
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const cols = [
    {
      title: 'Product',
      links: [
        { label: 'Find a therapist', to: '/match' },
        { label: 'Browse directory', to: '/match/results' },
        { label: 'How the score works', to: '/#faq' },
        { label: 'For therapists', to: '/providers' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', to: '/#why' },
        { label: 'Careers', to: '/providers' },
        { label: 'Contact', to: 'mailto:hello@angelmatch.com', external: true },
      ],
    },
    {
      title: 'Trust & legal',
      links: [
        { label: 'Privacy', to: '/#faq' },
        { label: 'Terms', to: '/#faq' },
        { label: 'HIPAA posture', to: '/#faq' },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-line bg-feature text-offwhite">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <AngelIcon height={44} className="mb-5 text-offwhite/90" title="AngelMatch" />
            <Link to="/" className="inline-flex items-center" aria-label="AngelMatch home">
              <span className="text-[1.25rem] font-extrabold leading-none tracking-[-0.03em] text-offwhite">
                <HaloA />
                ngelMatch
                <sup className="ml-[0.08em] align-super text-[0.4em] font-semibold tracking-normal text-offwhite/45">
                  ™
                </sup>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-body leading-relaxed text-offwhite/70">
              Find the therapist who fits — matched on specialty, approach, values, budget, and real
              availability.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-fine font-semibold uppercase tracking-[0.12em] text-offwhite/50">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {'external' in l && l.external ? (
                      <a
                        href={l.to}
                        className="text-body text-offwhite/70 hover:text-offwhite"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.to} className="text-body text-offwhite/70 hover:text-offwhite">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-offwhite/15 pt-6 text-meta text-offwhite/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {2026} AngelMatch, Inc. Not a medical or emergency service.</p>
          <p className="max-w-xl sm:text-right">
            In crisis? Call or text <span className="font-medium text-offwhite/80">988</span> (US
            Suicide &amp; Crisis Lifeline), available 24/7.
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Scrolls to top on navigation, and to #anchors when present. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <ScrollManager />
      <Nav />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
