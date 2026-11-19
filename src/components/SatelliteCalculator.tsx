import { useState } from 'react';
import {
  CITIES,
  type CityId,
  type RoofCondition,
  type SolarCalculation,
  formatINR,
} from '../data/solarData';
import { Check, Compass, IndianRupee } from 'lucide-react';

interface SatelliteCalculatorProps {
  selectedCity: CityId;
  monthlyBill: number;
  roofAreaSqFt: number;
  roofCondition: RoofCondition;
  calculation: SolarCalculation;
  onCityChange: (city: CityId) => void;
  onMonthlyBillChange: (bill: number) => void;
  onRoofAreaChange: (area: number) => void;
  onConditionChange: (cond: RoofCondition) => void;
  onLockQuote: () => void;
}

const ROOF_PRESETS: Array<{
  label: string;
  city: CityId;
  bill: number;
  area: number;
  condition: RoofCondition;
}> = [
  {
    label: 'Surat 3BHK Bungalow',
    city: 'surat',
    bill: 4500,
    area: 450,
    condition: 'clear-rcc',
  },
  {
    label: 'Indore Duplex Home',
    city: 'indore',
    bill: 6200,
    area: 600,
    condition: 'clear-rcc',
  },
  {
    label: 'Kota Corner Plot',
    city: 'kota',
    bill: 8500,
    area: 720,
    condition: 'partial-shade',
  },
];

