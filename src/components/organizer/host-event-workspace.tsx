"use client";

import React, { useState, useTransition } from "react";
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Upload,
  AlertTriangle,
  ArrowRight,
  Send,
} from "lucide-react";

interface CampusData {
  id: string;
  name: string;
  code: string;
  city: string;
  venues: {
    id: string;
    name: string;
    building: string;
    capacity: number;
    facilities: string[];
  }[];
}

interface ConflictDetail {
  conflictingEventTitle: string;
  startTime: string;
  endTime: string;
  venueName?: string;
  organizerClubName?: string | null;
  status: string;
}

interface AvailabilityState {
  checked: boolean;
  available: boolean;
  message: string;
  conflict?: ConflictDetail;
}

interface HostEventWorkspaceProps {
  initialCampuses: CampusData[];
}

export function HostEventWorkspace({ initialCampuses }: HostEventWorkspaceProps) {
  // 1. Campus selection state
  const [selectedCampusCode, setSelectedCampusCode] = useState<string>("SRM-KTR");
  const selectedCampus = initialCampuses.find((c) => c.code === selectedCampusCode) ?? initialCampuses[0];

  // 2. Venue selection state (defaults to first venue of selected campus)
  const [selectedVenueId, setSelectedVenueId] = useState<string>(
    selectedCampus?.venues[0]?.id ?? ""
  );

  // 3. Time interval state
  const tomorrowStr = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16);
  const tomorrowEndStr = new Date(Date.now() + 28 * 3600 * 1000).toISOString().slice(0, 16);
  const [startTime, setStartTime] = useState<string>(tomorrowStr);
  const [endTime, setEndTime] = useState<string>(tomorrowEndStr);

  // 4. Availability check status state
  const [availability, setAvailability] = useState<AvailabilityState | null>(null);
  const [isPending, startTransition] = useTransition();

  // 5. Host proposal form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventCategory, setEventCategory] = useState("Hackathon");
  const [eventClub, setEventClub] = useState("Developer Student Club SRM (GDSC)");
  const [capacity, setCapacity] = useState("350");
  const [description, setDescription] = useState("");
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // When campus changes, update selected venue
  const handleCampusChange = (campusCode: string) => {
    setSelectedCampusCode(campusCode);
    const newCampus = initialCampuses.find((c) => c.code === campusCode);
    if (newCampus && newCampus.venues.length > 0) {
      setSelectedVenueId(newCampus.venues[0].id);
    }
    setAvailability(null);
  };

  // Run Conflict & Availability Check
  const handleCheckAvailability = () => {
    if (!selectedVenueId) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/venues/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            venueId: selectedVenueId,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
          }),
        });

        const json = await res.json();
        if (json.success && json.data) {
          setAvailability({
            checked: true,
            available: json.data.available,
            message: json.data.message,
            conflict: json.data.conflict,
          });
        } else {
          setAvailability({
            checked: true,
            available: false,
            message: json.error?.message || "Could not verify venue availability.",
          });
        }
      } catch (err) {
        console.error("Availability check failed:", err);
        setAvailability({
          checked: true,
          available: false,
          message: "Network or server error while checking venue conflicts.",
        });
      }
    });
  };

  // Pre-fill with AI mock draft
  const handleAutoFillAiDraft = () => {
    setEventTitle("SRM TechXelerate 2026: Next-Gen AI Symposium");
    setEventCategory("Technical");
    setEventClub("Developer Student Club SRM (GDSC)");
    setCapacity("350");
    setDescription(
      "National campus tech fest bringing 500+ builders together for AI workshops, overnight hack challenges, and startup mentorship."
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSuccess(true);
  };

  return (
    <div className="space-y-10">
      {/* =========================================================================
          CAMPUS & VENUE CONFLICT CHECKER ENGINE
         ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <Clock className="h-3.5 w-3.5" />
              <span>Real-Time Interval Overlap Detector</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Venue Availability & Conflict Verification
            </h2>
          </div>

          <p className="text-xs text-slate-500 max-w-sm sm:text-right">
            Enforces strict interval overlap rules on the server. Detects double-bookings across campus halls.
          </p>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. CAMPUS SELECTOR */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
              <span>1. Target SRM Campus</span>
            </label>
            <select
              value={selectedCampusCode}
              onChange={(e) => handleCampusChange(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              {initialCampuses.map((campus) => (
                <option key={campus.id} value={campus.code}>
                  {campus.name} ({campus.code})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              Selected: <span className="font-semibold text-slate-700">{selectedCampus?.city}</span>
            </p>
          </div>

          {/* 2. CAMPUS-SPECIFIC VENUE SELECTOR */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" />
              <span>2. Campus Venue ({selectedCampus?.venues.length ?? 0} Available)</span>
            </label>
            <select
              value={selectedVenueId}
              onChange={(e) => {
                setSelectedVenueId(e.target.value);
                setAvailability(null);
              }}
              className="w-full text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              {selectedCampus?.venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} — {venue.building} ({venue.capacity} seats)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 truncate">
              Building: {selectedCampus?.venues.find((v) => v.id === selectedVenueId)?.building}
            </p>
          </div>

          {/* 3. TIME INTERVALS */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Calendar className="h-3.5 w-3.5 text-indigo-600" />
              <span>3. Proposed Booking Slot</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setAvailability(null);
                }}
                className="w-full text-[11px] font-medium rounded-xl bg-slate-50 border border-slate-200 p-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setAvailability(null);
                }}
                className="w-full text-[11px] font-medium rounded-xl bg-slate-50 border border-slate-200 p-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCheckAvailability}
                disabled={isPending}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                {isPending ? "Checking availability..." : "Re-check Slot →"}
              </button>
            </div>
          </div>
        </div>

        {/* Check Button */}
        <div>
          <button
            type="button"
            onClick={handleCheckAvailability}
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <span>Verifying database intervals...</span>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                <span>Verify Venue Availability & Detect Conflicts</span>
              </>
            )}
          </button>
        </div>

        {/* =========================================================================
            AVAILABILITY / CONFLICT RESULT BOX
           ========================================================================= */}
        {availability && (
          <div className="pt-2 animate-in fade-in duration-200">
            {availability.available ? (
              /* CLEAN SLOT: GREEN CONFIRMATION */
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>Venue Available — Zero Scheduling Overlaps</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  {availability.message}
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] font-semibold text-emerald-800">
                  <span className="px-2 py-0.5 bg-emerald-100 rounded-md">Status: Clean Slot</span>
                  <span>Ready to attach to event proposal below.</span>
                </div>
              </div>
            ) : (
              /* CONFLICT DETECTED: RED / AMBER WARNING WITH EXACT CONFLICT DETAILS */
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0" />
                  <span>Booking Conflict Detected! Venue Already Occupied</span>
                </div>

                {availability.conflict ? (
                  <div className="bg-white/80 rounded-xl p-3.5 border border-rose-200/80 space-y-1.5 text-xs text-slate-700">
                    <p className="font-bold text-rose-900 text-sm">
                      Conflicting Event: {availability.conflict.conflictingEventTitle}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Reserved By:</span>{" "}
                      {availability.conflict.organizerClubName ?? "Registered Campus Organization"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Conflicting Slot:</span>{" "}
                      <span className="font-mono text-rose-800">
                        {new Date(availability.conflict.startTime).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}{" "}
                        –{" "}
                        {new Date(availability.conflict.endTime).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Status:</span>{" "}
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {availability.conflict.status}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-rose-700">{availability.message}</p>
                )}

                <div className="flex items-start gap-1.5 text-[11px] text-rose-700 bg-rose-100/60 p-2.5 rounded-lg border border-rose-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>
                    Resolution Required: Please choose another venue on this campus (e.g. Amphitheatre or Seminar Hall) or select a different time interval to resolve the conflict.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =========================================================================
          HOST EVENT PROPOSAL FORM (WITH MANDATORY CAMPUS FIELD)
         ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Event Proposal Creator</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Host an Event at SRM University
            </h2>
          </div>

          <button
            type="button"
            onClick={handleAutoFillAiDraft}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Autofill with AI Extracted Draft
          </button>
        </div>

        {submittedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Event proposal successfully submitted for DSA Administrative Approval!</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* 1. Target Campus Field */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <span>Hosting Campus Location *</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Specify which SRM campus will host this event so students see it on their respective campus feed.
            </p>
            <select
              value={selectedCampusCode}
              onChange={(e) => handleCampusChange(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl bg-white border border-slate-200 p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              {initialCampuses.map((campus) => (
                <option key={campus.id} value={campus.code}>
                  {campus.name} ({campus.code}) — {campus.city}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Event Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Event Title *</label>
              <input
                type="text"
                placeholder="e.g. HackSRM 2026 / Cultural Fest"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Category *</label>
              <select
                value={eventCategory}
                onChange={(e) => setEventCategory(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Technical">Technical</option>
                <option value="Cultural Fest">Cultural Fest</option>
                <option value="Guest Lecture">Guest Lecture</option>
                <option value="Workshop">Workshop</option>
                <option value="Sports">Sports</option>
              </select>
            </div>
          </div>

          {/* 3. Club, Venue, & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Organizing Club *</label>
              <input
                type="text"
                value={eventClub}
                onChange={(e) => setEventClub(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Reserved Venue (Filtered for {selectedCampusCode}) *
              </label>
              <select
                value={selectedVenueId}
                onChange={(e) => setSelectedVenueId(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              >
                {selectedCampus?.venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} ({venue.capacity} seats)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Target Capacity *</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>

          {/* 4. Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Event Description & Requirements *</label>
            <textarea
              rows={3}
              placeholder="Describe agenda, prizes, speaker qualifications, equipment needed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              Submitted proposals require review by the Directorate of Student Affairs.
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Proposal for Approval</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
