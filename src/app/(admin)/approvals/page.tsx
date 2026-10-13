import React from "react";
import { prisma } from "@/lib/db";
import {
  ApprovalDeskWorkspace,
  PendingProposal,
  AuditLogItem,
} from "@/components/admin/approval-desk-workspace";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Administrative Approval Desk — CampusPulse",
  description: "Directorate of Student Affairs (DSA) event clearance and venue approval workflow.",
};

const FALLBACK_PENDING: PendingProposal[] = [
  {
    id: "evt-pending-1",
    title: "RoboWars Arena 2026: Intracollegiate Combat Tournament",
    category: "Technical",
    club: "Robotics Society SRM",
    venue: "Java Green Open Amphitheatre",
    requestedDates: "Nov 02, 2026 • 10:00 AM – 6:00 PM",
    capacity: 500,
    description:
      "High-voltage combat bot competition featuring 15kg and 30kg bots. Safety barriers and fire marshals requested.",
  },
  {
    id: "evt-pending-2",
    title: "National Student Satellite Design Symposium",
    category: "Technical / Aerospace",
    club: "SRMSAT Student Initiative",
    venue: "Tech Park Mini Auditorium",
    requestedDates: "Nov 08, 2026 • 2:00 PM – 5:30 PM",
    capacity: 300,
    description:
      "Technical paper presentations on CubeSat communications with keynote from ISRO scientists.",
  },
];

const FALLBACK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "audit-1",
    eventTitle: "HackSRM 2026 (36hr Hackathon)",
    reviewer: "Dr. K. S. Arunkumar (Dean Student Affairs)",
    action: "APPROVED",
    date: "Oct 10, 2026 • 4:15 PM",
    comments: "Approved with faculty mentor presence requirement for 36hr hackathon.",
  },
  {
    id: "audit-2",
    eventTitle: "GrooveMania 2026 (Dance Showcase)",
    reviewer: "Dr. K. S. Arunkumar (Dean Student Affairs)",
    action: "APPROVED",
    date: "Oct 11, 2026 • 11:30 AM",
    comments: "Approved for TP Ganesan Main Hall. Strict sound cutoff at 9:00 PM.",
  },
];

export default async function AdminApprovalsPage() {
  let pendingProposals: PendingProposal[] = FALLBACK_PENDING;
  let auditLogs: AuditLogItem[] = FALLBACK_AUDIT_LOGS;

  try {
    // 1. Query pending proposals from database
    const dbPending = await prisma.event.findMany({
      where: {
        status: "PENDING_APPROVAL",
      },
      include: {
        venue: true,
        organizerClub: true,
        campus: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (dbPending && dbPending.length > 0) {
      pendingProposals = dbPending.map((e) => {
        const start = new Date(e.startTime);
        const end = new Date(e.endTime);
        const dateStr = start.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
        const startTimeStr = start.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
        const endTimeStr = end.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        return {
          id: e.id,
          title: e.title,
          category: e.category,
          club: e.organizerClub?.name || "Student Organization",
          venue: e.venue?.name || "Campus Venue",
          requestedDates: `${dateStr} • ${startTimeStr} – ${endTimeStr}`,
          capacity: e.capacity,
          description: e.description,
        };
      });
    }

    // 2. Query recent approval audit records
    const dbAudits = await prisma.approvalRecord.findMany({
      include: {
        event: {
          select: { title: true },
        },
        reviewer: {
          select: { name: true, role: true },
        },
      },
      orderBy: {
        reviewedAt: "desc",
      },
      take: 20,
    });

    if (dbAudits && dbAudits.length > 0) {
      auditLogs = dbAudits.map((a) => {
        const d = new Date(a.reviewedAt);
        const datePart = d.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
        const timePart = d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        return {
          id: a.id,
          eventTitle: a.event?.title || "University Event",
          reviewer: `${a.reviewer?.name || "Dr. K. S. Arunkumar"} (Dean Student Affairs)`,
          action: a.action as "APPROVED" | "REJECTED" | "REVISION_REQUESTED",
          date: `${datePart} • ${timePart}`,
          comments: a.comments || "Clearance decision recorded by DSA.",
        };
      });
    }
  } catch (err) {
    console.warn("Could not query DB approvals, using fallback data:", err);
  }

  return (
    <ApprovalDeskWorkspace
      initialPending={pendingProposals}
      initialAuditLogs={auditLogs}
    />
  );
}
