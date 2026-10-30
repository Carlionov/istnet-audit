import { readFile, access, readdir } from "node:fs/promises";
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
  "scripts/qa-static.mjs",
  "scripts/qa-release.mjs",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "src/app/api/status/route.ts",
  "src/app/globals.css",
  "src/app/mistnet-v2.css",
  "src/styles/tokens.css",
  "src/components/Header.tsx",
  "src/components/header/MobileNavigation.tsx",
  "src/components/command/CommandPalette.tsx",
  "src/components/sections/FAQ.tsx",
  "src/components/sections/Terminal.tsx",
  "src/components/runtime/RuntimeUIProvider.tsx",
  "src/components/runtime/ServerStatusProvider.tsx",
  "src/hooks/runtime/useFocusTrap.ts",
  "src/hooks/runtime/useAnimationFrame.ts",
  "src/types/window.d.ts",
  "public/favicon.svg",
  "public/mascot.webp",
  "public/og-image.jpg",
];

const missingFiles = (await Promise.all(requiredFiles.map(async (file) =>
  (await fileExists(file)) ? null : file,
))).filter(Boolean);
check("Required React project files and public assets", missingFiles.length === 0, missingFiles.join(", "));

const removedFiles = [
  "public/mistnet-runtime.js",
  "src/components/MistnetScripts.tsx",
  "src/components/MobileMenuA11y.tsx",
  "src/components/FaqAccessibility.tsx",
  "src/components/Preloader.tsx",
  "src/types/runtime-vendors.d.ts",
  "src/hooks/runtime/useExternalScript.ts",
  "src/hooks/runtime/useGsapContext.ts",
  "src/hooks/runtime/useGsapRuntime.ts",
  "src/hooks/runtime/useThreeRuntime.ts",
  "src/hooks/runtime/useThreeScene.ts",
  "src/hooks/runtime/useResizeObserver.ts",
  "src/hooks/runtime/useClickOutside.ts",
];
const remainingRemovedFiles = (await Promise.all(removedFiles.map(async (file) =>
  (await fileExists(file)) ? file : null,
))).filter(Boolean);
check("Legacy runtime and superseded adapters are deleted", remainingRemovedFiles.length === 0, remainingRemovedFiles.join(", "));

const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const lock = JSON.parse(await readFile(path.join(root, "package-lock.json"), "utf8"));
const lockRoot = lock.packages?.[""];
const lockDepsMatch = lockRoot
  && JSON.stringify(lockRoot.dependencies ?? {}) === JSON.stringify(packageJson.dependencies ?? {})
  && JSON.stringify(lockRoot.devDependencies ?? {}) === JSON.stringify(packageJson.devDependencies ?? {});
check("package.json and package-lock dependencies agree", Boolean(lockDepsMatch));
check("Static QA command is registered", packageJson.scripts?.["qa:static"] === "node scripts/qa-static.mjs");
check("Release QA command is registered", packageJson.scripts?.["qa:release"] === "node scripts/qa-release.mjs");

const lockPackages = Object.entries(lock.packages ?? {}).filter(([name]) => name !== "");
const incompleteLockPackages = lockPackages
  .filter(([, entry]) => !entry.link && !entry.inBundle && (!entry.resolved || !entry.integrity))
  .map(([name]) => name);
check("Lockfile package entries have resolved URLs and integrity hashes", lockPackages.length > 0 && incompleteLockPackages.length === 0, incompleteLockPackages.slice(0, 10).join(", "));

const gitignore = await readFile(path.join(root, ".gitignore"), "utf8");
const ignoreEnvIndex = gitignore.split(/\r?\n/).indexOf(".env*");
const allowEnvExampleIndex = gitignore.split(/\r?\n/).indexOf("!.env.example");
check("Safe .env.example is whitelisted after .env*", ignoreEnvIndex >= 0 && allowEnvExampleIndex > ignoreEnvIndex);
const envExample = await readFile(path.join(root, ".env.example"), "utf8");
check(".env.example contains no configured credentials", !/^MISTNET_STATUS_(?:ENDPOINT|TOKEN)=.+$/m.test(envExample));

