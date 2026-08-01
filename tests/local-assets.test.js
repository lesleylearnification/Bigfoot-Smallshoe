const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
const failures = [];

for (const ref of refs) {
  if (/^(https?:|mailto:|#)/.test(ref)) continue;
  const clean = ref.split("?")[0];
  if (!fs.existsSync(path.join(root, clean))) failures.push(clean);
}

if (failures.length) {
  console.error(`Missing local references:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`Local asset test passed (${refs.length} references checked).`);
