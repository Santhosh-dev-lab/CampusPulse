import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth-context";
import { ApprovalAction, UserRole } from "@prisma/client";
import { processEventApproval } from "@/server/services/approval.service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);
    const body = await request.json();
    const { action, comments } = body;

    if (!action || !["APPROVED", "REJECTED", "REVISION_REQUESTED"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Valid action is required (APPROVED, REJECTED, REVISION_REQUESTED)" },
        { status: 400 }
      );
    }

    if (action === "REJECTED" && (!comments || comments.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: "Comments are required when rejecting an event." },
        { status: 422 }
      );
    }

    // Resolve reviewer
    let reviewer = user;
    if (reviewer.role !== UserRole.ADMIN) {
      const admin = await prisma.user.findFirst({
        where: { role: UserRole.ADMIN },
      });
      if (admin) reviewer = admin;
    }

    const result = await processEventApproval({
      eventId: id,
      reviewerId: reviewer.id,
      action: action as ApprovalAction,
      comments: comments?.trim() || (action === "APPROVED" ? "Clearance granted by Directorate of Student Affairs (DSA)." : ""),
    });

    try {
      revalidatePath("/approvals");
      revalidatePath("/");
      revalidatePath("/events");
      revalidatePath(`/events/${id}`);
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Event proposal ${action.toLowerCase()} successfully.`,
      event: result.event,
      auditRecord: result.auditRecord,
    });
  } catch (error: any) {
    console.error("Decision error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process approval decision." },
      { status: 500 }
    );
  }
}
