// Hero grid layouts. Walls and heavy cells are listed as [row, col].
const toCells = (cols, list) => list.map(([r, c]) => r * cols + c);

function preset({ cols, rows, start, target, walls, heavy }) {
  return {
    cols,
    rows,
    start: start[0] * cols + start[1],
    defaultTarget: target[0] * cols + target[1],
    walls: toCells(cols, walls),
    heavy: toCells(cols, heavy),
  };
}

export const presets = {
  // 12 × 7, desktop and tablet
  wide: preset({
    cols: 12,
    rows: 7,
    start: [3, 1],
    target: [2, 10],
    walls: [
      [1, 4], [2, 4], [3, 4], [4, 4], [5, 4],
      [0, 8], [1, 8], [2, 8], [3, 8],
      [6, 8],
    ],
    heavy: [
      [2, 6], [3, 6], [4, 6], [5, 6],
      [5, 8],
      [3, 10],
    ],
  }),
  // 8 × 7, under 640px
  narrow: preset({
    cols: 8,
    rows: 7,
    start: [3, 1],
    target: [3, 7],
    walls: [[1, 4], [2, 4], [3, 4], [4, 4], [5, 4]],
    heavy: [[0, 5], [0, 6], [1, 6], [2, 6]],
  }),
};
