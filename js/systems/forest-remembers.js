const BEHAVIORS = ["notice", "specific", "fair", "earned", "personal"];

const META = {
  notice: { label: "Notice overlooked contributions", motif: "🔎" },
  specific: { label: "Make recognition specific", motif: "🏷️" },
  fair: { label: "Recognize fairly", motif: "⚖️" },
  earned: { label: "Keep recognition meaningful", motif: "🌲" },
  personal: { label: "Personalize recognition", motif: "✉️" }
};

const PROFILE_COPY = {
  notice: ["The Quiet-Work Tracker", "You notice preventive, supportive, and easily overlooked contributions."],
  specific: ["The Clear-Track Narrator", "You connect recognition to behavior and explain why it mattered."],
  fair: ["The Evidence Scout", "You follow contribution rather than status, familiarity, or visibility."],
  earned: ["The Keeper of the Golden Pinecone", "You keep meaningful recognition proportional and credible."],
  personal: ["The Human Naturalist", "You adapt appreciation to what each person values."]
};

const CULTURE_STAGES = [
  {
    rank: "Forest Intern",
    name: "One Quiet Act",
    description: "Recognition is still something Bigfoot must initiate.",
    linda: "Linda is certain Bigfoot exists and treats every leaf as evidence.",
    gary: "Gary remains confident that weather is responsible."
  },
  {
    rank: "Campfire Rumor",
    name: "The First Echo",
    description: "A ranger repeats one useful recognition behavior without prompting.",
    linda: "Linda has started labeling meaningful contributions before photographing them.",
    gary: "Gary admits the breeze may not understand employee engagement."
  },
  {
    rank: "Local Legend",
    name: "Shared Recognition",
    description: "Team members begin thanking one another by name.",
    linda: "Linda now looks for quiet helpers before looking for footprints.",
    gary: "Gary has stopped crediting squirrels for administrative improvements."
  },
  {
    rank: "Regional Mystery",
    name: "Culture in Motion",
    description: "Recognition spreads before Bigfoot can leave a clue.",
    linda: "Linda trains new rangers to notice preventive and supporting work.",
    gary: "Gary thanked a dispatcher without first checking whether anyone was watching."
  },
  {
    rank: "Bigfoot Emeritus",
    name: "The Forest Remembers",
    description: "The culture sustains itself. Bigfoot is no longer the only source of recognition.",
    linda: "Linda understands the tracks were never the most important evidence.",
    gary: "Gary has filed a revised report: 'Possibly Bigfoot. Definitely better leadership.'"
  }
];

