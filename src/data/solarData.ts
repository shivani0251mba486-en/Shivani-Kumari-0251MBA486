export type CityId = 'surat' | 'indore' | 'kota' | 'jaipur';

export type RoofCondition = 'clear-rcc' | 'partial-shade' | 'sloped-roof';

export interface CityConfig {
  id: CityId;
  name: string;
  state: string;
  discom: string;
  irradiance: number; // kWh/m2/day
  avgTariff: number; // INR per kWh
  yieldPerKwPerMonth: number; // kWh generated per kW per month
  avgTurnaroundDays: number;
  samplePin: string;
  sampleNeighborhood: string;
}

export interface EpcPartner {
  id: string;
  name: string;
  cityId: CityId;
  cityLabel: string;
  rating: number;
  completedHomes: number;
  avgDays: number;
  panelBrand: string;
  inverterBrand: string;
  ratePerKw: number; // INR per kW turnkey before subsidy
  warrantyYears: number;
  escrowVerified: boolean;
}

export interface TrackerStage {
  dayRange: string;
  title: string;
  detail: string;
  department: string;
}

export interface ActiveProject {
  id: string;
  ownerId?: string;
  homeowner: string;
  locality: string;
  city: string;
  discom: string;
  systemKw: number;
  installerName: string;
  currentDay: number;
  targetDays: number;
  completedSteps: number; // 1 to 6
  status?: 'active' | 'commissioned';
  escrowStatus: string;
  subsidyStatus: string;
  loanStatus: string;
  isPersisted?: boolean;
}

export const CITIES: Record<CityId, CityConfig> = {
  surat: {
    id: 'surat',
    name: 'Surat',
    state: 'Gujarat',
    discom: 'DGVCL / Torrent Power',
    irradiance: 5.72,
    avgTariff: 7.4,
    yieldPerKwPerMonth: 128,
    avgTurnaroundDays: 21,
    samplePin: '395007',
    sampleNeighborhood: 'Vesu / Adajan',
  },
  indore: {
    id: 'indore',
    name: 'Indore',
    state: 'Madhya Pradesh',
    discom: 'MPPKVVCL (Paschim Kshetra)',
    irradiance: 5.65,
    avgTariff: 7.2,
    yieldPerKwPerMonth: 125,
    avgTurnaroundDays: 23,
    samplePin: '452010',
    sampleNeighborhood: 'Vijay Nagar / Scheme 78',
  },
  kota: {
    id: 'kota',
    name: 'Kota',
    state: 'Rajasthan',
    discom: 'JVVNL (Jaipur Discom)',
    irradiance: 5.84,
    avgTariff: 7.8,
    yieldPerKwPerMonth: 132,
    avgTurnaroundDays: 24,
    samplePin: '324005',
    sampleNeighborhood: 'Talwandi / Mahaveer Nagar',
  },
  jaipur: {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    discom: 'JVVNL (Jaipur Discom)',
    irradiance: 5.76,
    avgTariff: 7.8,
    yieldPerKwPerMonth: 130,
    avgTurnaroundDays: 24,
    samplePin: '302017',
    sampleNeighborhood: 'Malviya Nagar / Vaishali Nagar',
  },
};

