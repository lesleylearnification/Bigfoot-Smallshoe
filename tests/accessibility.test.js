const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.resolve(__dirname, "..", "index.html"), "utf8");
const failures = [];

if (!html.includes('lang="en"')) failures.push("Missing document language.");
if (!html.includes('class="skip-link"')) failures.push("Missing skip link.");
if (!html.includes('aria-live="polite"')) failures.push("Missing polite live region.");
if (!html.includes('id="accessibilityToggle"')) failures.push("Missing accessibility control.");
if (!html.includes('id="motionToggle"')) failures.push("Missing motion control.");
if (!html.includes('id="soundToggle"')) failures.push("Missing sound control.");

const buttonsWithoutType = [...html.matchAll(/<button(?![^>]*\btype=)[^>]*>/g)];
if (buttonsWithoutType.length) failures.push(`${buttonsWithoutType.length} button(s) missing type.`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Accessibility markup test passed.");
