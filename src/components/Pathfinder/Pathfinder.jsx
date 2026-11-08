import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { algorithms } from "./algorithms";
import { presets } from "./presets";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { onIntroDone } from "@/lib/motion";
import { track } from "@/lib/analytics";
import "./pathfinder.css";

const ALGOS = [
  { id: "bfs", label: "BFS" },
  { id: "dijkstra", label: "Dijkstra" },
  { id: "astar", label: "A*" },
];

const WAVE_MS = 45; // delay per hop of distance
const PATH_MS = 55; // delay per path cell

// Times only the search call. Each algorithm is warmed up once before its
// first timed run, so the number reflects the search rather than JIT
// compilation; warm-up runs are not counted. One run is often below the
// browser's timer resolution, so the same search is repeated until at least
// 2 ms have passed (max 200 runs) and the mean per call is reported.
const warmed = new Set();
function timeSearch(fn, grid, start, target) {
  if (!warmed.has(fn)) {
    for (let i = 0; i < 30; i++) fn(grid, start, target);
    warmed.add(fn);
  }
  const result = fn(grid, start, target);
  let runs = 0;
  const t0 = performance.now();
  let elapsed = 0;
  do {
    fn(grid, start, target);
    runs++;
    elapsed = performance.now() - t0;
  } while (elapsed < 2 && runs < 200);
  return { result, ms: elapsed / runs };
}

