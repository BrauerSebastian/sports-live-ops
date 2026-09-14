import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceRoots = ["src", "public"].map((dir) => path.join(root, dir));
const rasterExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);
const maxRasterBytes = 300 * 1024;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = sourceRoots.flatMap(walk);
const problems = [];

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (rasterExtensions.has(ext)) {
    const size = fs.statSync(file).size;
    if (size > maxRasterBytes) problems.push(`${path.relative(root, file)} is ${(size / 1024).toFixed(0)} KB (budget: 300 KB).`);
  }

  if (/\.(tsx?|jsx?)$/.test(file)) {
    const source = fs.readFileSync(file, "utf8");
    const rawImages = source.match(/<img\b[^>]*>/g) ?? [];
    for (const tag of rawImages) {
      if (!/\balt\s*=/.test(tag)) problems.push(`${path.relative(root, file)} contains an <img> without alt text.`);
    }
  }
}

if (problems.length) {
  console.error("Image/accessibility audit failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

const rasterCount = files.filter((file) => rasterExtensions.has(path.extname(file).toLowerCase())).length;
console.log(`Image audit passed (${rasterCount} raster asset${rasterCount === 1 ? "" : "s"}; future Next/Image assets are configured for AVIF/WebP).`);
