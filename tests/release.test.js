const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const required = [
  ".nojekyll",
  "404.html",
  "README.md",
  "RELEASE_NOTES.md",
  "PLAYTEST_GUIDE.md",
  "GITHUB_PAGES_DEPLOYMENT.md",
  "version.json",
  "css/release.css"
];

const failures = required.filter(file => !fs.existsSync(path.join(root, file)));

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
if (!html.includes("Build 6.0 · Art Lock")) failures.push("Final release badge missing.");
if (html.includes("Module 9 of 10")) failures.push("Development module label remains.");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Release packaging test passed.");
