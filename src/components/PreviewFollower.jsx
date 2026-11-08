import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { tick } from "@/lib/ticker";
import { isReduced } from "@/lib/motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Hover previews for project rows: a 320×200 muted, looping clip that follows
// the cursor with a little lag and tilt.
//
// Files: public/previews/<slug>.webm, <slug>.mp4 and <slug>.jpg (poster).
// - Desktop mouse only (768px and up). Skipped entirely when Save-Data is on.
// - Nothing loads until a row is first hovered (preload="none").
// - Reduced motion: poster image only, no playback, no lag or tilt.
// - Leaving the row pauses the clip and unloads it.
// - A missing or broken file shows nothing, and is not retried.

const W = 320;
const H = 200;
const GAP = 24;
const base = (slug) => `/previews/${slug}`;

const saveData = () => Boolean(navigator.connection?.saveData);

export default function PreviewFollower({ container = "#work" }) {
  const enabled = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 768px)");
  const boxRef = useRef(null);
  const videoRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!enabled || saveData()) return;
    const root = document.querySelector(container);
    const box = boxRef.current;
    const video = videoRef.current;
    const img = imgRef.current;
    if (!root || !box || !video || !img) return;

    const missing = new Set(); // slugs whose files failed
    let current = null;
    let token = 0; // invalidates late load events after leaving a row
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let tilt = 0;
    let vw = window.innerWidth;
    let stopTick = null;

    const place = (x, y) => {
      const left = x + GAP + W > vw - 8 ? x - GAP - W : x + GAP;
      const top = y - GAP - H < 8 ? y + GAP : y - GAP - H;
      return { left, top };
    };

    const show = () => box.classList.add("is-visible");
    const hide = () => box.classList.remove("is-visible");

    const unload = () => {
      token += 1;
      hide();
      video.pause();
      video.removeAttribute("poster");
      video.replaceChildren();
      video.load(); // drops the buffered media
      img.removeAttribute("src");
      video.hidden = true;
      img.hidden = true;
      stopTick?.();
      stopTick = null;
    };

    const fail = (slug, t) => {
      if (t !== token) return;
      missing.add(slug);
      unload();
    };

    const start = (slug, x, y) => {
      if (missing.has(slug)) return;
      unload();
      current = slug;
      const t = token;
      const p = place(x, y);
      target.x = pos.x = p.left;
      target.y = pos.y = p.top;
      tilt = 0;
      box.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

      if (isReduced()) {
        img.hidden = false;
        img.onload = () => t === token && show();
        img.onerror = () => fail(slug, t);
        img.src = `${base(slug)}.jpg`;
      } else {
        video.hidden = false;
        video.poster = `${base(slug)}.jpg`;
        const sources = [
          ["webm", "video/webm"],
          ["mp4", "video/mp4"],
        ].map(([ext, type]) => {
          const s = document.createElement("source");
          s.src = `${base(slug)}.${ext}`;
          s.type = type;
          return s;
        });
        // Only the last source's error means every option failed.
        sources.at(-1).addEventListener("error", () => fail(slug, t), { once: true });
        video.append(...sources);
        video.onplaying = () => t === token && show();
        video.load();
        video.play().catch(() => {});
      }

      stopTick = tick((_, dt) => {
        if (isReduced()) {
          pos.x = target.x;
          pos.y = target.y;
          tilt = 0;
        } else {
          const k = 1 - Math.pow(1 - 0.15, dt / 16.7);
          const dx = (target.x - pos.x) * k;
          pos.x += dx;
          pos.y += (target.y - pos.y) * k;
          // Lean toward the direction of travel, up to 6 degrees.
          tilt += (Math.max(-6, Math.min(6, dx * 0.6)) - tilt) * 0.2;
        }
        box.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      });
    };

    const rowOf = (el) => el?.closest?.("[data-preview]");

    const onOver = (e) => {
      const row = rowOf(e.target);
      if (!row || row.dataset.preview === current) return;
      start(row.dataset.preview, e.clientX, e.clientY);
    };
    const onOut = (e) => {
      const from = rowOf(e.target);
      if (!from || rowOf(e.relatedTarget) === from) return;
      current = null;
      unload();
    };
    const onMove = (e) => {
      if (!current) return;
      const p = place(e.clientX, e.clientY);
      target.x = p.left;
      target.y = p.top;
    };
    const onResize = () => (vw = window.innerWidth);
    const onHidden = () => {
      if (document.hidden) {
        current = null;
        unload();
      }
    };

    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerout", onOut);
    root.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerout", onOut);
      root.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onHidden);
      unload();
    };
  }, [enabled, container]);

  if (!enabled) return null;
  return createPortal(
    <div ref={boxRef} className="preview-follower" aria-hidden="true">
      <video ref={videoRef} muted loop playsInline preload="none" disablePictureInPicture hidden width={W} height={H} />
      <img ref={imgRef} alt="" hidden width={W} height={H} />
    </div>,
    document.body
  );
}
