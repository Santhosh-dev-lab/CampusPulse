# CampusPulse Security Architecture & Hardening Guide

## 1. Threat Model & Security Principles

CampusPulse manages university event operations, ticketing, administrative approvals, and capacity allocation. The architecture enforces the following security standards:

1. **Server-Side Authorization Authority**: A client-side check is never trusted. Every administrative or organizer action runs through server policies (`requireAdmin`, `requireOrganizer`, `requireAuth`).
2. **Deterministic Role Segregation**:
   - `STUDENT`: Can view published events, register for free passes, access personal QR tickets, and bookmark events.
   - `ORGANIZER`: Can create draft events, check venue availability, view registrations for managed events, and validate check-in tickets.
   - `ADMIN`: Directorate of Student Affairs (DSA) staff authorized to approve or reject events with audit reasons.
3. **No Private Attendee Data in QR Codes**: QR codes contain cryptographically unpredictable random tokens (`CP-TKT-...`), never student emails, roll numbers, or personal identifying information (PII).
4. **Token Storage Hashing**: Ticket tokens are stored alongside SHA-256 hashes for fast and secure indexed server lookups.
5. **No Blind Trust in Client Parameters**: Client cannot submit capacity numbers, ticket statuses, or bypass event status checks.
6. **SQL Parameterization**: Prisma ORM executes parameterized queries for all database transactions, preventing SQL injection.

---

## 2. File Upload Safety

The file storage subsystem (`src/lib/storage/index.ts`) enforces:

- **Strict MIME validation**: Only `image/jpeg`, `image/png`, `image/webp`, and `image/gif` are accepted.
- **Size Caps**: Maximum 5MB per upload.
- **Path Traversal Prevention**: User-supplied filenames are never used directly as filesystem paths. Object keys are generated using timestamps and random hex strings (`Date.now() + randomBytes(8).hex + ext`).
- **Storage Isolation**: Local uploads are saved into `.local-storage/uploads` which is explicitly ignored by Git.

---

## 3. Safe Development Authentication

When `DEV_AUTH_ENABLED=true` in local development:

- The system enables quick switching between seeded demo roles (`admin@srmist.edu.in`, `organizer.dsc@srmist.edu.in`, `student@srmist.edu.in`).
- Startup assertion in `src/lib/env.ts` guarantees that `DEV_AUTH_ENABLED` is impossible to enable when `NODE_ENV=production`.

---

## 4. Reporting Security Vulnerabilities

Please report potential security issues directly to the security team as described in the root [SECURITY.md](../SECURITY.md).
