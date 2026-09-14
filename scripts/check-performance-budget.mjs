import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const budgets = [
  ["src/app/globals.css", 60 * 1024],
];

const failures = [];
for (const [relative, budget] of budgets) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) continue;
  const size = fs.statSync(file).size;
  console.log(`${relative}: ${(size / 1024).toFixed(1)} KB / ${(budget / 1024).toFixed(0)} KB budget`);
  if (size > budget) failures.push(`${relative} exceeds the source-size performance budget.`);
}

const publicDir = path.join(root, "public");
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir, { recursive: true }).map((name) => path.join(publicDir, String(name))).filter((file) => fs.existsSync(file) && fs.statSync(file).isFile());
  const total = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  console.log(`public static assets: ${(total / 1024).toFixed(1)} KB`);
  if (total > 1024 * 1024) failures.push("public static assets exceed 1 MB.");
}

if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Static performance budget passed. Runtime Core Web Vitals are reported only after analytics consent.");
