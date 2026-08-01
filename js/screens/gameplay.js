const BEHAVIORS = ["notice", "specific", "fair", "earned", "personal"];

const META = {
  notice: {
    label: "Notice overlooked contributions",
    motif: "🔎",
    object: "Observation Kit",
    prompt: "Look beyond the obvious event and identify the useful work most people will miss.",
    image: "assets/illustrations/scenarios/notice-field-sketch.jpg"
  },
  specific: {
    label: "Make recognition specific",
    motif: "🏷️",
    object: "Evidence Tags",
    prompt: "Name the action and connect it to a meaningful impact.",
    image: "assets/illustrations/scenarios/specific-field-sketch.jpg"
  },
  fair: {
    label: "Recognize fairly",
    motif: "⚖️",
    object: "Ranger Ledger",
    prompt: "Follow contribution rather than status, visibility, or familiarity.",
    image: "assets/illustrations/scenarios/fair-field-sketch.jpg"
  },
  earned: {
    label: "Keep recognition meaningful",
    motif: "🌲",
    object: "Golden Pinecone Box",
    prompt: "Match the scale of recognition to the scale of the contribution.",
    image: "assets/illustrations/scenarios/earned-field-sketch.jpg"
  },
  personal: {
    label: "Personalize recognition",
    motif: "✉️",
    object: "Keepsake Letters",
    prompt: "Choose recognition that fits this person rather than the manager’s preference.",
    image: "assets/illustrations/scenarios/personal-field-sketch.jpg"
  }
};

const LOCATIONS = [
  "Fern Creek Trail",
  "Ranger Station Six",
  "Owl Hollow",
  "Cedar Bridge",
  "Lost Lake Campground"
];

