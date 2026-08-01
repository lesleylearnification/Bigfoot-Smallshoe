const fs = require("fs");
const path = require("path");

const code = fs.readFileSync(path.resolve(__dirname, "..", "js", "systems", "persistence.js"), "utf8");

const requiredExports = ["loadSave", "saveState", "clearSave"];
const failures = requiredExports.filter(name => !code.includes(`export function ${name}`));

if (failures.length) {
  console.error(`Missing persistence exports: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Persistence interface test passed.");
