// Shared SVG pieces for case study diagrams, drawn with the site's tokens.

// A labelled box. `title` and `sub` may be strings or arrays of lines.
export function Box({ x, y, w, h, title, sub, dark = false }) {
  const titles = [].concat(title);
  const subs = sub ? [].concat(sub) : [];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} className={dark ? "fill-night" : "fill-paper stroke-ink"} strokeWidth="1" />
      {titles.map((line, i) => (
        <text key={`t${i}`} x={x + 14} y={y + 28 + i * 22} className={`font-display text-[19px] ${dark ? "fill-cream" : "fill-ink"}`}>
          {line}
        </text>
      ))}
      {subs.map((line, i) => (
        <text
          key={`s${i}`}
          x={x + 14}
          y={y + 28 + titles.length * 22 - 4 + i * 15}
          className={`font-mono text-[11px] ${dark ? "fill-cream" : "fill-muted"}`}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

// A connector. `both` puts arrowheads on both ends.
export function Edge({ d, label, lx, ly, marker, both = false }) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        className="stroke-ink"
        strokeWidth="1"
        markerEnd={`url(#${marker})`}
        markerStart={both ? `url(#${marker})` : undefined}
      />
      {label && (
        <text x={lx} y={ly} className="fill-muted font-mono text-[10px]">
          {label}
        </text>
      )}
    </g>
  );
}

export function Arrow({ id }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" className="fill-ink" />
      </marker>
    </defs>
  );
}

// Both layouts of a diagram: wide from 640px up, stacked on phones.
export function Responsive({ wide, stacked }) {
  return (
    <div className="border border-hairline bg-paper p-4 sm:p-6">
      <div className="hidden sm:block">{wide}</div>
      <div className="sm:hidden">{stacked}</div>
    </div>
  );
}
