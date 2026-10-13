# CampusPulse Developer Guide

This guide describes how to set up, develop, test, and contribute to CampusPulse on your local machine.

---

## 1. Prerequisites

- **Node.js**: v20+ or v22+ LTS (v23+ supported).
- **npm**: v10+ or v11+.
- **PostgreSQL**: Locally installed and running on port 5432 (PostgreSQL 15–18 supported).

---

## 2. Quickstart Step-by-Step

### Step 1: Clone & Install

```bash
git clone https://github.com/Santhosh-dev-lab/CampusPulse.git
cd CampusPulse
npm install
```

### Step 2: Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `DATABASE_URL` with your local PostgreSQL credentials:

```dotenv
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/campuspulse?schema=public
```

### Step 3: Run Migrations & Seed Data

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Step 4: Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Available npm Scripts

| Script                 | Command              | Purpose                                      |
| :--------------------- | :------------------- | :------------------------------------------- |
| `npm run dev`          | `next dev`           | Starts local Next.js development server      |
| `npm run build`        | `next build --turbo` | Compiles optimized production bundle         |
| `npm run start`        | `next start`         | Runs built production server                 |
| `npm run lint`         | `next lint`          | Executes ESLint across all source files      |
| `npm run typecheck`    | `tsc --noEmit`       | Strict TypeScript compilation check          |
| `npm run format`       | `prettier --write .` | Auto-formats codebase                        |
| `npm run format:check` | `prettier --check .` | Verifies code formatting                     |
| `npm run test`         | `vitest run`         | Runs unit & integration test suite           |
| `npm run test:watch`   | `vitest`             | Runs tests in interactive watch mode         |
| `npm run test:e2e`     | `playwright test`    | Executes end-to-end browser smoke tests      |
| `npm run db:generate`  | `prisma generate`    | Generates type-safe Prisma client            |
| `npm run db:migrate`   | `prisma migrate dev` | Applies schema migrations                    |
| `npm run db:seed`      | `tsx prisma/seed.ts` | Populates database with SRM demo data        |
| `npm run db:studio`    | `prisma studio`      | Opens database visual explorer               |
| `npm run verify`       | Combined             | Runs typecheck, tests, and formatting checks |
