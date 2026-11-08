import { useEffect, useRef } from "react";
import { tick } from "@/lib/ticker";
import { isReduced } from "@/lib/motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// A small block caret that follows the mouse and grows into a label over
// elements marked data-cursor="…". Mouse only, 768px and up. Native cursor
// returns over form fields and while selecting text.

const NATIVE = "input, textarea, select, [contenteditable]";

export default function Cursor() {
  const enabled = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 768px)");
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    const label = el.querySelector("[data-label]");
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let visible = false;
    let selecting = false;
    let mouseDown = false;
    let current = "";

    const setVisible = (v) => {
      if (v === visible) return;
      visible = v;
      el.classList.toggle("is-visible", v);
    };

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible && !selecting) {
        pos.x = target.x;
        pos.y = target.y;
      }
      const t = e.target;
      const native = t.closest?.(NATIVE);
      setVisible(!native && !selecting);
      const host = t.closest?.("[data-cursor]");
      const text = host?.dataset.cursor || "";
      if (text !== current) {
        current = text;
        label.textContent = text;
        el.classList.toggle("has-label", Boolean(text));
      }
      el.classList.toggle("on-night", Boolean(t.closest?.(".on-night")));
    };

    const onLeave = () => setVisible(false);
    const onDown = () => (mouseDown = true);
    const onUp = () => {
      mouseDown = false;
      if (selecting) {
        selecting = false;
        root.classList.remove("native-cursor");
      }
    };
    const onSelection = () => {
      const sel = document.getSelection();
      if (mouseDown && sel && !sel.isCollapsed && !selecting) {
        selecting = true;
        root.classList.add("native-cursor");
        setVisible(false);
      }
    };

    const stop = tick((_, dt) => {
      const k = isReduced() ? 1 : 1 - Math.pow(1 - 0.2, dt / 16.7);
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    });

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("selectionchange", onSelection);

    return () => {
      stop();
      root.classList.remove("has-cursor", "native-cursor");
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("selectionchange", onSelection);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span className="cursor-body">
        <span data-label className="cursor-label" />
      </span>
    </div>
  );
}
