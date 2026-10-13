"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  History,
  ArrowLeft,
  AlertTriangle,
  X,
  Sparkles,
  Check,
} from "lucide-react";

export interface PendingProposal {
  id: string;
  title: string;
  category: string;
  club: string;
  venue: string;
  requestedDates: string;
  capacity: number;
  description: string;
}

export interface AuditLogItem {
  id: string;
  eventTitle: string;
  reviewer: string;
  action: "APPROVED" | "REJECTED" | "REVISION_REQUESTED";
  date: string;
  comments: string;
}

interface ApprovalDeskWorkspaceProps {
  initialPending: PendingProposal[];
  initialAuditLogs: AuditLogItem[];
}

const QUICK_REJECTION_REASONS = [
  "Safety clearances and fire marshal protocols incomplete.",
  "Venue schedule conflict with scheduled university examination.",
  "Sound and high-decibel audio requested beyond 8:30 PM cutoff.",
  "Projected attendance exceeds auditorium fire safety capacity limits.",
];

export function ApprovalDeskWorkspace({
  initialPending,
  initialAuditLogs,
}: ApprovalDeskWorkspaceProps) {
  const router = useRouter();
  const [pendingProposals, setPendingProposals] = useState<PendingProposal[]>(initialPending);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);

  // Loading states
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingProposal, setRejectingProposal] = useState<PendingProposal | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Banner notification feedback
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // Approve Handler
  const handleApprove = async (proposal: PendingProposal) => {
    setApprovingId(proposal.id);
    setNotification(null);

    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: proposal.id,
          action: "APPROVED",
          comments: "Clearance granted by Directorate of Student Affairs (DSA).",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to approve proposal.");
      }

      // Remove from pending
      setPendingProposals((prev) => prev.filter((p) => p.id !== proposal.id));

      // Append to audit log
      const newAuditItem: AuditLogItem = {
        id: data.auditRecord?.id || `audit-${Date.now()}`,
        eventTitle: proposal.title,
        reviewer: "Dr. K. S. Arunkumar (Dean Student Affairs)",
        action: "APPROVED",
        date: "Just now",
        comments: "Clearance granted by Directorate of Student Affairs (DSA).",
      };
      setAuditLogs((prev) => [newAuditItem, ...prev]);

      setNotification({
        type: "success",
        title: "Proposal Approved",
        message: `"${proposal.title}" has been approved. Venue clearance issued and immutable audit record appended.`,
      });

      router.refresh();
    } catch (err: any) {
      console.error("Approval error:", err);
      setNotification({
        type: "error",
        title: "Approval Failed",
        message: err.message || "Could not process approval.",
      });
    } finally {
      setApprovingId(null);
    }
  };

  // Open Rejection Modal
  const handleOpenRejectModal = (proposal: PendingProposal) => {
    setRejectingProposal(proposal);
    setRejectReason("");
    setRejectError(null);
  };

  // Close Rejection Modal
  const handleCloseRejectModal = () => {
    setRejectingProposal(null);
    setRejectReason("");
    setRejectError(null);
  };

  // Confirm Rejection Handler
  const handleConfirmReject = async () => {
    if (!rejectingProposal) return;
    if (!rejectReason.trim()) {
      setRejectError("An explicit audit reason is strictly required by DSA policy.");
      return;
    }

    setIsRejecting(true);
    setRejectError(null);

    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: rejectingProposal.id,
          action: "REJECTED",
          comments: rejectReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reject proposal.");
      }

      const rejectedTitle = rejectingProposal.title;

      // Remove from pending
      setPendingProposals((prev) => prev.filter((p) => p.id !== rejectingProposal.id));

      // Append to audit log
      const newAuditItem: AuditLogItem = {
        id: data.auditRecord?.id || `audit-${Date.now()}`,
        eventTitle: rejectedTitle,
        reviewer: "Dr. K. S. Arunkumar (Dean Student Affairs)",
        action: "REJECTED",
        date: "Just now",
        comments: rejectReason.trim(),
      };
      setAuditLogs((prev) => [newAuditItem, ...prev]);

      handleCloseRejectModal();

      setNotification({
        type: "success",
        title: "Proposal Rejected with Audit Reason",
        message: `"${rejectedTitle}" rejected. Reason recorded in immutable audit log.`,
      });

      router.refresh();
    } catch (err: any) {
      console.error("Rejection error:", err);
      setRejectError(err.message || "Failed to record rejection.");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Event Discovery
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Administrative Approval Desk
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase transition-colors ${
                pendingProposals.length > 0
                  ? "bg-amber-400/20 border border-amber-400/40 text-amber-300"
                  : "bg-emerald-400/20 border border-emerald-400/40 text-emerald-300"
              }`}
            >
              {pendingProposals.length}{" "}
              {pendingProposals.length === 1 ? "Proposal" : "Proposals"} Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Directorate of Student Affairs (DSA) • Campus Venue & Safety Clearance
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
          <span>Immutable Audit Logging Active</span>
        </div>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-xs animate-in zoom-in-95 ${
            notification.type === "success"
              ? "bg-emerald-950/70 border-emerald-500/30 text-emerald-200"
              : "bg-rose-950/70 border-rose-500/30 text-rose-200"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block text-white text-xs">{notification.title}</span>
              <span className="opacity-90">{notification.message}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Pending Approvals Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Proposals Awaiting Decision</span>
          <span className="text-xs text-slate-400 font-normal">
            (Rejections strictly require an audit reason)
          </span>
        </h2>

        {pendingProposals.length === 0 ? (
          <div className="bg-[#12161f] rounded-2xl border border-white/10 p-10 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">All Event Proposals Reviewed</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No pending event proposals awaiting administrative decision. New submissions from student clubs will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProposals.map((item) => {
              const isApproving = approvingId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-[#12161f] rounded-2xl border border-white/10 p-6 shadow-xl space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wide">
                          {item.club}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{item.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Approve Button */}
                      <button
                        type="button"
                        onClick={() => handleApprove(item)}
                        disabled={isApproving}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {isApproving ? (
                          <>
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </>
                        )}
                      </button>

                      {/* Reject Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenRejectModal(item)}
                        disabled={isApproving}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject with Reason</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>{item.requestedDates}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>{item.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-300">Capacity:</span>
                      <span>{item.capacity} attendees</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Immutable Audit Trail Section */}
      <div className="bg-[#12161f] rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <History className="h-4 w-4 text-indigo-400" />
          <h2>Recent Approval Audit History</h2>
        </div>

        <div className="divide-y divide-white/10">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{log.eventTitle}</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                    log.action === "APPROVED"
                      ? "text-emerald-300 bg-emerald-500/20 border border-emerald-500/30"
                      : "text-rose-300 bg-rose-500/20 border border-rose-500/30"
                  }`}
                >
                  {log.action}
                </span>
              </div>
              <p className="text-xs text-slate-300 italic">“{log.comments}”</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Decision by {log.reviewer}</span>
                <span>{log.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* REJECT WITH REASON AUDIT MODAL DIALOG                     */}
      {/* ========================================================= */}
      {rejectingProposal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#151922] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-rose-400" />
                  <span>Reject Event Proposal</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Rejections strictly require an audit rationale under DSA Governance.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseRejectModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Event Info */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Target Proposal
              </span>
              <span className="font-bold text-white block mt-0.5">
                {rejectingProposal.title}
              </span>
              <span className="text-slate-400 block mt-0.5">
                {rejectingProposal.club} • {rejectingProposal.venue}
              </span>
            </div>

            {/* Rejection Reason Form */}
            <div className="space-y-3">
              <label className="text-[11px] uppercase font-bold tracking-wider text-rose-300 block">
                Audit Reason for Rejection *
              </label>

              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectError) setRejectError(null);
                }}
                placeholder="State specific policy violations, venue clashes, or safety prerequisites that must be rectified..."
                className="w-full bg-[#1b202c] border border-white/15 focus:border-rose-400 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
              />

              {rejectError && (
                <div className="text-[11px] text-rose-400 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{rejectError}</span>
                </div>
              )}

              {/* Quick Policy Presets */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">
                  Quick Standard DSA Policy Reasons:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REJECTION_REASONS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setRejectReason(preset);
                        if (rejectError) setRejectError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 text-left transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleCloseRejectModal}
                disabled={isRejecting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRejecting ? (
                  <>
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Recording Rejection...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Confirm Rejection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
