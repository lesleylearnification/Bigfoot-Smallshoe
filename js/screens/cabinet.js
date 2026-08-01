const BEHAVIORS = ["notice", "specific", "fair", "earned", "personal"];

const META = {
  notice: {
    label: "Notice overlooked contributions",
    motif: "🔎",
    drawer: "Observation Notebooks",
    intro: "Sources on attention, recognition frequency, overlooked work, and the managerial habit of noticing before correcting."
  },
  specific: {
    label: "Make recognition specific",
    motif: "🏷️",
    drawer: "Evidence Tags",
    intro: "Sources on behavior-specific feedback, praise quality, attribution, and explaining why a contribution mattered."
  },
  fair: {
    label: "Recognize fairly",
    motif: "⚖️",
    drawer: "Ranger Ledgers",
    intro: "Sources on fairness, visibility bias, status, favoritism, equity, and distributing recognition across a team."
  },
  earned: {
    label: "Keep recognition meaningful",
    motif: "🌲",
    drawer: "Golden Pinecone Records",
    intro: "Sources on credibility, proportionality, meaningful rewards, overpraise, and keeping recognition tied to real contribution."
  },
  personal: {
    label: "Personalize recognition",
    motif: "✉️",
    drawer: "Keepsake Letters",
    intro: "Sources on individual preference, public versus private recognition, autonomy, identity, and meaningful appreciation."
  }
};

