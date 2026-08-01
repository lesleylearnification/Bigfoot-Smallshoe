const SAVE_KEY = "bigfoot-smallshoe-build6";

export function loadSave() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // The game remains playable when storage is unavailable.
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
