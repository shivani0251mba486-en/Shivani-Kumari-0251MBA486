import type { User } from 'firebase/auth';
import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';
import {
  CITIES,
  type CityId,
  type EpcPartner,
  type SolarCalculation,
  formatINR,
} from '../data/solarData';

interface BookingModalProps {
  isOpen: boolean;
  user: User | null;
  selectedCity: CityId;
  calculation: SolarCalculation;
  selectedInstaller: EpcPartner;
  preCheckPassed: boolean;
  onSignIn: () => Promise<User | null>;
  onClose: (scrollToTracker?: boolean) => void;
  onConfirmBooking: (
    details: {
      homeownerName: string;
      phone: string;
      locality: string;
      pinCode: string;
    },
    signedInUser: User
  ) => Promise<string>;
}

export function BookingModal({
  isOpen,
  user,
  selectedCity,
  calculation,
  selectedInstaller,
  preCheckPassed,
  onSignIn,
  onClose,
  onConfirmBooking,
}: BookingModalProps) {
  const city = CITIES[selectedCity];
  const [homeownerName, setHomeownerName] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('');
  const [pinCode, setPinCode] = useState(city.samplePin);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  useEffect(() => {
    setPinCode(city.samplePin);
  }, [city.samplePin]);

  useEffect(() => {
    if (user?.displayName && !homeownerName) {
      setHomeownerName(user.displayName);
    }
  }, [user, homeownerName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (homeownerName.trim().length < 2) {
      setErrorMsg('Please enter the property owner full name.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setErrorMsg('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!/^\d{6}$/.test(pinCode.trim())) {
      setErrorMsg('Enter a valid 6-digit PIN code.');
      return;
    }

    setSubmitting(true);
    try {
      let activeUser = user;
      if (!activeUser) {
        activeUser = await onSignIn();
      }
      if (!activeUser) {
        setErrorMsg('Google Sign-In is required to save your ₹499 booking.');
        return;
      }

      const newProjectId = await onConfirmBooking(
        {
          homeownerName: homeownerName.trim(),
          phone: phone.trim(),
          locality: locality.trim() || city.sampleNeighborhood,
          pinCode: pinCode.trim(),
        },
        activeUser
      );
      setConfirmedId(newProjectId);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Could not save booking. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = (scrollToTracker = false) => {
    setConfirmedId(null);
    setErrorMsg('');
    onClose(scrollToTracker);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="booking-modal-title"
              className="font-display text-lg font-bold text-slate-900"
            >
              {confirmedId
                ? 'Audit & Priority DISCOM Slot Confirmed'
                : 'Book 3D Satellite Roof Audit (₹499 Deposit)'}
            </h2>
            <p className="text-xs text-slate-500">
              100% refundable if roof fails structural or shading feasibility
            </p>
          </div>
          <button
            type="button"
            onClick={() => resetAndClose(false)}
            aria-label="Close booking dialog"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {confirmedId ? (
          <div className="p-6">
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <p className="text-sm font-bold text-emerald-950">
                  Reference ID: <span className="font-mono">{confirmedId}</span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-emerald-900">
                  Your ₹499 refundable commitment deposit has been saved to Firestore. Our{' '}
                  {city.name} field engineer and {selectedInstaller.name} have been assigned to
                  initiate your 25-day net-metering &amp; PM Surya Ghar filing.
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">System Capacity &amp; Subsidy</dt>
                <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                  {calculation.effectiveKw} kW · {formatINR(calculation.pmSuryaGharSubsidy)} CFA
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Assigned EPC Partner</dt>
                <dd className="font-semibold text-slate-900">{selectedInstaller.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">DISCOM Filing Desk</dt>
                <dd className="font-medium text-slate-800">{city.discom}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => resetAndClose(true)}
              className="mt-6 w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              View Live Project in 25-Day Tracker
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="p-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span>
                  {calculation.effectiveKw} kW Rooftop System ({city.name})
                </span>
                <span className="font-mono tabular-nums">
                  Net {formatINR(calculation.netSystemCost)}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-slate-600">
                <span>EPC: {selectedInstaller.name}</span>
                <span>
                  Document Check:{' '}
                  <strong className={preCheckPassed ? 'text-emerald-700' : 'text-amber-700'}>
                    {preCheckPassed ? 'Pre-Audited' : 'Pending Concierge Check'}
                  </strong>
                </span>
              </div>
            </div>

            {!user && (
              <p className="mt-3 text-xs text-slate-600">
                Signing in with Google saves this booking and your 25-day DISCOM tracker
                directly to your account.
              </p>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="book-name"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Homeowner Full Name
                </label>
                <input
                  id="book-name"
                  type="text"
                  maxLength={120}
                  placeholder="e.g. Kantilal Patel"
                  value={homeownerName}
                  onChange={(e) => setHomeownerName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="book-phone"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Mobile Number (WhatsApp Updates)
                </label>
                <input
                  id="book-phone"
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="book-pin"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Property PIN Code
                </label>
                <input
                  id="book-pin"
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="book-locality"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Colony / Society / Bungalow Locality
                </label>
                <input
                  id="book-locality"
                  type="text"
                  maxLength={160}
                  placeholder={`e.g. ${city.sampleNeighborhood}, ${city.name}`}
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="mt-3 text-xs font-medium text-rose-700" role="alert">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>
                {submitting
                  ? 'Saving to SolarSewa...'
                  : user
                    ? 'Confirm ₹499 Refundable Audit Booking'
                    : 'Sign in with Google & Confirm ₹499 Booking'}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