export function SatelliteCalculator({
  selectedCity,
  monthlyBill,
  roofAreaSqFt,
  roofCondition,
  calculation,
  onCityChange,
  onMonthlyBillChange,
  onRoofAreaChange,
  onConditionChange,
  onLockQuote,
}: SatelliteCalculatorProps) {
  const [financingMode, setFinancingMode] = useState<'loan' | 'cash'>('loan');
  const city = CITIES[selectedCity];

  const areaLimited = calculation.recommendedKw > calculation.maxRoofKw;

  // Compute panel grid columns/rows for SVG roof map
  const cols = Math.min(5, Math.max(2, Math.ceil(Math.sqrt(calculation.panelCount * 1.5))));
  const rows = Math.ceil(calculation.panelCount / cols);

  return (
    <section id="calculator" className="border-b border-slate-200 bg-[#F8FAFC] py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold tracking-wide text-amber-700">
              01. Satellite Roof Assessment &amp; ROI Calculator
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Instant 3D roof sizing &amp; PM Surya Ghar economics
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Configure your city DISCOM, monthly electricity bill, and usable roof area to
              simulate panel placement, central subsidy eligibility, and Month-1 cash flow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Presets:</span>
            {ROOF_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  onCityChange(preset.city);
                  onMonthlyBillChange(preset.bill);
                  onRoofAreaChange(preset.area);
                  onConditionChange(preset.condition);
                }}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left column: Interactive Controls + Satellite Blueprint */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="calc-city"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    City &amp; State DISCOM
                  </label>
                  <select
                    id="calc-city"
                    value={selectedCity}
                    onChange={(e) => onCityChange(e.target.value as CityId)}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    {(Object.keys(CITIES) as CityId[]).map((id) => (
                      <option key={id} value={id}>
                        {CITIES[id].name}, {CITIES[id].state} ({CITIES[id].discom})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="calc-roof-type"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Roof Structure &amp; Shading
                  </label>
                  <select
                    id="calc-roof-type"
                    value={roofCondition}
                    onChange={(e) => onConditionChange(e.target.value as RoofCondition)}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="clear-rcc">Clear Flat RCC Roof (100% Sun)</option>
                    <option value="sloped-roof">Sloped Tile / Metal Roof (92% Yield)</option>
                    <option value="partial-shade">Partial Parapet / Tree Shade (86% Yield)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <label htmlFor="calc-bill" className="font-semibold text-slate-800">
                      Average Monthly Electricity Bill
                    </label>
                    <span className="font-mono text-base font-semibold text-slate-900 tabular-nums">
                      {formatINR(monthlyBill)} / mo
                    </span>
                  </div>
                  <input
                    id="calc-bill"
                    type="range"
                    min={3000}
                    max={15000}
                    step={250}
                    value={monthlyBill}
                    onChange={(e) => onMonthlyBillChange(Number(e.target.value))}
                    className="mt-2.5 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-500"
                  />
                  <div className="mt-1 flex justify-between font-mono text-xs text-slate-400 tabular-nums">
                    <span>₹3,000</span>
                    <span>₹9,000</span>
                    <span>₹15,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <label htmlFor="calc-area" className="font-semibold text-slate-800">
                      Shadow-Free Usable Roof Area
                    </label>
                    <span className="font-mono text-base font-semibold text-slate-900 tabular-nums">
                      {roofAreaSqFt} sq ft
                    </span>
                  </div>
                  <input
                    id="calc-area"
                    type="range"
                    min={200}
                    max={1200}
                    step={50}
                    value={roofAreaSqFt}
                    onChange={(e) => onRoofAreaChange(Number(e.target.value))}
                    className="mt-2.5 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-500"
                  />
                  <div className="mt-1 flex justify-between font-mono text-xs text-slate-400 tabular-nums">
                    <span>200 sq ft</span>
                    <span>700 sq ft</span>
                    <span>1,200 sq ft</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Satellite Roof Canvas */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    Simulated Satellite Roof Array Layout
                  </h3>
                  <p className="text-xs text-slate-500">
                    {calculation.panelCount} × 540 Wp Tier-1 Mono-PERC panels · Requires{' '}
                    {calculation.roofAreaUsedSqFt} sq ft net footprint
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 tabular-nums">
                  <Compass className="h-4 w-4 text-amber-600" />
                  <span>South Tilt 21° · {city.irradiance} kWh/m²</span>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-950 p-4">
                <svg
                  viewBox="0 0 560 230"
                  className="h-52 w-full"
                  role="img"
                  aria-label={`Roof layout diagram fitting ${calculation.panelCount} solar panels in ${rows} rows`}
                >
                  <defs>
                    <pattern
                      id="sat-grid"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="#1E293B"
                        strokeWidth="0.7"
                      />
                    </pattern>
                  </defs>
                  <rect width="560" height="230" fill="url(#sat-grid)" rx="6" />

                  {/* Scaled roof slab */}
                  <rect
                    x="44"
                    y="24"
                    width="472"
                    height="176"
                    rx="4"
                    fill="#1E293B"
                    stroke="#64748B"
                    strokeWidth="1.5"
                  />

                  {/* Shading overlay if partial shade */}
                  {roofCondition === 'partial-shade' && (
                    <polygon
                      points="44,24 165,24 115,200 44,200"
                      fill="#020617"
                      opacity="0.55"
                    />
                  )}

                  {/* Dynamic solar panels */}
                  {Array.from({ length: calculation.panelCount }).map((_, index) => {
                    const col = index % cols;
                    const row = Math.floor(index / cols);
                    const totalWidth = cols * 64 + (cols - 1) * 10;
                    const startX = Math.max(66, (560 - totalWidth) / 2);
                    const startY = rows <= 2 ? 56 : 38;
                    const x = startX + col * 74;
                    const y = startY + row * 40;
                    if (y + 32 > 195) return null;
                    return (
                      <g key={index}>
                        <rect
                          x={x}
                          y={y}
                          width="64"
                          height="32"
                          rx="2"
                          fill="#1E3A8A"
                          stroke="#93C5FD"
                          strokeWidth="1"
                        />
                        <line
                          x1={x + 32}
                          y1={y}
                          x2={x + 32}
                          y2={y + 32}
                          stroke="#60A5FA"
                          strokeWidth="0.6"
                          opacity="0.7"
                        />
                        <line
                          x1={x}
                          y1={y + 16}
                          x2={x + 64}
                          y2={y + 16}
                          stroke="#60A5FA"
                          strokeWidth="0.6"
                          opacity="0.7"
                        />
                      </g>
                    );
                  })}

                  <text
                    x="54"
                    y="216"
                    fill="#94A3B8"
                    fontSize="11"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    USABLE ROOF: {roofAreaSqFt} SQ FT · SYSTEM: {calculation.effectiveKw} KW ·
                    EST. GENERATION: {calculation.monthlyGenerationKwh} KWH/MO
                  </text>
                </svg>
              </div>

              {areaLimited && (
                <p className="mt-3 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Note: Your monthly bill suggests {calculation.recommendedKw} kW, while your
                  entered roof area safely accommodates up to {calculation.maxRoofKw} kW. Our
                  site engineer can evaluate elevated pergola mounting to fit higher capacity.
                </p>
              )}
            </div>
          </div>

          {/* Right column: Financial & Cash-Flow Output */}
          <div className="lg:col-span-5">
            <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6">
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Recommended System</p>
                    <p className="mt-0.5 font-display text-2xl font-bold text-slate-900 tabular-nums">
                      {calculation.effectiveKw} kW Rooftop Plant
                    </p>
                  </div>

                  <div className="inline-flex rounded-lg bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setFinancingMode('loan')}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        financingMode === 'loan'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Jansamarth Loan
                    </button>
                    <button
                      type="button"
                      onClick={() => setFinancingMode('cash')}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        financingMode === 'cash'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Upfront Cash
                    </button>
                  </div>
                </div>

                {/* Price & Subsidy Table */}
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-600">Gross Turnkey System Cost</dt>
                    <dd className="font-mono font-medium text-slate-900 tabular-nums">
                      {formatINR(calculation.grossSystemCost)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-emerald-700 font-medium">
                      PM Surya Ghar CFA Subsidy
                    </dt>
                    <dd className="font-mono font-semibold text-emerald-700 tabular-nums">
                      -{formatINR(calculation.pmSuryaGharSubsidy)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                    <dt className="font-semibold text-slate-900">Net Effective Cost</dt>
                    <dd className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                      {formatINR(calculation.netSystemCost)}
                    </dd>
                  </div>
                </dl>

                {/* Month-1 Cash Flow Box */}
                <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-700">
                    {financingMode === 'loan'
                      ? 'Month-1 Cash-Flow Positive Check (7% p.a., 10-Yr EMI)'
                      : 'Monthly Utility Bill Elimination'}
                  </p>

                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Current {city.discom} Bill</span>
                      <span className="font-mono text-slate-900 tabular-nums">
                        {formatINR(monthlyBill)} / mo
                      </span>
                    </div>

                    {financingMode === 'loan' && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Jansamarth Solar EMI</span>
                        <span className="font-mono text-slate-900 tabular-nums">
                          {formatINR(calculation.monthlyLoanEmi)} / mo
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Residual Grid Fixed Charge</span>
                      <span className="font-mono text-slate-900 tabular-nums">
                        {formatINR(calculation.residualMonthlyBill)} / mo
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 font-semibold">
                      <span className="text-emerald-800">
                        {financingMode === 'loan'
                          ? 'Net Cash Saved Every Month'
                          : 'Monthly Electricity Savings'}
                      </span>
                      <span className="font-mono text-base text-emerald-700 tabular-nums">
                        {financingMode === 'loan'
                          ? formatINR(calculation.netMonthlySavings)
                          : formatINR(monthlyBill - calculation.residualMonthlyBill)}{' '}
                        / mo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payback & 25-year ROI */}
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-200 p-3.5">
                    <p className="text-xs text-slate-500">Payback Period</p>
                    <p className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
                      {calculation.paybackYears} Years
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3.5">
                    <p className="text-xs text-slate-500">25-Yr Net Wealth Gain</p>
                    <p className="mt-1 font-mono text-lg font-bold text-emerald-700 tabular-nums">
                      {formatINR(calculation.lifetimeSavings25Yr)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onLockQuote}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                >
                  <IndianRupee className="h-4 w-4 text-amber-400" />
                  <span>Lock {calculation.effectiveKw} kW Quote with ₹499 Refundable Deposit</span>
                </button>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    100% refundable if roof unfeasible
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Includes DISCOM concierge filing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
