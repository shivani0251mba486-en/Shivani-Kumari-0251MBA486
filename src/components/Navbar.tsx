import type { User } from 'firebase/auth';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  user: User | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenBooking: () => void;
}

export function Navbar({
  user,
  authLoading,
  onSignIn,
  onSignOut,
  onOpenBooking,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '#calculator', label: 'Roof Calculator' },
    { href: '#precheck', label: 'Document Check' },
    { href: '#installers', label: 'Tier-1 Installers' },
    { href: '#tracker', label: '25-Day Tracker' },
  ];

  const firstName = user?.displayName?.split(' ')[0] || 'Account';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        <a
          href="#top"
          className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
        >
          SolarSewa
        </a>

        <nav
          aria-label="Primary"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap shrink-0 py-1 text-slate-600 transition-colors hover:text-slate-900 hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          {!authLoading &&
            (user ? (
              <div className="hidden sm:flex items-center gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="h-6 w-6 rounded-full object-cover border border-slate-200"
                    />
                  )}
                  <span className="max-w-[110px] truncate font-medium text-slate-800">
                    {firstName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 whitespace-nowrap shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 underline decoration-slate-300 underline-offset-4 whitespace-nowrap shrink-0"
              >
                Sign in with Google
              </button>
            ))}

          <button
            type="button"
            onClick={onOpenBooking}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            Book ₹499 Audit
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
            {!authLoading &&
              (user ? (
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 px-2 text-xs">
                  <span className="font-medium text-slate-800 truncate">
                    {user.displayName || user.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      onSignOut();
                    }}
                    className="font-semibold text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onSignIn();
                  }}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Sign in with Google
                </button>
              ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenBooking();
              }}
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Book ₹499 Audit
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
