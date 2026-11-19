import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { BookingModal } from './components/BookingModal';
import { DocumentPreCheck } from './components/DocumentPreCheck';
import { HeroSection } from './components/HeroSection';
import { InstallerMarketplace } from './components/InstallerMarketplace';
import { Navbar } from './components/Navbar';
import { SatelliteCalculator } from './components/SatelliteCalculator';
import { TurnkeyTracker } from './components/TurnkeyTracker';
import {
  type ActiveProject,
  CITIES,
  type CityId,
  EPC_PARTNERS,
  type EpcPartner,
  INITIAL_PROJECTS,
  type RoofCondition,
  TRACKER_STAGES,
  calculateSolarMetrics,
  formatINR,
} from './data/solarData';
import { auth, googleProvider } from './firebase';
import {
  advanceSolarProjectMilestone,
  createSolarProject,
  savePreCheckRecord,
  subscribeToUserPreChecks,
  subscribeToUserProjects,
  upsertUserProfile,
  type SavePreCheckInput,
  type SavedPreCheck,
} from './services/solarRepository';

export default function App() {
  const [selectedCity, setSelectedCity] = useState<CityId>('surat');
  const [monthlyBill, setMonthlyBill] = useState<number>(4500);
  const [roofAreaSqFt, setRoofAreaSqFt] = useState<number>(450);
  const [roofCondition, setRoofCondition] = useState<RoofCondition>('clear-rcc');

  const [selectedInstallerId, setSelectedInstallerId] = useState<string>(
    EPC_PARTNERS[0].id
  );
  const [preCheckPassed, setPreCheckPassed] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>('');

  const [persistedProjects, setPersistedProjects] = useState<ActiveProject[]>([]);
  const [sampleProjects, setSampleProjects] =
    useState<ActiveProject[]>(INITIAL_PROJECTS);
  const [savedPreChecks, setSavedPreChecks] = useState<SavedPreCheck[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECTS[0].id);
  const [advancingTracker, setAdvancingTracker] = useState<boolean>(false);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        void upsertUserProfile(firebaseUser, selectedCity);
      } else {
        setPersistedProjects([]);
        setSavedPreChecks([]);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubProjects = subscribeToUserProjects(user.uid, (rows) => {
      setPersistedProjects(rows);
      if (rows.length > 0) {
        setActiveProjectId((current) =>
          rows.some((r) => r.id === current) ? current : rows[0].id
        );
      }
    });

    const unsubPreChecks = subscribeToUserPreChecks(user.uid, (records) => {
      setSavedPreChecks(records);
    });

    return () => {
      unsubProjects();
      unsubPreChecks();
    };
  }, [user]);

  const combinedProjects = useMemo(() => {
    return [...persistedProjects, ...sampleProjects];
  }, [persistedProjects, sampleProjects]);

  const latestPreCheck = useMemo(() => {
    return (
      savedPreChecks.find((item) => item.cityId === selectedCity) ??
      savedPreChecks[0] ??
      null
    );
  }, [savedPreChecks, selectedCity]);

  const calculation = useMemo(
    () => calculateSolarMetrics(selectedCity, monthlyBill, roofAreaSqFt, roofCondition),
    [selectedCity, monthlyBill, roofAreaSqFt, roofCondition]
  );

  const selectedInstaller: EpcPartner = useMemo(() => {
    return (
      EPC_PARTNERS.find((p) => p.id === selectedInstallerId) ??
      EPC_PARTNERS.find((p) => p.cityId === selectedCity) ??
      EPC_PARTNERS[0]
    );
  }, [selectedInstallerId, selectedCity]);

  const handleGoogleSignIn = async (): Promise<User | null> => {
    setAuthError('');
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      return cred.user;
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setAuthError(
          err instanceof Error
            ? err.message
            : 'Unable to sign in with Google. Please try again.'
        );
      }
      return null;
    }
  };

  const handleSignOut = async () => {
    setAuthError('');
    await signOut(auth);
    setActiveProjectId(INITIAL_PROJECTS[0].id);
  };

  const handleCityChange = (city: CityId) => {
    setSelectedCity(city);
    const cityPartner = EPC_PARTNERS.find((p) => p.cityId === city);
    if (cityPartner) {
      setSelectedInstallerId(cityPartner.id);
    }
    if (user) {
      void upsertUserProfile(user, city);
    }
  };

  const handleSavePreCheck = async (input: SavePreCheckInput) => {
    if (!user) return;
    await savePreCheckRecord(user.uid, input);
  };

  const handleConfirmBooking = async (
    details: {
      homeownerName: string;
      phone: string;
      locality: string;
      pinCode: string;
    },
    signedInUser: User
  ): Promise<string> => {
    const randomSuffix = Math.floor(4200 + Math.random() * 5000);
    const newId = `SS-2026-${randomSuffix}`;
    const city = CITIES[selectedCity];

    await createSolarProject(signedInUser.uid, {
      id: newId,
      homeowner: details.homeownerName,
      phone: details.phone,
      locality: `${details.locality} (${details.pinCode})`,
      pinCode: details.pinCode,
      cityId: selectedCity,
      city: city.name,
      discom: city.discom,
      monthlyBill,
      roofAreaSqFt,
      roofCondition,
      systemKw: calculation.effectiveKw,
      subsidyAmount: calculation.pmSuryaGharSubsidy,
      netSystemCost: calculation.netSystemCost,
      installerId: selectedInstaller.id,
      installerName: selectedInstaller.name,
      preCheckPassed,
      escrowStatus: '₹499 Audit Deposit Active · Escrow Ready',
      subsidyStatus: preCheckPassed
        ? `Pre-Audited · ${formatINR(calculation.pmSuryaGharSubsidy)} Eligible`
        : `Document Audit Queued · ${formatINR(calculation.pmSuryaGharSubsidy)} Est.`,
      loanStatus: 'Jansamarth 7.0% Pre-Check Initiated',
    });

    setActiveProjectId(newId);
    return newId;
  };

  const handleAdvanceDemoStage = async (project: ActiveProject) => {
    if (project.isPersisted && user) {
      setAdvancingTracker(true);
      try {
        await advanceSolarProjectMilestone(project);
      } finally {
        setAdvancingTracker(false);
      }
      return;
    }

    const dayMilestones = [1, 3, 7, 16, 22, 25];
    setSampleProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== project.id) return proj;
        const nextSteps = Math.min(TRACKER_STAGES.length, proj.completedSteps + 1);
        const nextDay = dayMilestones[nextSteps - 1] ?? 25;
        const nextEscrow =
          nextSteps >= TRACKER_STAGES.length
            ? '100% Released Upon Net-Meter Sync'
            : nextSteps >= 4
              ? '70% Locked · Pending Net-Meter'
              : '100% Protected in Escrow';
        const nextSubsidy =
          nextSteps >= TRACKER_STAGES.length
            ? 'CFA Disbursal Triggered to Bank Account'
            : proj.subsidyStatus;

        return {
          ...proj,
          completedSteps: nextSteps,
          currentDay: nextDay,
          escrowStatus: nextEscrow,
          subsidyStatus: nextSubsidy,
        };
      })
    );
  };

  const scrollToCalculator = () => {
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <Navbar
        user={user}
        authLoading={authLoading}
        onSignIn={() => void handleGoogleSignIn()}
        onSignOut={() => void handleSignOut()}
        onOpenBooking={() => setBookingModalOpen(true)}
      />

      {authError && (
        <div
          role="alert"
          className="border-b border-rose-200 bg-rose-50 px-4 py-2.5 text-center text-xs font-medium text-rose-800"
        >
          {authError}
        </div>
      )}

      <main>
        <HeroSection
          selectedCity={selectedCity}
          calculation={calculation}
          user={user}
          authLoading={authLoading}
          onSelectCity={handleCityChange}
          onStartCalculator={scrollToCalculator}
          onSignIn={() => void handleGoogleSignIn()}
        />

        <SatelliteCalculator
          selectedCity={selectedCity}
          monthlyBill={monthlyBill}
          roofAreaSqFt={roofAreaSqFt}
          roofCondition={roofCondition}
          calculation={calculation}
          onCityChange={handleCityChange}
          onMonthlyBillChange={setMonthlyBill}
          onRoofAreaChange={setRoofAreaSqFt}
          onConditionChange={setRoofCondition}
          onLockQuote={() => setBookingModalOpen(true)}
        />

        <DocumentPreCheck
          selectedCity={selectedCity}
          recommendedKw={calculation.effectiveKw}
          user={user}
          savedPreCheck={latestPreCheck}
          onSignIn={() => void handleGoogleSignIn()}
          onPreCheckVerified={setPreCheckPassed}
          onSavePreCheck={handleSavePreCheck}
        />

        <InstallerMarketplace
          selectedCity={selectedCity}
          recommendedKw={calculation.effectiveKw}
          selectedInstallerId={selectedInstaller.id}
          onSelectInstaller={(partner) => setSelectedInstallerId(partner.id)}
          onBookWithInstaller={(partner) => {
            setSelectedInstallerId(partner.id);
            setBookingModalOpen(true);
          }}
        />

        <TurnkeyTracker
          projects={combinedProjects}
          activeProjectId={activeProjectId}
          user={user}
          advancing={advancingTracker}
          onSignIn={() => void handleGoogleSignIn()}
          onSelectProject={setActiveProjectId}
          onAdvanceDemoStage={(proj) => void handleAdvanceDemoStage(proj)}
        />
      </main>

      <footer className="bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="font-display text-lg font-bold text-slate-900">SolarSewa</p>
            <p className="mt-1 text-xs text-slate-500">
              Turnkey residential rooftop solar &amp; PM Surya Ghar subsidy concierge · Surat ·
              Indore · Kota · Jaipur
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600">
            <a href="#calculator" className="hover:text-slate-900">
              Roof Calculator
            </a>
            <a href="#precheck" className="hover:text-slate-900">
              Document Check
            </a>
            <a href="#installers" className="hover:text-slate-900">
              Tier-1 Installers
            </a>
            <a href="#tracker" className="hover:text-slate-900">
              25-Day Tracker
            </a>
          </div>
        </div>
      </footer>

      <BookingModal
        isOpen={bookingModalOpen}
        user={user}
        selectedCity={selectedCity}
        calculation={calculation}
        selectedInstaller={selectedInstaller}
        preCheckPassed={preCheckPassed}
        onSignIn={handleGoogleSignIn}
        onClose={(scrollToTracker) => {
          setBookingModalOpen(false);
          if (scrollToTracker) {
            document.getElementById('tracker')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onConfirmBooking={handleConfirmBooking}
      />
    </div>
  );
}
