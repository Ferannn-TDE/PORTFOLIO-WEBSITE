// Pure grid search: BFS, Dijkstra, A*.
//
// A grid is { cols, rows, walls: Set<cell>, heavy: Set<cell> }, where a cell is
// the index row * cols + col. Moving into a cell costs its weight: HEAVY_COST for
// heavy cells, 1 otherwise. BFS ignores weights; Dijkstra and A* respect them.
//
// Everything is deterministic: neighbours are always tried in the order
// up, right, down, left, and priority ties are broken by a fixed rule plus
// insertion order, so the same input always expands cells in the same order.

export const HEAVY_COST = 5;

// up, right, down, left
const DIRS = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

export const cellOf = (grid, row, col) => row * grid.cols + col;
export const rowCol = (grid, cell) => [Math.floor(cell / grid.cols), cell % grid.cols];

export function weight(grid, cell) {
  return grid.heavy.has(cell) ? HEAVY_COST : 1;
}

export function neighbours(grid, cell) {
  const [r, c] = rowCol(grid, cell);
  const out = [];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nr >= grid.rows || nc < 0 || nc >= grid.cols) continue;
    const n = nr * grid.cols + nc;
    if (!grid.walls.has(n)) out.push(n);
  }
  return out;
}

export function manhattan(grid, a, b) {
  const [ar, ac] = rowCol(grid, a);
  const [br, bc] = rowCol(grid, b);
  return Math.abs(ar - br) + Math.abs(ac - bc);
}

export function pathCost(grid, path) {
  let cost = 0;
  for (let i = 1; i < path.length; i++) cost += weight(grid, path[i]);
  return cost;
}

function buildResult(grid, start, target, parent, visited) {
  if (!parent.has(target)) {
    return { found: false, path: [], steps: 0, cost: Infinity, visited };
  }
  const path = [];
  for (let x = target; x !== -1; x = parent.get(x)) path.push(x);
  path.reverse();
  return { found: true, path, steps: path.length - 1, cost: pathCost(grid, path), visited };
}

function validate(grid, start, target) {
  const n = grid.cols * grid.rows;
  for (const c of [start, target]) {
    if (!Number.isInteger(c) || c < 0 || c >= n) throw new RangeError(`cell ${c} is outside the grid`);
  }
  return !grid.walls.has(start) && !grid.walls.has(target);
}

const empty = () => ({ found: false, path: [], steps: 0, cost: Infinity, visited: [] });

// visited: cells in the order they were expanded, each with its hop depth from start.
export function bfs(grid, start, target) {
  if (!validate(grid, start, target)) return empty();
  const parent = new Map([[start, -1]]);
  const depth = new Map([[start, 0]]);
  const visited = [];
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];
    visited.push({ cell: u, depth: depth.get(u) });
    if (u === target) break;
    for (const v of neighbours(grid, u)) {
      if (parent.has(v)) continue;
      parent.set(v, u);
      depth.set(v, depth.get(u) + 1);
      queue.push(v);
    }
  }
  return buildResult(grid, start, target, parent, visited);
}

// Binary min-heap over [key1, key2, seq, cell]; compared lexicographically.
class Heap {
  constructor() {
    this.a = [];
  }
  get size() {
    return this.a.length;
  }
  static less(x, y) {
    if (x[0] !== y[0]) return x[0] < y[0];
    if (x[1] !== y[1]) return x[1] < y[1];
    return x[2] < y[2];
  }
  push(item) {
    const a = this.a;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!Heap.less(a[i], a[p])) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && Heap.less(a[l], a[m])) m = l;
        if (r < a.length && Heap.less(a[r], a[m])) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}

// Shared best-first search. `key(g, cell)` returns [key1, key2] for the heap.
function bestFirst(grid, start, target, key) {
  if (!validate(grid, start, target)) return empty();
  const g = new Map([[start, 0]]);
  const parent = new Map([[start, -1]]);
  const depth = new Map([[start, 0]]);
  const closed = new Set();
  const visited = [];
  const heap = new Heap();
  let seq = 0;
  heap.push([...key(0, start), seq++, start]);

  while (heap.size) {
    const [, , , u] = heap.pop();
    if (closed.has(u)) continue; // stale entry
    closed.add(u);
    visited.push({ cell: u, depth: depth.get(u) });
    if (u === target) break;
    const gu = g.get(u);
    for (const v of neighbours(grid, u)) {
      if (closed.has(v)) continue;
      const gv = gu + weight(grid, v);
      if (g.has(v) && gv >= g.get(v)) continue;
      g.set(v, gv);
      parent.set(v, u);
      depth.set(v, depth.get(u) + 1);
      heap.push([...key(gv, v), seq++, v]);
    }
  }
  return buildResult(grid, start, target, parent, visited);
}

// Dijkstra: lowest cost first, ties by insertion order.
export function dijkstra(grid, start, target) {
  return bestFirst(grid, start, target, (g) => [g, 0]);
}

// A*: lowest f = g + h first; ties prefer the larger g (closer to the target),
// then insertion order. Manhattan distance is admissible and consistent here
// because every move costs at least 1.
export function astar(grid, start, target) {
  return bestFirst(grid, start, target, (g, cell) => [g + manhattan(grid, cell, target), -g]);
}

export const algorithms = { bfs, dijkstra, astar };
