import { describe, it, expect } from "vitest";
import { algorithms as real } from "./algorithms.js";
import { presets } from "./presets.js";
import { broken } from "./testing/broken.js";
import {
  parse,
  reference,
  checkResult,
  checkOptimal,
  mulberry32,
  randomGrid,
  openGrid,
} from "./testing/checks.js";

// PATHFINDER_BROKEN=<variant> runs this whole suite against a broken set,
// to show the suite really goes red (see testing/broken.js).
const variant = process.env.PATHFINDER_BROKEN;
if (variant && !broken[variant]) throw new Error(`unknown variant ${variant}`);
const impl = variant ? broken[variant] : real;
const NAMES = ["bfs", "dijkstra", "astar"];

// Hand-made grids. `steps` is the fewest moves (BFS); `cost` is the cheapest
// weighted route (Dijkstra, A*). null = target unreachable.
const cases = [
  {
    name: "open field",
    map: `
      S....
      .....
      ....T`,
    steps: 6,
    cost: 6,
  },
  {
    name: "wall forces a detour",
    map: `
      S.#..
      ..#..
      ..#.T
      .....`,
    steps: 8,
    cost: 8,
  },
  {
    name: "heavy shortcut is not worth it",
    map: `
      ShT
      ...`,
    steps: 2,
    cost: 4,
  },
  {
    name: "only route crosses a heavy cell",
    map: `
      S#.
      .h.
      .#T`,
    steps: 4,
    cost: 8,
  },
  {
    name: "heavy corridor",
    map: `ShhT`,
    steps: 3,
    cost: 11,
  },
  {
    name: "ring of heavy cells",
    map: `
      S....
      .hhh.
      .h.h.
      .hhhT`,
    steps: 7,
    cost: 7,
  },
  {
    name: "target walled off",
    map: `
      S.#..
      ..#.T
      ..#..`,
    steps: null,
    cost: null,
  },
  {
    name: "start boxed in",
    map: `
      S#..
      #...
      ...T`,
    steps: null,
    cost: null,
  },
];

describe("hand-made grids", () => {
  for (const c of cases) {
    const { grid, start, target } = parse(c.map);

    describe(c.name, () => {
      it("BFS finds the fewest steps", () => {
        const res = impl.bfs(grid, start, target);
        expect(checkResult(grid, start, target, res)).toEqual([]);
        if (c.steps === null) expect(res.found).toBe(false);
        else expect(res.steps).toBe(c.steps);
      });

      for (const name of ["dijkstra", "astar"]) {
        it(`${name} finds the cheapest weighted route`, () => {
          const res = impl[name](grid, start, target);
          expect(checkResult(grid, start, target, res)).toEqual([]);
          if (c.cost === null) expect(res.found).toBe(false);
          else expect(res.cost).toBe(c.cost);
        });
      }

      it("Dijkstra and A* agree on cost", () => {
        expect(impl.astar(grid, start, target).cost).toBe(impl.dijkstra(grid, start, target).cost);
      });
    });
  }
});

