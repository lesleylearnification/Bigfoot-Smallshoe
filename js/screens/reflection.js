const BEHAVIORS = ["notice", "specific", "fair", "earned", "personal"];

const META = {
  notice: { label: "Notice overlooked contributions", motif: "🔎" },
  specific: { label: "Make recognition specific", motif: "🏷️" },
  fair: { label: "Recognize fairly", motif: "⚖️" },
  earned: { label: "Keep recognition meaningful", motif: "🌲" },
  personal: { label: "Personalize recognition", motif: "✉️" }
};

const REFLECTIONS = [
  ["Bigfoot’s Tea Journal", "The kettle is warm. Rate your own trail before the expert path is revealed."],
  ["The Ranger’s Notebook", "Reconstruct the day from the clues, then compare your judgment with the expert benchmark."],
  ["The Forest Remembers", "The forest has recorded the consequences. Begin with your own assessment."],
  ["Campfire Stories", "The humans are retelling the day with confidence and limited accuracy. Check your trail first."],
  ["Evening Field Notes", "Quiet leaders reflect before they explain. Rate each choice before opening the expert note."]
];

const MARKERS = [
  "look for a contribution I normally miss",
  "name the behavior and explain why it mattered",
  "check whose work has been less visible",
  "match recognition to the level of contribution",
  "ask someone how they prefer to be recognized"
];

const GOOD_HEADLINES = [
  "Unknown Forest Hero Helps Park Notice Quiet Work",
  "Rangers Follow Evidence Instead of Spotlight",
  "Mysterious Guardian Improves Morale, Avoids Publicity",
  "Park Finally Thanks the People Keeping Everything Together"
];

const MIXED_HEADLINES = [
  "Park Credits Helpful Moss for Improved Morale",
  "Bridge Repaired by Strong Breeze; Volunteer Still Waiting",
  "Beavers Receive Third Unrelated Employee Award",
  "Rangers Praise Teamwork, Accidentally Thank Podium"
];

