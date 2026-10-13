import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { ApprovalAction, UserRole } from "@prisma/client";
import { processEventApproval } from "@/server/services/approval.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pendingEvents = await prisma.event.findMany({
      where: {
        status: "PENDING_APPROVAL",
      },
      include: {
        venue: true,
        campus: true,
        organizerClub: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const auditRecords = await prisma.approvalRecord.findMany({
      include: {
        event: true,
        reviewer: true,
      },
      orderBy: {
        reviewedAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      pendingEvents,
      auditRecords,
    });
  } catch (error: any) {
    console.error("Error fetching approvals data:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch approvals data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, action, comments } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "eventId is required" },
        { status: 400 }
      );
    }

    if (!action || !["APPROVED", "REJECTED", "REVISION_REQUESTED"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Valid action is required (APPROVED, REJECTED, REVISION_REQUESTED)" },
        { status: 400 }
      );
    }

    if (action === "REJECTED" && (!comments || comments.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: "A clear reason is strictly required when rejecting an event proposal." },
        { status: 422 }
      );
    }

    // Resolve Reviewer (DSA Admin)
    let reviewer = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });
    if (!reviewer) {
      reviewer = await prisma.user.findFirst();
    }
    if (!reviewer) {
      reviewer = await prisma.user.create({
        data: {
          email: "dsa.approvals@srmist.edu.in",
          name: "Dr. K. S. Arunkumar (Dean Student Affairs)",
          role: UserRole.ADMIN,
        },
      });
    }

    // Call service to process decision & append to immutable audit log
    const result = await processEventApproval({
      eventId,
      reviewerId: reviewer.id,
      action: action as ApprovalAction,
      comments: comments?.trim() || (action === "APPROVED" ? "Clearance granted by Directorate of Student Affairs (DSA)." : ""),
    });

    // Invalidate cached pages
    try {
      revalidatePath("/approvals");
      revalidatePath("/");
      revalidatePath("/events");
      revalidatePath(`/events/${eventId}`);
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    return NextResponse.json({
      success: true,
      event: result.event,
      auditRecord: result.auditRecord,
      message: action === "APPROVED" ? "Event proposal approved and clearance granted." : "Event proposal rejected with audit reason.",
    });
  } catch (error: any) {
    console.error("Error processing approval:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process decision" },
      { status: 500 }
    );
  }
}
