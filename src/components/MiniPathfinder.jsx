import { useEffect, useMemo, useState } from "react";
import { bfs } from "@/components/Pathfinder/algorithms";
import "@/components/Pathfinder/pathfinder.css";

// A small grid for the 404 page where the target is walled in, so a real BFS
// searches everything it can reach and finds no path.
const COLS = 11;
const ROWS = 5;
const START = 2 * COLS + 1;
const TARGET = 2 * COLS + 8;
// A closed ring of walls around the target.
const WALLS = new Set(
  [
    [1, 7], [1, 8], [1, 9],
    [2, 7], [2, 9],
    [3, 7], [3, 8], [3, 9],
  ].map(([r, c]) => r * COLS + c)
);
const WAVE_MS = 45;

export default function MiniPathfinder() {
  const grid = useMemo(() => ({ cols: COLS, rows: ROWS, walls: WALLS, heavy: new Set() }), []);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => setResult(bfs(grid, START, TARGET)), 400);
    return () => clearTimeout(id);
  }, [grid]);

  const depth = new Map(result?.visited.map((v) => [v.cell, v.depth]) ?? []);

  return (
    <div className="pf w-full max-w-[520px] border border-hairline-night bg-black/30 font-mono">
      <div className="border-b border-hairline-night px-5 py-3 text-[12px] tracking-[0.06em] text-cream/70">
        <span className="text-violet-soft">$</span> route --to {"<this page>"}
      </div>
      <div aria-hidden="true" className="pf-grid p-5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          let cls = "pf-cell !cursor-default";
          if (WALLS.has(i)) cls += " is-wall";
          else if (i === START) cls += " is-start";
          else if (depth.has(i)) cls += " is-visited";
          if (i === TARGET) cls += " is-target";
          const delay = depth.has(i) ? { animationDelay: `${depth.get(i) * WAVE_MS}ms` } : undefined;
          return <span key={i} className={cls} style={delay} />;
        })}
      </div>
      <p aria-live="polite" className="border-t border-hairline-night px-5 pb-4 pt-3 text-[12px] text-cream/75">
        {result ? `visited ${result.visited.length} · no path` : "searching…"}
      </p>
    </div>
  );
}
