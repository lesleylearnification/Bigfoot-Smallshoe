import { createStore } from "./core/store.js";
import { createRouter } from "./core/router.js";
import { EventBus } from "./core/events.js";
import { loadSave, saveState, clearSave } from "./systems/persistence.js";
import { mountGameplay } from "./screens/gameplay.js";
import { mountReflection } from "./screens/reflection.js";
import { mountCabinet } from "./screens/cabinet.js";
import { createProgressionSystem } from "./systems/forest-remembers.js";
import { createAudioSystem } from "./systems/audio.js";
import { createExperienceSystem } from "./systems/experience.js";
import { installAccessibility } from "./systems/accessibility.js";

const initialState = {
  build: "6.0-art-lock",
  module: 10,
  screen: "cabin",
  settings: { ambience: true, reducedMotion: false },
  expedition: null,
  player: { round: 0, evidence: [], quietLegends: [] }
};

const bus = new EventBus();
const store = createStore({ ...initialState, ...loadSave() });
const router = createRouter(store, bus);

bus.on("state:changed", state => saveState(state));
router.start();

const audio = createAudioSystem({ store, bus });
const experience = createExperienceSystem({ store, bus, audio });
const accessibility = installAccessibility({ store, bus });

const gameplay = mountGameplay({
  store,
  router,
  bus,
  gameData: window.GAME_DATA
});

const reflection = mountReflection({
  store,
  router,
  bus,
  gameplay,
  gameData: window.GAME_DATA
});

const cabinet = mountCabinet({
  store,
  router,
  bus,
  gameplay,
  gameData: window.GAME_DATA
});

const progression = createProgressionSystem({
  store,
  router,
  bus,
  gameplay
});

document.querySelector("#returnCabinGlobal").addEventListener("click", () => {
  gameplay.showScreen("cabin");
});

document.querySelector("#resetGame").addEventListener("click", () => {
  const confirmed = window.confirm("Reset all expeditions, discoveries, Quiet Legends, and endings?");
  if (!confirmed) return;
  clearSave();
  window.location.reload();
});

document.addEventListener("keydown", event => {
  const satchel = document.querySelector("#satchelPanel");
  if (event.key === "Escape" && satchel.classList.contains("open")) {
    satchel.classList.remove("open");
    satchel.setAttribute("aria-hidden", "true");
  }
});


const soundToggle = document.querySelector("#soundToggle");
const motionToggle = document.querySelector("#motionToggle");

function syncExperienceControls() {
  const soundOn = audio.isEnabled();
  const motionOn = experience.isMotionEnabled();
  soundToggle.setAttribute("aria-pressed", String(soundOn));
  soundToggle.textContent = `Sound: ${soundOn ? "On" : "Off"}`;
  motionToggle.setAttribute("aria-pressed", String(motionOn));
  motionToggle.textContent = `Motion: ${motionOn ? "On" : "Off"}`;
}

soundToggle.addEventListener("click", () => {
  audio.setEnabled(!audio.isEnabled());
  syncExperienceControls();
});

motionToggle.addEventListener("click", () => {
  experience.setMotion(!experience.isMotionEnabled());
  syncExperienceControls();
});

syncExperienceControls();
bus.emit("screen:changed", store.getState().screen || "cabin");
document.documentElement.classList.add("app-ready");

window.BigfootSmallshoe = { store, router, bus, gameplay, reflection, cabinet, progression, audio, experience, accessibility };

