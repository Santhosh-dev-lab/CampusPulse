import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth-context";
import { registerForEvent } from "@/server/services/registration.service";
import { AppError } from "@/lib/errors/app-error";
import { RegistrationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function resolveEvent(id: string) {
  let event = await prisma.event.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    select: { id: true, title: true, capacity: true, registeredCount: true, status: true },
  });

  if (!event) {
    const cleanId = id.replace(/^(evt-|cp-)/i, "");
    event = await prisma.event.findFirst({
      where: {
        OR: [
          { slug: { contains: cleanId, mode: "insensitive" } },
          { title: { contains: cleanId.replace(/-/g, " "), mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, capacity: true, registeredCount: true, status: true },
    });
  }

  return event;
}

/**
 * POST /api/events/[id]/register
 * Registers the active student for an event within a safe transaction.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);

    const event = await resolveEvent(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const result = await registerForEvent({
      eventId: event.id,
      userId: user.id,
    });

    try {
      revalidatePath(`/events/${id}`);
      revalidatePath(`/events/${event.id}`);
      revalidatePath("/my-tickets");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Successfully registered for "${event.title}"!`,
      registrationId: result.registrationId,
      ticketToken: result.ticketToken,
      eventTitle: result.eventTitle,
      registeredAt: result.registeredAt,
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorCode: error.code,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error during registration",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]/register
 * Cancels the active user's registration and frees up event capacity.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);

    const event = await resolveEvent(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const existingReg = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id,
        },
      },
    });

    if (!existingReg) {
      return NextResponse.json(
        { success: false, error: "No active registration found for this event." },
        { status: 404 }
      );
    }

    if (existingReg.status === RegistrationStatus.CANCELLED) {
      return NextResponse.json(
        { success: false, error: "Registration is already cancelled." },
        { status: 400 }
      );
    }

    // Atomic cancellation and decrement
    await prisma.$transaction(async (tx) => {
      await tx.registration.update({
        where: { id: existingReg.id },
        data: {
          status: RegistrationStatus.CANCELLED,
        },
      });

      await tx.event.update({
        where: { id: event.id },
        data: {
          registeredCount: {
            decrement: 1,
          },
        },
      });
    });

    try {
      revalidatePath(`/events/${id}`);
      revalidatePath(`/events/${event.id}`);
      revalidatePath("/my-tickets");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Registration for "${event.title}" has been cancelled.`,
    });
  } catch (error: any) {
    console.error("Cancellation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to cancel registration." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/events/[id]/register
 * Returns registration status for the current user.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);

    const event = await resolveEvent(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const registration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id,
        },
      },
      include: {
        checkIn: true,
      },
    });

    return NextResponse.json({
      success: true,
      isRegistered: Boolean(registration && registration.status !== RegistrationStatus.CANCELLED),
      registration: registration
        ? {
            id: registration.id,
            status: registration.status,
            ticketToken: registration.ticketToken,
            registeredAt: registration.registeredAt,
            checkedIn: Boolean(registration.checkIn),
            checkedInAt: registration.checkIn?.checkedInAt ?? null,
          }
        : null,
      spotsLeft: Math.max(0, event.capacity - event.registeredCount),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to query registration status" },
      { status: 500 }
    );
  }
}
