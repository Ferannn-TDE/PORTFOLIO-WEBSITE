import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { site } from "@/data/site";
import { MailIcon, MenuIcon, CloseIcon } from "./Icons";

const tracked = [
  { id: "readme", label: "Readme" },
  { id: "work", label: "The work" },
  { id: "log", label: "The log" },
  { id: "stack", label: "The stack" },
  { id: "contact", label: "Exit 0" },
];

const menuLinks = [
  { href: "/#work", label: "The work", num: "01" },
  { href: "/#log", label: "The log", num: "02" },
  { href: "/#stack", label: "The stack", num: "03" },
  { href: "/#contact", label: "Contact", num: "04" },
];

function useScrollProgress(barRef) {
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [barRef]);
}

function useCurrentSection() {
  const [current, setCurrent] = useState("");
  useEffect(() => {
    const els = tracked.map((t) => document.getElementById(t.id)).filter(Boolean);
    if (!els.length) return;
    const visible = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        const hit = tracked.find((t) => visible.get(t.id));
        setCurrent(hit ? hit.label : "");
      },
      // A thin band near the top of the viewport acts as the reading line.
      { rootMargin: "-30% 0px -65% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return current;
}

function Menu({ open, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.querySelector("a,button")?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = [...panel.querySelectorAll("a,button")];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="on-night dot-grid fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-night text-cream"
    >
      <div className="mx-auto mt-4 flex h-[60px] w-[calc(100%-32px)] max-w-[500px] items-center justify-between bg-button px-3">
        <span className="label pl-2">( Menu )</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex size-11 items-center justify-center text-cream"
        >
          <CloseIcon />
        </button>
      </div>
      <nav aria-label="Menu" className="shell flex flex-1 flex-col justify-center gap-12 py-16">
        <ul className="flex flex-col gap-2">
          {menuLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={onClose}
                className="group flex items-baseline gap-5 py-1 font-display text-[clamp(48px,9vw,88px)] leading-[1.05] tracking-[-0.02em] hover:text-violet-soft"
              >
                <span className="font-mono text-[13px] tracking-[0.14em] text-cream/60">{l.num}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-[13px] uppercase tracking-[0.14em]">
          <li>
            <a className="link-underline" href={site.resume} target="_blank" rel="noopener noreferrer">
              Résumé ↗
            </a>
          </li>
          <li>
            <a className="link-underline" href={site.github} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          </li>
          <li>
            <a className="link-underline" href={site.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn ↗
            </a>
          </li>
        </ul>
      </nav>
    </div>,
    document.body
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const barRef = useRef(null);
  const menuBtnRef = useRef(null);
  const current = useCurrentSection();
  useScrollProgress(barRef);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => menuBtnRef.current?.focus());
  }, []);

  return (
    <>
      <header className="on-night fixed left-1/2 top-4 z-50 w-[calc(100%-32px)] max-w-[500px] -translate-x-1/2">
        <nav
          aria-label="Primary"
          className="relative flex h-[60px] items-center justify-between bg-button px-3 text-cream"
        >
          <a
            href={`mailto:${site.email}`}
            aria-label={`Email ${site.email}`}
            className="flex size-11 items-center justify-center hover:text-violet-soft"
          >
            <MailIcon />
          </a>

          <div className="flex items-baseline gap-3">
            <a
              href="/#top"
              aria-label="Feran Odedairo, back to top"
              className="font-display text-[30px] italic leading-none hover:text-violet-soft"
            >
              fo.
            </a>
            {current && (
              <span className="label hidden !text-[11px] sm:inline" aria-hidden="true">
                / {current}
              </span>
            )}
          </div>

          <button
            ref={menuBtnRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="site-menu"
            className="flex size-11 items-center justify-center hover:text-violet-soft"
          >
            <MenuIcon />
          </button>

          <span
            ref={barRef}
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-cream/70"
          />
        </nav>
      </header>
      <Menu open={open} onClose={close} />
    </>
  );
}