export const EPC_PARTNERS: EpcPartner[] = [
  {
    id: 'epc-surya-surat',
    name: 'Tapi CleanGrid Systems',
    cityId: 'surat',
    cityLabel: 'Surat, GJ',
    rating: 4.9,
    completedHomes: 142,
    avgDays: 19,
    panelBrand: 'Waaree 540Wp Mono-PERC',
    inverterBrand: 'Growatt On-Grid',
    ratePerKw: 56500,
    warrantyYears: 25,
    escrowVerified: true,
  },
  {
    id: 'epc-guj-surat',
    name: 'Navsari VoltCraft EPC',
    cityId: 'surat',
    cityLabel: 'Surat, GJ',
    rating: 4.8,
    completedHomes: 96,
    avgDays: 22,
    panelBrand: 'Adani Bifacial TOPCon',
    inverterBrand: 'Havells Enviro',
    ratePerKw: 58000,
    warrantyYears: 25,
    escrowVerified: true,
  },
  {
    id: 'epc-malwa-indore',
    name: 'Malwa Heliotech Engineers',
    cityId: 'indore',
    cityLabel: 'Indore, MP',
    rating: 4.9,
    completedHomes: 118,
    avgDays: 21,
    panelBrand: 'Vikram Solar Hypersol',
    inverterBrand: 'Luminous NXi',
    ratePerKw: 56000,
    warrantyYears: 25,
    escrowVerified: true,
  },
  {
    id: 'epc-narmada-indore',
    name: 'Avantika SunWorks',
    cityId: 'indore',
    cityLabel: 'Indore, MP',
    rating: 4.7,
    completedHomes: 74,
    avgDays: 24,
    panelBrand: 'Waaree 540Wp Mono-PERC',
    inverterBrand: 'Sungrow Residential',
    ratePerKw: 55000,
    warrantyYears: 25,
    escrowVerified: true,
  },
  {
    id: 'epc-chambal-kota',
    name: 'Hadoti Solar Infra',
    cityId: 'kota',
    cityLabel: 'Kota, RJ',
    rating: 4.8,
    completedHomes: 68,
    avgDays: 23,
    panelBrand: 'Tata Power TP540',
    inverterBrand: 'Polycab On-Grid',
    ratePerKw: 57500,
    warrantyYears: 25,
    escrowVerified: true,
  },
  {
    id: 'epc-pink-jaipur',
    name: 'Aravalli Renewables',
    cityId: 'jaipur',
    cityLabel: 'Jaipur, RJ',
    rating: 4.9,
    completedHomes: 134,
    avgDays: 22,
    panelBrand: 'Vikram Solar Mono-PERC',
    inverterBrand: 'Growatt On-Grid',
    ratePerKw: 56800,
    warrantyYears: 25,
    escrowVerified: true,
  },
];

export const TRACKER_STAGES: TrackerStage[] = [
  {
    dayRange: 'Day 1',
    title: '₹499 Deposit & Satellite Roof Lock',
    detail: '3D irradiance map verified and dedicated Tier-1 EPC partner assigned with escrow account.',
    department: 'SolarSewa Onboarding',
  },
  {
    dayRange: 'Days 2–3',
    title: 'Document Pre-Audit & Jansamarth Loan',
    detail: 'Aadhaar, PAN, bank IFSC, and DISCOM bill matched with 0% rejection risk; 7% loan sanctioned in 72h.',
    department: 'Automated Verification Engine',
  },
  {
    dayRange: 'Days 4–7',
    title: 'DISCOM Technical Feasibility Approval',
    detail: 'Digital net-metering feasibility clearance secured in under 5 working days (vs 15+ days offline).',
    department: 'DISCOM Liaison Desk',
  },
  {
    dayRange: 'Days 8–16',
    title: 'Tier-1 Hardware Delivery & Mounting',
    detail: 'Hot-dip galvanized structure and Mono-PERC panels installed with structural load sign-off.',
    department: 'Empanelled EPC Team',
  },
  {
    dayRange: 'Days 17–22',
    title: 'Bidirectional Net-Meter Inspection',
    detail: 'CEIG / DISCOM field engineer inspection completed and bidirectional net-meter synchronized.',
    department: 'State DISCOM Field Unit',
  },
  {
    dayRange: 'Days 23–25',
    title: 'Commissioning & ₹78,000 Subsidy Claim',
    detail: 'Escrow milestone released to EPC; PM Surya Ghar CFA subsidy triggered directly to homeowner bank.',
    department: 'MNRE Subsidy Portal',
  },
];

export const INITIAL_PROJECTS: ActiveProject[] = [
  {
    id: 'SS-2026-4108',
    homeowner: 'Kantilal & Meera Patel',
    locality: 'Vesu, Surat',
    city: 'Surat',
    discom: 'Torrent Power',
    systemKw: 3,
    installerName: 'Tapi CleanGrid Systems',
    currentDay: 19,
    targetDays: 25,
    completedSteps: 4,
    escrowStatus: '70% Locked · Pending Net-Meter',
    subsidyStatus: 'Pre-Audited · ₹78,000 Eligible',
    loanStatus: 'Jansamarth Approved (7.0% p.a.)',
  },
  {
    id: 'SS-2026-4124',
    homeowner: 'Dr. Arvind Sharma',
    locality: 'Vijay Nagar, Indore',
    city: 'Indore',
    discom: 'MPPKVVCL',
    systemKw: 5,
    installerName: 'Malwa Heliotech Engineers',
    currentDay: 6,
    targetDays: 25,
    completedSteps: 2,
    escrowStatus: '100% Protected in Escrow',
    subsidyStatus: 'Pre-Audited · ₹78,000 Eligible',
    loanStatus: 'Sanctioned in 48 Hours',
  },
];