const ARTIFACT_TYPES = [
  ["journal", "Field Journal"],
  ["memo", "Ranger Training Memo"],
  ["checkout", "Library Checkout Card"],
  ["conference", "Folded Conference Handout"],
  ["archive", "Newspaper Archive Copy"]
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeSource(source, behavior, index) {
  const [className, artifactType] = ARTIFACT_TYPES[index % ARTIFACT_TYPES.length];
  return {
    ...clone(source),
    behavior,
    index,
    className,
    artifactType,
    fieldNumber: `${behavior.slice(0, 2).toUpperCase()}-${String(index + 1).padStart(2, "0")}`
  };
}

function fallbackSource(behavior, expert, index = 0) {
  return normalizeSource({
    title: expert?.source || `${META[behavior].label} field source`,
    authors: "Expert source",
    journal: "Recognition field notes",
    takeaway: expert?.standard || "This source clarifies the expert standard used in the reflection experience.",
    bigfoot: "Bigfoot saved this because the source explains a practical behavior worth repeating.",
    improve: `Use this source to improve how you ${META[behavior].label.toLowerCase()}.`,
    url: expert?.url || "#"
  }, behavior, index);
}

export function mountCabinet({ store, router, bus, gameData, gameplay }) {
  const cabinetScreen = document.querySelector("#cabinetScreen");
  const allScreens = [
    document.querySelector("#cabinScreen"),
    document.querySelector("#mapScreen"),
    document.querySelector("#gameplayScreen"),
    document.querySelector("#roundCompleteScreen"),
    document.querySelector("#reflectionScreen"),
    document.querySelector("#rangerReportScreen"),
    document.querySelector("#constellationScreen"),
    document.querySelector("#endingScreen"),
    cabinetScreen
  ];

  let activeBehavior = "notice";
  let currentSource = null;
  const savedNotes = [...(store.getState().savedFieldNotes || [])];
  const discovery = { ...(store.getState().researchDiscovery || {}) };

  function showOnly(screen) {
    bus.emit("transition", {
      text:"Opening the Field Guide Cabinet",
      callback:()=>{
        allScreens.forEach(element => element?.classList.add("hidden"));
        screen.classList.remove("hidden");
        router.go("cabinet");
        bus.emit("screen:changed","cabinet");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  function sourcesFor(behavior) {
    const sources = gameData.research?.[behavior] || [];
    if (sources.length) {
      return sources.map((source, index) => normalizeSource(source, behavior, index));
    }
    return [fallbackSource(behavior, gameData.expertCards?.[behavior], 0)];
  }

  function renderTabs() {
    const holder = document.querySelector("#drawerTabs");
    holder.innerHTML = "";
    BEHAVIORS.forEach(behavior => {
      const meta = META[behavior];
      const count = sourcesFor(behavior).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `drawer-button${behavior === activeBehavior ? " active" : ""}`;
      button.innerHTML = `<strong>${meta.motif} ${meta.drawer}</strong><span>${count} collected sources</span>`;
      button.addEventListener("click", () => {
        bus.emit("fx:drawer");
        button.classList.add("drawer-moving");
        window.setTimeout(() => button.classList.remove("drawer-moving"), 450);
        activeBehavior = behavior;
        renderCabinet();
      });
      holder.appendChild(button);
    });
  }

  function renderDrawerIntro() {
    const meta = META[activeBehavior];
    document.querySelector("#drawerIntro").innerHTML = `
      <p class="chapter-label">${meta.motif} ${meta.label}</p>
      <h2>${meta.drawer}</h2>
      <p>${meta.intro}</p>`;
  }

  function renderShelf() {
    const holder = document.querySelector("#sourceShelf");
    const sources = sourcesFor(activeBehavior);
    holder.innerHTML = "";
    sources.forEach((source, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `source-artifact ${source.className}`;
      button.style.setProperty("--artifact-tilt", `${index % 2 ? .7 : -.7}deg`);
      button.innerHTML = `
        <span class="artifact-label">${source.artifactType}</span>
        <h3>${source.title}</h3>
        <p><strong>${source.authors || "Collected source"}</strong></p>
        <p>${source.journal || "Field archive"}</p>`;
      button.addEventListener("click", () => {
        button.classList.add("lifted");
        bus.emit("fx:page");
        window.setTimeout(() => {
          button.classList.remove("lifted");
          openSource(source);
        }, 180);
      });
      holder.appendChild(button);
    });
  }

  function renderSavedNotes() {
    const holder = document.querySelector("#savedFieldNotes");
    holder.innerHTML = savedNotes.length
      ? savedNotes.map(note => `
        <div class="saved-field-note">
          <strong>${META[note.behavior].motif} ${note.title}</strong>
          <span>${note.takeaway}</span>
        </div>`).join("")
      : '<p class="empty-field-notes">No field notes saved yet.</p>';
  }

  function renderCabinet() {
    document.querySelector("#sourceShelf").classList.remove("hidden");
    document.querySelector("#openSource").classList.add("hidden");
    renderTabs();
    renderDrawerIntro();
    renderShelf();
    renderSavedNotes();
  }

  function openSource(source) {
    currentSource = source;
    discovery[`${source.behavior}:${source.index}`] = true;
    document.querySelector("#sourceShelf").classList.add("hidden");
    document.querySelector("#openSource").classList.remove("hidden");
    document.querySelector("#sourceArtifactType").textContent = source.artifactType;
    document.querySelector("#sourceFieldNumber").textContent = source.fieldNumber;
    document.querySelector("#sourceMeta").textContent =
      `${source.authors || "Collected source"} · ${source.journal || "Field archive"}`;
    document.querySelector("#sourceTitle").textContent = source.title;
    document.querySelector("#sourceTakeaway").textContent =
      source.takeaway || "This source supports the recognition behavior practiced in the game.";
    document.querySelector("#sourceBigfoot").textContent =
      source.bigfoot || "Bigfoot saved this because it explains a practical pattern worth noticing.";
    document.querySelector("#sourceImprove").textContent =
      source.improve || `Use this source to improve how you ${META[source.behavior].label.toLowerCase()}.`;
    const link = document.querySelector("#sourceLink");
    const hasUsableUrl = Boolean(source.url && source.url !== "#");
    link.href = hasUsableUrl ? source.url : "#";
    link.classList.toggle("hidden", !hasUsableUrl);
    link.setAttribute("aria-label", `Open source: ${source.title}`);
    document.querySelector("#saveFieldNote").textContent =
      savedNotes.some(note => note.behavior === source.behavior && note.index === source.index)
        ? "Field Note Saved"
        : "Save as a Field Note";
    store.update({ researchDiscovery: { ...discovery } });
    bus.emit("research:opened", clone(source));
  }

  function saveCurrentNote() {
    if (!currentSource) return;
    const exists = savedNotes.some(note =>
      note.behavior === currentSource.behavior && note.index === currentSource.index
    );
    if (!exists) {
      savedNotes.push({
        behavior: currentSource.behavior,
        index: currentSource.index,
        title: currentSource.title,
        takeaway: currentSource.takeaway || "Recognition field note"
      });
      store.update({ savedFieldNotes: clone(savedNotes) });
      renderSavedNotes();
      bus.emit("research:note-saved", clone(currentSource));
    }
    document.querySelector("#saveFieldNote").textContent = "Field Note Saved";
  }

  function openCabinet(behavior = "notice") {
    activeBehavior = BEHAVIORS.includes(behavior) ? behavior : "notice";
    renderCabinet();
    showOnly(cabinetScreen);
  }

  document.querySelector("#openCabinet").addEventListener("click", () => openCabinet("notice"));
  document.querySelector("#backToDrawer").addEventListener("click", renderCabinet);
  document.querySelector("#saveFieldNote").addEventListener("click", saveCurrentNote);

  document.addEventListener("cabinet:open", event => {
    openCabinet(event.detail?.behavior || "notice");
  });

  return {
    openCabinet,
    renderSavedNotes,
    getSavedNotes: () => clone(savedNotes)
  };
}
