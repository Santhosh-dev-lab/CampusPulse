# CampusPulse Architecture Guide

## 1. System Overview

CampusPulse is a two-sided campus event management, discovery, conflict-free venue booking, and approval platform tailored for SRM University (SRM Institute of Science and Technology).

The platform draws inspiration from modern event discovery platforms like Luma while solving institutional requirements:

- Multi-campus isolation and aggregation (`SRM-KTR`, `SRM-RMP`, `SRM-VDP`).
- Role-based workflows (Student, Club Organizer, Dean/Administrator).
- Conflict-free physical venue reservation using interval overlap checking.
- Cryptographically signed QR ticketing and tamper-proof check-ins.
- Provider-agnostic AI poster-to-draft extraction.

```
                      ┌────────────────────────────────────────┐
                      │          CampusPulse Web App           │
                      │       (Next.js App Router / RSC)       │
                      └───────────────────┬────────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
   ┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
   │ Student Portal  │           │  Organizer Hub  │           │   Admin Desk    │
   │  - Discovery    │           │  - Draft Event  │           │  - Approvals    │
   │  - Free Passes  │           │  - AI Posters   │           │  - Audit Logs   │
   │  - QR Tickets   │           │  - Venue Search │           │  - Multi-Campus │
   └─────────────────┘           └─────────────────┘           └─────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │        Domain Service Boundaries       │
                      │  - RegistrationService                 │
                      │  - VenueBookingService                 │
                      │  - CheckInService                      │
                      │  - ApprovalService                     │
                      │  - PosterExtractionService             │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │          Prisma ORM Layer              │
                      │ (Type-safe, parameterized SQL queries) │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │         Local PostgreSQL 18            │
                      │      (Relational Constraints)          │
                      └────────────────────────────────────────┘
```

---

## 2. Directory Layout & Layer Boundaries

```text
src/
├── app/                  # Next.js App Router (RSC by default)
│   ├── (public)/         # Public event landing pages & details
│   ├── (student)/        # Student ticket passes & registration receipts
│   ├── (organizer)/      # Organizer event manager & AI poster upload
│   ├── (admin)/          # Admin approval desk & audit viewer
│   ├── api/              # Route handlers (/api/health, /api/readiness)
│   └── globals.css       # Design tokens & glassmorphism utilities
├── components/           # Reusable UI elements (EventCard, badges, modals)
├── config/               # App metadata, SRM campus constants, navigation
├── features/             # Domain UI modules
├── lib/
│   ├── db.ts             # PrismaClient singleton with dev connection pool reuse
│   ├── env.ts            # Zod runtime environment validation
│   ├── errors/           # AppError, standard error codes & response handlers
│   ├── security/         # Cryptographic ticket tokens, SHA-256 hashing
│   ├── storage/          # Local filesystem & S3-compatible storage abstraction
│   └── utils.ts          # Tailwind cn merge & Asia/Kolkata date formatters
└── server/
    ├── policies/         # Server-side RBAC (requireRole, status transitions)
    └── services/         # Transactional domain logic (never in React components)
```

---

## 3. Server Components vs Client Components

1. **Server Components (Default)**:
   - Data fetching and database access happen on the server.
   - Zero client-side JavaScript overhead for static pages.
   - Credentials, connection strings, and server logic never leak to the browser.

2. **Client Components (`"use client"`)**:
   - Strictly reserved for interactive elements: modals, client-side error boundaries, forms, and camera QR scanners.
   - Never perform database calls directly from client components; communicate via server actions or validated route handlers.

---

## 4. Multi-Campus Extensibility

Campus data is stored as first-class entities with unique codes (`SRM-KTR`, `SRM-RMP`, `SRM-VDP`). Adding a new campus (such as `SRM-NCR` or `SRM-AP`) requires only a database record insertion without rewriting routing or domain logic.
