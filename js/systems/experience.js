export function createExperienceSystem({ store, bus, audio }) {
  const layer=document.querySelector("#transitionLayer");
  const caption=document.querySelector("#transitionCaption");
  let motion=store.getState().settings?.motion !== false;

  function setMotion(next) {
    motion=Boolean(next);
    document.body.classList.toggle("motion-off",!motion);
    const settings={...(store.getState().settings||{}),motion};
    store.update({settings});
  }

  function transition(text, callback) {
    if (!motion) {
      callback?.();
      return;
    }
    caption.textContent=text||"Turning the page";
    layer.classList.remove("active");
    void layer.offsetWidth;
    layer.classList.add("active");
    audio?.play("page");
    window.setTimeout(()=>callback?.(),330);
    window.setTimeout(()=>layer.classList.remove("active"),820);
  }

  function tactilePress(element) {
    if (!element || !motion) return;
    element.classList.remove("is-pressing");
    void element.offsetWidth;
    element.classList.add("is-pressing");
    window.setTimeout(()=>element.classList.remove("is-pressing"),260);
  }

  function discoverNote() {
    const note=document.querySelector("#quietDiscovery");
    if (!note) return;
    note.classList.add("discovered");
    note.querySelector(".discovery-paper").textContent =
      "Linda almost photographed my elbow again. Need quieter pinecones.";
    bus.emit("fx:pin");
    store.update({quietDiscoveryFound:true});
  }

  document.querySelectorAll(".cabin-object").forEach(object=>{
    object.addEventListener("pointerdown",()=>tactilePress(object));
  });

  document.querySelector("#quietDiscovery")?.addEventListener("click",discoverNote);

  bus.on("transition",({text,callback}={})=>transition(text,callback));
  bus.on("screen:changed",screen=>{
    document.body.dataset.activeScreen=screen;
  });

  setMotion(motion);
  if (store.getState().quietDiscoveryFound) discoverNote();

  return {transition,setMotion,isMotionEnabled:()=>motion};
}
