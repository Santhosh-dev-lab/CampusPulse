import React from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function EventDetailsPage({ params: _params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to All Events
        </Link>
      </div>

      {/* Main Event Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80"
            alt="Event Poster"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold shadow">
              Hackathon
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Event
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase font-bold tracking-wider text-indigo-600">
              Developer Student Club SRM (GDSC)
            </p>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              HackSRM 2026: 36-Hour National Flagship Hackathon
            </h1>
          </div>

          {/* Quick Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Date & Time</p>
                <p className="text-slate-500">Oct 24, 2026 • 9:00 AM</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Venue</p>
                <p className="text-slate-500">Tech Park Mini Auditorium</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Capacity</p>
                <p className="text-slate-500">38 spots left of 350</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">About the Event</h2>
            <p>
              Join 500+ builders across India to build decentralized, AI, and smart campus
              prototypes. Mentorship from industry giants, cash prize pools, free food, and
              overnight hacking in the SRM Tech Park.
            </p>
            <p>
              Open to all SRM Institute of Science and Technology students across Kattankulathur,
              Ramapuram, and Vadapalani campuses.
            </p>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">Registration Status</p>
              <p className="text-base font-bold text-slate-900">Free Admission Pass</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all">
                <CheckCircle2 className="h-4 w-4" />
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