export interface SolarCalculation {
  recommendedKw: number;
  maxRoofKw: number;
  effectiveKw: number;
  panelCount: number;
  roofAreaUsedSqFt: number;
  monthlyGenerationKwh: number;
  grossSystemCost: number;
  pmSuryaGharSubsidy: number;
  netSystemCost: number;
  monthlyLoanEmi: number;
  residualMonthlyBill: number;
  netMonthlySavings: number;
  annualSavings: number;
  paybackYears: number;
  lifetimeSavings25Yr: number;
}

export function calculatePmSuryaGharSubsidy(kw: number): number {
  if (kw <= 0) return 0;
  if (kw <= 2) {
    return Math.round(kw * 30000);
  }
  if (kw < 3) {
    return Math.round(60000 + (kw - 2) * 18000);
  }
  return 78000;
}

export function calculateSolarMetrics(
  cityId: CityId,
  monthlyBill: number,
  roofAreaSqFt: number,
  condition: RoofCondition
): SolarCalculation {
  const city = CITIES[cityId];
  const shadeMultiplier =
    condition === 'clear-rcc' ? 1.0 : condition === 'partial-shade' ? 0.86 : 0.92;

  const monthlyKwhNeed = monthlyBill / city.avgTariff;
  const rawNeededKw = monthlyKwhNeed / (city.yieldPerKwPerMonth * shadeMultiplier);

  // Snap to realistic residential sizes: 1, 2, 3, 4, 5, 6, 8, 10 kW
  const neededKw = Math.max(1, Math.min(10, Math.round(rawNeededKw)));
  // Roughly 95 sq ft per kW needed for safe spacing & parapet clearance
  const maxRoofKw = Math.max(1, Math.floor(roofAreaSqFt / 95));
  const effectiveKw = Math.max(1, Math.min(neededKw, maxRoofKw));

  // 540Wp panels -> ~2 panels per kW (1.08 kW nominal per 2 panels)
  const panelCount = Math.max(2, Math.round((effectiveKw * 1000) / 540));
  const roofAreaUsedSqFt = panelCount * 42;

  const monthlyGenerationKwh = Math.round(
    effectiveKw * city.yieldPerKwPerMonth * shadeMultiplier
  );

  // Market-accurate turnkey benchmark: ~56,667/kW for 3kW (= ~1,70,000 as in PDF)
  const ratePerKw = effectiveKw <= 2 ? 59000 : effectiveKw <= 4 ? 56667 : 54000;
  const grossSystemCost = Math.round((effectiveKw * ratePerKw) / 500) * 500;
  const pmSuryaGharSubsidy = calculatePmSuryaGharSubsidy(effectiveKw);
  const netSystemCost = Math.max(0, grossSystemCost - pmSuryaGharSubsidy);

  // Jansamarth collateral-free solar loan: 7.0% p.a., 10 years (120 months) on net cost
  const monthlyRate = 0.07 / 12;
  const months = 120;
  const emiFactor =
    (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  const monthlyLoanEmi = Math.round(netSystemCost * emiFactor);

  const monthlyValueGenerated = Math.round(monthlyGenerationKwh * city.avgTariff);
  // Fixed meter/minimum DISCOM charge typically ~₹180–₹250/mo
  const residualMonthlyBill = Math.max(180, monthlyBill - monthlyValueGenerated);
  const actualMonthlyBillSaved = Math.max(0, monthlyBill - residualMonthlyBill);
  const netMonthlySavings = actualMonthlyBillSaved - monthlyLoanEmi;
  const annualSavings = actualMonthlyBillSaved * 12;
  const paybackYears =
    annualSavings > 0 ? Number((netSystemCost / annualSavings).toFixed(1)) : 0;

  // 25-year cumulative net savings accounting for 5% annual tariff escalation & 0.5% panel degradation
  let cumulative = 0;
  for (let yr = 0; yr < 25; yr++) {
    const tariffFactor = Math.pow(1.05, yr);
    const degFactor = Math.pow(0.995, yr);
    cumulative += annualSavings * tariffFactor * degFactor;
  }
  const lifetimeSavings25Yr = Math.round(cumulative - netSystemCost);

  return {
    recommendedKw: neededKw,
    maxRoofKw,
    effectiveKw,
    panelCount,
    roofAreaUsedSqFt,
    monthlyGenerationKwh,
    grossSystemCost,
    pmSuryaGharSubsidy,
    netSystemCost,
    monthlyLoanEmi,
    residualMonthlyBill,
    netMonthlySavings,
    annualSavings,
    paybackYears,
    lifetimeSavings25Yr,
  };
}

export function formatINR(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  const formatted = abs.toLocaleString('en-IN');
  return amount < 0 ? `-₹${formatted}` : `₹${formatted}`;
}
