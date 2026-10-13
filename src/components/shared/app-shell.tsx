"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  Calendar,
  Ticket,
  ShieldCheck,
  QrCode,
  ChevronDown,
  Check,
  LogOut,
  LayoutDashboard,
  Plus,
  LogIn,
  UserPlus,
} from "lucide-react";

interface CurrentUserData {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ORGANIZER" | "ADMIN";
  studentId?: string | null;
  department?: string | null;
  club?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

interface DevUserOption {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ORGANIZER" | "ADMIN";
  studentId?: string | null;
  department?: string | null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUserData | null>(null);
  const [devUsers, setDevUsers] = useState<DevUserOption[]>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Fetch pending approvals count
    fetch("/api/approvals")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.pendingEvents)) {
          setPendingCount(data.pendingEvents.length);
        }
      })
      .catch(() => {});

    // 2. Fetch active user & available dev accounts
    fetch("/api/auth/current-user")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          if (data.user) {
            setCurrentUser(data.user);
          }
          if (Array.isArray(data.availableUsers)) {
            setDevUsers(data.availableUsers);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoaded(true);
      });
  }, [pathname]);

  const handleSwitchUser = async (targetUserId: string) => {
    try {
      setSwitching(true);
      const res = await fetch("/api/auth/dev-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setShowRoleDropdown(false);

        // Intelligently route to their designated role dashboard
        if (data.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else if (data.user.role === "ORGANIZER") {
          router.push("/club/dashboard");
        } else {
          router.push("/student/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to switch persona:", err);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setShowRoleDropdown(false);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const isCreateOrHost =
    pathname === "/create" || pathname.startsWith("/create/");

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const userRole = currentUser?.role;

  // Initials for avatar
  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SRM";

  return (
    <div className="min-h-screen bg-[#07090e] text-white font-sans flex flex-col selection:bg-lime-400/20 selection:text-lime-300">
      {/* Persistent Unified Task Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07090e]/90 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & SRM Ramapuram Badge */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4 text-lime-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  CampusPulse
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-lime-400/20 text-lime-400 rounded border border-lime-400/30">
                  SRM-RMP
                </span>
              </div>
              <span className="text-[10px] text-white/40 -mt-0.5 font-medium">
                Ramapuram Campus
              </span>
            </div>
          </Link>

          {/* Role-Specific Protected Navigation Pills (hidden on auth pages) */}
          {!isAuthPage && (
            <nav className="hidden md:flex items-center gap-1">
            {/* Always accessible discovery */}
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                pathname === "/"
                  ? "bg-white/10 text-white font-bold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="h-3.5 w-3.5 text-white/50" />
              <span>Explore</span>
            </Link>

            {/* 1. STUDENT ONLY LINKS */}
            {userRole === "STUDENT" && (
              <>
                <Link
                  href="/student/dashboard"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    pathname === "/student/dashboard"
                      ? "bg-white/10 text-white font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-lime-400" />
                  <span>My Dashboard</span>
                </Link>

                <Link
                  href="/my-tickets"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    pathname === "/my-tickets"
                      ? "bg-white/10 text-white font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Ticket className="h-3.5 w-3.5 text-white/50" />
                  <span>My Passes</span>
                </Link>
              </>
            )}

            {/* 2. CLUB / ORGANIZER ONLY LINKS */}
            {userRole === "ORGANIZER" && (
              <>
                <Link
                  href="/club/dashboard"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    pathname === "/club/dashboard"
                      ? "bg-white/10 text-white font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Club Dashboard</span>
                </Link>

                <Link
                  href="/create"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    pathname === "/create"
                      ? "bg-white/10 text-white font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Plus className="h-3.5 w-3.5 text-lime-400" />
                  <span>Host Event</span>
                </Link>

                <Link
                  href="/scanner"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    pathname === "/scanner"
                      ? "bg-white/10 text-white font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5 text-white/50" />
                  <span>Gate Scanner</span>
                </Link>
              </>
            )}

            {/* 3. ADMIN (DSA) ONLY LINKS */}
            {userRole === "ADMIN" && (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    pathname === "/admin/dashboard"
                      ? "bg-white/10 text-white font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-amber-400" />
                  <span>DSA Dashboard</span>
                </Link>

                <Link
                  href="/approvals"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    pathname === "/approvals"
                      ? "bg-white/10 text-white font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-white/50" />
                  <span>Approvals Desk</span>
                  {pendingCount !== null && pendingCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-400 text-black text-[10px] font-extrabold rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/scanner"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    pathname === "/scanner"
                      ? "bg-white/10 text-white font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5 text-lime-400" />
                  <span>Gate Scanner</span>
                </Link>
              </>
            )}
          </nav>
          )}

          {/* User Profile Pill & Login/Register Buttons */}
          <div className="flex items-center gap-3">
            {isAuthPage ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Calendar className="h-3.5 w-3.5 text-white/50" />
                  <span>Explore Events</span>
                </Link>
                {currentUser && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            ) : !currentUser && isLoaded ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 text-xs font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5 text-white/70" />
                  <span>Sign In</span>
                </Link>

                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-lime-400 hover:bg-lime-300 text-black text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5 text-black" />
                  <span>Register</span>
                </Link>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-3">
                {/* Contextual primary action button for role */}
                {userRole === "ORGANIZER" && (
                  <Link
                    href="/create"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 ${
                      isCreateOrHost
                        ? "bg-lime-400 text-black shadow-lime-400/20"
                        : "bg-white hover:bg-lime-400 text-black"
                    }`}
                  >
                    <span>+ Host Event</span>
                  </Link>
                )}

                {userRole === "STUDENT" && (
                  <Link
                    href="/my-tickets"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-lime-400 hover:text-black text-white transition-all border border-white/15"
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    <span>My Passes</span>
                  </Link>
                )}

                {userRole === "ADMIN" && (
                  <Link
                    href="/approvals"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black transition-all shadow-md"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Review Queue</span>
                  </Link>
                )}

                {/* Interactive Profile & Persona Switcher */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="flex items-center gap-2 pl-2 border-l border-white/10 hover:opacity-90 transition-opacity text-left cursor-pointer"
                    title="Account profile & persona switcher"
                  >
                    <div
                      className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                        userRole === "ADMIN"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : userRole === "ORGANIZER"
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                          : "bg-lime-500/10 border-lime-500/30 text-lime-400"
                      }`}
                    >
                      {initials}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white leading-tight">
                          {currentUser.name}
                        </span>
                        <ChevronDown className="h-3 w-3 text-white/50" />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-white/50">
                        <span
                          className={`font-semibold ${
                            userRole === "ADMIN"
                              ? "text-amber-400"
                              : userRole === "ORGANIZER"
                              ? "text-cyan-400"
                              : "text-lime-400"
                          }`}
                        >
                          {userRole}
                        </span>
                        <span>• SRM-RMP</span>
                      </div>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showRoleDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowRoleDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#12161f] border border-white/10 shadow-2xl z-50 p-2 space-y-1 backdrop-blur-xl">
                        {/* Profile Info Header */}
                        <div className="px-3 py-2 border-b border-white/[0.08] space-y-0.5">
                          <span className="text-xs font-bold text-white block">
                            {currentUser.name}
                          </span>
                          <span className="text-[10px] text-white/40 block truncate">
                            {currentUser.email}
                          </span>
                          <div className="pt-1">
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                userRole === "ADMIN"
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                  : userRole === "ORGANIZER"
                                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                                  : "bg-lime-500/20 text-lime-400 border-lime-500/30"
                              }`}
                            >
                              Role: {userRole}
                            </span>
                          </div>
                        </div>

                        {/* Role-specific Navigation Links */}
                        <div className="py-1 space-y-0.5">
                          {userRole === "STUDENT" && (
                            <>
                              <Link
                                href="/student/dashboard"
                                onClick={() => setShowRoleDropdown(false)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <LayoutDashboard className="h-3.5 w-3.5 text-lime-400" />
                                <span>My Student Dashboard</span>
                              </Link>
                              <Link
                                href="/my-tickets"
                                onClick={() => setShowRoleDropdown(false)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <Ticket className="h-3.5 w-3.5 text-white/50" />
                                <span>My Passes & QR Tickets</span>
                              </Link>
                            </>
                          )}

                          {userRole === "ORGANIZER" && (
                            <>
                              <Link
                                href="/club/dashboard"
                                onClick={() => setShowRoleDropdown(false)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <LayoutDashboard className="h-3.5 w-3.5 text-cyan-400" />
                                <span>Club Overview</span>
                              </Link>
                              <Link
                                href="/create"
                                onClick={() => setShowRoleDropdown(false)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5 text-lime-400" />
                                <span>Host New Event</span>
                              </Link>
                              <Link
                                href="/scanner"
                                onClick={() => setShowRoleDropdown(false)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <QrCode className="h-3.5 w-3.5 text-white/50" />
                                <span>Gate QR Scanner</span>
                              </Link>
                            </>
                          )}

                          {userRole === "ADMIN" && (
                            <>
                              <Link
                                href="/admin/dashboard"
                                onClick={() => setShowRoleDropdown(false)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <LayoutDashboard className="h-3.5 w-3.5 text-amber-400" />
                                <span>DSA Command Dashboard</span>
                              </Link>
                              <Link
                                href="/approvals"
                                onClick={() => setShowRoleDropdown(false)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-white/50" />
                                <span>Approvals Clearance Desk</span>
                              </Link>
                              <Link
                                href="/scanner"
                                onClick={() => setShowRoleDropdown(false)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <QrCode className="h-3.5 w-3.5 text-lime-400" />
                                <span>Gate QR Scanner</span>
                              </Link>
                            </>
                          )}
                        </div>

                        {/* Sign Out Button */}
                        <div className="pt-2 border-t border-white/[0.08]">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Sign Out of Account</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full ${
          isCreateOrHost ? "p-0" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        }`}
      >
        {children}
      </main>

      {/* Persistent Footer */}
      {!isCreateOrHost && !isAuthPage && (
        <footer className="border-t border-white/[0.08] bg-[#07090e] py-8 mt-auto text-xs text-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-medium">
              <span className="font-bold text-white">CampusPulse</span>
              <span>
                © {new Date().getFullYear()} SRM Institute of Science and Technology, Ramapuram
                Campus.
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <a href="/api/health" className="hover:text-white transition-colors">
                System Health
              </a>
              <a href="/api/readiness" className="hover:text-white transition-colors">
                Database Status
              </a>
              <span className="text-white/20">•</span>
              <span className="text-white/40">Bharathi Salai, Ramapuram, Chennai</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
