import { PrismaClient } from "@prisma/client";

async function main() {
  console.log("🔍 Running CampusPulse Environment & Dependency Checks...\n");

  // 1. Check Node version
  const nodeVersion = process.version;
  console.log(`✅ Node.js Version: ${nodeVersion}`);

  // 2. Check Database URL presence
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is not set. Please configure .env or .env.local.");
    process.exit(1);
  }
  console.log(`✅ DATABASE_URL is configured.`);

  // 3. Test Database Connection
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log("✅ Successfully connected to PostgreSQL instance.");

    const campusCount = await prisma.campus.count();
    const eventCount = await prisma.event.count();
    console.log(`📊 Found ${campusCount} campus(es) and ${eventCount} event(s) in database.`);
  } catch (err: unknown) {
    console.error("❌ Failed to connect to database:", err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n🎉 Environment is healthy and ready for development!");
}

main();
