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
let total = 0;

for (const behavior of behaviors) {
  const sources = data.research?.[behavior] || [];
  total += sources.length;
  if (sources.length < 5) failures.push(`${behavior} has fewer than five research sources.`);
  for (const source of sources) {
    if (!source.title) failures.push(`${behavior} source missing title.`);
    if (!source.takeaway) failures.push(`${behavior}/${source.title} missing takeaway.`);
    if (!source.bigfoot) failures.push(`${behavior}/${source.title} missing Bigfoot note.`);
    if (!source.improve) failures.push(`${behavior}/${source.title} missing improvement note.`);
  }
}

if (total < 25) failures.push(`Only ${total} research sources found.`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Research test passed (${total} sources).`);
