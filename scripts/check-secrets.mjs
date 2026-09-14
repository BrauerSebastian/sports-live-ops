import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const roots = ["src", "scripts"].map((dir) => path.join(root, dir));
const problems = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const dangerousPublicEnv = /NEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|PASSWORD|PRIVATE_KEY|DATABASE_URL|ACCESS_TOKEN|API_SECRET)/g;
const privateKey = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;

for (const file of roots.flatMap(walk).filter((item) => /\.(tsx?|jsx?|mjs|cjs|json)$/.test(item))) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(dangerousPublicEnv)) {
    problems.push(`${path.relative(root, file)} exposes a secret-like environment name: ${match[0]}`);
  }
  if (privateKey.test(source)) problems.push(`${path.relative(root, file)} appears to contain a private key.`);
}

if (problems.length) {
  console.error("Frontend secret audit failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("Frontend secret audit passed. Server credentials remain outside NEXT_PUBLIC_*.");
