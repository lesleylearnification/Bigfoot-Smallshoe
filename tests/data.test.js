const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dataPath = path.resolve(__dirname, "..", "js", "data", "game-data.js");
const code = fs.readFileSync(dataPath, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const data = sandbox.window.GAME_DATA;
const behaviors = ["notice","specific","fair","earned","personal"];
const failures = [];

for (const behavior of behaviors) {
  const scenarios = data.scenarios?.[behavior] || [];
  if (scenarios.length < 5) failures.push(`${behavior} has fewer than 5 scenarios.`);
  for (const scenario of scenarios) {
    if (!Array.isArray(scenario.choices) || scenario.choices.length !== 4) {
      failures.push(`${behavior}/${scenario.title} does not have exactly 4 choices.`);
    }
    for (const choice of scenario.choices || []) {
      if (!Array.isArray(choice.scores) || choice.scores.length !== 6) {
        failures.push(`${behavior}/${scenario.title} has invalid score dimensions.`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Scenario data test passed.");
