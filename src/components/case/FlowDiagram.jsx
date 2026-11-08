import { useId } from "react";
import { Arrow, Box, Edge, Responsive } from "./svg";
import { svgId } from "@/lib/svgId";

// A left-to-right flow of steps (top-to-bottom on phones).
//   steps: [{ title: string | string[], sub?: string | string[], dark?: bool }]
//   links: one per gap between steps: "→" (default), "←" or "↔"
//   labels: optional text per gap
export default function FlowDiagram({ title, desc, steps, links = [], labels = [] }) {
  const id = svgId(useId());
  const n = steps.length;
  const lines = (s) => [].concat(s.title).length + (s.sub ? [].concat(s.sub).length : 0);
  const tallest = Math.max(...steps.map(lines));

  // Wide: boxes in a row.
  const GAP = 44;
  const W = 960;
  const bw = (W - GAP * (n - 1)) / n;
  const bh = 34 + tallest * 19;
  const wideH = bh + 60;

  // Stacked: boxes in a column.
  const SW = 320;
  const sbh = (s) => 34 + lines(s) * 19;
  const SGAP = 40;
  const tops = [];
  let y = 10;
  for (const s of steps) {
    tops.push(y);
    y += sbh(s) + SGAP;
  }
  const stackH = y - SGAP + 10;

  const edgeProps = (i) => ({ both: links[i] === "↔", reverse: links[i] === "←" });

  const wide = (
    <svg viewBox={`0 0 ${W} ${wideH}`} role="img" aria-labelledby={`${id}w-t ${id}w-d`} className="h-auto w-full">
      <title id={`${id}w-t`}>{title}</title>
      <desc id={`${id}w-d`}>{desc}</desc>
      <Arrow id={`${id}w-m`} />
      {steps.map((s, i) => (
        <Box key={i} x={i * (bw + GAP)} y={30} w={bw} h={bh} title={s.title} sub={s.sub} dark={s.dark} />
      ))}
      {steps.slice(1).map((_, i) => {
        const x1 = i * (bw + GAP) + bw;
        const x2 = x1 + GAP;
        const yMid = 30 + bh / 2;
        const { both, reverse } = edgeProps(i);
        const d = reverse ? `M${x2 - 1},${yMid} L${x1 + 1},${yMid}` : `M${x1 + 1},${yMid} L${x2 - 1},${yMid}`;
        return <Edge key={i} d={d} both={both} marker={`${id}w-m`} label={labels[i]} lx={x1 + 2} ly={yMid - 10} />;
      })}
    </svg>
  );

  const stacked = (
    <svg viewBox={`0 0 340 ${stackH}`} role="img" aria-labelledby={`${id}s-t ${id}s-d`} className="h-auto w-full">
      <title id={`${id}s-t`}>{title}</title>
      <desc id={`${id}s-d`}>{desc}</desc>
      <Arrow id={`${id}s-m`} />
      {steps.map((s, i) => (
        <Box key={i} x={10} y={tops[i]} w={SW} h={sbh(s)} title={s.title} sub={s.sub} dark={s.dark} />
      ))}
      {steps.slice(1).map((_, i) => {
        const y1 = tops[i] + sbh(steps[i]);
        const y2 = tops[i + 1];
        const { both, reverse } = edgeProps(i);
        const d = reverse ? `M170,${y2 - 1} L170,${y1 + 1}` : `M170,${y1 + 1} L170,${y2 - 1}`;
        return <Edge key={i} d={d} both={both} marker={`${id}s-m`} label={labels[i]} lx={180} ly={(y1 + y2) / 2 + 4} />;
      })}
    </svg>
  );

  return <Responsive wide={wide} stacked={stacked} />;
}
