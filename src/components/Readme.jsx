import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const EDGE = 16;
const GAP = 14;

// Places the card under (or above) the trigger line the pointer is on,
// clamped inside the viewport. Coordinates are document-relative, so the card
// scrolls with the page without any per-frame work.
function place(trigger, card, pointerY) {
  const rects = [...trigger.getClientRects()];
  const line =
    (pointerY != null && rects.find((r) => pointerY >= r.top && pointerY <= r.bottom)) || rects[0] || trigger.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const w = card.offsetWidth;
  const h = card.offsetHeight;
  const left = Math.min(Math.max(EDGE, line.left), vw - EDGE - w);
  const below = line.bottom + GAP + h <= vh - EDGE || line.top - GAP - h < EDGE;
  const top = below ? line.bottom + GAP : line.top - GAP - h;
  return {
    left: left + window.scrollX,
    top: top + window.scrollY,
    origin: `${Math.round(line.left - left)}px ${below ? "0" : "100%"}`,
  };
}

function Peek({ href, word, file, touch, children }) {
  const id = useId();
  const triggerRef = useRef(null);
  const cardRef = useRef(null);
  const pointerY = useRef(null);
  const closeTimer = useRef(0);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);

  const show = useCallback(() => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);
  const hide = useCallback((delay = 0) => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), delay);
  }, []);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useLayoutEffect(() => {
    if (open && triggerRef.current && cardRef.current) {
      setPos(place(triggerRef.current, cardRef.current, pointerY.current));
    }
  }, [open]);

  // Esc closes; on touch, a tap anywhere else closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onDown = (e) => {
      if (!triggerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const handlers = touch
    ? {
        onClick: (e) => {
          e.preventDefault();
          pointerY.current = e.clientY || null;
          setOpen((o) => !o);
        },
        "aria-expanded": open,
      }
    : {
        onPointerEnter: (e) => {
          if (e.pointerType !== "mouse") return;
          pointerY.current = e.clientY;
          show();
        },
        onPointerLeave: (e) => e.pointerType === "mouse" && hide(80),
        onFocus: () => {
          pointerY.current = null;
          show();
        },
        onBlur: () => hide(),
      };

  return (
    <>
      <a ref={triggerRef} href={href} className="peek-trigger" aria-describedby={id} {...handlers}>
        {word}
      </a>
      {createPortal(
        <span
          ref={cardRef}
          id={id}
          role="tooltip"
          className={`peek-card ${open && pos ? "is-open" : ""}`}
          style={pos ? { left: pos.left, top: pos.top, transformOrigin: pos.origin } : undefined}
        >
          <span className="bar">{file}</span>
          {children}
        </span>,
        document.body
      )}
    </>
  );
}

const L = ({ children, c }) => <span className={`ln ${c ? "c" : ""}`}>{children}</span>;
const K = ({ children }) => <span className="k">{children}</span>;

export default function Readme() {
  const touch = useMediaQuery("(pointer: coarse)");
  const p = { touch };

  return (
    <section id="readme" aria-labelledby="readme-h" className="shell pb-[120px] pt-[140px]">
      <div className="flex max-w-[900px] flex-col gap-7">
        <h2 id="readme-h" data-reveal className="label">
          ( Readme )
        </h2>
        <p data-reveal className="text-[clamp(24px,4.4vw,32px)] font-light leading-[1.6] tracking-[-0.02em]">
          Hi, I’m Feran. I’m finishing my computer science degree at{" "}
          <Peek {...p} href="#log" word="SIUE" file="siue.yml">
            <L>
              <K>degree:</K> B.S./M.S. Computer Science
            </L>
            <L>
              <K>minor:</K> Mathematics
            </L>
            <L>
              <K>b.s.:</K> Dec 2026
            </L>
            <L c># Meridian Scholar</L>
          </Peek>
          , and the work I enjoy most is the part nobody notices: money that adds up, orders that don’t get lost, and
          screens people understand without help. Mostly I build{" "}
          <Peek {...p} href="#work" word="full‑stack products" file="fairsynq.ts">
            <L>
              <K>type</K> FairSynq = Marketplace&lt;
            </L>
            <L>{"  "}Vendor, Organizer, Fair&gt;</L>
            <L c>// Next.js · Supabase · Stripe Connect</L>
          </Peek>{" "}
          for real users, and sometimes{" "}
          <Peek {...p} href="#work" word="low‑level networking code" file="proxy.cpp">
            <L>
              recv() <K>→</K> relay() <K>→</K> FIN
            </L>
            <L>
              blocked IP <K>→</K> local 403
            </L>
            <L c>// C++ · Winsock · one thread per direction</L>
          </Peek>
          , just to see how things work underneath. I test everything I ship. That habit came from my internship at{" "}
          <Peek {...p} href="#log" word="ReliaQuest" file="internship.md">
            <L>
              <K>role:</K> QA / Automation intern
            </L>
            <L>
              <K>team:</K> 20 engineers, distributed
            </L>
          </Peek>
          , and it stuck.
        </p>
        <p data-reveal className="label !text-[12px]">
          {touch ? "Tap" : "Hover"} the underlined words to peek inside
        </p>
      </div>
    </section>
  );
}
