"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  CheckCircle2,
  Download,
  Share2,
  Copy,
  ExternalLink,
  Loader2,
  Sparkles,
  Smartphone,
} from "lucide-react";

interface GoogleWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    id: string;
    eventTitle: string;
    ticketToken: string;
    venue: string;
    building?: string;
    campus?: string;
    campusCode?: string;
    date: string;
    time: string;
    attendee: string;
    studentId: string;
    seatType: string;
  };
}

export function GoogleWalletModal({
  isOpen,
  onClose,
  ticket,
}: GoogleWalletModalProps) {
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  const handleAddToWallet = () => {
    setAdding(true);
    setTimeout(() => {
      setAdding(false);
      setAdded(true);
    }, 700);
  };

  const handleDownloadPass = () => {
    const passData = {
      iss: "campuspulse-srmist-dsa@srmist.edu.in",
      ticketToken: ticket.ticketToken,
      ticketId: ticket.id,
      event: ticket.eventTitle,
      venue: ticket.venue,
      date: ticket.date,
      time: ticket.time,
      studentName: ticket.attendee,
      studentId: ticket.studentId,
      passTier: ticket.seatType,
      walletClass: "campuspulse_rmp_event_pass",
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(passData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campuspulse-wallet-pass-${ticket.studentId}-${ticket.id.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(ticket.ticketToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0f131c] border border-white/15 p-6 shadow-2xl text-white space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-lg shrink-0">
            {/* Google Wallet Icon Colors */}
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M20 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"
              />
              <path
                fill="#34A853"
                d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H4V7z"
              />
              <path
                fill="#EA4335"
                d="M17 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
              />
              <path
                fill="#FBBC05"
                d="M4 11h9v2H4z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-1.5">
              <span>Google Wallet Pass</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30">
                Official
              </span>
            </h3>
            <p className="text-[11px] text-white/50">Save digital event pass to your Android & Google devices</p>
          </div>
        </div>

        {/* Digital Google Wallet Card Mockup */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1a202c] via-[#0d1117] to-[#161c28] border border-white/15 p-5 shadow-inner space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Card Top Brand */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-lime-400 text-black font-black text-xs flex items-center justify-center">
                CP
              </div>
              <span className="text-xs font-black tracking-wider text-white">CAMPUSPULSE SRM</span>
            </div>
            <span className="text-[10px] font-bold text-lime-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/20">
              {ticket.seatType}
            </span>
          </div>

          {/* Event Title */}
          <div>
            <h4 className="text-sm font-black text-white leading-snug">
              {ticket.eventTitle}
            </h4>
            <p className="text-[11px] text-white/50 mt-0.5">
              {ticket.date} • {ticket.time}
            </p>
          </div>

          {/* Venue & Location */}
          <div className="text-xs text-white/70">
            <span className="text-[10px] uppercase font-bold text-white/40 block">Location</span>
            <span>{ticket.venue} {ticket.building ? `(${ticket.building})` : ""}</span>
          </div>

          {/* Attendee Details & QR Barcode */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div>
                <span className="text-[9px] uppercase font-bold text-white/40 block">Student</span>
                <span className="text-xs font-bold text-white">{ticket.attendee}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-white/40 block">Reg No</span>
                <span className="text-xs font-mono font-bold text-lime-400">{ticket.studentId}</span>
              </div>
            </div>

            <div className="p-2 bg-white rounded-xl shrink-0 shadow-md">
              <QRCodeSVG
                value={ticket.ticketToken}
                size={76}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Token Hash */}
          <div className="text-center pt-1">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block truncate">
              {ticket.ticketToken}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {added ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block">Added to Google Wallet!</span>
                <span className="text-[11px] text-emerald-300/80">
                  Pass synced to your Google Account (ID: GWT-{ticket.ticketToken.slice(4, 12)})
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAddToWallet}
              disabled={adding}
              className="w-full py-3 px-5 rounded-2xl bg-black hover:bg-[#1f242e] border border-white/20 text-white font-bold text-xs shadow-xl flex items-center justify-center gap-3 transition-all active:scale-98 cursor-pointer group"
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M20 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"
                  />
                  <path
                    fill="#34A853"
                    d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H4V7z"
                  />
                  <path
                    fill="#EA4335"
                    d="M17 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M4 11h9v2H4z"
                  />
                </svg>
              )}
              <span>Add to Google Wallet</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleDownloadPass}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-lime-400" />
              <span>Download .json</span>
            </button>

            <button
              onClick={handleCopyToken}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5 text-lime-400" />
              <span>{copied ? "Copied!" : "Copy Token"}</span>
            </button>
          </div>
        </div>

        <p className="text-[10px] text-center text-white/40">
          Present the QR barcode from your Google Wallet app or lock screen when entering campus event gates.
        </p>
      </div>
    </div>
  );
}
