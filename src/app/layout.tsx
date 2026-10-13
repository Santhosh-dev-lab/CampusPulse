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
  title: "CampusPulse — SRM University Smart Events",
  description:
    "Luma-inspired smart campus event discovery, ticketing, conflict-free venue booking, and approval platform for SRM Institute of Science and Technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans flex flex-col selection:bg-indigo-500/20 selection:text-indigo-600">
        {/* Luma Minimalist Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo & Campus Badge */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    CampusPulse
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    SRM
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 -mt-0.5 font-medium">
                  Smart Event Engine
                </span>
              </div>
            </Link>

            {/* Navigation Pills */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-full transition-all"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Explore</span>
              </Link>

              <Link
                href="/my-tickets"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-full transition-all"
              >
                <Ticket className="h-3.5 w-3.5 text-slate-400" />
                <span>My Passes</span>
              </Link>

              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-full transition-all"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
                <span>Organizer Hub</span>
              </Link>

              <Link
                href="/approvals"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-full transition-all"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                <span>DSA Approvals</span>
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-full">
                  2
                </span>
              </Link>
            </nav>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-sm"
              >
                <span>+ Host Event</span>
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700">
                  SK
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    Santhosh Kumar
                  </span>
                  <span className="text-[10px] text-slate-400">RA2311003010512</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Luma Minimalist Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2 font-medium">
              <span className="font-bold text-slate-800">CampusPulse</span>
              <span>© {new Date().getFullYear()} SRM Institute of Science and Technology.</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <a href="/api/health" className="hover:text-slate-900 transition-colors">
                System Health
              </a>
              <a href="/api/readiness" className="hover:text-slate-900 transition-colors">
                Database Status
              </a>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">Kattankulathur • Ramapuram • Vadapalani</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