const sourceFiles = [];
async function walk(directory) {
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) await walk(relative);
    else if (/\.(?:tsx?|jsx?)$/.test(entry.name)) sourceFiles.push(relative);
  }
}
await walk("src");
const sourceContents = await Promise.all(sourceFiles.map(async (file) => [file, await readFile(path.join(root, file), "utf8")]));
const sourceText = sourceContents.map(([, content]) => content).join("\n");

const literalIds = [...sourceText.matchAll(/\bid="([^\"]+)"/g)].map((match) => match[1]);
const idCounts = new Map();
for (const id of literalIds) idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
const duplicateIds = [...idCounts].filter(([, count]) => count > 1).map(([id]) => id);
check("No duplicate literal DOM IDs", duplicateIds.length === 0, duplicateIds.join(", "));

const literalAnchorRefs = [...sourceText.matchAll(/href="#([^\"]+)"/g)].map((match) => match[1]);
const missingAnchors = [...new Set(literalAnchorRefs.filter((id) => !idCounts.has(id)))];
check("Internal hash links resolve to declared IDs", missingAnchors.length === 0, missingAnchors.join(", "));

const staticControls = [...sourceText.matchAll(/aria-controls="([^\"]+)"/g)].map((match) => match[1]);
const missingControls = [...new Set(staticControls.filter((id) => !idCounts.has(id)))];
check("Literal aria-controls references resolve", missingControls.length === 0, missingControls.join(", "));

const blankTargetIssues = [];
for (const [file, content] of sourceContents) {
  for (const match of content.matchAll(/<a\b[\s\S]*?>/g)) {
    if (/target="_blank"/.test(match[0]) && !/rel="[^"]*noopener[^"]*"/.test(match[0])) blankTargetIssues.push(file);
  }
}
check("External target=_blank links declare rel=noopener", blankTargetIssues.length === 0, [...new Set(blankTargetIssues)].join(", "));

const legacyDomAttributes = [
  "data-track",
  "data-plan",
  "data-copy",
  "data-counter",
  "data-ping",
  "data-node",
  "data-leg-ping",
  "data-location-status",
  "data-bot-trigger",
  "data-lenis-prevent",
];
const remainingLegacyAttributes = legacyDomAttributes.filter((attribute) => sourceText.includes(attribute));
check("Old runtime-only data attributes are removed", remainingLegacyAttributes.length === 0, remainingLegacyAttributes.join(", "));
check("data-status-location remains only as a CSS interaction hook", sourceText.includes("data-status-location") && (await readFile(path.join(root, "src/app/mistnet-v2.css"), "utf8")).includes("[data-status-location]"));
check("data-text remains for the CSS logo glitch", sourceText.includes('data-text="MISTNET"') && (await readFile(path.join(root, "src/app/globals.css"), "utf8")).includes("attr(data-text)"));

