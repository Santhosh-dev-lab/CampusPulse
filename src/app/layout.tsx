import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Sparkles, Calendar, Ticket, LayoutDashboard, ShieldCheck } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CampusPulse — Smart Campus Event Platform | SRM University",
  description:
    "The two-sided event discovery, ticketing, conflict-free venue booking, and approval platform for SRM Institute of Science and Technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-500/20 selection:text-indigo-600">
        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-indigo-100 text-xs py-2 px-4 text-center font-medium border-b border-indigo-900/50 flex items-center justify-center gap-2">
          <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300 font-semibold ring-1 ring-inset ring-indigo-500/30">
            SRM University
          </span>
          <span>SRM Kattankulathur • Ramapuram • Vadapalani Campus Event Engine</span>
        </div>

        {/* Main Header / Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900">
                    CampusPulse
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200/60">
                    KTR
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 -mt-0.5 font-medium">
                  SRM University Events
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 rounded-lg transition-colors"
              >
                <Calendar className="h-4 w-4 text-slate-500" />
                Explore
              </Link>
              <Link
                href="/my-tickets"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 rounded-lg transition-colors"
              >
                <Ticket className="h-4 w-4 text-slate-500" />
                My Tickets
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 rounded-lg transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-500" />
                Organizer Hub
              </Link>
              <Link
                href="/approvals"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 rounded-lg transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-slate-500" />
                Approvals
                <span className="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                  2
                </span>
              </Link>
            </nav>

            {/* User Profile / Mock Session */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900">Santhosh Kumar</span>
                <span className="text-[11px] text-slate-500">Student • RA2311003010512</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-slate-200 to-indigo-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-indigo-700">
                SK
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">CampusPulse</span>
              <span>
                © {new Date().getFullYear()} SRM Institute of Science and Technology. All rights
                reserved.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/api/health" className="hover:text-slate-900 transition-colors">
                API Health
              </a>
              <a href="/api/readiness" className="hover:text-slate-900 transition-colors">
                Readiness Check
              </a>
              <span className="text-slate-300">•</span>
              <span>Kattankulathur Campus, Chengalpattu, Tamil Nadu 603203</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
