import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "src");
const app = path.join(src, "app");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function routePattern(pageFile) {
  let route = path.relative(app, path.dirname(pageFile)).split(path.sep).filter(Boolean);
  route = route.filter((part) => !(part.startsWith("(") && part.endsWith(")")));
  return "/" + route.join("/");
}

const routePatterns = walk(app)
  .filter((file) => path.basename(file) === "page.tsx" || path.basename(file) === "page.ts")
  .map(routePattern);

function routeRegex(pattern) {
  const segments = (pattern.replace(/\/+$/, "") || "/").split("/").filter(Boolean);
  if (!segments.length) return /^\/$/;
  const encoded = segments.map((segment) => {
    if (/^\[\.\.\..+\]$/.test(segment)) return ".+";
    if (/^\[.+\]$/.test(segment)) return "[^/]+";
    return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  });
  return new RegExp(`^/${encoded.join("/")}$`);
}

const compiledRoutes = routePatterns.map((pattern) => [pattern, routeRegex(pattern)]);
function matchesRoute(urlPath) {
  const clean = urlPath.replace(/\/+$/, "") || "/";
  return compiledRoutes.some(([, regex]) => regex.test(clean));
}

const problems = [];
const literalHrefPattern = /href\s*=\s*["']([^"']+)["']/g;
const templateHrefPattern = /href\s*=\s*\{`([^`]+)`\}/g;

function inspectHref(file, href) {
  if (href === "#") {
    problems.push(`${path.relative(root, file)}: placeholder href="#"`);
    return;
  }
  if (!href.startsWith("/") || href.startsWith("//")) return;
  const normalized = href.replace(/\$\{[^}]+\}/g, "sample");
  const pathname = normalized.split(/[?#]/)[0] || "/";
  if (!matchesRoute(pathname)) problems.push(`${path.relative(root, file)}: no route found for ${href}`);
}

for (const file of walk(src).filter((item) => /\.(tsx?|jsx?)$/.test(item))) {
  const text = fs.readFileSync(file, "utf8");
  for (const pattern of [literalHrefPattern, templateHrefPattern]) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text))) inspectHref(file, match[1]);
  }
}

if (problems.length) {
  console.error("Broken internal link audit failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Internal link audit passed (${routePatterns.length} application routes checked, including template links).`);