describe("walls", () => {
  it("no algorithm visits or routes through a wall, on 300 random grids", () => {
    const rand = mulberry32(7);
    const problems = [];
    for (let k = 0; k < 300; k++) {
      const grid = randomGrid(rand, 12, 7, 0.28, 0.12);
      const start = 0;
      const target = 12 * 7 - 1;
      grid.walls.delete(start);
      grid.walls.delete(target);
      for (const name of NAMES) {
        for (const p of checkResult(grid, start, target, impl[name](grid, start, target))) {
          problems.push(`grid ${k} ${name}: ${p}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("a wall start or target means no path", () => {
    const { grid, start, target } = parse(`
      S..
      ...
      ..T`);
    for (const name of NAMES) {
      expect(impl[name]({ ...grid, walls: new Set([target]) }, start, target).found).toBe(false);
      expect(impl[name]({ ...grid, walls: new Set([start]) }, start, target).found).toBe(false);
    }
  });
});

describe("optimality against a reference solver", () => {
  it("matches the reference on 300 seeded random grids with walls and heavy cells", () => {
    const rand = mulberry32(42);
    const problems = [];
    for (let k = 0; k < 300; k++) {
      const grid = randomGrid(rand, 12, 7, 0.22, 0.18);
      const start = Math.floor(rand() * 84);
      const target = Math.floor(rand() * 84);
      grid.walls.delete(start);
      grid.walls.delete(target);
      for (const name of NAMES) {
        const res = impl[name](grid, start, target);
        for (const p of checkOptimal(name, grid, start, target, res)) problems.push(`grid ${k}: ${p}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("Dijkstra and A* return the same cost for every target on both hero presets", () => {
    const problems = [];
    for (const [key, p] of Object.entries(presets)) {
      const grid = { cols: p.cols, rows: p.rows, walls: new Set(p.walls), heavy: new Set(p.heavy) };
      for (let t = 0; t < p.cols * p.rows; t++) {
        const d = impl.dijkstra(grid, p.start, t).cost;
        const a = impl.astar(grid, p.start, t).cost;
        const ref = reference(grid, p.start, t, { weighted: true });
        if (d !== a || d !== ref) problems.push(`${key} target ${t}: dijkstra ${d}, astar ${a}, reference ${ref}`);
      }
    }
    expect(problems).toEqual([]);
  });
});

describe("A* efficiency", () => {
  const grids = {
    "open 12×7": openGrid(12, 7),
    "open 8×7": openGrid(8, 7),
    "open 12×7 with heavy cells": openGrid(12, 7, presets.wide.heavy),
    "open 20×20": openGrid(20, 20),
  };
  for (const [label, grid] of Object.entries(grids)) {
    it(`visits no more cells than Dijkstra on ${label}, from every start to every target`, () => {
      const n = grid.cols * grid.rows;
      const problems = [];
      let astarTotal = 0;
      let dijkstraTotal = 0;
      for (let s = 0; s < n; s += label.includes("20×20") ? 37 : 1) {
        for (let t = 0; t < n; t++) {
          const a = impl.astar(grid, s, t).visited.length;
          const d = impl.dijkstra(grid, s, t).visited.length;
          astarTotal += a;
          dijkstraTotal += d;
          if (a > d) problems.push(`${s}->${t}: astar ${a} > dijkstra ${d}`);
        }
      }
      expect(problems).toEqual([]);
      expect(astarTotal).toBeLessThan(dijkstraTotal);
    });
  }
});

describe("determinism", () => {
  it("expands neighbours in the order up, right, down, left", () => {
    const { grid } = parse(`
      ...
      ...
      ...`);
    // From the centre (4): up 1, right 5, down 7, left 3.
    const order = impl.bfs(grid, 4, 8).visited.map((v) => v.cell);
    expect(order.slice(0, 5)).toEqual([4, 1, 5, 7, 3]);
  });

  it("returns identical results for identical input", () => {
    const p = presets.wide;
    const grid = { cols: p.cols, rows: p.rows, walls: new Set(p.walls), heavy: new Set(p.heavy) };
    for (const name of NAMES) {
      expect(impl[name](grid, p.start, p.defaultTarget)).toEqual(impl[name](grid, p.start, p.defaultTarget));
    }
  });

  it("reports hop depth for each visited cell", () => {
    const { grid, start, target } = parse(`S...T`);
    const res = impl.bfs(grid, start, target);
    expect(res.visited.map((v) => v.depth)).toEqual([0, 1, 2, 3, 4]);
  });
});

// Negative control: the same checks used above, run against deliberately broken
// algorithms, must report problems. If they did not, the checks would be blind.
describe("negative control", () => {
  function problemsFor(set) {
    const problems = [];
    for (const c of cases) {
      const { grid, start, target } = parse(c.map);
      for (const name of NAMES) {
        const res = set[name](grid, start, target);
        problems.push(...checkResult(grid, start, target, res));
        problems.push(...checkOptimal(name, grid, start, target, res));
      }
    }
    return problems;
  }

  it("the real algorithms produce no problems", () => {
    expect(problemsFor(real)).toEqual([]);
  });

  it("catches a Dijkstra that ignores weights", () => {
    const problems = problemsFor(broken["dijkstra-ignores-weights"]);
    expect(problems).toContain("dijkstra: got 6, optimal is 4");
  });

  it("catches a BFS that walks through walls", () => {
    const problems = problemsFor(broken["bfs-through-walls"]);
    expect(problems.some((p) => p.startsWith("path passes through wall"))).toBe(true);
    expect(problems.some((p) => p.startsWith("visited wall cell"))).toBe(true);
  });
});