const LEGEND_DESCRIPTIONS = {
  notice: "The person whose work prevented a problem before anyone saw it.",
  specific: "The helper whose exact behavior became a model others could repeat.",
  fair: "The quiet contributor who finally received credit instead of the spotlight holder.",
  earned: "The contribution that made the Golden Pinecone mean something.",
  personal: "The person who was recognized in a way that actually mattered to them."
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function decisionQuality(decision) {
  return decision.scores.reduce((sum, value) => sum + value, 0) / 18;
}

function stageFromState(state) {
  const completed = state.completedRounds || 0;
  const memory = state.forestMemory || 0;
  if (completed >= 5 && memory >= 18) return 4;
  if (completed >= 4 && memory >= 12) return 3;
  if (completed >= 2 && memory >= 6) return 2;
  if (completed >= 1) return 1;
  return 0;
}

function bestBehavior(totals) {
  return BEHAVIORS.slice().sort((a,b)=>(totals[b]||0)-(totals[a]||0))[0];
}

export function createProgressionSystem({ store, router, bus, gameplay }) {
  const defaults = {
    completedRounds: 0,
    forestMemory: 0,
    quietLegends: [],
    behaviorTotals: { notice:0, specific:0, fair:0, earned:0, personal:0 },
    unlockedMemories: [],
    endingUnlocked: false
  };

  let progression = { ...defaults, ...(store.getState().progression || {}) };
  progression.behaviorTotals = {
    ...defaults.behaviorTotals,
    ...(progression.behaviorTotals || {})
  };

  const constellationScreen = document.querySelector("#constellationScreen");
  const endingScreen = document.querySelector("#endingScreen");

  function save() {
    store.update({ progression: clone(progression) });
  }

  function currentStage() {
    return stageFromState(progression);
  }

  function updateCabin() {
    const stage = currentStage();
    const stageInfo = CULTURE_STAGES[stage];
    document.querySelector("#forestWindowImage").src =
      `assets/illustrations/environments/forest-stage-${stage}.jpg`;
    document.querySelector("#weatherNote").textContent =
      ["Early Spring · light fog","Late Spring · birds returning","Summer · warm trail light","Autumn · lantern evenings","Early Spring · new growth"][stage];
    document.querySelector("#legendRank").textContent = stageInfo.rank;

    const shelf = document.querySelector("#cabinEvidenceShelf");
    shelf.innerHTML = progression.quietLegends.length
      ? progression.quietLegends.slice(-7).map(legend =>
          `<span class="legend-artifact" title="${legend.title}">${META[legend.behavior].motif}</span>`
        ).join("")
      : '<span class="empty-shelf">Nothing collected yet.</span>';
  }

  function completeRound(payload) {
    const decisions = payload?.decisions || gameplay.state.decisions || [];
    const score = payload?.score ?? average(decisions.map(decisionQuality));
    progression.completedRounds += 1;
    progression.forestMemory += decisions.filter(d => decisionQuality(d) >= .68).length;

    decisions.forEach(decision => {
      progression.behaviorTotals[decision.behavior] += decision.scores.reduce((sum,v)=>sum+v,0);
    });

    const best = decisions.slice().sort((a,b)=>decisionQuality(b)-decisionQuality(a))[0];
    if (best) {
      progression.quietLegends.push({
        behavior: best.behavior,
        title: best.title,
        description: LEGEND_DESCRIPTIONS[best.behavior],
        round: progression.completedRounds
      });
    }

    const stage = currentStage();
    progression.unlockedMemories = Array.from({length:stage+1},(_,i)=>i);
    if (progression.completedRounds >= 5) progression.endingUnlocked = true;
    save();
    updateCabin();
  }

  function renderConstellation() {
    const stage = currentStage();
    const stageInfo = CULTURE_STAGES[stage];
    document.querySelector("#constellationSummary").textContent =
      `${progression.completedRounds} expedition${progression.completedRounds===1?"":"s"} completed. ${progression.forestMemory} recognition echoes recorded.`;
    document.querySelector("#cultureStage").innerHTML = `
      <div class="culture-stage-card">
        <strong>${stageInfo.name}</strong>
        <p>${stageInfo.description}</p>
      </div>`;
    document.querySelector("#lindaEvolution").textContent = `Linda: ${stageInfo.linda}`;
    document.querySelector("#garyEvolution").textContent = `Gary: ${stageInfo.gary}`;

    const network = document.querySelector("#memoryNetwork");
    const nodes = [
      {x:50,y:50,cls:"center",title:"The Forest",text:stageInfo.name},
      {x:18,y:20,title:"Notice",text:"Quiet work becomes visible",behavior:"notice"},
      {x:82,y:18,title:"Specific",text:"Useful behavior gets repeated",behavior:"specific"},
      {x:18,y:78,title:"Fair",text:"Credit follows contribution",behavior:"fair"},
      {x:82,y:80,title:"Earned",text:"Recognition remains credible",behavior:"earned"},
      {x:50,y:90,title:"Personal",text:"Appreciation fits the person",behavior:"personal"}
    ];
    network.innerHTML = nodes.map((node,index)=>{
      const unlocked = index===0 || progression.behaviorTotals[node.behavior] > 0;
      return `<article class="memory-node ${node.cls||""} ${unlocked?"":"locked"}"
        style="left:${node.x}%;top:${node.y}%;--node-tilt:${index%2?.7:-.7}deg">
        <strong>${node.behavior?META[node.behavior].motif:"🌲"} ${node.title}</strong>
        <span>${unlocked?node.text:"Complete an expedition to reveal this connection."}</span>
      </article>`;
    }).join("");

    const legends = document.querySelector("#quietLegendsList");
    legends.innerHTML = progression.quietLegends.length
      ? progression.quietLegends.map(legend=>`
        <div class="quiet-legend-entry">
          <span class="legend-icon">${META[legend.behavior].motif}</span>
          <div><strong>${legend.title}</strong><p>${legend.description}</p></div>
        </div>`).join("")
      : "<p>No Quiet Legends collected yet.</p>";
  }

  function showOnly(screen) {
    const name=screen.id.replace("Screen","");
    bus.emit("transition", {
      text: name==="ending" ? "Turning to the final page" : "Following the thread",
      callback:()=>{
        document.querySelectorAll(".game-screen").forEach(el=>el.classList.add("hidden"));
        screen.classList.remove("hidden");
        router.go(name);
        bus.emit("screen:changed",name);
        window.scrollTo({top:0,behavior:"smooth"});
      }
    });
  }

  function openConstellation() {
    renderConstellation();
    showOnly(constellationScreen);
  }

  function renderEnding() {
    const stage = currentStage();
    const totals = progression.behaviorTotals;
    const best = bestBehavior(totals);
    const [profileTitle,profileText] = PROFILE_COPY[best];
    const secret = progression.completedRounds >= 5 && progression.forestMemory >= 18;
    const success = progression.completedRounds >= 5 && progression.forestMemory >= 10;

    if (secret) {
      document.querySelector("#endingTitle").textContent = "The Forest That Learned to Notice";
      document.querySelector("#endingImage").src = "assets/illustrations/environments/ending-forest-remembers.jpg";
      document.querySelector("#endingImage").alt = "Bigfoot watches through the trees as rangers recognize a volunteer without his intervention.";
      document.querySelector("#endingText").textContent =
        "Years later, you watch from the trees as a new ranger thanks a volunteer before you can leave a clue. The culture sustains itself now. You shoulder your pack, tighten your tiny boots, and walk toward another forest.";
      document.querySelector("#endingQuote").textContent =
        "Gary: “Linda... I think you were right.”";
    } else if (success) {
      document.querySelector("#endingTitle").textContent = "Legend of the Pines";
      document.querySelector("#endingImage").src = "assets/illustrations/environments/ending-legend-pines.jpg";
      document.querySelector("#endingImage").alt = "A forest monument honors the unknown guardian who quietly cared for the park.";
      document.querySelector("#endingText").textContent =
        "The rangers unveil a monument with no portrait and no name, only enormous footprints leading toward the trees. The park now notices overlooked contributions, even if nobody knows who taught them.";
      document.querySelector("#endingQuote").textContent =
        "“To whoever quietly took care of this forest.”";
    } else {
      document.querySelector("#endingTitle").textContent = "The Forest of Missed Opportunities";
      document.querySelector("#endingImage").src = "assets/illustrations/environments/ending-missed-opportunities.jpg";
      document.querySelector("#endingImage").alt = "A wrinkled newspaper wrongly credits excellent vibes for helpful work.";
      document.querySelector("#endingText").textContent =
        "Helpful work occurred, but broad clues, visible favorites, and oversized praise kept the park from learning who truly made the difference. The newspaper credits weather, moss, and excellent vibes.";
      document.querySelector("#endingQuote").textContent =
        "Linda: “Bigfoot is having a complicated season.”";
    }

    document.querySelector("#profileTitle").textContent = profileTitle;
    document.querySelector("#profileText").textContent = profileText;
    document.querySelector("#profileBreakdown").innerHTML = BEHAVIORS.map(behavior=>`
      <div class="profile-row">
        <strong>${META[behavior].motif} ${META[behavior].label}</strong>
        <span>${totals[behavior]||0} evidence points</span>
      </div>`).join("");
    document.querySelector("#endingArtifacts").innerHTML =
      progression.quietLegends.slice(-8).map(legend=>`<span class="ending-artifact">${META[legend.behavior].motif}</span>`).join("");

    showOnly(endingScreen);
  }

  function maybeOpenEnding() {
    if (progression.endingUnlocked) {
      renderEnding();
      return true;
    }
    return false;
  }

  function resetJourney() {
    progression = clone(defaults);
    save();
    updateCabin();
    gameplay.state.roundScenarios = [];
    gameplay.state.currentIndex = 0;
    gameplay.state.decisions = [];
    gameplay.state.evidence = [];
    gameplay.state.selectedChoice = null;
    gameplay.showScreen("cabin");
  }

  document.querySelector("#openConstellation").addEventListener("click", openConstellation);
  document.querySelector("#restartJourney").addEventListener("click", resetJourney);

  bus.on("round:completed", completeRound);
  bus.on("ending:requested", renderEnding);

  updateCabin();

  return {
    currentStage,
    completeRound,
    openConstellation,
    renderEnding,
    maybeOpenEnding,
    getState:()=>clone(progression)
  };
}
