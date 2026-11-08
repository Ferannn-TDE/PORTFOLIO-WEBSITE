// One requestAnimationFrame loop for every per-frame effect (Lenis, cursor,
// scroll-linked effects). It only runs while something is subscribed.

const subs = new Set();
let raf = 0;
let last = 0;

function frame(time) {
  const dt = last ? Math.min(time - last, 100) : 16.7;
  last = time;
  subs.forEach((fn) => fn(time, dt));
  raf = subs.size ? requestAnimationFrame(frame) : 0;
  if (!raf) last = 0;
}

export function tick(fn) {
  subs.add(fn);
  if (!raf) raf = requestAnimationFrame(frame);
  return () => subs.delete(fn);
}
