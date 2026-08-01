export function createStore(initialState = {}) {
  let state = structuredClone(initialState);
  const listeners = new Set();

  function getState() {
    return structuredClone(state);
  }

  function update(patch) {
    state = { ...state, ...patch };
    listeners.forEach(listener => listener(getState()));
    window.dispatchEvent(new CustomEvent("bigfoot:state", { detail: getState() }));
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, update, subscribe };
}
