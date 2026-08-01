const OBJECTS = {
  journal: {
    eyebrow: "Hero object",
    title: "Trail Journal",
    copy: "The journal is the heart of Build 6. Module 4 will turn it into the complete scenario and gameplay experience.",
    action: "Open the journal"
  },
  map: {
    eyebrow: "World object",
    title: "Forest Map",
    copy: "The map anchors every scenario to a real location in Smallshoe Forest and makes the world feel continuous.",
    action: "Unfold the map"
  },
  satchel: {
    eyebrow: "Collection object",
    title: "Evidence Satchel",
    copy: "Collected clues and meaningful artifacts will persist here as the player completes recognition decisions.",
    action: "Check the satchel"
  },
  cabinet: {
    eyebrow: "Discovery object",
    title: "Field Guide Cabinet",
    copy: "Research becomes something the player uncovers through drawers, journals, and annotated evidence.",
    action: "Open a drawer"
  },
  wall: {
    eyebrow: "Culture object",
    title: "Constellation Wall",
    copy: "This wall will show how recognition decisions connect people, behaviors, and later consequences.",
    action: "Follow the thread"
  },
  kettle: {
    eyebrow: "Reflection object",
    title: "Campfire Journal",
    copy: "The kettle and evening journal frame reflection as a quiet ritual rather than a quiz.",
    action: "Brew the tea"
  },
  radio: {
    eyebrow: "Settings object",
    title: "Old Ranger Radio",
    copy: "Sound, motion, and accessibility options live inside a believable object rather than a generic settings menu.",
    action: "Tune the radio"
  }
};

export function mountCabin({ store, bus }) {
  const panel = document.querySelector("#objectPanel");
  const title = document.querySelector("#panelTitle");
  const eyebrow = document.querySelector("#panelEyebrow");
  const copy = document.querySelector("#panelCopy");
  const action = document.querySelector("#panelAction");
  const close = document.querySelector("#closeObjectPanel");

  function openObject(key) {
    const data = OBJECTS[key];
    if (!data) return;
    eyebrow.textContent = data.eyebrow;
    title.textContent = data.title;
    copy.textContent = data.copy;
    action.textContent = data.action;
    action.dataset.object = key;
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    close.focus();
    store.update({ selectedCabinObject: key });
    bus.emit("cabin:object-opened", key);
  }

  function closePanel() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll("[data-object]").forEach(button => {
    button.addEventListener("click", () => openObject(button.dataset.object));
  });

  close.addEventListener("click", closePanel);
  action.addEventListener("click", () => {
    const key = action.dataset.object;
    bus.emit("cabin:object-action", key);
    action.textContent = "Module coming soon";
    window.setTimeout(() => {
      action.textContent = OBJECTS[key].action;
    }, 900);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && panel.classList.contains("open")) {
      closePanel();
    }
  });

  return { openObject, closePanel };
}
