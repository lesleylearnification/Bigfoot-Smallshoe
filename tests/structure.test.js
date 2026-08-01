const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const requiredIds = [
  "app",
  "cabinScreen",
  "mapScreen",
  "gameplayScreen",
  "reflectionScreen",
  "rangerReportScreen",
  "cabinetScreen",
  "constellationScreen",
  "endingScreen",
  "accessibilityPanel",
  "liveRegion"
];

const failures = [];

for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) failures.push(`Missing id: ${id}`);
}

const requiredFiles = [
  "css/accessibility.css",
  "js/systems/accessibility.js",
  "js/systems/persistence.js",
  "js/screens/gameplay.js",
  "js/screens/reflection.js",
  "js/screens/cabinet.js",
  "js/systems/forest-remembers.js"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing file: ${file}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Structure test passed.");
