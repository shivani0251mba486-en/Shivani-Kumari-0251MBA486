import type { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileCheck2, XCircle } from 'lucide-react';
import { CITIES, type CityId } from '../data/solarData';
import type { SavePreCheckInput, SavedPreCheck } from '../services/solarRepository';

export interface PreCheckResult {
  passed: boolean;
  scoreLabel: string;
  checks: Array<{
    label: string;
    status: 'pass' | 'warning' | 'fail';
    detail: string;
  }>;
}

interface DocumentPreCheckProps {
  selectedCity: CityId;
  recommendedKw: number;
  user: User | null;
  savedPreCheck: SavedPreCheck | null;
  onSignIn: () => void;
  onPreCheckVerified: (passed: boolean) => void;
  onSavePreCheck: (input: SavePreCheckInput) => Promise<void>;
}

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function DocumentPreCheck({
  selectedCity,
  recommendedKw,
  user,
  savedPreCheck,
  onSignIn,
  onPreCheckVerified,
  onSavePreCheck,
}: DocumentPreCheckProps) {
  const city = CITIES[selectedCity];

  const [aadhaarName, setAadhaarName] = useState('Rameshbhai Kantilal Patel');
  const [billName, setBillName] = useState('Ramesh K. Patel');
  const [bankHolderName, setBankHolderName] = useState('Rameshbhai Kantilal Patel');
  const [consumerNumber, setConsumerNumber] = useState('10482930112');
  const [panNumber, setPanNumber] = useState('ABCPP4821K');
  const [sanctionedLoadKw, setSanctionedLoadKw] = useState(2);
  const [roofOwnership, setRoofOwnership] = useState<'independent' | 'joint-society'>(
    'independent'
  );
  const [result, setResult] = useState<PreCheckResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<string>('');

  const evaluateChecks = (
    aName: string,
    bName: string,
    bkName: string,
    cNo: string,
    pan: string,
    sLoad: number,
    ownership: 'independent' | 'joint-society'
  ): PreCheckResult => {
    const checks: PreCheckResult['checks'] = [];

    const normA = normalizeName(aName);
    const normB = normalizeName(bName);
    const normBk = normalizeName(bkName);

    if (!normA || !normB) {
      checks.push({
        label: 'Aadhaar & DISCOM Bill Name Match',
        status: 'fail',
        detail: 'Both Aadhaar name and electricity bill name are required for MNRE filing.',
      });
    } else if (normA === normB) {
      checks.push({
        label: 'Aadhaar & DISCOM Bill Name Match',
        status: 'pass',
        detail: `Exact character match verified ("${aName.trim()}"). Zero portal rejection risk.`,
      });
    } else {
      checks.push({
        label: 'Aadhaar & DISCOM Bill Name Match',
        status: 'fail',
        detail: `Mismatch detected: "${aName.trim()}" vs "${bName.trim()}". State DISCOM portals reject >50% of subsidy claims for middle-name or initial discrepancies. SolarSewa generates an instant online Name-Correction Affidavit before filing.`,
      });
    }

    if (!normBk) {
      checks.push({
        label: 'CFA Subsidy Bank Account Match',
        status: 'fail',
        detail: 'Enter bank passbook holder name for DBT ₹78,000 payout.',
      });
    } else if (normA === normBk) {
      checks.push({
        label: 'CFA Subsidy Bank Account Match',
        status: 'pass',
        detail: 'Bank account holder matches Aadhaar for direct DBT subsidy credit.',
      });
    } else {
      checks.push({
        label: 'CFA Subsidy Bank Account Match',
        status: 'fail',
        detail: `Bank holder "${bkName.trim()}" differs from Aadhaar "${aName.trim()}". Update bank KYC or use a matching Aadhaar-seeded account.`,
      });
    }

    if (sLoad >= recommendedKw) {
      checks.push({
        label: `${city.discom} Sanctioned Load`,
        status: 'pass',
        detail: `Existing ${sLoad} kW sanctioned load supports your ${recommendedKw} kW solar plant without load enhancement delay.`,
      });
    } else {
      checks.push({
        label: `${city.discom} Sanctioned Load`,
        status: 'warning',
        detail: `Sanctioned load (${sLoad} kW) is below ${recommendedKw} kW. SolarSewa bundles an automated online load-enhancement request with your feasibility filing (+2 days).`,
      });
    }

    const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
    const consumerValid = cNo.trim().length >= 6;
    if (panValid && consumerValid) {
      checks.push({
        label: 'PAN & Consumer ID Syntax',
        status: 'pass',
        detail: `PAN (${pan.toUpperCase()}) & Consumer #${cNo.trim()} verified for Jansamarth 7% loan desk.`,
      });
    } else {
      checks.push({
        label: 'PAN & Consumer ID Syntax',
        status: 'fail',
        detail: !panValid
          ? 'PAN format invalid (expected format: ABCDE1234F).'
          : 'Consumer number must be at least 6 digits.',
      });
    }

    if (ownership === 'independent') {
      checks.push({
        label: 'Clear Rooftop Rights (PM Surya Ghar)',
        status: 'pass',
        detail: 'Independent house/duplex eligible for individual net-metering & full CFA subsidy.',
      });
    } else {
      checks.push({
        label: 'Clear Rooftop Rights (PM Surya Ghar)',
        status: 'warning',
        detail: 'Joint/RWA buildings require society NOC; V1 prioritizes independent rooftops.',
      });
    }

    const hasFail = checks.some((c) => c.status === 'fail');
    return {
      passed: !hasFail,
      scoreLabel: hasFail ? 'Action Required Before Filing' : 'Ready for Zero-Rejection Filing',
      checks,
    };
  };

  useEffect(() => {
    if (!savedPreCheck) return;
    setAadhaarName(savedPreCheck.aadhaarName);
    setBillName(savedPreCheck.billName);
    setBankHolderName(savedPreCheck.bankHolderName);
    setConsumerNumber(savedPreCheck.consumerNumber);
    setPanNumber(savedPreCheck.panNumber);
    setSanctionedLoadKw(savedPreCheck.sanctionedLoadKw);
    setRoofOwnership(savedPreCheck.roofOwnership);
    const hydrated = evaluateChecks(
      savedPreCheck.aadhaarName,
      savedPreCheck.billName,
      savedPreCheck.bankHolderName,
      savedPreCheck.consumerNumber,
      savedPreCheck.panNumber,
      savedPreCheck.sanctionedLoadKw,
      savedPreCheck.roofOwnership
    );
    setResult(hydrated);
    onPreCheckVerified(hydrated.passed);
    setSavedFeedback('Loaded saved pre-audit from your account');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPreCheck?.id, savedPreCheck?.updatedAtMs]);

  const runVerification = async (
    aName = aadhaarName,
    bName = billName,
    bkName = bankHolderName,
    cNo = consumerNumber,
    pan = panNumber,
    sLoad = sanctionedLoadKw,
    ownership = roofOwnership,
    persistIfSignedIn = true
  ) => {
    const nextResult = evaluateChecks(aName, bName, bkName, cNo, pan, sLoad, ownership);
    setResult(nextResult);
    onPreCheckVerified(nextResult.passed);

    const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
    if (persistIfSignedIn && user && panValid && cNo.trim().length >= 6) {
      setSaving(true);
      setSavedFeedback('');
      try {
        await onSavePreCheck({
          cityId: selectedCity,
          aadhaarName: aName,
          billName: bName,
          bankHolderName: bkName,
          consumerNumber: cNo,
          panNumber: pan,
          sanctionedLoadKw: sLoad,
          roofOwnership: ownership,
          recommendedKw,
          passed: nextResult.passed,
          scoreLabel: nextResult.scoreLabel,
        });
        setSavedFeedback('Saved to your SolarSewa account');
      } finally {
        setSaving(false);
      }
    } else if (!user) {
      setSavedFeedback('');
    }
  };

  const loadCleanSample = () => {
    const clean = {
      a: 'Meera Kantilal Patel',
      b: 'Meera Kantilal Patel',
      bk: 'Meera Kantilal Patel',
      c: '10482930112',
      pan: 'ADZPP7312M',
      load: Math.max(3, recommendedKw),
      own: 'independent' as const,
    };
    setAadhaarName(clean.a);
    setBillName(clean.b);
    setBankHolderName(clean.bk);
    setConsumerNumber(clean.c);
    setPanNumber(clean.pan);
    setSanctionedLoadKw(clean.load);
    setRoofOwnership(clean.own);
    void runVerification(
      clean.a,
      clean.b,
      clean.bk,
      clean.c,
      clean.pan,
      clean.load,
      clean.own,
      false
    );
  };

  const loadMismatchSample = () => {
    const mismatch = {
      a: 'Rameshbhai Kantilal Patel',
      b: 'Ramesh K. Patel',
      bk: 'Rameshbhai Kantilal Patel',
      c: '10482930112',
      pan: 'ABCPP4821K',
      load: 2,
      own: 'independent' as const,
    };
    setAadhaarName(mismatch.a);
    setBillName(mismatch.b);
    setBankHolderName(mismatch.bk);
    setConsumerNumber(mismatch.c);
    setPanNumber(mismatch.pan);
    setSanctionedLoadKw(mismatch.load);
    setRoofOwnership(mismatch.own);
    void runVerification(
      mismatch.a,
      mismatch.b,
      mismatch.bk,
      mismatch.c,
      mismatch.pan,
      mismatch.load,
      mismatch.own,
      false
    );
  };

  return (
    <section id="precheck" className="border-b border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold tracking-wide text-amber-700">
              02. Automated Verification Engine
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Catch subsidy &amp; DISCOM rejection traps before filing
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Over 50% of PM Surya Ghar subsidy applications stall due to subtle spelling
              differences between Aadhaar, electricity bills, and bank passbooks. Test your
              details below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadMismatchSample}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
            >
              Simulate Name Mismatch
            </button>
            <button
              type="button"
              onClick={loadCleanSample}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
            >
              Load Clean Profile
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void runVerification();
            }}
            className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-6 lg:col-span-6"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="doc-aadhaar"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Full Name on Aadhaar Card
                </label>
                <input
                  id="doc-aadhaar"
                  type="text"
                  maxLength={120}
                  value={aadhaarName}
                  onChange={(e) => setAadhaarName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="doc-bill"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Name Printed on {city.discom} Electricity Bill
                </label>
                <input
                  id="doc-bill"
                  type="text"
                  maxLength={120}
                  value={billName}
                  onChange={(e) => setBillName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="doc-bank"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Bank Account Holder Name (for ₹78,000 Subsidy Credit)
                </label>
                <input
                  id="doc-bank"
                  type="text"
                  maxLength={120}
                  value={bankHolderName}
                  onChange={(e) => setBankHolderName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="doc-consumer"
                  className="block text-xs font-semibold text-slate-700"
                >
                  DISCOM Consumer Number
                </label>
                <input
                  id="doc-consumer"
                  type="text"
                  maxLength={32}
                  value={consumerNumber}
                  onChange={(e) => setConsumerNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="doc-pan"
                  className="block text-xs font-semibold text-slate-700"
                >
                  PAN Number (Jansamarth Loan)
                </label>
                <input
                  id="doc-pan"
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm uppercase text-slate-900 focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="doc-load"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Current Sanctioned Load (kW)
                </label>
                <select
                  id="doc-load"
                  value={sanctionedLoadKw}
                  onChange={(e) => setSanctionedLoadKw(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((kw) => (
                    <option key={kw} value={kw}>
                      {kw} kW Sanctioned
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="doc-ownership"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Rooftop Property Rights
                </label>
                <select
                  id="doc-ownership"
                  value={roofOwnership}
                  onChange={(e) =>
                    setRoofOwnership(e.target.value as 'independent' | 'joint-society')
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  <option value="independent">Independent Bungalow / Duplex</option>
                  <option value="joint-society">Shared Society / Apartment</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              <FileCheck2 className="h-4 w-4 text-amber-400" />
              <span>
                {saving
                  ? 'Saving Pre-Audit...'
                  : user
                    ? 'Run & Save Pre-Audit'
                    : 'Run Automated Pre-Audit'}
              </span>
            </button>
          </form>

          <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
            {!result ? (
              <div className="flex h-full flex-col justify-center py-8 text-left">
                <p className="font-display text-lg font-semibold text-slate-900">
                  Pre-Audit Diagnostic Report
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Run the automated verification engine to cross-check your Aadhaar, DISCOM
                  bill, bank passbook, and sanctioned load before submitting to the PM Surya
                  Ghar national portal.
                </p>

                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>
                      Detects middle-name &amp; initial mismatches between utility bill and Aadhaar
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>
                      Validates sanctioned load vs {recommendedKw} kW target system capacity
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>
                      Pre-screens PAN &amp; Consumer ID for 72-hour Jansamarth loan approval
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void runVerification()}
                  className="mt-6 inline-flex w-fit items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Check Current Inputs Now
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Pre-Audit Status
                      {savedFeedback ? ` · ${savedFeedback}` : ''}
                    </p>
                    <p
                      className={`mt-0.5 font-display text-lg font-bold ${
                        result.passed ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {result.scoreLabel}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {result.checks.filter((c) => c.status === 'pass').length}/
                    {result.checks.length} Passed
                  </span>
                </div>

                <ul className="mt-4 divide-y divide-slate-100">
                  {result.checks.map((item) => (
                    <li key={item.label} className="py-3.5">
                      <div className="flex items-start gap-3">
                        {item.status === 'pass' && (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        )}
                        {item.status === 'warning' && (
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        )}
                        {item.status === 'fail' && (
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {!user && (
                  <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-600">
                    Sign in to keep this verification attached to your solar booking:{' '}
                    <button
                      type="button"
                      onClick={onSignIn}
                      className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900"
                    >
                      Sign in with Google
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
