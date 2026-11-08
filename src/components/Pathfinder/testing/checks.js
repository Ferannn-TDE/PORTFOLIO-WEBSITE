// Test support: grid parsing, an independent reference solver, and checks that
// return a list of problems ([] = pass). The same checks run against the real
// algorithms and against deliberately broken variants (the negative control).

import { HEAVY_COST } from "../algorithms.js";

// ASCII grid: S start, T target, # wall, h heavy (cost 5), . open.
export function parse(rowsText) {
  const lines = rowsText.trim().split("\n").map((l) => l.trim());
  const rows = lines.length;
  const cols = lines[0].length;
  const walls = new Set();
  const heavy = new Set();
  let start = -1;
  let target = -1;
  lines.forEach((line, r) => {
    if (line.length !== cols) throw new Error(`ragged grid at row ${r}`);
    [...line].forEach((ch, c) => {
      const i = r * cols + c;
      if (ch === "#") walls.add(i);
      else if (ch === "h") heavy.add(i);
      else if (ch === "S") start = i;
      else if (ch === "T") target = i;
      else if (ch !== ".") throw new Error(`unknown cell '${ch}'`);
    });
  });
  return { grid: { cols, rows, walls, heavy }, start, target };
}

// Reference: plain label-correcting relaxation over every cell until nothing
// changes. Slow and simple on purpose, and shares no code with algorithms.js.
export function reference(grid, start, target, { weighted }) {
  const n = grid.cols * grid.rows;
  if (grid.walls.has(start) || grid.walls.has(target)) return Infinity;
  const dist = new Array(n).fill(Infinity);
  dist[start] = 0;
  let changed = true;
  while (changed) {
    changed = false;
    for (let u = 0; u < n; u++) {
      if (dist[u] === Infinity || grid.walls.has(u)) continue;
      const r = Math.floor(u / grid.cols);
      const c = u % grid.cols;
      const adj = [];
      if (r > 0) adj.push(u - grid.cols);
      if (r < grid.rows - 1) adj.push(u + grid.cols);
      if (c > 0) adj.push(u - 1);
      if (c < grid.cols - 1) adj.push(u + 1);
      for (const v of adj) {
        if (grid.walls.has(v)) continue;
        const w = weighted && grid.heavy.has(v) ? HEAVY_COST : 1;
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          changed = true;
        }
      }
    }
  }
  return dist[target];
}

// Structural checks every result must pass, whatever the algorithm.
export function checkResult(grid, start, target, res) {
  const problems = [];
  const seen = new Set();
  for (const { cell } of res.visited) {
    if (grid.walls.has(cell)) problems.push(`visited wall cell ${cell}`);
    if (seen.has(cell)) problems.push(`visited cell ${cell} twice`);
    seen.add(cell);
  }
  if (!res.found) {
    if (res.path.length) problems.push("no path reported but path is non-empty");
    return problems;
  }
  const p = res.path;
  if (p[0] !== start) problems.push(`path starts at ${p[0]}, not ${start}`);
  if (p[p.length - 1] !== target) problems.push(`path ends at ${p[p.length - 1]}, not ${target}`);
  if (res.steps !== p.length - 1) problems.push(`steps ${res.steps} != path length - 1`);
  let cost = 0;
  for (let i = 0; i < p.length; i++) {
    if (grid.walls.has(p[i])) problems.push(`path passes through wall ${p[i]}`);
    if (i === 0) continue;
    const [r0, c0] = [Math.floor(p[i - 1] / grid.cols), p[i - 1] % grid.cols];
    const [r1, c1] = [Math.floor(p[i] / grid.cols), p[i] % grid.cols];
    if (Math.abs(r0 - r1) + Math.abs(c0 - c1) !== 1) problems.push(`path jumps ${p[i - 1]} -> ${p[i]}`);
    cost += grid.heavy.has(p[i]) ? HEAVY_COST : 1;
  }
  if (cost !== res.cost) problems.push(`reported cost ${res.cost} but path costs ${cost}`);
  return problems;
}

// Optimality against the reference: BFS must be shortest in steps,
// Dijkstra and A* must be cheapest in weighted cost.
export function checkOptimal(name, grid, start, target, res) {
  const weighted = name !== "bfs";
  const best = reference(grid, start, target, { weighted });
  const got = !res.found ? Infinity : weighted ? res.cost : res.steps;
  return got === best ? [] : [`${name}: got ${got}, optimal is ${best}`];
}

// Deterministic PRNG so random grids are the same on every run.
export function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomGrid(rand, cols, rows, wallRate, heavyRate) {
  const walls = new Set();
  const heavy = new Set();
  for (let i = 0; i < cols * rows; i++) {
    const x = rand();
    if (x < wallRate) walls.add(i);
    else if (x < wallRate + heavyRate) heavy.add(i);
  }
  return { cols, rows, walls, heavy };
}

export function openGrid(cols, rows, heavyCells = []) {
  return { cols, rows, walls: new Set(), heavy: new Set(heavyCells) };
}
