import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendOtpEmail } from "@/server/services/email.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Please enter your SRM institutional email address." },
        { status: 400 }
      );
    }

    // Auto-append @srmist.edu.in if student only entered netID (e.g. "sk1234")
    if (!email.includes("@")) {
      email = `${email}@srmist.edu.in`;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address format." },
        { status: 400 }
      );
    }

    // Find if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Delete any existing tokens for this email to prevent multiple valid codes
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Generate secure 6-digit numeric code
    const code = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save token to database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: code,
        expires,
      },
    });

    // Send email
    const emailResult = await sendOtpEmail({
      email,
      code,
      recipientName: existingUser?.name || "Student",
    });

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}`,
      email,
      expiresInSeconds: 600,
    });
  } catch (error: any) {
    console.error("Failed to generate and send OTP:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send verification code." },
      { status: 500 }
    );
  }
}
