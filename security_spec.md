# SolarSewa Firestore Security Specification

## 1. Data Invariants
1. **Strict Owner Isolation (PII Protection)**: Every document in `/users/{userId}`, `/solarProjects/{projectId}`, and `/preChecks/{preCheckId}` contains PII (email, mobile phone, locality, Aadhaar/PAN/consumer ID) and is readable/writable strictly by the verified owner (`request.auth.uid == ownerId` and `request.auth.token.email_verified == true`).
2. **Blueprint Key & Type Synchronicity**: All creates enforce exact required and allowed key sets (`hasAll` + `hasOnly`), string length bounds, numeric bounds, enum constraints, and regex guards matching `firebase-blueprint.json`.
3. **Immutable Ownership & Creation Timestamps**: `ownerId` (or `uid`) and `createdAt` cannot be modified after creation (`incoming().ownerId == existing().ownerId`, `incoming().createdAt == existing().createdAt`).
4. **Action-Based Updates & Terminal Locking**: Updates on `solarProjects` allow only `updateProgress` (`currentDay`, `completedSteps`, `status`, `escrowStatus`, `subsidyStatus`, `updatedAt`) and lock once `existing().status == 'commissioned'`.
5. **No Client-Delegated List Queries**: `allow list` explicitly evaluates `resource.data.ownerId == request.auth.uid`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Read/List**: Anonymous `getDocs(collection(db, 'solarProjects'))`.
2. **Unverified Email Spoof**: Signed-in user with `email_verified: false` attempting `create` on `solarProjects`.
3. **Cross-Tenant Project Read**: User B calling `getDoc(doc(db, 'solarProjects', 'projectOwnedByUserA'))`.
4. **Cross-Tenant List Scraping**: User B querying `solarProjects` without `where('ownerId', '==', userB.uid)`.
5. **Identity Spoofing on Create**: User A creating a `solarProject` with `ownerId: 'userB'`.
6. **Shadow Field Injection**: Creating a `solarProject` with extra ghost key `isAdminVerified: true`.
7. **ID Poisoning**: Creating `/solarProjects/invalid$id_with_1500_chars...` failing `isValidId()`.
8. **String Overflow (Denial of Wallet)**: Writing a 5,000-character `locality` or `aadhaarName`.
9. **Regex Bypass on Phone/PIN/PAN**: Creating a `solarProject` with `phone: '12345'` or `pinCode: 'ABCDEF'`, or `preCheck` with `panNumber: 'INVALID'`.
10. **Client Timestamp Forgery**: Creating a document with backdated `createdAt` (`!== request.time`).
11. **Immutable Field Tampering**: Updating `solarProject.ownerId` or `solarProject.createdAt`.
12. **Terminal State Mutation**: Updating a `solarProject` after `existing().status == 'commissioned'`.
