import { prisma } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { ApprovalAction, EventStatus } from "@prisma/client";

export interface EventApprovalDecisionInput {
  eventId: string;
  reviewerId: string;
  action: ApprovalAction;
  comments?: string;
}

/**
 * Handles event approval or rejection with immutable audit trail creation.
 */
export async function processEventApproval(input: EventApprovalDecisionInput) {
  const { eventId, reviewerId, action, comments } = input;

  if (action === ApprovalAction.REJECTED && (!comments || comments.trim().length === 0)) {
    throw new ValidationError("A clear reason is required when rejecting an event proposal.");
  }

  return await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError("Event");
    }

    const previousStatus = event.status;
    let nextStatus: EventStatus;

    if (action === ApprovalAction.APPROVED) {
      nextStatus = EventStatus.APPROVED;
    } else if (action === ApprovalAction.REJECTED) {
      nextStatus = EventStatus.REJECTED;
    } else if (action === ApprovalAction.REVISION_REQUESTED) {
      nextStatus = EventStatus.DRAFT;
    } else {
      nextStatus = EventStatus.PENDING_APPROVAL;
    }

    // 1. Update event status
    const updatedEvent = await tx.event.update({
      where: { id: eventId },
      data: {
        status: nextStatus,
        approvalReason: comments,
      },
    });

    // 2. Append to immutable audit log
    const auditRecord = await tx.approvalRecord.create({
      data: {
        eventId,
        reviewerId,
        action,
        comments,
        previousStatus,
        nextStatus,
      },
    });

    return {
      event: updatedEvent,
      auditRecord,
    };
  });
}
