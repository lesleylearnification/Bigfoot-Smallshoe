export function createRouter(store, bus) {
  function start() {
    const state = store.getState();
    document.documentElement.dataset.screen = state.screen || "foundation";
    store.subscribe(nextState => {
      document.documentElement.dataset.screen = nextState.screen || "foundation";
      bus.emit("state:changed", nextState);
    });
  }

  function go(screen) {
    store.update({ screen });
  }

  return { start, go };
}
