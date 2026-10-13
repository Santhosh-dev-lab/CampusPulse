import { execSync } from "child_process";

function run(command: string, name: string) {
  process.stdout.write(`⏳ Checking: ${name}... `);
  try {
    execSync(command, { stdio: "pipe" });
    console.log("✅ Passed");
    return true;
  } catch (error: any) {
    console.log("❌ Failed");
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.log(error.stderr.toString());
    return false;
  }
}

console.log("==================================================");
console.log(" CampusPulse Foundation Verification Suite");
console.log("==================================================\n");

let allPassed = true;

allPassed = run("npx tsc --noEmit", "TypeScript Compilation (strict mode)") && allPassed;
allPassed = run("npx vitest run", "Unit and Integration Tests") && allPassed;
allPassed = run("npx prettier --check .", "Code Formatting (Prettier)") && allPassed;

console.log("\n==================================================");
if (allPassed) {
  console.log("🎉 ALL VERIFICATION CHECKS PASSED!");
  process.exit(0);
} else {
  console.log("⚠️ Some verification checks failed. Review output above.");
  process.exit(1);
}
