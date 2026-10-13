import { prisma } from "@/lib/db";
import {
  DuplicateRegistrationError,
  EventFullError,
  NotFoundError,
  AppError,
} from "@/lib/errors/app-error";
import { generateTicketToken } from "@/lib/security/tokens";
import { RegistrationStatus, EventStatus } from "@prisma/client";

export interface RegisterEventInput {
  eventId: string;
  userId: string;
}

export interface RegistrationResult {
  registrationId: string;
  ticketToken: string;
  eventTitle: string;
  registeredAt: Date;
}

/**
 * Executes event registration within a database transaction, enforcing:
 * 1. Event existence and PUBLISHED status.
 * 2. Event capacity constraints.
 * 3. Unique user registration per event (with unique index constraint guarantee).
 * 4. Atomic ticket token generation.
 */
export async function registerForEvent(input: RegisterEventInput): Promise<RegistrationResult> {
  const { eventId, userId } = input;

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch event with latest registeredCount and capacity
    const event = await tx.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        status: true,
        capacity: true,
        registeredCount: true,
      },
    });

    if (!event) {
      throw new NotFoundError("Event");
    }

    if (event.status !== EventStatus.PUBLISHED && event.status !== EventStatus.APPROVED) {
      throw new AppError(
        "Registration is only permitted for published or approved events.",
        400,
        "EVENT_NOT_PUBLISHED"
      );
    }

    // 2. Check capacity
    if (event.registeredCount >= event.capacity) {
      throw new EventFullError();
    }

    // 3. Check for existing active registration
    const existing = await tx.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existing) {
      throw new DuplicateRegistrationError();
    }

    // 4. Generate secure token
    const { token, tokenHash } = generateTicketToken();

    // 5. Create registration record
    const registration = await tx.registration.create({
      data: {
        eventId,
        userId,
        status: RegistrationStatus.CONFIRMED,
        ticketToken: token,
        tokenHash,
      },
    });

    // 6. Increment event registeredCount atomically
    await tx.event.update({
      where: { id: eventId },
      data: {
        registeredCount: {
          increment: 1,
        },
      },
    });

    return {
      registrationId: registration.id,
      ticketToken: token,
      eventTitle: event.title,
      registeredAt: registration.registeredAt,
    };
  });
}
