const SOUND_IDS = {
  cabin: "audioCabin",
  forest: "audioForest",
  page: "audioPage",
  drawer: "audioDrawer",
  stamp: "audioStamp",
  pin: "audioPin",
  kettle: "audioKettle"
};

export function createAudioSystem({ store, bus }) {
  const audio = Object.fromEntries(
    Object.entries(SOUND_IDS).map(([key,id])=>[key,document.getElementById(id)])
  );
  let enabled = store.getState().settings?.sound !== false;
  let ambientKey = null;
  let userActivated = false;

  Object.values(audio).forEach(element => {
    if (!element) return;
    element.volume = element.loop ? .24 : .48;
  });

  function safePlay(element, restart=true) {
    if (!enabled || !element) return;
    if (restart && !element.loop) element.currentTime = 0;
    const promise = element.play();
    promise?.catch(()=>{});
  }

  function play(key) {
    safePlay(audio[key]);
  }

  function stop(key) {
    const element=audio[key];
    if (!element) return;
    element.pause();
    if (!element.loop) element.currentTime=0;
  }

  function setAmbient(key) {
    ambientKey=key;
    ["cabin","forest"].forEach(name=>{
      if (name===key && enabled && userActivated) safePlay(audio[name],false);
      else stop(name);
    });
  }

  function setEnabled(next) {
    enabled=Boolean(next);
    const settings={...(store.getState().settings||{}),sound:enabled};
    store.update({settings});
    if (!enabled) {
      Object.keys(audio).forEach(stop);
    } else if (ambientKey && userActivated) {
      setAmbient(ambientKey);
    }
  }

  function activate() {
    if (userActivated) return;
    userActivated=true;
    if (ambientKey && enabled) setAmbient(ambientKey);
  }

  document.addEventListener("pointerdown",activate,{once:true});
  document.addEventListener("keydown",activate,{once:true});

  bus.on("screen:changed",screen=>{
    setAmbient(screen==="cabin" ? "cabin" : "forest");
  });
  bus.on("fx:page",()=>play("page"));
  bus.on("fx:drawer",()=>play("drawer"));
  bus.on("fx:stamp",()=>play("stamp"));
  bus.on("fx:pin",()=>play("pin"));
  bus.on("fx:kettle",()=>play("kettle"));

  return {
    play,
    stop,
    setAmbient,
    setEnabled,
    isEnabled:()=>enabled
  };
}
