import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            venue: true,
            campus: true,
            organizerClub: true,
          },
        },
        user: true,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration / Ticket not found" },
        { status: 404 }
      );
    }

    const event = registration.event;
    const user = registration.user;
    const venue = event.venue;
    const campus = event.campus;

    const eventDateStr = new Date(event.startTime).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const eventTimeStr = new Date(event.startTime).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Standard Google Wallet Generic Pass Object specification
    const googleWalletPass = {
      iss: "campuspulse-srmist-dsa@srmist.edu.in",
      aud: "google",
      typ: "savetoandroidpay",
      iat: Math.floor(Date.now() / 1000),
      payload: {
        genericObjects: [
          {
            id: `3388000000022345678.campuspulse_${registration.id}`,
            classId: "3388000000022345678.campuspulse_srm_event_ticket",
            logo: {
              sourceUri: {
                uri: "https://campuspulse.srmist.edu.in/srm-logo.png",
              },
              contentDescription: {
                defaultValue: {
                  language: "en-US",
                  value: "SRM University CampusPulse Logo",
                },
              },
            },
            cardTitle: {
              defaultValue: {
                language: "en-US",
                value: "CAMPUSPULSE SRM • OFFICIAL EVENT PASS",
              },
            },
            subheader: {
              defaultValue: {
                language: "en-US",
                value: "STUDENT ATTENDEE",
              },
            },
            header: {
              defaultValue: {
                language: "en-US",
                value: user.name || "SRM Student",
              },
            },
            barcode: {
              type: "QR_CODE",
              value: registration.ticketToken,
              alternateText: registration.ticketToken,
            },
            hexBackgroundColor: "#0a0e17",
            notifications: {
              expiryNotification: {
                enableNotification: true,
              },
            },
            textModulesData: [
              {
                id: "event_title",
                header: "EVENT TITLE",
                body: event.title,
              },
              {
                id: "venue_location",
                header: "CAMPUS VENUE",
                body: `${venue?.name || "Main Auditorium"} (${venue?.building || campus?.name || "SRM Campus"})`,
              },
              {
                id: "date_time",
                header: "DATE & TIME",
                body: `${eventDateStr} • ${eventTimeStr} IST`,
              },
              {
                id: "student_id",
                header: "REGISTRATION NO",
                body: user.studentId || "RA2411003010001",
              },
              {
                id: "pass_tier",
                header: "PASS TIER",
                body: "OFFICIAL_STUDENT_PASS",
              },
              {
                id: "academic_od",
                header: "OD CREDIT STATUS",
                body: "Academic OD Attendance Verified upon Gate Scan",
              },
            ],
          },
        ],
      },
    };

    // Google Wallet Save URL format
    const dummyJwt = Buffer.from(JSON.stringify(googleWalletPass)).toString("base64url");
    const saveUrl = `https://pay.google.com/gp/v/save/${dummyJwt}`;

    return NextResponse.json({
      success: true,
      pass: googleWalletPass,
      saveUrl,
      ticketToken: registration.ticketToken,
      ticketId: registration.id,
    });
  } catch (error: any) {
    console.error("Failed to generate Google Wallet Pass:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate pass" },
      { status: 500 }
    );
  }
}
