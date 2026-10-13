"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  GraduationCap,
  Users,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "ORGANIZER">("STUDENT");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [campusCode, setCampusCode] = useState("SRM-RMP");

  // Club specific states
  const [clubName, setClubName] = useState("");
  const [clubCategory, setClubCategory] = useState("Technical");
  const [clubDescription, setClubDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim()) {
      setErrorMsg("Please provide your full name and institutional email.");
      return;
    }

    if (selectedRole === "ORGANIZER" && !clubName.trim()) {
      setErrorMsg("Please provide your Club / Society name.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: selectedRole,
        studentId: studentId.trim() || undefined,
        department: department.trim() || undefined,
        campusCode,
        clubName: selectedRole === "ORGANIZER" ? clubName.trim() : undefined,
        clubCategory: selectedRole === "ORGANIZER" ? clubCategory : undefined,
        clubDescription: selectedRole === "ORGANIZER" ? clubDescription.trim() : undefined,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create account");
      }

      // Route to respective dashboard
      if (selectedRole === "ORGANIZER") {
        router.push("/club/dashboard");
      } else {
        router.push("/student/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4 sm:py-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>New Account Registration</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Join CampusPulse SRM
        </h1>
        <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto">
          Create an account to RSVP for campus hackathons or register your club to host flagship events.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#12161f] border border-white/10 shadow-lg">
        <button
          type="button"
          onClick={() => setSelectedRole("STUDENT")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            selectedRole === "STUDENT"
              ? "bg-white text-black shadow-lg"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Student Account</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole("ORGANIZER")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            selectedRole === "ORGANIZER"
              ? "bg-white text-black shadow-lg"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Club / Organization</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3 shadow-lg">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-[#12161f] border border-white/10 p-6 sm:p-8 space-y-5 shadow-2xl"
      >
        <div className="border-b border-white/[0.08] pb-4">
          <h3 className="text-base font-bold text-white">
            {selectedRole === "STUDENT" ? "Student Information" : "Club Profile & Organizer Lead"}
          </h3>
          <p className="text-xs text-white/50">
            {selectedRole === "STUDENT"
              ? "Enter your academic details for OD attendance clearance and event passes."
              : "Set up your student organization profile for hosting campus events."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">
              {selectedRole === "STUDENT" ? "Full Name" : "Lead / President Name"} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Santhosh Kumar"
              className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">
              SRM Email ID *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sk1234@srmist.edu.in"
              className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-lime-400"
            />
          </div>
        </div>

        {selectedRole === "STUDENT" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">
                SRM Register Number
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. RA2311003010512"
                className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-lime-400 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-lime-400"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="School of Management">Management Studies (MBA/BBA)</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">
                  Club / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="e.g. Google Developer Student Club"
                  className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">
                  Category
                </label>
                <select
                  value={clubCategory}
                  onChange={(e) => setClubCategory(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="Technical">Technical Community</option>
                  <option value="Cultural">Cultural Society</option>
                  <option value="Academic">Academic & Research</option>
                  <option value="Sports">Sports & Fitness</option>
                  <option value="Social">Social Impact & Outreach</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">
                Short Description / Mission
              </label>
              <textarea
                rows={2}
                value={clubDescription}
                onChange={(e) => setClubDescription(e.target.value)}
                placeholder="Briefly describe your organization's mission and regular activities..."
                className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-lime-400 resize-none"
              />
            </div>
          </div>
        )}

        {/* Campus selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">
            Home Campus
          </label>
          <select
            value={campusCode}
            onChange={(e) => setCampusCode(e.target.value)}
            className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-lime-400"
          >
            <option value="SRM-RMP">SRM IST, Ramapuram Campus (Chennai)</option>
            <option value="SRM-KTR">SRM IST, Kattankulathur (Main Campus)</option>
            <option value="SRM-VDP">SRM IST, Vadapalani City Campus</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs tracking-tight transition-all active:scale-[0.99] shadow-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-black" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          <span>
            {selectedRole === "STUDENT" ? "Create Student Account" : "Register Organization & Lead"}
          </span>
        </button>
      </form>

      {/* Footer */}
      <div className="text-center space-y-2">
        <p className="text-xs text-white/50">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-lime-400 hover:text-lime-300 underline underline-offset-4"
          >
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
