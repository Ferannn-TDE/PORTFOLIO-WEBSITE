// Minimal toast store: one message at a time, auto-dismissed.
const listeners = new Set();
let current = null;
let timer = 0;
let seq = 0;

export function toast(message, { duration = 2200 } = {}) {
  clearTimeout(timer);
  current = { id: ++seq, message };
  listeners.forEach((fn) => fn(current));
  timer = setTimeout(() => {
    current = null;
    listeners.forEach((fn) => fn(current));
  }, duration);
}

export function subscribeToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const getToast = () => current;
