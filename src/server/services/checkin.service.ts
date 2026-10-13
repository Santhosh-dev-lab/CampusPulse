import { prisma } from "@/lib/db";
import { DuplicateCheckInError, InvalidTicketError, AppError } from "@/lib/errors/app-error";
import { hashTicketToken } from "@/lib/security/tokens";
import { RegistrationStatus } from "@prisma/client";

export interface CheckInInput {
  ticketToken: string;
  staffUserId: string;
  checkInMethod?: "QR_SCAN" | "MANUAL";
  notes?: string;
}

export interface CheckInResult {
  status: "SUCCESS" | "ALREADY_CHECKED_IN";
  attendeeName: string | null;
  studentId: string | null;
  eventTitle: string;
  checkedInAt: Date;
}

/**
 * Validates a QR ticket token and performs attendee check-in.
 * Guaranteed idempotent and atomic via database transactions.
 */
export async function performCheckIn(input: CheckInInput): Promise<CheckInResult> {
  const { ticketToken, staffUserId, checkInMethod = "QR_SCAN", notes } = input;

  const tokenHash = hashTicketToken(ticketToken);

  return await prisma.$transaction(async (tx) => {
    // 1. Find registration by tokenHash
    const registration = await tx.registration.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            name: true,
            studentId: true,
            email: true,
          },
        },
        event: {
          select: {
            title: true,
            status: true,
          },
        },
        checkIn: true,
      },
    });

    if (!registration) {
      throw new InvalidTicketError("Ticket not found or token is invalid.");
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new AppError("This registration has been cancelled.", 400, "INVALID_TICKET");
    }

    // 2. Idempotent check: if already checked in, return existing record details or error
    if (registration.checkIn) {
      throw new DuplicateCheckInError(
        `Attendee "${registration.user.name ?? "Student"}" was already checked in at ${registration.checkIn.checkedInAt.toISOString()}.`
      );
    }

    // 3. Create CheckIn record
    const checkIn = await tx.checkIn.create({
      data: {
        registrationId: registration.id,
        checkedInById: staffUserId,
        checkInMethod,
        notes,
      },
    });

    // 4. Update registration status to ATTENDED
    await tx.registration.update({
      where: { id: registration.id },
      data: {
        status: RegistrationStatus.ATTENDED,
      },
    });

    return {
      status: "SUCCESS",
      attendeeName: registration.user.name,
      studentId: registration.user.studentId,
      eventTitle: registration.event.title,
      checkedInAt: checkIn.checkedInAt,
    };
  });
}
