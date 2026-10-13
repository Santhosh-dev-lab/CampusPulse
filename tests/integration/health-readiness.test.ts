import { describe, it, expect } from "vitest";
import { GET as getHealth } from "@/app/api/health/route";
import { GET as getReadiness } from "@/app/api/readiness/route";

describe("Health & Readiness Endpoints", () => {
  it("GET /api/health returns healthy liveness status with 200 OK", async () => {
    const response = await getHealth();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("healthy");
    expect(body.service).toBe("campuspulse-api");
    expect(body.version).toBe("0.1.0");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("uptime");
  });

  it("GET /api/readiness reports readiness status without exposing internal credentials", async () => {
    const response = await getReadiness();
    // In local dev with running DB it returns 200 ready, in disconnected it returns 503
    expect([200, 503]).toContain(response.status);

    const body = await response.json();
    expect(body).toHaveProperty("checks");
    expect(body.checks).toHaveProperty("database");
    // Verify no secret leakage
    const stringified = JSON.stringify(body);
    expect(stringified).not.toContain("password");
    expect(stringified).not.toContain("Santhu");
    expect(stringified).not.toContain("postgresql://");
  });
});
