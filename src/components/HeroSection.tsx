import type { User } from 'firebase/auth';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { CITIES, type CityId, type SolarCalculation, formatINR } from '../data/solarData';

interface HeroSectionProps {
  selectedCity: CityId;
  calculation: SolarCalculation;
  user: User | null;
  authLoading: boolean;
  onSelectCity: (city: CityId) => void;
  onStartCalculator: () => void;
  onSignIn: () => void;
}

export function HeroSection({
  selectedCity,
  calculation,
  user,
  authLoading,
  onSelectCity,
  onStartCalculator,
  onSignIn,
}: HeroSectionProps) {
  const city = CITIES[selectedCity];

  return (
    <section id="top" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-center lg:col-span-7">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span>PM Surya Ghar Partner Platform</span>
              <span aria-hidden="true">·</span>
              <span>Surat, Indore, Kota &amp; Jaipur</span>
              <span aria-hidden="true">·</span>
              <span>25-Day Turnkey SLA</span>
            </div>

            <h1
              className="font-display font-bold tracking-tight text-slate-900 [text-wrap:balance]"
              style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', lineHeight: 1.08 }}
            >
              Switch your home to solar in 25 days, without DISCOM chaos.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              SolarSewa maps your roof by satellite, pre-audits your Aadhaar and electricity
              bill for zero-rejection PM Surya Ghar subsidies up to ₹78,000, and holds your
              Tier-1 installer&apos;s payment in escrow until net-metering goes live.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartCalculator}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <span>Calculate Your 3D Roof ROI</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="#tracker"
                className="inline-flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-900 hover:decoration-slate-900 whitespace-nowrap shrink-0"
              >
                Inspect 25-Day Workflow
              </a>
            </div>

            <div className="mt-8 space-y-3 border-t border-slate-100 pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-slate-500">Active launch hub:</span>
                <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
                  {(Object.keys(CITIES) as CityId[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onSelectCity(id)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        selectedCity === id
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {CITIES[id].name}
                    </button>
                  ))}
                </div>
              </div>

              {!authLoading && (
                <p className="text-xs text-slate-500">
                  {user ? (
                    <>
                      Signed in as{' '}
                      <span className="font-medium text-slate-800">
                        {user.displayName || user.email}
                      </span>{' '}
                      · Your pre-audits and ₹499 bookings sync to Firestore automatically.
                    </>
                  ) : (
                    <>
                      Want to save your roof audit and track live DISCOM approvals?{' '}
                      <button
                        type="button"
                        onClick={onSignIn}
                        className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900"
                      >
                        Sign in with Google
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex">
            <div className="flex w-full flex-col justify-between rounded-xl border border-slate-200 bg-slate-900 p-6 text-white">
              <div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Aerial Roof Feasibility Preview
                    </p>
                    <p className="mt-0.5 font-display text-lg font-semibold text-white">
                      {city.sampleNeighborhood}, {city.name}
                    </p>
                  </div>
                  <div className="text-right font-mono text-xs text-amber-400 tabular-nums">
                    {city.irradiance} kWh/m²/day
                  </div>
                </div>

                {/* Isometric / Satellite Roof Blueprint SVG */}
                <div className="my-5 rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <svg
                    viewBox="0 0 360 190"
                    className="h-44 w-full"
                    role="img"
                    aria-label={`Satellite roof panel blueprint showing ${calculation.panelCount} solar modules for ${city.name}`}
                  >
                    {/* Subtle coordinate grid */}
                    <defs>
                      <pattern
                        id="hero-grid"
                        width="24"
                        height="24"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 24 0 L 0 0 0 24"
                          fill="none"
                          stroke="#1E293B"
                          strokeWidth="0.75"
                        />
                      </pattern>
                    </defs>
                    <rect width="360" height="190" fill="url(#hero-grid)" rx="6" />

                    {/* Property boundary & RCC roof footprint */}
                    <polygon
                      points="46,40 282,28 314,146 78,162"
                      fill="#1E293B"
                      stroke="#475569"
                      strokeWidth="1.5"
                    />
                    {/* Parapet inner edge */}
                    <polygon
                      points="58,49 272,38 300,136 86,150"
                      fill="#0F172A"
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray="4 3"
                    />

                    {/* Solar Panels dynamically laid out */}
                    {Array.from({ length: Math.min(calculation.panelCount, 12) }).map(
                      (_, idx) => {
                        const col = idx % 4;
                        const row = Math.floor(idx / 4);
                        const x = 76 + col * 48 + row * 7;
                        const y = 58 + row * 28 - col * 1.5;
                        return (
                          <g key={idx}>
                            <rect
                              x={x}
                              y={y}
                              width="40"
                              height="22"
                              rx="2"
                              fill="#1D4ED8"
                              stroke="#93C5FD"
                              strokeWidth="1"
                            />
                            <line
                              x1={x + 20}
                              y1={y}
                              x2={x + 20}
                              y2={y + 22}
                              stroke="#60A5FA"
                              strokeWidth="0.6"
                              opacity="0.7"
                            />
                            <line
                              x1={x}
                              y1={y + 11}
                              x2={x + 40}
                              y2={y + 11}
                              stroke="#60A5FA"
                              strokeWidth="0.6"
                              opacity="0.7"
                            />
                          </g>
                        );
                      }
                    )}

                    {/* Sun azimuth indicator */}
                    <circle cx="326" cy="30" r="10" fill="#F59E0B" />
                    <path
                      d="M312 42 L292 56"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                    <text
                      x="24"
                      y="180"
                      fill="#94A3B8"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      AZIMUTH 180° S · PIN {city.samplePin}
                    </text>
                  </svg>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-800 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Recommended Size</p>
                    <p className="mt-0.5 font-mono text-lg font-semibold text-white tabular-nums">
                      {calculation.effectiveKw} kW ({calculation.panelCount} panels)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">PM Surya Ghar Subsidy</p>
                    <p className="mt-0.5 font-mono text-lg font-semibold text-emerald-400 tabular-nums">
                      {formatINR(calculation.pmSuryaGharSubsidy)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    DISCOM: {city.discom}
                  </span>
                  <span className="font-mono text-amber-400 tabular-nums">
                    Avg {city.avgTurnaroundDays}d sync
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-column benchmark strip directly below hero split */}
        <div className="mt-10 grid grid-cols-1 gap-6 border-t border-slate-200 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              &le; 25 Days
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              Guaranteed Grid Synchronization
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Down from 90+ days with unorganized offline contractors
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              ₹78,000
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              Direct Bank CFA Subsidy
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Pre-audited Aadhaar, PAN &amp; DISCOM filing on MNRE portal
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              100% Escrow
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              Milestone-Protected EPC Payouts
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Final installer funds released only after net-meter commissioning
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              7.0% p.a.
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              Collateral-Free Jansamarth EMI
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Month-1 EMI stays lower than your previous monthly utility bill
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
