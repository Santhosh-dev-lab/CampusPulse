# CampusPulse ⚡

> **The Next-Gen Smart Event Hub & Gate Attendance Pipeline for SRM University**  
> Conflict-free venue scheduling, passwordless institutional email authentication, live camera gate verification, and official Google Wallet passes.

[![Next.js](https://img.shields.io/badge/Next.js-15_App_Router-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_0_Errors-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4_Dark_Glassmorphism-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🏆 Hackathon Winning Pitch & Core Innovations

Universities host hundreds of technical hackathons, cultural festivals, and symposiums every semester. Yet, campus event management remains plagued by **scattered WhatsApp flyers, double-booked auditoriums, manual sign-in sheets, paper ticket scalping, and lost academic On-Duty (OD) attendance credits**.

**CampusPulse** transforms SRM University into an automated, two-sided smart campus ecosystem:

```
[Student Discovery & Passes]  ◄───►  [Club Hosting & Venue Booking]  ◄───►  [DSA University Approvals]
       │                                         │                                      │
       ▼                                         ▼                                      ▼
 Google Wallet Passes &                    Zero-Overlap Venue                    Immutable Clearance
 6-Digit Real Email OTP                   Time-Interval Engine                  Audit Log & OD Credits
```

### 🌟 6 Killer Unique Features
1. **Passwordless Institutional Email OTP Authentication**:
   - Students enter their institutional SRM email (`@srmist.edu.in`).
   - System dispatches a cryptographically secure 6-digit OTP code directly to their real inbox via configured Gmail/Workspace SMTP.
   - Zero password fatigue; automatic student profile provisioning on first login.
2. **Real-Time Live Camera QR Gate Scanner**:
   - Gate security and club organizers turn any smartphone, laptop webcam, or tablet into a high-speed gate terminal.
   - Built with hardware-accelerated `jsQR` computer vision, animated scanning reticle, pleasant acoustic chime feedback (Web Audio API), and anti-duplicate cooldown.
3. **Official Google Wallet Pass Integration**:
   - Verified passes feature an official *"Add to Google Wallet"* button.
   - Generates standardized Google Wallet Generic Pass objects with QR barcodes, campus location data, seat tiers, and downloadable `.json` passes.
4. **Autonomous Venue Conflict Prevention Engine**:
   - Mathematical PostgreSQL interval check (`t_start1 < t_end2 AND t_start2 < t_end1`) guarantees no two clubs can ever double-book TP Ganesan or TRP Auditorium.
5. **Three Distinct, Role-Isolated Dashboards**:
   - **Student Dashboard**: Live active passes, attended hours counter, academic OD attendance credit tally, and personalized schedule.
   - **Club Organizer Dashboard**: Event portfolio management, registration capacity gauges, flyer drafts, and gate scanner shortcut.
   - **DSA Executive Command Center**: Directorate of Student Affairs approval queue, conflict audit logs, and clearance desk.
6. **Academic On-Duty (OD) Attendance Credit Automation**:
   - Scanning a ticket at the campus gate instantly writes an immutable check-in record linked to the student's register number, providing certified proof for semester attendance credits.

---

## 🔐 Demo Credentials (Seeded in PostgreSQL)

The platform includes verified production seed accounts across all three university roles:

| Role | Institutional Email | Password | Affiliation / SRM ID | Destination Dashboard |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `santhosh.student@srmist.edu.in` | `password123` | SRMIST Ramapuram (`RA2311003010512`) | [`/student/dashboard`](http://localhost:3000/student/dashboard) |
| **Club Lead (Organizer)** | `aarav.organizer@srmist.edu.in` | `password123` | Turing AI Club Lead (`RA2211003010042`) | [`/club/dashboard`](http://localhost:3000/club/dashboard) |
| **DSA Admin** | `admin@srmist.edu.in` | `password123` | Directorate of Student Affairs (DSA) | [`/admin/dashboard`](http://localhost:3000/admin/dashboard) |

> 💡 **Tip:** You can log in using either the **Password tab** (with quick-fill buttons) or the **SRM Email Code tab** (dispatches a real 6-digit OTP code to your inbox).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** `v20+` or `v22+` (Node `v23` verified)
- **PostgreSQL** running locally or in cloud on port `5432`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Santhosh-dev-lab/CampusPulse.git
cd CampusPulse
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/campuspulse?schema=public"

# Outgoing Email OTP Configuration (Gmail / Google Workspace SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_app_password
EMAIL_FROM="CampusPulse SRM" <your_email@gmail.com>
```

### 3. Database Migration & Flagship Seed
```bash
# Generate Prisma Client & apply schema migrations
npm run db:generate
npm run db:migrate

# Seed flagship SRM Ramapuram events (HackSRM, RoboWars, AI Diagnostics, Cloud Native)
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Inspect Database (Prisma Studio)
```bash
npx prisma studio --port 5555
```
Prisma Studio visual GUI opens at **[http://localhost:5555](http://localhost:5555)**.

---

## 🗺️ Key Routes & Architecture

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/               # Passwordless Email OTP & Credentials Login
│   │   └── register/            # Student & Club Registration
│   ├── (student)/
│   │   ├── student/dashboard/   # Student metrics, active passes & OD credits
│   │   └── my-tickets/          # QR Ticket passes & Add to Google Wallet modal
│   ├── (organizer)/
│   │   ├── club/dashboard/      # Club organizer portfolio & analytics
│   │   ├── create/              # Host Event workspace & venue conflict detector
│   │   └── scanner/             # Live Camera QR Gate Scanner (Organizer & Admin)
│   ├── (admin)/
│   │   ├── admin/dashboard/     # DSA Executive Command Center
│   │   └── approvals/           # Official proposal clearance desk
│   ├── (public)/
│   │   ├── page.tsx             # Modern Spotlight Discovery Grid (SRM Ramapuram)
│   │   └── events/[id]/         # Event details & instant pass reservation
│   └── api/
│       ├── auth/otp/send/       # Dispatches 6-digit code via real SMTP
│       ├── auth/otp/verify/     # Verifies code & auto-provisions student account
│       ├── check-in/            # Idempotent gate check-in & attendance recording
│       ├── tickets/[id]/wallet/ # Google Wallet Generic Object API
│       └── venues/              # Conflict checking & availability engine
├── components/
│   ├── organizer/               # Venue conflict calendar & event builder
│   ├── student/                 # Google Wallet pass card modal
│   └── shared/                  # Role-protected responsive glassmorphic shell
├── lib/
│   ├── db.ts                    # Prisma PostgreSQL client singleton
│   └── security/                # Role-Based Access Control (RBAC) & cookie auth
└── server/
    └── services/
        ├── email.service.ts     # Nodemailer SMTP engine with HTML template
        ├── checkin.service.ts   # Attendance recording & OD validation
        └── venue.service.ts     # Mathematical interval overlap detection
```

---

## 🧪 Verification & Quality Assurance

```bash
# Full TypeScript typecheck (0 errors)
npm run typecheck

# Unit and integration tests (Vitest)
npm run test

# Code formatting & style checks
npm run format:check
```

---

## 📄 License
MIT License. Engineered with pride for SRM Institute of Science and Technology.
