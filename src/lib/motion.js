import { useSyncExternalStore } from "react";

// Reduced motion = the OS setting, or a per-session override (command palette).
// index.html applies the `reduce-motion` class before first paint; this module
// keeps it in sync afterwards. CSS keys off the class, not the media query.

const KEY = "fo:reduce-motion";
const mql = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
const listeners = new Set();

function readOverride() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

let override = readOverride();
let reduced = Boolean(mql?.matches) || override;

function apply() {
  const next = Boolean(mql?.matches) || override;
  if (next === reduced) return;
  reduced = next;
  document.documentElement.classList.toggle("reduce-motion", reduced);
  listeners.forEach((fn) => fn());
}

mql?.addEventListener("change", apply);

export const isReduced = () => reduced;
export const isOverridden = () => override;

export function setReducedOverride(on) {
  override = on;
  try {
    if (on) sessionStorage.setItem(KEY, "1");
    else sessionStorage.removeItem(KEY);
  } catch {
    // storage blocked: the override still holds for this page view
  }
  apply();
}

export function subscribeReduced(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const useReducedMotion = () => useSyncExternalStore(subscribeReduced, isReduced, () => false);

// ---- intro ------------------------------------------------------------------
// index.html adds `intro` to <html> when the boot overlay should play.
// Intro.jsx dispatches these events; consumers subscribe here.

export const INTRO_LIFT = "fo:intro-lift"; // overlay starts sliding up
export const INTRO_DONE = "fo:intro-done"; // overlay gone

export const introPlaying = () => document.documentElement.classList.contains("intro");

// Calls `fn` when the intro finishes, or on the next tick if no intro is playing.
// Also fires again whenever the intro is replayed. Returns an unsubscribe.
export function onIntroDone(fn) {
  let timer = 0;
  if (!introPlaying()) timer = setTimeout(fn, 0);
  window.addEventListener(INTRO_DONE, fn);
  return () => {
    clearTimeout(timer);
    window.removeEventListener(INTRO_DONE, fn);
  };
}
