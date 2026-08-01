export function installAccessibility({ store, bus }) {
  const panel = document.querySelector("#accessibilityPanel");
  const openButton = document.querySelector("#accessibilityToggle");
  const closeButton = document.querySelector("#closeAccessibility");
  const largeText = document.querySelector("#largeTextToggle");
  const contrast = document.querySelector("#contrastToggle");
  const announce = document.querySelector("#announceToggle");
  const liveRegion = document.querySelector("#liveRegion");

  const saved = {
    largeText: false,
    highContrast: false,
    announcements: true,
    ...(store.getState().accessibility || {})
  };

  function apply() {
    document.body.classList.toggle("large-text", saved.largeText);
    document.body.classList.toggle("high-contrast", saved.highContrast);
    largeText.checked = saved.largeText;
    contrast.checked = saved.highContrast;
    announce.checked = saved.announcements;
    store.update({ accessibility: { ...saved } });
  }

  function openPanel() {
    panel.classList.remove("hidden");
    openButton.setAttribute("aria-expanded", "true");
    closeButton.focus();
  }

  function closePanel() {
    panel.classList.add("hidden");
    openButton.setAttribute("aria-expanded", "false");
    openButton.focus();
  }

  function speak(message) {
    if (!saved.announcements || !liveRegion || !message) return;
    liveRegion.textContent = "";
    window.setTimeout(() => {
      liveRegion.textContent = message;
    }, 30);
  }

  openButton.addEventListener("click", () => {
    panel.classList.contains("hidden") ? openPanel() : closePanel();
  });
  closeButton.addEventListener("click", closePanel);

  largeText.addEventListener("change", () => {
    saved.largeText = largeText.checked;
    apply();
    speak(saved.largeText ? "Larger text enabled." : "Larger text disabled.");
  });

  contrast.addEventListener("change", () => {
    saved.highContrast = contrast.checked;
    apply();
    speak(saved.highContrast ? "Higher contrast enabled." : "Higher contrast disabled.");
  });

  announce.addEventListener("change", () => {
    saved.announcements = announce.checked;
    apply();
    if (saved.announcements) speak("Screen announcements enabled.");
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Tab") document.body.classList.add("keyboard-user");
    if (event.key === "Escape" && !panel.classList.contains("hidden")) closePanel();
  });
  document.addEventListener("pointerdown", () => {
    document.body.classList.remove("keyboard-user");
  });

  bus.on("screen:changed", screen => {
    const names = {
      cabin: "Bigfoot's cabin",
      map: "Smallshoe Forest map",
      gameplay: "Trail Journal scenario",
      complete: "Expedition complete",
      reflection: "Campfire Journal reflection",
      report: "Ranger Report",
      cabinet: "Field Guide Cabinet",
      constellation: "The Forest Remembers constellation wall",
      ending: "Final legacy ending"
    };
    speak(`${names[screen] || screen} opened.`);
    const active = document.querySelector(".game-screen:not(.hidden)");
    const heading = active?.querySelector("h1, h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      window.setTimeout(() => heading.focus({ preventScroll: true }), 360);
    }
  });

  bus.on("gameplay:decision", decision => {
    speak(`Choice sealed for ${decision.title}.`);
  });
  bus.on("reflection:complete", () => {
    speak("All five trails rated. The Ranger Report is ready.");
  });
  bus.on("research:opened", source => {
    speak(`Opened research source: ${source.title}.`);
  });
  bus.on("research:note-saved", source => {
    speak(`Saved field note: ${source.title}.`);
  });

  apply();
  return { speak, openPanel, closePanel };
}
