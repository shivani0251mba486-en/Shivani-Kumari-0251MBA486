import { useState } from 'react';
import { Check, Shield, Star } from 'lucide-react';
import {
  CITIES,
  type CityId,
  EPC_PARTNERS,
  type EpcPartner,
  formatINR,
  calculatePmSuryaGharSubsidy,
} from '../data/solarData';

interface InstallerMarketplaceProps {
  selectedCity: CityId;
  recommendedKw: number;
  selectedInstallerId: string;
  onSelectInstaller: (partner: EpcPartner) => void;
  onBookWithInstaller: (partner: EpcPartner) => void;
}

export function InstallerMarketplace({
  selectedCity,
  recommendedKw,
  selectedInstallerId,
  onSelectInstaller,
  onBookWithInstaller,
}: InstallerMarketplaceProps) {
  const [cityFilter, setCityFilter] = useState<'all' | CityId>(selectedCity);

  const visiblePartners =
    cityFilter === 'all'
      ? EPC_PARTNERS
      : EPC_PARTNERS.filter((p) => p.cityId === cityFilter);

  const subsidy = calculatePmSuryaGharSubsidy(recommendedKw);

  return (
    <section id="installers" className="border-b border-slate-200 bg-[#F8FAFC] py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold tracking-wide text-amber-700">
              03. Escrow-Protected Tier-1 EPC Network
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Vetted local installers bound by 25-day SLAs
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Milestone payouts are held in SolarSewa escrow and released only after DISCOM
              net-metering grid synchronization. Quotes below are dynamically priced for your{' '}
              <span className="font-semibold text-slate-900 tabular-nums">
                {recommendedKw} kW
              </span>{' '}
              system.
            </p>
          </div>

          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1">
            <button
              type="button"
              onClick={() => setCityFilter('all')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                cityFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Cities
            </button>
            {(Object.keys(CITIES) as CityId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setCityFilter(id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  cityFilter === id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {CITIES[id].name}
              </button>
            ))}
          </div>
        </div>

        {/* Partner Cards Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visiblePartners.map((partner) => {
            const gross = partner.ratePerKw * recommendedKw;
            const net = Math.max(0, gross - subsidy);
            const isSelected = selectedInstallerId === partner.id;

            return (
              <article
                key={partner.id}
                className={`flex flex-col justify-between rounded-xl border bg-white p-6 transition-colors ${
                  isSelected
                    ? 'border-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        {partner.cityLabel} · {partner.completedHomes} DISCOM Syncs
                      </p>
                      <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
                        {partner.name}
                      </h3>
                    </div>
                    <div className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-900 tabular-nums">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      <span>{partner.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Modules</dt>
                      <dd className="font-medium text-slate-800 text-right">
                        {partner.panelBrand}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Inverter</dt>
                      <dd className="font-medium text-slate-800 text-right">
                        {partner.inverterBrand}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Avg Turnaround</dt>
                      <dd className="font-mono font-semibold text-emerald-700 tabular-nums">
                        {partner.avgDays} Days SLA
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Performance Warranty</dt>
                      <dd className="font-mono font-medium text-slate-800 tabular-nums">
                        {partner.warrantyYears} Years
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-xs text-slate-500">
                        Net for {recommendedKw} kW (Post-Subsidy)
                      </p>
                      <p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                        {formatINR(net)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <Shield className="h-3.5 w-3.5" />
                      Escrow
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectInstaller(partner);
                        onBookWithInstaller(partner);
                      }}
                      className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isSelected ? 'Selected · Book ₹499 Audit' : 'Select & Book Audit'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Competitor Battlefield Comparison Table */}
        <div className="mt-12 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="font-display text-base font-bold text-slate-900">
              How SolarSewa compares on a standard 3 kW residential installation
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Benchmarked against CEEW (2026) and MNRE regional residential solar market data
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="px-6 py-3.5">Evaluation Parameter</th>
                  <th className="px-6 py-3.5 text-slate-900 bg-amber-50/70">
                    SolarSewa Escrow Platform
                  </th>
                  <th className="px-6 py-3.5">Unorganized Local Contractors</th>
                  <th className="px-6 py-3.5">Legacy National Brands</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-900">
                    3 kW Gross Price (Pre-Subsidy)
                  </td>
                  <td className="px-6 py-3.5 font-mono font-semibold text-slate-900 bg-amber-50/40 tabular-nums">
                    ₹1,65,000 – ₹1,74,000
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-600 tabular-nums">
                    ₹1,40,000 – ₹1,60,000
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-600 tabular-nums">
                    ₹2,10,000 – ₹2,50,000
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-900">
                    DISCOM Net-Metering Turnaround
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-emerald-700 bg-amber-50/40 tabular-nums">
                    Guaranteed &le; 25 Days
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">90 to 180 Days (manual chasing)</td>
                  <td className="px-6 py-3.5 text-slate-600">45 to 75 Days (sub-contracted)</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-900">
                    Document Pre-Check &amp; Subsidy
                  </td>
                  <td className="px-6 py-3.5 text-slate-900 bg-amber-50/40">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Check className="h-4 w-4 text-emerald-600" />
                      Automated Aadhaar/Bill Audit
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">High rejection risk</td>
                  <td className="px-6 py-3.5 text-slate-600">Standard dealer filing</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-900">
                    Payment &amp; Hardware Protection
                  </td>
                  <td className="px-6 py-3.5 text-slate-900 bg-amber-50/40">
                    Escrow Release + Tier-1 Only
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">Upfront cash, unverified panels</td>
                  <td className="px-6 py-3.5 text-slate-600">Brand warranty, high markup</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
