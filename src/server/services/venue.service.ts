import { prisma } from "@/lib/db";
import { NotFoundError, VenueConflictError } from "@/lib/errors/app-error";
import { EventStatus } from "@prisma/client";

export interface CheckVenueAvailabilityInput {
  venueId: string;
  startTime: Date;
  endTime: Date;
  excludeEventId?: string;
}

/**
 * Validates whether two time intervals overlap.
 * Standard interval formula: StartA < EndB AND EndA > StartB
 */
export function doIntervalsOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

export interface VenueConflictDetail {
  conflictingEventId: string;
  conflictingEventTitle: string;
  startTime: Date;
  endTime: Date;
  status: string;
  venueName?: string;
  organizerClubName?: string | null;
}

export interface VenueAvailabilityResult {
  available: boolean;
  conflict?: VenueConflictDetail;
  message: string;
}

/**
 * Checks if a venue is available for the given time slot.
 * Returns detailed conflict information (title, schedule, club) when an overlap exists.
 */
export async function checkVenueAvailability(
  input: CheckVenueAvailabilityInput
): Promise<VenueAvailabilityResult> {
  const { venueId, startTime, endTime, excludeEventId } = input;

  if (startTime >= endTime) {
    return {
      available: false,
      message: "Event start time must precede end time.",
    };
  }

  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: {
      id: true,
      name: true,
      building: true,
      campus: { select: { name: true, code: true } },
    },
  });

  if (!venue) {
    throw new NotFoundError("Venue");
  }

  const conflictingEvent = await prisma.event.findFirst({
    where: {
      venueId,
      id: excludeEventId ? { not: excludeEventId } : undefined,
      status: {
        in: [
          EventStatus.DRAFT,
          EventStatus.PENDING_APPROVAL,
          EventStatus.APPROVED,
          EventStatus.PUBLISHED,
        ],
      },
      // Interval overlap in SQL: startTime < reqEnd AND endTime > reqStart
      startTime: {
        lt: endTime,
      },
      endTime: {
        gt: startTime,
      },
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
      organizerClub: {
        select: {
          name: true,
        },
      },
    },
  });

  if (conflictingEvent) {
    const club = conflictingEvent.organizerClub?.name
      ? ` by ${conflictingEvent.organizerClub.name}`
      : "";
    return {
      available: false,
      conflict: {
        conflictingEventId: conflictingEvent.id,
        conflictingEventTitle: conflictingEvent.title,
        startTime: conflictingEvent.startTime,
        endTime: conflictingEvent.endTime,
        status: conflictingEvent.status,
        venueName: venue.name,
        organizerClubName: conflictingEvent.organizerClub?.name ?? null,
      },
      message: `Conflict detected: "${conflictingEvent.title}"${club} is already scheduled at ${venue.name} from ${conflictingEvent.startTime.toISOString()} to ${conflictingEvent.endTime.toISOString()}.`,
    };
  }

  return {
    available: true,
    message: `Venue "${venue.name}" is completely free and available for booking during this time slot.`,
  };
}

/**
 * Books a venue atomically inside a transaction with interval validation.
 */
export async function bookVenueForEvent(
  eventId: string,
  venueId: string,
  startTime: Date,
  endTime: Date
): Promise<void> {
  if (startTime >= endTime) {
    throw new Error("Event start time must precede end time.");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Verify venue existence
    const venue = await tx.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      throw new NotFoundError("Venue");
    }

    // 2. Check for conflicting bookings in active states
    const conflict = await tx.event.findFirst({
      where: {
        venueId,
        id: { not: eventId },
        status: {
          in: [EventStatus.PENDING_APPROVAL, EventStatus.APPROVED, EventStatus.PUBLISHED],
        },
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: startTime,
        },
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
      },
    });

    if (conflict) {
      throw new VenueConflictError(
        `Venue "${venue.name}" is already booked by "${conflict.title}" during this time window.`
      );
    }

    // 3. Assign venue to event
    await tx.event.update({
      where: { id: eventId },
      data: {
        venueId,
        startTime,
        endTime,
      },
    });
  });
}