function choose(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function quality(decision) {
  return decision.scores.reduce((sum, value) => sum + value, 0) / 18;
}

function expertFootprints(decision) {
  return Math.max(1, Math.min(5, Math.round(quality(decision) * 5)));
}

function roundQuality(decisions) {
  if (!decisions.length) return 0;
  return decisions.reduce((sum, decision) => sum + quality(decision), 0) / decisions.length;
}

function qualityLabel(value) {
  if (value >= .82) return "Expert-aligned";
  if (value >= .66) return "Strong judgment";
  if (value >= .5) return "Promising trail";
  if (value >= .34) return "Mixed evidence";
  return "Recognition missed";
}

export function mountReflection({ store, router, bus, gameplay, gameData }) {
  const reflectionScreen = document.querySelector("#reflectionScreen");
  const reportScreen = document.querySelector("#rangerReportScreen");
  const completeScreen = document.querySelector("#roundCompleteScreen");
  const cabinScreen = document.querySelector("#cabinScreen");

  const selfRatings = {};
  let marker = "";

  function showOnly(screen) {
    const name=screen.id.replace("Screen", "").replace("rangerReport", "report");
    bus.emit("transition", {
      text:name==="reflection" ? "Brewing tea" : "Opening the Ranger Report",
      callback:()=>{
        [cabinScreen, document.querySelector("#mapScreen"), document.querySelector("#gameplayScreen"),
         completeScreen, reflectionScreen, reportScreen, document.querySelector("#cabinetScreen"),
         document.querySelector("#constellationScreen"), document.querySelector("#endingScreen")].forEach(element => {
          element.classList.add("hidden");
        });
        screen.classList.remove("hidden");
        router.go(name);
        bus.emit("screen:changed",name);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  function getDecisions() {
    return gameplay.state.decisions || [];
  }

  function renderRoundMemory() {
    const holder = document.querySelector("#roundMemory");
    holder.innerHTML = getDecisions().map(decision => `
      <article class="round-memory-entry">
        <strong>${META[decision.behavior].motif} ${decision.title}</strong>
        <span>${decision.location}</span>
      </article>`).join("");
  }

  function renderReflectionCards() {
    const holder = document.querySelector("#reflectionCards");
    holder.innerHTML = "";
    Object.keys(selfRatings).forEach(key => delete selfRatings[key]);

    getDecisions().forEach((decision, index) => {
      const expert = gameData.expertCards[decision.behavior];
      const benchmark = expertFootprints(decision);
      const card = document.createElement("article");
      card.className = "reflection-card";
      card.style.setProperty("--reflection-tilt", `${index % 2 ? .35 : -.35}deg`);
      card.innerHTML = `
        <p class="chapter-label">${META[decision.behavior].motif} ${META[decision.behavior].label}</p>
        <h2>${decision.title}</h2>
        <p><strong>Your sealed choice:</strong> ${decision.choice}</p>
        <blockquote>“${expert.quote}”</blockquote>
        <p class="source-line"><strong><a href="${expert.url}" target="_blank" rel="noopener">${expert.source}</a></strong></p>
        <p>${expert.standard}</p>
        <div class="trail-compare">
          <section class="trail-box">
            <strong>My Trail</strong>
            <p>How closely did your judgment match the expert standard?</p>
            <div class="footprint-rating" data-behavior="${decision.behavior}"></div>
          </section>
          <section class="trail-box">
            <strong>Expert Trail</strong>
            <p id="expert-label-${decision.behavior}">Rate your trail first.</p>
            <div id="expert-summary-${decision.behavior}" class="expert-summary hidden">
              <strong>${benchmark} of 5 footprints · ${qualityLabel(quality(decision))}</strong>
              <p>${decision.consequence}</p>
            </div>
          </section>
        </div>
        <button class="secondary-action open-research" data-behavior="${decision.behavior}" type="button">
          Open This Cabinet Drawer
        </button>`;

      const rating = card.querySelector(".footprint-rating");
      for (let value = 1; value <= 5; value += 1) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "footprint-button";
        button.textContent = "👣";
        button.setAttribute("aria-label", `${value} out of 5 footprints`);
        button.addEventListener("click", () => rateTrail(decision.behavior, value, rating, benchmark));
        rating.appendChild(button);
      }

      holder.appendChild(card);
      card.querySelector(".open-research").addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent("cabinet:open", {
          detail: { behavior: decision.behavior }
        }));
      });
    });
  }

  function rateTrail(behavior, value, ratingHolder, benchmark) {
    selfRatings[behavior] = value;
    [...ratingHolder.children].forEach((button, index) => {
      button.classList.toggle("selected", index < value);
      button.classList.toggle("stamping", index === value - 1);
      if (index === value - 1) {
        window.setTimeout(() => button.classList.remove("stamping"), 380);
      }
    });
    bus.emit("fx:stamp");
    document.querySelector(`#expert-label-${behavior}`).textContent =
      `${"👣".repeat(benchmark)}${"○".repeat(5 - benchmark)}`;
    document.querySelector(`#expert-summary-${behavior}`).classList.remove("hidden");

    const count = Object.keys(selfRatings).length;
    document.querySelector("#reflectionProgress").textContent =
      count === 5 ? "All five trails rated. The Ranger Report is ready." : `${count} of 5 trails rated.`;
    document.querySelector("#finishReflection").classList.toggle("hidden", count !== 5);

    store.update({
      reflection: {
        selfRatings: { ...selfRatings }
      }
    });
  }

  function beginReflection() {
    bus.emit("fx:kettle");
    const [mode, intro] = choose(REFLECTIONS);
    document.querySelector("#reflectionMode").textContent = mode;
    document.querySelector("#reflectionIntro").textContent = intro;
    document.querySelector("#reflectionProgress").textContent = "Rate all five trails to continue.";
    document.querySelector("#finishReflection").classList.add("hidden");
    renderRoundMemory();
    renderReflectionCards();
    showOnly(reflectionScreen);
  }

  function renderOutcomeBreakdown() {
    const holder = document.querySelector("#outcomeBreakdown");
    holder.innerHTML = getDecisions().map(decision => `
      <div class="outcome-row">
        <span class="icon">${META[decision.behavior].motif}</span>
        <div><strong>${META[decision.behavior].label}</strong><span>${decision.title}</span></div>
        <span class="result">${qualityLabel(quality(decision))}</span>
      </div>`).join("");
  }

  function renderMarkers() {
    const holder = document.querySelector("#markerOptions");
    holder.innerHTML = "";
    marker = "";
    document.querySelector("#finishRound").disabled = true;

    MARKERS.forEach(text => {
      const label = document.createElement("label");
      label.className = "marker-option";
      label.innerHTML = `<input type="radio" name="next-marker" value="${text}"><span>${text}</span>`;
      label.querySelector("input").addEventListener("change", () => {
        marker = text;
        document.querySelector("#finishRound").disabled = false;
      });
      holder.appendChild(label);
    });
  }

  function openReport() {
    const decisions = getDecisions();
    const score = roundQuality(decisions);
    const good = score >= .66;

    document.querySelector("#reportSubhead").textContent =
      `${decisions.length} trail entries reviewed · ${qualityLabel(score)}`;
    document.querySelector("#headline").textContent = choose(good ? GOOD_HEADLINES : MIXED_HEADLINES);
    document.querySelector("#reportStory").textContent = good
      ? "Across five decisions, your clues helped the rangers connect useful work with the people who performed it. Prevention, quiet support, fair credit, proportional recognition, and personal preference became more visible."
      : "You helped the forest, but several clues were broad, delayed, oversized, or attached to the most visible person rather than the most useful contribution. The ranger station remains grateful and confused.";
    document.querySelector("#lindaQuote").textContent = good
      ? "Linda: “The tracks are teaching us how to notice people.”"
      : "Linda: “It is still Bigfoot. Bigfoot is just having a complicated week.”";
    document.querySelector("#garyQuote").textContent = good
      ? "Gary has upgraded Bigfoot from impossible to administratively inconvenient."
      : "Gary has filed the incident under excellent vibes.";
    document.querySelector("#forestMoment").textContent = good
      ? "Later that evening, a ranger thanks a volunteer by name. The volunteer returns the next morning with two friends."
      : "Later that evening, the volunteer walks past the bulletin board without finding their name.";

    renderOutcomeBreakdown();
    renderMarkers();
    showOnly(reportScreen);
    bus.emit("reflection:complete", {
      selfRatings: { ...selfRatings },
      score
    });
  }

  function finishRound() {
    if (!marker) return;
    const decisions = getDecisions();
    const score = roundQuality(decisions);
    document.querySelector("#cabinRule").textContent = `On the next expedition, I will ${marker}.`;
    store.update({
      playerCommitment: marker,
      lastRound: {
        decisions,
        selfRatings: { ...selfRatings },
        score
      }
    });

    bus.emit("fx:pin");
        bus.emit("round:completed", { decisions, score, marker });

    gameplay.state.roundScenarios = [];
    gameplay.state.currentIndex = 0;
    gameplay.state.decisions = [];
    gameplay.state.evidence = [];
    gameplay.state.selectedChoice = null;
    gameplay.state.metrics = {
      harmony: 50,
      clue: 50,
      happiness: 50,
      accuracy: 50,
      stealth: 100
    };

    const completed = (store.getState().progression?.completedRounds || 0);
    if (completed >= 5) {
      bus.emit("ending:requested");
    } else {
      gameplay.showScreen("cabin");
    }
  }

  document.querySelector("#beginReflection").addEventListener("click", beginReflection);
  document.querySelector("#finishReflection").addEventListener("click", openReport);
  document.querySelector("#finishRound").addEventListener("click", finishRound);

  return { beginReflection, openReport };
}
