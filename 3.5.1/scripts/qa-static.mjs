import { createHash } from "node:crypto";
import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const results = [];

function check(name, condition, detail = "") {
  results.push({ name, ok: Boolean(condition), detail });
}

async function fileExists(relativePath) {
  try {
    await access(path.join(root, relativePath), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const requiredFiles = [
  "package.json",
  "package-lock.json",
  "scripts/qa-release.mjs",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "src/app/api/status/route.ts",
  "src/app/globals.css",
  "src/app/mistnet-v2.css",
  "src/styles/tokens.css",
  "src/components/MobileMenuA11y.tsx",
  "public/mistnet-runtime.js",
  "public/favicon.svg",
  "public/mascot.webp",
  "public/og-image.jpg",
];

const missingFiles = (await Promise.all(requiredFiles.map(async (file) =>
  (await fileExists(file)) ? null : file,
))).filter(Boolean);
check("Required project files and public assets", missingFiles.length === 0, missingFiles.join(", "));

const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const lock = JSON.parse(await readFile(path.join(root, "package-lock.json"), "utf8"));
const lockRoot = lock.packages?.[""];
const lockDepsMatch = lockRoot
  && JSON.stringify(lockRoot.dependencies ?? {}) === JSON.stringify(packageJson.dependencies ?? {})
  && JSON.stringify(lockRoot.devDependencies ?? {}) === JSON.stringify(packageJson.devDependencies ?? {});
check("package.json and package-lock root dependencies agree", Boolean(lockDepsMatch));
check("Static QA command is registered", packageJson.scripts?.["qa:static"] === "node scripts/qa-static.mjs");
check("Release QA command is registered", packageJson.scripts?.["qa:release"] === "node scripts/qa-release.mjs");

const lockPackages = Object.entries(lock.packages ?? {}).filter(([name]) => name !== "");
const incompleteLockPackages = lockPackages
  .filter(([, entry]) => !entry.link && !entry.inBundle && (!entry.resolved || !entry.integrity))
  .map(([name]) => name);
check(
  "Lockfile package entries contain resolved URLs and integrity hashes",
  lockPackages.length > 0 && incompleteLockPackages.length === 0,
  incompleteLockPackages.slice(0, 10).join(", "),
);

const gitignore = await readFile(path.join(root, ".gitignore"), "utf8");
const ignoreEnvIndex = gitignore.split(/\r?\n/).indexOf(".env*");
const allowEnvExampleIndex = gitignore.split(/\r?\n/).indexOf("!.env.example");
check(
  "Safe .env.example is whitelisted after the .env* ignore rule",
  ignoreEnvIndex >= 0 && allowEnvExampleIndex > ignoreEnvIndex,
);
const envExample = await readFile(path.join(root, ".env.example"), "utf8");
const envExampleHasSecret = /^MISTNET_STATUS_(?:ENDPOINT|TOKEN)=.+$/m.test(envExample);
check(".env.example contains no configured credentials or endpoints", !envExampleHasSecret);

const runtime = await readFile(path.join(root, "public/mistnet-runtime.js"));
const runtimeHash = createHash("sha256").update(runtime).digest("hex");
const expectedRuntimeHash = "29f9d7a2d38a1556daa01af9b1c3fafaddbdb54c992f241d704def9842ffbe90";
check("runtime.js preserved byte-for-byte", runtimeHash === expectedRuntimeHash, runtimeHash);

const sourceFiles = [];
async function walk(directory) {
  const { readdir } = await import("node:fs/promises");
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) await walk(relative);
    else if (/\.(?:tsx?|jsx?)$/.test(entry.name)) sourceFiles.push(relative);
  }
}
await walk("src");
const sourceText = (await Promise.all(sourceFiles.map((file) => readFile(path.join(root, file), "utf8")))).join("\n");
const literalIds = [...sourceText.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const idCounts = new Map();
for (const id of literalIds) idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
const duplicateIds = [...idCounts].filter(([, count]) => count > 1).map(([id]) => id);
check("No duplicate literal DOM IDs", duplicateIds.length === 0, duplicateIds.join(", "));

const literalAnchorRefs = [...sourceText.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
const missingAnchors = [...new Set(literalAnchorRefs.filter((id) => !idCounts.has(id)))];
check("Internal hash links resolve to declared IDs", missingAnchors.length === 0, missingAnchors.join(", "));

const staticControls = [...sourceText.matchAll(/aria-controls="([^"]+)"/g)].map((match) => match[1]);
const missingControls = [...new Set(staticControls.filter((id) => !idCounts.has(id)))];
check("Literal aria-controls references resolve", missingControls.length === 0, missingControls.join(", "));

const blankTargetIssues = [];
for (const file of sourceFiles) {
  const content = await readFile(path.join(root, file), "utf8");
  for (const match of content.matchAll(/<a\b[\s\S]*?>/g)) {
    if (/target="_blank"/.test(match[0]) && !/rel="[^"]*noopener[^"]*"/.test(match[0])) {
      blankTargetIssues.push(file);
    }
  }
}
check("External target=_blank links declare rel=noopener", blankTargetIssues.length === 0, [...new Set(blankTargetIssues)].join(", "));

const robots = await readFile(path.join(root, "src/app/robots.ts"), "utf8");
const sitemap = await readFile(path.join(root, "src/app/sitemap.ts"), "utf8");
check("robots.ts sitemap URL has no duplicate slash", robots.includes('sitemap: `${siteUrl}/sitemap.xml`') && !robots.includes("//sitemap.xml"));
check("sitemap.ts publishes the canonical root URL", sitemap.includes('url: `${siteUrl}/`'));

const cssFiles = ["src/styles/tokens.css", "src/app/globals.css", "src/app/mistnet-v2.css"];
const cssText = (await Promise.all(cssFiles.map((file) => readFile(path.join(root, file), "utf8")))).join("\n");
const v2Css = await readFile(path.join(root, "src/app/mistnet-v2.css"), "utf8");
check("Refinement CSS contains no !important", !v2Css.includes("!important"));
check("Refinement CSS has no local :root declaration", !/(^|[},])\s*:root\s*\{/m.test(v2Css));
check("Refinement CSS contains no negative margins", !/margin(?:-[a-z-]+)?\s*:\s*-[\d.]+(?:px|rem|em|%)\b/i.test(v2Css));
const mediaQueries = [...v2Css.matchAll(/@media\s*\(([^)]*)\)/g)].map((match) => match[1].trim());
const invalidMediaQueries = mediaQueries.filter((query) => !/^min-width\s*:/.test(query) && !/^(?:hover|pointer)\s*:/.test(query) && !/^prefers-reduced-motion\s*:/.test(query));
check("Refinement CSS breakpoints are mobile-first", invalidMediaQueries.length === 0, invalidMediaQueries.join("; "));

const declaredVars = new Set([...cssText.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((match) => match[1]));
const referencedVars = new Set([...cssText.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((match) => match[1]));
const runtimeVars = new Set(["--bx", "--by", "--dx", "--dy", "--i"]);
const fontVars = new Set(["--font-manrope", "--font-jetbrains-mono"]);
const undefinedVars = [...referencedVars].filter((name) => !declaredVars.has(name) && !runtimeVars.has(name) && !fontVars.has(name));
check("CSS variable references resolve", undefinedVars.length === 0, undefinedVars.join(", "));

const notFoundSource = await readFile(path.join(root, "src/app/not-found.tsx"), "utf8");
const homepageSource = sourceText.replace(notFoundSource, "");
const homepageH1Count = [...homepageSource.matchAll(/<h1\b/g)].length;
const notFoundH1Count = [...notFoundSource.matchAll(/<h1\b/g)].length;
check("Homepage has exactly one H1", homepageH1Count === 1, `count=${homepageH1Count}`);
check("404 route has its own H1", notFoundH1Count === 1, `count=${notFoundH1Count}`);
const layout = await readFile(path.join(root, "src/app/layout.tsx"), "utf8");
check("Document language is explicitly Russian", /<html\s+lang="ru"/.test(layout));
check("Open Graph preview asset exists", await fileExists("public/og-image.jpg"));

const runtimeSyntax = spawnSync(process.execPath, ["--check", "public/mistnet-runtime.js"], { cwd: root, encoding: "utf8" });
check("runtime.js passes Node syntax check", runtimeSyntax.status === 0, runtimeSyntax.stderr.trim());
const releaseScriptSyntax = spawnSync(process.execPath, ["--check", "scripts/qa-release.mjs"], { cwd: root, encoding: "utf8" });
check("qa-release.mjs passes Node syntax check", releaseScriptSyntax.status === 0, releaseScriptSyntax.stderr.trim());

for (const [index, result] of results.entries()) {
  const status = result.ok ? "PASS" : "FAIL";
  console.log(`${status} ${String(index + 1).padStart(2, "0")}. ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
}
const passed = results.filter((result) => result.ok).length;
const failed = results.length - passed;
console.log(`\nStatic QA: ${passed}/${results.length} passed; ${failed} failed.`);
process.exitCode = failed === 0 ? 0 : 1;
