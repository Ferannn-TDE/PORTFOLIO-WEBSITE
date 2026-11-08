import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { buildCommands } from "./commands";
import { fuzzyFilter } from "@/lib/fuzzy";
import { copyEmail } from "@/lib/email";
import { track } from "@/lib/analytics";
import { toast } from "@/lib/toast";
import { lockScroll, unlockScroll, scrollToElement } from "@/lib/scroll";
import { isOverridden, setReducedOverride, useReducedMotion } from "@/lib/motion";
import { OPEN_PALETTE } from "@/lib/palette";

const TYPING = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

function Highlight({ text, indices }) {
  if (!indices.length) return text;
  const set = new Set(indices);
  return [...text].map((ch, i) =>
    set.has(i) ? (
      <mark key={i} className="bg-transparent text-violet-soft">
        {ch}
      </mark>
    ) : (
      ch
    )
  );
}

export default function Palette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const listRef = useRef(null);
  const returnFocus = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();
  const listId = useId();
  const onHome = location.pathname === "/";

  const show = useCallback(() => {
    returnFocus.current = document.activeElement;
    setQuery("");
    setActive(0);
    setOpen(true);
    track("cmdk-open");
  }, []);

  const close = useCallback((restore = true) => {
    setOpen(false);
    if (restore) {
      const el = returnFocus.current;
      requestAnimationFrame(() => el?.focus?.({ preventScroll: true }));
    }
  }, []);

  // ⌘K / Ctrl+K anywhere, except while typing in a field outside the palette.
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.key === "k" || e.key === "K") || !(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      const inPalette = dialogRef.current?.contains(e.target);
      if (!inPalette && e.target.closest?.(TYPING)) return;
      e.preventDefault();
      if (open) close();
      else show();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE, show);
    };
  }, [open, show, close]);

  // While open: pause page scroll and focus the input.
  useEffect(() => {
    if (!open) return;
    lockScroll();
    inputRef.current?.focus();
    return () => unlockScroll();
  }, [open]);

  const ctx = useMemo(
    () => ({
      onHome,
      reduced,
      navigate: (to) => navigate(to),
      goToSection: (id) => {
        const el = onHome && document.getElementById(id);
        if (el) scrollToElement(el);
        else navigate(id === "top" ? "/" : `/#${id}`);
      },
      openExternal: (url, event) => {
        window.open(url, "_blank", "noopener,noreferrer");
        if (event === "resume") track("resume-open", { source: "palette" });
      },
      copyEmail: () => copyEmail("palette"),
      pathfinder: (detail) => {
        const top = document.getElementById("top");
        if (top) scrollToElement(top);
        window.dispatchEvent(new CustomEvent("pathfinder:command", { detail }));
      },
      toggleMotion: () => {
        if (reduced && !isOverridden()) {
          toast("Motion is reduced by your system setting");
          return;
        }
        setReducedOverride(!reduced);
        toast(reduced ? "Motion on" : "Motion reduced for this session");
      },
    }),
    [onHome, reduced, navigate]
  );

  const commands = useMemo(() => buildCommands(ctx), [ctx]);
  const results = useMemo(
    () => fuzzyFilter(query, commands, (c) => `${c.label} ${c.group} ${c.keywords ?? ""}`),
    [query, commands]
  );
  const activeIndex = Math.min(active, Math.max(0, results.length - 1));
  const optionId = (i) => `${listId}-opt-${i}`;

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const run = (cmd) => {
    // Commands that move focus (section jumps) run after focus is restored.
    close(true);
    requestAnimationFrame(() => requestAnimationFrame(() => cmd.run()));
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((activeIndex + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((activeIndex - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Home" && e.ctrlKey) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End" && e.ctrlKey) {
      e.preventDefault();
      setActive(results.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[activeIndex];
      if (r) run(r.item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      // Focus trap: the input is the only tab stop inside the dialog.
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="palette-backdrop fixed inset-0 z-[90] flex items-start justify-center bg-night/70 px-4 pt-[12vh]" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        data-lenis-prevent
        className="palette on-night w-full max-w-[560px] border border-hairline-night bg-editor text-cream shadow-[0_24px_60px_rgb(20_18_42/0.45)]"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-hairline-night px-4">
          <span aria-hidden="true" className="font-mono text-[13px] text-violet-soft">
            ›
          </span>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results.length ? optionId(activeIndex) : undefined}
            aria-label="Search commands"
            placeholder="Type a command or search…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            className="h-14 w-full bg-transparent font-mono text-[15px] text-cream outline-none placeholder:text-cream/60"
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="font-mono text-[11px] text-cream/60">esc</kbd>
        </div>
        <ul ref={listRef} id={listId} role="listbox" aria-label="Commands" className="max-h-[min(420px,60vh)] overflow-y-auto py-2">
          {results.map(({ item, indices }, i) => (
            <li
              key={item.id}
              id={optionId(i)}
              data-index={i}
              role="option"
              aria-selected={i === activeIndex}
              onMouseMove={() => i !== activeIndex && setActive(i)}
              onClick={() => run(item)}
              className={`flex cursor-pointer items-baseline justify-between gap-4 px-4 py-2.5 ${
                i === activeIndex ? "bg-cream/10" : ""
              }`}
            >
              <span className="min-w-0 truncate text-[15px]">
                <Highlight text={item.label} indices={indices.filter((x) => x < item.label.length)} />
              </span>
              <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-cream/60">
                {item.hint || item.group}
              </span>
            </li>
          ))}
          {!results.length && <li className="px-4 py-6 font-mono text-[13px] text-cream/60">No matching commands</li>}
        </ul>
        <p className="sr-only" aria-live="polite">
          {results.length} {results.length === 1 ? "result" : "results"}
        </p>
      </div>
    </div>,
    document.body
  );
}
