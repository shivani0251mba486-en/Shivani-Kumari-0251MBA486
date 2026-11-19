import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  type ActiveProject,
  type CityId,
  type RoofCondition,
  TRACKER_STAGES,
} from '../data/solarData';
import { OperationType, db, handleFirestoreError } from '../firebase';

export interface SavedPreCheck {
  id: string;
  ownerId: string;
  cityId: CityId;
  aadhaarName: string;
  billName: string;
  bankHolderName: string;
  consumerNumber: string;
  panNumber: string;
  sanctionedLoadKw: number;
  roofOwnership: 'independent' | 'joint-society';
  recommendedKw: number;
  passed: boolean;
  scoreLabel: string;
  updatedAtMs: number;
}

function clampString(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

const profileUpsertQueue = new Map<string, Promise<void>>();

export async function upsertUserProfile(user: User, preferredCity: CityId): Promise<void> {
  const previous = profileUpsertQueue.get(user.uid) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(async () => {
      const path = `users/${user.uid}`;
      const userRef = doc(db, 'users', user.uid);

      try {
        const snap = await getDoc(userRef);
        const displayName = clampString(user.displayName || 'SolarSewa Homeowner', 120);
        const email = clampString(user.email || 'unknown@example.com', 160);
        const photoURL = user.photoURL ? clampString(user.photoURL, 500) : undefined;

        if (!snap.exists()) {
          const payload: Record<string, unknown> = {
            uid: user.uid,
            displayName,
            email,
            preferredCity,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          if (photoURL) {
            payload.photoURL = photoURL;
          }
          await setDoc(userRef, payload);
        } else {
          const updates: Record<string, unknown> = {
            displayName,
            preferredCity,
            updatedAt: serverTimestamp(),
          };
          if (photoURL) {
            updates.photoURL = photoURL;
          }
          await updateDoc(userRef, updates);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    });

  profileUpsertQueue.set(user.uid, next);
  try {
    await next;
  } finally {
    if (profileUpsertQueue.get(user.uid) === next) {
      profileUpsertQueue.delete(user.uid);
    }
  }
}

export function subscribeToUserProjects(
  uid: string,
  onData: (projects: ActiveProject[]) => void
): Unsubscribe {
  const path = 'solarProjects';
  const q = query(collection(db, path), where('ownerId', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Array<ActiveProject & { _createdAtMs: number }> = snapshot.docs.map(
        (docSnap) => {
          const data = docSnap.data();
          const createdAtMs =
            typeof data.createdAt?.toMillis === 'function'
              ? data.createdAt.toMillis()
              : 0;
          return {
            id: String(data.id || docSnap.id),
            ownerId: String(data.ownerId || uid),
            homeowner: String(data.homeowner || ''),
            locality: String(data.locality || ''),
            city: String(data.city || ''),
            discom: String(data.discom || ''),
            systemKw: Number(data.systemKw || 3),
            installerName: String(data.installerName || ''),
            currentDay: Number(data.currentDay || 1),
            targetDays: Number(data.targetDays || 25),
            completedSteps: Number(data.completedSteps || 1),
            status: (data.status === 'commissioned' ? 'commissioned' : 'active') as
              | 'active'
              | 'commissioned',
            escrowStatus: String(data.escrowStatus || ''),
            subsidyStatus: String(data.subsidyStatus || ''),
            loanStatus: String(data.loanStatus || ''),
            isPersisted: true,
            _createdAtMs: createdAtMs,
          };
        }
      );

      list.sort((a, b) => b._createdAtMs - a._createdAtMs);
      onData(list.map(({ _createdAtMs: _ignored, ...rest }) => rest));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export interface CreateSolarProjectInput {
  id: string;
  homeowner: string;
  phone: string;
  locality: string;
  pinCode: string;
  cityId: CityId;
  city: string;
  discom: string;
  monthlyBill: number;
  roofAreaSqFt: number;
  roofCondition: RoofCondition;
  systemKw: number;
  subsidyAmount: number;
  netSystemCost: number;
  installerId: string;
  installerName: string;
  preCheckPassed: boolean;
  escrowStatus: string;
  subsidyStatus: string;
  loanStatus: string;
}

export async function createSolarProject(
  uid: string,
  input: CreateSolarProjectInput
): Promise<void> {
  const path = `solarProjects/${input.id}`;
  const docRef = doc(db, 'solarProjects', input.id);

  const payload = {
    id: clampString(input.id, 64),
    ownerId: uid,
    homeowner: clampString(input.homeowner, 120),
    phone: clampString(input.phone, 10),
    locality: clampString(input.locality, 160),
    pinCode: clampString(input.pinCode, 6),
    cityId: input.cityId,
    city: clampString(input.city, 40),
    discom: clampString(input.discom, 80),
    monthlyBill: Math.min(200000, Math.max(500, Math.round(input.monthlyBill))),
    roofAreaSqFt: Math.min(20000, Math.max(100, Math.round(input.roofAreaSqFt))),
    roofCondition: input.roofCondition,
    systemKw: Math.min(50, Math.max(1, input.systemKw)),
    subsidyAmount: Math.min(78000, Math.max(0, Math.round(input.subsidyAmount))),
    netSystemCost: Math.min(5000000, Math.max(0, Math.round(input.netSystemCost))),
    installerId: clampString(input.installerId, 64),
    installerName: clampString(input.installerName, 100),
    preCheckPassed: Boolean(input.preCheckPassed),
    currentDay: 1,
    targetDays: 25,
    completedSteps: 1,
    status: 'active',
    escrowStatus: clampString(input.escrowStatus, 120),
    subsidyStatus: clampString(input.subsidyStatus, 120),
    loanStatus: clampString(input.loanStatus, 120),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function advanceSolarProjectMilestone(project: ActiveProject): Promise<void> {
  const path = `solarProjects/${project.id}`;
  const docRef = doc(db, 'solarProjects', project.id);

  const dayMilestones = [1, 3, 7, 16, 22, 25];
  const nextSteps = Math.min(TRACKER_STAGES.length, project.completedSteps + 1);
  const nextDay = dayMilestones[nextSteps - 1] ?? 25;
  const isFinal = nextSteps >= TRACKER_STAGES.length;

  const nextEscrow = isFinal
    ? '100% Released Upon Net-Meter Sync'
    : nextSteps >= 4
      ? '70% Locked · Pending Net-Meter'
      : '100% Protected in Escrow';

  const nextSubsidy = isFinal
    ? 'CFA Disbursal Triggered to Bank Account'
    : project.subsidyStatus;

  try {
    await updateDoc(docRef, {
      currentDay: nextDay,
      completedSteps: nextSteps,
      status: isFinal ? 'commissioned' : 'active',
      escrowStatus: clampString(nextEscrow, 120),
      subsidyStatus: clampString(nextSubsidy, 120),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeToUserPreChecks(
  uid: string,
  onData: (records: SavedPreCheck[]) => void
): Unsubscribe {
  const path = 'preChecks';
  const q = query(collection(db, path), where('ownerId', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SavedPreCheck[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const updatedAtMs =
          typeof data.updatedAt?.toMillis === 'function' ? data.updatedAt.toMillis() : 0;
        return {
          id: docSnap.id,
          ownerId: String(data.ownerId || uid),
          cityId: (data.cityId || 'surat') as CityId,
          aadhaarName: String(data.aadhaarName || ''),
          billName: String(data.billName || ''),
          bankHolderName: String(data.bankHolderName || ''),
          consumerNumber: String(data.consumerNumber || ''),
          panNumber: String(data.panNumber || ''),
          sanctionedLoadKw: Number(data.sanctionedLoadKw || 2),
          roofOwnership:
            data.roofOwnership === 'joint-society' ? 'joint-society' : 'independent',
          recommendedKw: Number(data.recommendedKw || 3),
          passed: Boolean(data.passed),
          scoreLabel: String(data.scoreLabel || ''),
          updatedAtMs,
        };
      });
      items.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export interface SavePreCheckInput {
  cityId: CityId;
  aadhaarName: string;
  billName: string;
  bankHolderName: string;
  consumerNumber: string;
  panNumber: string;
  sanctionedLoadKw: number;
  roofOwnership: 'independent' | 'joint-society';
  recommendedKw: number;
  passed: boolean;
  scoreLabel: string;
}

export async function savePreCheckRecord(
  uid: string,
  input: SavePreCheckInput
): Promise<string> {
  const preCheckId = `pc-${uid.slice(0, 18)}-${input.cityId}`;
  const path = `preChecks/${preCheckId}`;
  const docRef = doc(db, 'preChecks', preCheckId);

  try {
    const existingSnap = await getDoc(docRef);
    const sanitizedPan = input.panNumber.trim().toUpperCase();

    if (!existingSnap.exists()) {
      await setDoc(docRef, {
        ownerId: uid,
        cityId: input.cityId,
        aadhaarName: clampString(input.aadhaarName, 120),
        billName: clampString(input.billName, 120),
        bankHolderName: clampString(input.bankHolderName, 120),
        consumerNumber: clampString(input.consumerNumber, 32),
        panNumber: sanitizedPan,
        sanctionedLoadKw: Math.min(50, Math.max(1, input.sanctionedLoadKw)),
        roofOwnership: input.roofOwnership,
        recommendedKw: Math.min(50, Math.max(1, input.recommendedKw)),
        passed: Boolean(input.passed),
        scoreLabel: clampString(input.scoreLabel, 80),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        cityId: input.cityId,
        aadhaarName: clampString(input.aadhaarName, 120),
        billName: clampString(input.billName, 120),
        bankHolderName: clampString(input.bankHolderName, 120),
        consumerNumber: clampString(input.consumerNumber, 32),
        panNumber: sanitizedPan,
        sanctionedLoadKw: Math.min(50, Math.max(1, input.sanctionedLoadKw)),
        roofOwnership: input.roofOwnership,
        recommendedKw: Math.min(50, Math.max(1, input.recommendedKw)),
        passed: Boolean(input.passed),
        scoreLabel: clampString(input.scoreLabel, 80),
        updatedAt: serverTimestamp(),
      });
    }
    return preCheckId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
