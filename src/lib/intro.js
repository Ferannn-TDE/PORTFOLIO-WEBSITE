import { INTRO_DONE, INTRO_LIFT, introPlaying } from "@/lib/motion";

// Drives the static boot overlay from index.html: fills in the real start-up
// time, reports lift/done, and can replay it (monogram click).

const boot = () => document.getElementById("boot");
let mountMs = null;
let watchId = 0; // only the latest watcher may report

function watch() {
  const el = boot();
  if (!el || !introPlaying()) return () => {};
  const id = ++watchId;
  let finished = false;

  const lift = () => id === watchId && window.dispatchEvent(new Event(INTRO_LIFT));
  const done = () => {
    if (finished || id !== watchId) return;
    finished = true;
    document.documentElement.classList.remove("intro");
    try {
      sessionStorage.setItem("fo:intro", "1");
    } catch {
      // storage blocked: the intro may play again next load, which is harmless
    }
    window.dispatchEvent(new Event(INTRO_DONE));
  };

  const anim = el.getAnimations().find((a) => a.animationName === "boot-lift");
  const onStart = (e) => e.animationName === "boot-lift" && lift();
  el.addEventListener("animationstart", onStart);

  if (anim) {
    // Already past the lift delay when JS arrived: start the follow-ups now.
    if (anim.currentTime !== null && anim.currentTime >= 1700) lift();
    anim.finished.then(done, done);
  }
  // Safety net in case the animation is missing or cancelled.
  const fallback = setTimeout(done, 3200);

  return () => {
    el.removeEventListener("animationstart", onStart);
    clearTimeout(fallback);
  };
}

let unwatch = () => {};

export function startIntroWatch() {
  if (mountMs === null) {
    mountMs = Math.max(1, Math.round(performance.now() - (window.__foT0 ?? 0)));
    const out = document.getElementById("boot-ms");
    if (out) out.textContent = String(mountMs);
  }
  unwatch = watch();
  return () => unwatch();
}

export function replayIntro() {
  const el = boot();
  if (!el) return false;
  unwatch();
  const root = document.documentElement;
  root.classList.remove("intro");
  void el.offsetWidth; // restart the CSS animations
  root.classList.add("intro");
  unwatch = watch();
  return true;
}

