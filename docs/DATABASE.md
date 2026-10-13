# CampusPulse Database Architecture & Schema Reference

CampusPulse uses **PostgreSQL 18** managed via **Prisma ORM** with migrations and deterministic seed scripts.

---

## 1. Relational Entity Overview

| Entity             | Purpose                                               | Key Constraints                                     |
| :----------------- | :---------------------------------------------------- | :-------------------------------------------------- |
| **Campus**         | University campuses (Kattankulathur, Ramapuram, etc.) | `code` UNIQUE (`SRM-KTR`)                           |
| **User**           | Students, Organizers, and DSA Administrators          | `email` UNIQUE, `studentId` UNIQUE                  |
| **Club**           | Student clubs and technical societies                 | `slug` UNIQUE, `campusId` FK                        |
| **ClubMembership** | Connects users to clubs with roles (LEAD, PRESIDENT)  | `@@unique([clubId, userId])`                        |
| **Venue**          | Physical halls, auditoriums, and open grounds         | `@@unique([campusId, name])`                        |
| **Event**          | Events with status lifecycle and capacity limits      | `slug` UNIQUE, `status` Index, `venueId` FK         |
| **Registration**   | Ticket bookings per student                           | `@@unique([eventId, userId])`, `ticketToken` UNIQUE |
| **CheckIn**        | On-site attendance check-in record                    | `registrationId` UNIQUE (Prevents double check-in)  |
| **ApprovalRecord** | Immutable audit decisions by administrators           | `reviewedAt` Index, `reviewerId` FK                 |
| **EventInterest**  | Student bookmarks and interest upvotes                | `@@unique([eventId, userId])`                       |
| **Notification**   | Event reminders and approval alerts                   | `userId` FK, `isRead` Index                         |

---

## 2. Integrity & Concurrency Safeguards

### A. One Registration Per Student Guarantee

```prisma
model Registration {
  eventId String
  userId  String
  // ...
  @@unique([eventId, userId])
}
```

At the database engine level, PostgreSQL enforces a composite unique index on `(eventId, userId)`. Concurrent parallel requests attempting to register twice will result in a standard `P2002` unique constraint violation, which `handleApiError` safely translates to `DUPLICATE_REGISTRATION` (HTTP 409).

### B. Venue Interval Overlap Conflict Avoidance

When reserving a venue for an event during `[startTime, endTime]`:

```sql
SELECT id, title FROM "Event"
WHERE "venueId" = $1
  AND "status" IN ('PENDING_APPROVAL', 'APPROVED', 'PUBLISHED')
  AND "startTime" < $3  -- Existing event starts before requested end
  AND "endTime"   > $2  -- Existing event ends after requested start
LIMIT 1;
```

If an overlapping booking is detected, the transaction aborts with `VenueConflictError` (HTTP 409).

### C. Server-Side Check-In Guarantee

```prisma
model CheckIn {
  registrationId String @unique
  // ...
}
```

A student ticket cannot be checked in more than once. The `@unique` constraint on `registrationId` ensures idempotency even under high gate arrival concurrency.

---

## 3. Database Commands

| Command               | Action                                                      |
| :-------------------- | :---------------------------------------------------------- |
| `npm run db:generate` | Generates latest Prisma Client from `prisma/schema.prisma`  |
| `npm run db:migrate`  | Runs Prisma development migrations in local PostgreSQL      |
| `npm run db:deploy`   | Applies pending migrations in production or CI environments |
| `npm run db:seed`     | Runs `prisma/seed.ts` with SRM demo data                    |
| `npm run db:studio`   | Launches visual Prisma Studio GUI on port 5555              |
