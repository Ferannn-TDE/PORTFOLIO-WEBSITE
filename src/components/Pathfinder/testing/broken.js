// Deliberately wrong algorithm sets for the negative control. Each one swaps a
// single algorithm for a plausible bug; the rest stay correct.

import { bfs, dijkstra, astar, pathCost } from "../algorithms.js";

const noHeavy = (grid) => ({ ...grid, heavy: new Set() });
const noWalls = (grid) => ({ ...grid, walls: new Set() });

// Bug: Dijkstra treats every cell as cost 1 (forgets the weights).
function dijkstraIgnoresWeights(grid, start, target) {
  const res = dijkstra(noHeavy(grid), start, target);
  return res.found ? { ...res, cost: pathCost(grid, res.path) } : res;
}

// Bug: BFS never checks walls.
function bfsThroughWalls(grid, start, target) {
  return bfs(noWalls(grid), start, target);
}

export const broken = {
  "dijkstra-ignores-weights": { bfs, dijkstra: dijkstraIgnoresWeights, astar },
  "bfs-through-walls": { bfs: bfsThroughWalls, dijkstra, astar },
};
