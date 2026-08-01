const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.resolve(__dirname, "..", "index.html"), "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const seen = new Set();
const duplicates = new Set();

for (const id of ids) {
  if (seen.has(id)) duplicates.add(id);
  seen.add(id);
}

if (duplicates.size) {
  console.error(`Duplicate IDs: ${[...duplicates].join(", ")}`);
  process.exit(1);
}
console.log(`Duplicate ID test passed (${ids.length} unique IDs).`);
