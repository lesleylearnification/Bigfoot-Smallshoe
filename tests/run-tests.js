const { spawnSync } = require("child_process");
const path = require("path");

const tests = [
  "structure.test.js",
  "accessibility.test.js",
  "data.test.js",
  "persistence.test.js",
  "duplicate-ids.test.js",
  "local-assets.test.js",
  "research.test.js",
  "release.test.js"
];

let failed = false;
for (const test of tests) {
  const result = spawnSync(process.execPath, [path.join(__dirname, test)], {
    stdio: "inherit"
  });
  if (result.status !== 0) failed = true;
}

if (failed) process.exit(1);
console.log("All Bigfoot Smallshoe Build 6.0 release tests passed.");
