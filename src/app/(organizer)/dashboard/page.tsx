import React from "react";
import { prisma } from "@/lib/db";
import { HostEventWorkspace } from "@/components/organizer/host-event-workspace";
import {
  Upload,
  Sparkles,
  Calendar,
  Users,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  QrCode,
} from "lucide-react";

export default async function OrganizerDashboardPage() {
  // Fetch campuses and their venues from PostgreSQL
  const campuses = await prisma.campus.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      city: true,
      venues: {
        select: {
          id: true,
          name: true,
          building: true,
          capacity: true,
          facilities: true,
        },
        orderBy: {
          capacity: "desc",
        },
      },
    },
    orderBy: {
      code: "asc",
    },
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Organizer Operations Hub
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase">
              GDSC SRM Lead
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Host events, verify venue conflicts across SRM campuses, and manage attendee check-ins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#ai-poster-creator"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="h-4 w-4" />
            AI Poster Draft Creator
          </a>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Registrations</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">2,152</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>+18% from last week</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Managed Events</span>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">3 Events</p>
          <p className="text-[11px] text-slate-500 font-medium">2 Published • 1 In Review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Average Check-In Rate</span>
            <BarChart3 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">89.4%</p>
          <p className="text-[11px] text-emerald-600 font-medium">High turnout rate across KTR</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>QR Scanner Ready</span>
            <QrCode className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-slate-900">Gate Scanner Station</p>
          <span className="inline-block text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            Active for HackSRM 2026
          </span>
        </div>
      </div>

      {/* Interactive Host Workspace & Conflict Detector (with Campus selection) */}
      <HostEventWorkspace initialCampuses={campuses} />

      {/* AI Poster Extraction Studio */}
      <section
        id="ai-poster-creator"
        className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Provider-Independent AI Poster Extraction</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Generate Event Proposal Draft from Poster
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
          Upload an event flyer or poster image. The system extracts title, dates, venue, and
          descriptions into a structured draft for organizer review.
        </p>

        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer space-y-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">
              Click to upload or drag & drop poster flyer
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or WebP up to 5MB</p>
          </div>
        </div>

        {/* AI Extraction Preview Card */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Extracted Draft Preview (Deterministic Mock Engine)</span>
            <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Extraction Confidence: 92%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
            <p>
              <span className="font-semibold text-slate-900">Extracted Title:</span> SRM
              TechXelerate 2026
            </p>
            <p>
              <span className="font-semibold text-slate-900">Target Venue:</span> Dr. T. P. Ganesan
              Auditorium
            </p>
            <p>
              <span className="font-semibold text-slate-900">Schedule:</span> Next Saturday • 9:00 AM IST
            </p>
            <p>
              <span className="font-semibold text-slate-900">Category:</span> Technical Symposium
            </p>
          </div>

          <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Safety Rule: AI extraction never automatically publishes an event. Organizers must review
              and confirm details before submitting for Administrative approval.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