export default function Pathfinder({ autoRun = true, commandEvent = "pathfinder:command" }) {
  const narrow = useMediaQuery("(max-width: 639px)");
  const coarse = useMediaQuery("(pointer: coarse)");
  const [drawMode, setDrawMode] = useState(false);
  const preset = narrow ? presets.narrow : presets.wide;

  const [algo, setAlgo] = useState("bfs");
  const [walls, setWalls] = useState(() => new Set(preset.walls));
  const [run, setRun] = useState(null); // { id, target, depth: Map, pathIdx: Map, maxDepth, stats }
  const runId = useRef(0);
  const drag = useRef(null);

  const heavy = useMemo(() => new Set(preset.heavy), [preset]);

  // New layout when crossing the breakpoint.
  useEffect(() => {
    setWalls(new Set(preset.walls));
    setRun(null);
  }, [preset]);

  const route = useCallback(
    (target, opts = {}) => {
      const useAlgo = opts.algo ?? algo;
      const useWalls = opts.walls ?? walls;
      if (target === preset.start || useWalls.has(target)) return;
      const grid = { cols: preset.cols, rows: preset.rows, walls: useWalls, heavy };
      const { result, ms } = timeSearch(algorithms[useAlgo], grid, preset.start, target);
      if (!opts.auto) track("pathfinder-run", { algo: useAlgo });
      const depth = new Map(result.visited.map((v) => [v.cell, v.depth]));
      const pathIdx = new Map(result.path.map((c, i) => [c, i]));
      const maxDepth = result.visited.reduce((m, v) => Math.max(m, v.depth), 0);
      runId.current += 1;
      setRun({
        id: runId.current,
        target,
        depth,
        pathIdx,
        maxDepth,
        stats: {
          algo: useAlgo,
          visited: result.visited.length,
          found: result.found,
          steps: result.steps,
          cost: result.cost,
          ms,
        },
      });
    },
    [algo, walls, preset, heavy]
  );

  const pickAlgo = (id) => {
    setAlgo(id);
    if (run) route(run.target, { algo: id });
  };

  const newRoute = useCallback(() => {
    const open = [];
    for (let i = 0; i < preset.cols * preset.rows; i++) {
      if (i !== preset.start && !walls.has(i) && i !== run?.target) open.push(i);
    }
    if (open.length) route(open[Math.floor(Math.random() * open.length)]);
  }, [preset, walls, run, route]);

  const reset = () => {
    setWalls(new Set(preset.walls));
    setRun(null);
    setDrawMode(false);
  };

  // First route once the intro is out of the way (or right away if it was
  // skipped), so the hero is never static. Replaying the intro runs it again.
  const routeRef = useRef(route);
  routeRef.current = route;
  useEffect(() => {
    if (!autoRun) return;
    return onIntroDone(() => routeRef.current(preset.defaultTarget, { auto: true }));
  }, [autoRun, preset]);

  // External commands (command palette): { type: "algo", value } or { type: "route" }.
  const latest = useRef({});
  latest.current = { pickAlgo, newRoute };
  useEffect(() => {
    const onCommand = (e) => {
      const { type, value } = e.detail || {};
      if (type === "algo" && algorithms[value]) latest.current.pickAlgo(value);
      if (type === "route") latest.current.newRoute();
    };
    window.addEventListener(commandEvent, onCommand);
    return () => window.removeEventListener(commandEvent, onCommand);
  }, [commandEvent]);

  // Pointer handling: a press that stays on one cell is a click (set target);
  // a press that moves across cells paints walls.
  const cellAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const i = el?.dataset?.cell;
    return i === undefined ? null : Number(i);
  };

  // Mouse: press-and-drag paints walls, a plain click sets the target.
  // Touch/pen: the page keeps scrolling; a tap sets the target, or toggles a
  // wall while "Draw walls" is on.
  const onPointerDown = (e) => {
    const cell = e.target.dataset?.cell;
    if (cell === undefined || e.button !== 0) return;
    const c = Number(cell);
    const mouse = e.pointerType === "mouse";
    if (mouse) e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { origin: c, last: c, painting: false, mouse, mode: !walls.has(c), walls: new Set(walls) };
  };

  // Toggle one cell in the drag's working copy; the start and target stay open.
  const paint = (d, cell) => {
    if (cell === preset.start || cell === run?.target) return false;
    if (d.walls.has(cell) === d.mode) return false;
    if (d.mode) d.walls.add(cell);
    else d.walls.delete(cell);
    return true;
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || !d.mouse) return;
    const c = cellAt(e.clientX, e.clientY);
    if (c === null || c === d.last) return;
    let changed = false;
    if (!d.painting) {
      d.painting = true;
      changed = paint(d, d.origin);
    }
    changed = paint(d, c) || changed;
    d.last = c;
    if (changed) setWalls(new Set(d.walls));
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.painting) {
      if (run) route(run.target, { walls: d.walls });
      return;
    }
    if (!d.mouse && drawMode) {
      if (d.origin === preset.start || d.origin === run?.target) return;
      const next = new Set(walls);
      if (next.has(d.origin)) next.delete(d.origin);
      else next.add(d.origin);
      setWalls(next);
      if (run) route(run.target, { walls: next });
      return;
    }
    if (walls.has(d.origin)) {
      // Clicking a wall removes it.
      const next = new Set(walls);
      next.delete(d.origin);
      setWalls(next);
      if (run) route(run.target, { walls: next });
    } else {
      route(d.origin);
    }
  };

  const cells = [];
  for (let i = 0; i < preset.cols * preset.rows; i++) {
    let cls = "pf-cell";
    let delay = 0;
    if (walls.has(i)) cls += " is-wall";
    else {
      if (heavy.has(i)) cls += " is-heavy";
      if (i === preset.start) cls += " is-start";
      else if (run?.pathIdx.has(i)) {
        cls += " is-path";
        delay = (run.maxDepth + 2) * WAVE_MS + run.pathIdx.get(i) * PATH_MS;
      } else if (run?.depth.has(i)) {
        cls += " is-visited";
        delay = run.depth.get(i) * WAVE_MS;
      }
      if (i === run?.target) cls += " is-target";
    }
    cells.push(<span key={i} data-cell={i} className={cls} style={delay ? { animationDelay: `${delay}ms` } : undefined} />);
  }

  const s = run?.stats;
  const statText = !s
    ? "click any square to route"
    : `visited ${s.visited} · ${s.found ? `path ${s.steps}` : "no path"}${
        s.found && s.algo !== "bfs" ? ` · cost ${s.cost}` : ""
      } · ${s.ms.toFixed(s.ms < 0.1 ? 3 : 2)} ms avg`;

  return (
    <div className="pf min-w-0 border border-hairline-night bg-black/30 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline-night px-4 py-3 text-[12px] tracking-[0.06em] text-cream/70 sm:px-5">
        <span>
          <span className="text-violet-soft">$</span> route --algo {algo === "astar" ? "a*" : algo}
        </span>
        <div role="group" aria-label="Search algorithm" className="flex">
          {ALGOS.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={algo === a.id}
              onClick={() => pickAlgo(a.id)}
              className="pf-btn -ml-px h-8 border border-cream/25 px-2.5 text-[11px] uppercase tracking-[0.1em] first:ml-0"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        data-cursor="click"
        className={`pf-grid p-4 sm:p-6 ${coarse ? "" : "pf-grid-mouse"}`}
        style={{ gridTemplateColumns: `repeat(${preset.cols}, minmax(0, 1fr))` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
      >
        <div key={run?.id ?? 0} className="contents">
          {cells}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline-night px-4 pb-4 pt-3 text-[12px] text-cream/75 sm:px-5">
        <span aria-live="polite" className="min-h-[1.5em]">
          {statText}
        </span>
        <div className="flex flex-wrap gap-2">
          {coarse && (
            <button
              type="button"
              aria-pressed={drawMode}
              onClick={() => setDrawMode((m) => !m)}
              className="pf-btn h-9 border border-cream/30 px-3 text-[11px] uppercase tracking-[0.12em]"
            >
              Draw walls
            </button>
          )}
          <button type="button" onClick={newRoute} className="pf-btn h-9 border border-cream/30 px-3 text-[11px] uppercase tracking-[0.12em]">
            New route ↻
          </button>
          <button type="button" onClick={reset} className="pf-btn h-9 border border-cream/30 px-3 text-[11px] uppercase tracking-[0.12em]">
            Reset
          </button>
        </div>
      </div>
      <p className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 pb-4 text-[11px] text-cream/60 sm:px-5" aria-hidden="true">
        <span className="inline-flex items-center gap-2">
          <span className="pf-legend-heavy" /> heavy · cost 5{algo === "bfs" ? " (BFS ignores it)" : ""}
        </span>
        <span>{coarse ? "tap “Draw walls”, then tap cells" : "drag to draw walls"}</span>
      </p>
    </div>
  );
}