check("No document.querySelector imperative searches remain", !/document\.querySelector(?:All)?\s*\(/.test(sourceText));
check("No direct document.getElementById searches remain", !/document\.getElementById\s*\(/.test(sourceText));
const directDocumentListeners = sourceContents
  .filter(([file, content]) => /document\.(?:add|remove)EventListener\s*\(/.test(content) && !file.startsWith("src/hooks/runtime/"))
  .map(([file]) => file);
check("Direct document listeners are encapsulated in React hooks", directDocumentListeners.length === 0, directDocumentListeners.join(", "));
check("JSX contains no inline style props", !/<[A-Za-z][^>]*\bstyle\s*=/.test(sourceText));
check("React-owned conversion tracking has replaced data-track delegation", sourceText.includes("trackMistnetConversion") && sourceText.includes("<TrackedLink"));
check("FAQ is controlled by React state", /useState<[^>]+>\(null\)/.test(await readFile(path.join(root, "src/components/sections/FAQ.tsx"), "utf8")));
check("Mobile menu is controlled by React state and focus trap", (await readFile(path.join(root, "src/components/Header.tsx"), "utf8")).includes("useFocusTrap") && (await readFile(path.join(root, "src/components/Header.tsx"), "utf8")).includes("useState"));
check("Ping data is rendered from typed server status state", sourceText.includes("useServerStatus") && sourceText.includes("parseServerStatusResponse"));
check("Terminal timers are cleaned up in an effect", /clearInterval\(typingInterval\)/.test(await readFile(path.join(root, "src/components/sections/Terminal.tsx"), "utf8")));
check("Counter animation uses managed requestAnimationFrame hook", sourceText.includes("useAnimationFrame") && (await fileExists("src/hooks/runtime/useAnimationFrame.ts")));

const cssFiles = ["src/styles/tokens.css", "src/app/globals.css", "src/app/mistnet-v2.css"];
const cssText = (await Promise.all(cssFiles.map((file) => readFile(path.join(root, file), "utf8")))).join("\n");
const v2Css = await readFile(path.join(root, "src/app/mistnet-v2.css"), "utf8");
check("Legacy reveal, magnetic, tilt and ripple hooks are removed", !/\b(?:reveal|magnetic|tilt-card|ripple)\b/.test(sourceText + cssText));
check("Refinement CSS contains no !important", !v2Css.includes("!important"));
check("Refinement CSS has no local :root declaration", !/(^|[},])\s*:root\s*\{/m.test(v2Css));
check("Refinement CSS has no negative margins", !/margin(?:-[a-z-]+)?\s*:\s*-[\d.]+(?:px|rem|em|%)\b/i.test(v2Css));
const mediaQueries = [...v2Css.matchAll(/@media\s*\(([^)]*)\)/g)].map((match) => match[1].trim());
const invalidMediaQueries = mediaQueries.filter((query) => !/^min-width\s*:/.test(query) && !/^(?:hover|pointer)\s*:/.test(query) && !/^prefers-reduced-motion\s*:/.test(query));
check("Refinement CSS breakpoints remain mobile-first", invalidMediaQueries.length === 0, invalidMediaQueries.join("; "));
const declaredVars = new Set([...cssText.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((match) => match[1]));
const referencedVars = new Set([...cssText.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((match) => match[1]));
const runtimeVars = new Set(["--dx", "--dy"]);
const fontVars = new Set(["--font-manrope", "--font-jetbrains-mono"]);
const undefinedVars = [...referencedVars].filter((name) => !declaredVars.has(name) && !runtimeVars.has(name) && !fontVars.has(name));
check("CSS variable references resolve", undefinedVars.length === 0, undefinedVars.join(", "));
check("No Lenis, GSAP or WebGL canvas CSS hooks remain", !/\.lenis|gsap-on|#heroCanvas|#globeCanvas/.test(cssText));

const robots = await readFile(path.join(root, "src/app/robots.ts"), "utf8");
const sitemap = await readFile(path.join(root, "src/app/sitemap.ts"), "utf8");
check("robots.ts sitemap URL has no duplicate slash", robots.includes('sitemap: `${siteUrl}/sitemap.xml`') && !robots.includes("//sitemap.xml"));
check("sitemap.ts publishes canonical root URL", sitemap.includes('url: `${siteUrl}/`'));
const notFoundSource = await readFile(path.join(root, "src/app/not-found.tsx"), "utf8");
const homepageSource = sourceContents.filter(([file]) => file !== "src/app/not-found.tsx").map(([, content]) => content).join("\n");
const homepageH1Count = [...homepageSource.matchAll(/<h1\b/g)].length;
const notFoundH1Count = [...notFoundSource.matchAll(/<h1\b/g)].length;
check("Homepage has exactly one H1", homepageH1Count === 1, `count=${homepageH1Count}`);
check("404 route has its own H1", notFoundH1Count === 1, `count=${notFoundH1Count}`);
const layout = await readFile(path.join(root, "src/app/layout.tsx"), "utf8");
check("Document language remains Russian", /<html\s+lang="ru"/.test(layout));
check("Open Graph preview asset exists", await fileExists("public/og-image.jpg"));

const scriptSyntax = spawnSync(process.execPath, ["--check", "scripts/qa-release.mjs"], { cwd: root, encoding: "utf8" });
check("qa-release.mjs passes Node syntax check", scriptSyntax.status === 0, scriptSyntax.stderr.trim());

for (const [index, result] of results.entries()) {
  const status = result.ok ? "PASS" : "FAIL";
  console.log(`${status} ${String(index + 1).padStart(2, "0")}. ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
}
const passed = results.filter((result) => result.ok).length;
const failed = results.length - passed;
console.log(`\nStatic QA: ${passed}/${results.length} passed; ${failed} failed.`);
process.exitCode = failed === 0 ? 0 : 1;
