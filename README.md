# CampusPulse ⚡

> Smart campus event discovery, ticketing, conflict-free venue booking, and administrative approval platform for **SRM University** (SRM Institute of Science and Technology).

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?style=flat&logo=vitest)](https://vitest.dev/)

---

## 1. Product Overview

CampusPulse is a production-minded, two-sided platform connecting students looking for campus events with student clubs, technical societies, and university administrators:

- **Students**: Discover hackathons, cultural showcases, and guest lectures across SRM campuses (`SRM-KTR`, `SRM-RMP`, `SRM-VDP`), claim free passes with capacity enforcement, and present cryptographically signed QR tickets at entry gates.
- **Organizers**: Create event proposals, detect venue time interval overlaps in real-time, generate drafts from flyers using a provider-agnostic AI extraction interface, and check attendees in with idempotent scans.
- **Administrators**: Directorate of Student Affairs (DSA) dean portal for approving event proposals with mandatory rejection rationale and an immutable audit trail.

---

## 2. Technology Stack

- **Framework**: Next.js 15 (App Router, React Server Components by default).
- **Language**: TypeScript in strict mode.
- **Styling**: Tailwind CSS with tailored HSL design tokens and glassmorphism.
- **Database**: Local PostgreSQL 18 with Prisma ORM and migration tracking.
- **Testing**: Vitest, React Testing Library, and Playwright for E2E browser tests.
- **Quality**: ESLint, Prettier, and TypeScript compiler checks.

---

## 3. Quick Start (Windows & PowerShell)

### Prerequisites

- Node.js `v20+` or `v22+` (Node `v23` verified).
- PostgreSQL 15–18 running on `localhost:5432`.

### Step 1: Install Dependencies

```powershell
npm install
```

### Step 2: Environment Configuration

Copy `.env.example` to `.env.local` and configure your local PostgreSQL connection:

```powershell
Copy-Item .env.example .env.local
```

Edit `DATABASE_URL` in `.env.local`:

```dotenv
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/campuspulse?schema=public
```

### Step 3: Run Database Migrations & Deterministic Seed

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Step 4: Run Health Diagnostics

```powershell
npx tsx scripts/check-environment.ts
```

### Step 5: Start the Development Server

```powershell
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Key Endpoints & Routes

| Route            | Role / Scope | Description                                                           |
| :--------------- | :----------- | :-------------------------------------------------------------------- |
| `/`              | Public       | Luma-inspired event discovery grid with campus filters                |
| `/events/[id]`   | Public       | Event landing page with capacity meter & pass reservation             |
| `/my-tickets`    | Student      | Attendee ticket pass with high-fidelity QR matrix                     |
| `/dashboard`     | Organizer    | Organizer hub: AI poster extraction preview & venue conflict detector |
| `/approvals`     | Admin        | DSA administrative approval desk with immutable audit log             |
| `/api/health`    | Public       | Liveness probe returning process uptime & status                      |
| `/api/readiness` | Public       | Readiness probe checking PostgreSQL connectivity                      |

---

## 5. Verification Commands

To verify code quality and tests:

```powershell
npm run typecheck    # TypeScript strict check (0 errors)
npm test             # Vitest test suite (25 unit & integration tests passing)
npm run lint         # ESLint checking
npm run format:check # Prettier code style verification
npm run build        # Optimized production build with Turbopack
```

---

## 6. Architecture & Documentation Directory

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Database & Relational Constraints](docs/DATABASE.md)
- [Environment Configuration Matrix](docs/ENVIRONMENT.md)
- [Security & Threat Model](docs/SECURITY.md)
- [API Specification & Error Conventions](docs/API.md)
- [Developer Onboarding Guide](docs/DEVELOPMENT.md)

---

## 7. License

MIT License. Designed and engineered for SRM Institute of Science and Technology.
