import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: "campuspulse-api",
      version: "0.1.0",
    },
    { status: 200 }
  );
}
