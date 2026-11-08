import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { tick } from "./ticker";
import { isReduced, subscribeReduced } from "./motion";

// Space the floating nav takes at the top (16px gap + 60px bar + breathing room).
export const NAV_OFFSET = 96;

let lenis = null;
let stopTick = null;
let scrollY = typeof window !== "undefined" ? window.scrollY : 0;
let docMax = 1;
let viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
const listeners = new Set();

// Scroll position is pushed in by events; nothing here reads layout on scroll.
function setY(y) {
  scrollY = y;
  listeners.forEach((fn) => fn(y));
}
const onNativeScroll = () => setY(window.scrollY);

export const getScroll = () => ({ y: scrollY, max: docMax, vh: viewportH });

// Subscribe to scroll position changes (called from scroll events, so keep it cheap:
// store the value and do the work in a ticker callback).
export function onScroll(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function measure() {
  viewportH = window.innerHeight;
  docMax = Math.max(1, document.documentElement.scrollHeight - viewportH);
}

function startLenis() {
  if (lenis) return;
  lenis = new Lenis({ autoRaf: false, lerp: 0.1, anchors: false });
  lenis.on("scroll", (l) => setY(l.scroll));
  stopTick = tick((time) => lenis?.raf(time));
}

function stopLenis() {
  stopTick?.();
  stopTick = null;
  lenis?.destroy();
  lenis = null;
}

let started = false;
export function initScroll() {
  if (started) return;
  started = true;
  window.addEventListener("scroll", onNativeScroll, { passive: true });
  const ro = new ResizeObserver(measure);
  ro.observe(document.documentElement);
  window.addEventListener("resize", measure);
  measure();
  if (!isReduced()) startLenis();
  subscribeReduced(() => (isReduced() ? stopLenis() : startLenis()));
  document.addEventListener("click", onAnchorClick);
}

// Pause / resume page scrolling (menu, command palette).
export function lockScroll() {
  lenis?.stop();
  document.documentElement.style.overflow = "hidden";
}
export function unlockScroll() {
  document.documentElement.style.overflow = "";
  lenis?.start();
}

export function scrollToElement(el, { immediate = false } = {}) {
  const top = el.id === "top" ? 0 : el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  if (lenis && !immediate) lenis.scrollTo(top, { force: true });
  else {
    lenis?.scrollTo(top, { immediate: true, force: true });
    window.scrollTo(0, top);
  }
  // Move focus for keyboard and screen reader users without a second jump.
  if (el.id !== "top") {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }
}

// Same-page anchors (#work, /#work) go through here so the nav offset and
// smooth scrolling apply. Other links are left alone.
function onAnchorClick(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest?.("a[href]");
  if (!a || a.target === "_blank") return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
  const id = decodeURIComponent(url.hash.slice(1));
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  history.replaceState(null, "", id === "top" ? location.pathname : `#${id}`);
  // Let any closing overlay (menu) release the page first.
  requestAnimationFrame(() => scrollToElement(el));
}
