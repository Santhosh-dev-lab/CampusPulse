import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const checks: Record<string, "ok" | "degraded" | "failed"> = {
    database: "failed",
  };

  try {
    // Ping database with a lightweight scalar query
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch (error) {
    checks.database = "failed";
    console.error(
      "Readiness check: Database connection failed.",
      error instanceof Error ? error.message : ""
    );
  }

  const isReady = checks.database === "ok";

  return NextResponse.json(
    {
      status: isReady ? "ready" : "not_ready",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: isReady ? 200 : 503 }
  );
}
