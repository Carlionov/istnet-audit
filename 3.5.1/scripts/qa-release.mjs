import { spawnSync } from "node:child_process";
import process from "node:process";

const steps = [
  ["Static project QA", "qa:static"],
  ["ESLint", "lint"],
  ["TypeScript semantic check", "typecheck"],
  ["Next.js production build", "build"],
];

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

console.log("MISTNET release gate");
console.log(`Node.js ${process.version}`);
console.log("Run order: static QA → ESLint → TypeScript → production build\n");

for (const [label, script] of steps) {
  console.log(`\n=== ${label} (npm run ${script}) ===`);
  const result = spawnSync(npmCommand, ["run", script], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });

  if (result.error) {
    console.error(`Could not start npm run ${script}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.signal) {
    console.error(`npm run ${script} was stopped by ${result.signal}.`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`\nRelease gate stopped: '${script}' failed with exit code ${result.status ?? 1}.`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nRELEASE GATE: PASS — static QA, lint, typecheck and production build succeeded.");