const EVIDENCE = ["🪶", "🧭", "🍂", "📓", "🪨", "🔔", "🌲", "🗺️", "🔍", "🎒"];
const RULES = [
  "Quiet work still leaves tracks.",
  "Recognition belongs to the helper.",
  "The loudest person is rarely the only contributor.",
  "Name the behavior worth repeating.",
  "The right recognition fits the person."
];
const OBSERVATIONS = [
  "Something useful happened before anyone thought to look.",
  "Gary has ruled out weather. This is unusual.",
  "Linda has photographed three leaves and one elbow.",
  "The forest is full of work that succeeds by preventing a problem.",
  "The best contribution today happened outside the spotlight."
];
const RANGER_NOTES = [
  "Linda says it was Bigfoot. Gary says the breeze has become highly organized.",
  "The beavers deny involvement and request a correction.",
  "Gary considers the evidence annoyingly specific.",
  "Linda has started a second notebook titled 'Obviously Bigfoot.'",
  "The ranger station remains grateful and professionally confused."
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function choose(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function createRound(gameData) {
  return BEHAVIORS.map(behavior => {
    const scenarios = gameData.scenarios?.[behavior] || [];
    return {
      behavior,
      ...clone(choose(scenarios))
    };
  });
}

function initialMetrics() {
  return {
    harmony: 50,
    clue: 50,
    happiness: 50,
    accuracy: 50,
    stealth: 100
  };
}

function metricDescription(value) {
  if (value >= 85) return "Legendary";
  if (value >= 70) return "Strong tracks";
  if (value >= 55) return "Promising";
  if (value >= 40) return "Foggy";
  return "Beavers credited";
}

function applyScores(metrics, scores) {
  const average = scores.reduce((sum, value) => sum + value, 0) / 18;
  return {
    harmony: clamp(metrics.harmony + (average - .5) * 14),
    clue: clamp(metrics.clue + (((scores[0] + scores[1]) / 6) - .5) * 15),
    happiness: clamp(metrics.happiness + (((scores[2] + scores[4]) / 6) - .5) * 15),
    accuracy: clamp(metrics.accuracy + (((scores[0] + scores[1] + scores[2]) / 9) - .5) * 16),
    stealth: clamp(metrics.stealth - (average < .45 ? 6 : 0))
  };
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function mountGameplay({ store, router, bus, gameData }) {
  const screens = {
    cabin: document.querySelector("#cabinScreen"),
    map: document.querySelector("#mapScreen"),
    gameplay: document.querySelector("#gameplayScreen"),
    complete: document.querySelector("#roundCompleteScreen"),
    reflection: document.querySelector("#reflectionScreen"),
    report: document.querySelector("#rangerReportScreen"),
    cabinet: document.querySelector("#cabinetScreen"),
    constellation: document.querySelector("#constellationScreen"),
    ending: document.querySelector("#endingScreen")
  };

  const state = {
    selectedLocation: "Fern Creek Trail",
    roundScenarios: [],
    currentIndex: 0,
    selectedChoice: null,
    decisions: [],
    evidence: [],
    metrics: initialMetrics()
  };

  function showScreen(name) {
    const captions = {
      cabin: "Returning to the cabin",
      map: "Unfolding the forest map",
      gameplay: "Opening the Trail Journal",
      complete: "Closing the day’s field notes",
      reflection: "Brewing tea",
      report: "Opening the Ranger Report",
      cabinet: "Opening the Field Guide Cabinet",
      constellation: "Following the thread",
      ending: "Turning to the final page"
    };
    bus.emit("transition", {
      text: captions[name] || "Turning the page",
      callback: () => {
        Object.entries(screens).forEach(([key, element]) => {
          element.classList.toggle("hidden", key !== name);
        });
        router.go(name);
        bus.emit("screen:changed", name);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  function syncStore() {
    store.update({
      screen: store.getState().screen,
      expedition: clone(state)
    });
  }

  function restoreFromStore() {
    const saved = store.getState().expedition;
    if (!saved) return;
    Object.assign(state, clone(saved));
  }

  function resetRound() {
    state.selectedLocation = "Fern Creek Trail";
    state.roundScenarios = [];
    state.currentIndex = 0;
    state.selectedChoice = null;
    state.decisions = [];
    state.evidence = [];
    state.metrics = initialMetrics();
    syncStore();
    renderCabinEvidence();
  }

  function prepareRound() {
    if (!state.roundScenarios.length || state.decisions.length >= 5) {
      state.roundScenarios = createRound(gameData);
      state.currentIndex = 0;
      state.selectedChoice = null;
      state.decisions = [];
      state.evidence = [];
      state.metrics = initialMetrics();
    }
    syncStore();
  }

  function renderMap() {
    document.querySelectorAll(".map-location").forEach(button => {
      button.classList.toggle("selected", button.dataset.location === state.selectedLocation);
    });
    const card = document.querySelector("#selectedLocationCard");
    card.querySelector("strong").textContent = state.selectedLocation;
  }

  function renderProgress() {
    const holder = document.querySelector("#trailProgress");
    holder.innerHTML = "";
    BEHAVIORS.forEach((behavior, index) => {
      const li = document.createElement("li");
      if (index < state.currentIndex) li.classList.add("complete");
      if (index === state.currentIndex) li.classList.add("current");
      const track = document.createElement("span");
      track.className = "track";
      track.textContent = index < state.currentIndex ? "✓" : META[behavior].motif;
      const text = document.createElement("span");
      text.textContent = META[behavior].label;
      li.append(track, text);
      holder.appendChild(li);
    });
  }

  function renderMetrics() {
    const values = [
      ["Forest Harmony", state.metrics.harmony],
      ["Clue Quality", state.metrics.clue],
      ["Human Happiness", state.metrics.happiness],
      ["Recognition Accuracy", state.metrics.accuracy],
      ["Stealth", state.metrics.stealth]
    ];
    document.querySelector("#forestSigns").innerHTML = values.map(([label, value]) =>
      `<div class="sign-row"><dt>${label}</dt><dd>${metricDescription(value)}</dd></div>`
    ).join("");
  }

  function renderEvidence() {
    const holder = document.querySelector("#liveEvidence");
    holder.innerHTML = state.evidence.length
      ? state.evidence.map(item => `<span class="evidence-token">${item.icon}</span>`).join("")
      : "<span>No useful clues yet.</span>";
    renderCabinEvidence();
  }

  function renderCabinEvidence() {
    const shelf = document.querySelector("#cabinEvidenceShelf");
    shelf.innerHTML = state.evidence.length
      ? state.evidence.map(item => `<span class="legend-artifact" title="${item.title}">${item.icon}</span>`).join("")
      : '<span class="empty-shelf">Nothing collected yet.</span>';
    const description = document.querySelector("#satchelDescription");
    description.textContent = state.evidence.length
      ? `${state.evidence.length} clues collected during today’s expedition.`
      : "No evidence collected yet.";
  }

  function renderSatchel() {
    const holder = document.querySelector("#satchelContents");
    holder.innerHTML = state.evidence.length
      ? state.evidence.map(item => `
        <div class="satchel-entry">
          <span class="evidence-token">${item.icon}</span>
          <div><strong>${item.title}</strong><br><span>${META[item.behavior].label}</span></div>
        </div>`).join("")
      : "<p>The satchel contains one tiny shoe catalog and no useful clues.</p>";
  }

  function renderScenario() {
    const scenario = state.roundScenarios[state.currentIndex];
    if (!scenario) {
      renderRoundComplete();
      showScreen("complete");
      return;
    }

    const meta = META[scenario.behavior];
    document.querySelector("#behaviorLabel").textContent =
      `Trail ${state.currentIndex + 1} of 5 · ${meta.label}`;
    document.querySelector("#scenarioTitle").textContent = scenario.title;
    document.querySelector("#scenarioLocation").textContent =
      `${LOCATIONS[(LOCATIONS.indexOf(state.selectedLocation) + state.currentIndex) % LOCATIONS.length]} · morning field entry`;
    document.querySelector("#roundStamp").textContent = `Day 1 · ${state.currentIndex + 1}/5`;
    document.querySelector("#behaviorRibbon").innerHTML = `<span>${meta.motif}</span><span>${meta.object}</span>`;
    document.querySelector("#scenarioImage").src = meta.image;
    document.querySelector("#scenarioImage").alt =
      `${meta.label} field-journal illustration for ${scenario.title}.`;
    document.querySelector("#scenarioObservation").textContent = choose(OBSERVATIONS);
    document.querySelector("#scenarioSetup").textContent = scenario.setup;
    document.querySelector("#behaviorMotif").textContent = meta.motif;
    document.querySelector("#behaviorPrompt").textContent = meta.prompt;
    document.querySelector("#rangerObservation").textContent = choose(RANGER_NOTES);

    const list = document.querySelector("#choiceList");
    list.innerHTML = "<legend>What evidence will you leave behind?</legend>";
    shuffled(scenario.choices).forEach((choice, index) => {
      const label = document.createElement("label");
      label.className = "choice-card";
      label.style.setProperty("--choice-tilt", `${index % 2 ? .35 : -.35}deg`);
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "recognition-choice";
      const text = document.createElement("span");
      text.textContent = choice.text;
      input.addEventListener("change", () => sealChoice(choice));
      label.append(input, text);
      list.appendChild(label);
    });

    document.querySelector("#sealedChoice").classList.add("hidden");
    document.querySelector("#nextScenario").classList.add("hidden");
    state.selectedChoice = null;
    renderProgress();
    renderEvidence();
    renderMetrics();
    syncStore();
  }

  function sealChoice(choice) {
    state.selectedChoice = clone(choice);
    bus.emit("fx:stamp");
    document.querySelectorAll('#choiceList input').forEach(input => input.disabled = true);
    document.querySelector("#sealedChoiceText").textContent = choice.text;
    document.querySelector("#sealedChoice").classList.remove("hidden");
    const nextButton = document.querySelector("#nextScenario");
    nextButton.classList.remove("hidden");
    nextButton.textContent = state.currentIndex === 4 ? "Seal the Final Entry" : "Follow the Next Trail";
  }

  function commitChoice() {
    if (!state.selectedChoice) return;
    const scenario = state.roundScenarios[state.currentIndex];
    const meta = META[scenario.behavior];
    const icon = EVIDENCE[(state.currentIndex + state.decisions.length) % EVIDENCE.length];
    const decision = {
      behavior: scenario.behavior,
      title: scenario.title,
      choice: state.selectedChoice.text,
      scores: [...state.selectedChoice.scores],
      consequence: state.selectedChoice.consequence,
      icon,
      location: LOCATIONS[(LOCATIONS.indexOf(state.selectedLocation) + state.currentIndex) % LOCATIONS.length]
    };

    state.decisions.push(decision);
    state.evidence.push({ icon, title: scenario.title, behavior: scenario.behavior });
    state.metrics = applyScores(state.metrics, decision.scores);
    state.selectedChoice = null;
    state.currentIndex += 1;
    document.querySelector("#cabinRule").textContent = choose(RULES);
    syncStore();
    bus.emit("gameplay:decision", clone(decision));

    if (state.currentIndex >= 5) {
      renderRoundComplete();
      showScreen("complete");
    } else {
      renderScenario();
    }
  }

  function renderRoundComplete() {
    const summary = document.querySelector("#decisionSummary");
    summary.innerHTML = state.decisions.map(decision => `
      <article class="decision-card">
        <h3>${META[decision.behavior].motif} ${decision.title}</h3>
        <p><strong>${decision.location}</strong></p>
        <p>${decision.choice}</p>
      </article>`).join("");
    renderCabinEvidence();
    syncStore();
  }

  restoreFromStore();
  renderCabinEvidence();

  document.querySelector("#openJournal").addEventListener("click", () => {
    prepareRound();
    renderMap();
    showScreen("map");
  });
  document.querySelector("#openMapCabin").addEventListener("click", () => {
    prepareRound();
    renderMap();
    showScreen("map");
  });
  document.querySelector("#openSatchel").addEventListener("click", () => {
    renderSatchel();
    document.querySelector("#satchelPanel").classList.add("open");
    document.querySelector("#satchelPanel").setAttribute("aria-hidden", "false");
    document.querySelector("#closeSatchel").focus();
  });
  document.querySelector("#closeSatchel").addEventListener("click", () => {
    document.querySelector("#satchelPanel").classList.remove("open");
    document.querySelector("#satchelPanel").setAttribute("aria-hidden", "true");
  });
  document.querySelectorAll(".map-location").forEach(button => {
    button.addEventListener("click", () => {
      state.selectedLocation = button.dataset.location;
      renderMap();
      syncStore();
    });
  });
  document.querySelector("#beginExpedition").addEventListener("click", () => {
    renderScenario();
    showScreen("gameplay");
  });
  document.querySelector("#nextScenario").addEventListener("click", commitChoice);
  document.querySelector("#returnMap").addEventListener("click", () => {
    renderMap();
    showScreen("map");
  });
  document.querySelectorAll(".local-return").forEach(button => {
    button.addEventListener("click", () => {
      renderCabinEvidence();
      showScreen("cabin");
    });
  });

  return { showScreen, resetRound, state };
}
