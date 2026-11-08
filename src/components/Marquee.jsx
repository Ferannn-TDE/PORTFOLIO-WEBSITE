import { marquee } from "@/data/about";

// Decorative: the same names are listed in The stack, so this is hidden from assistive tech.
export default function Marquee() {
  const run = (
    <span className="flex gap-12 whitespace-nowrap pr-12">
      {marquee.map((name) => (
        <span key={name} className="flex gap-12">
          <span>{name}</span>
          <span>✦</span>
        </span>
      ))}
    </span>
  );
  return (
    <div
      aria-hidden="true"
      className="marquee overflow-hidden bg-button py-[18px] font-mono text-[14px] uppercase tracking-[0.16em] text-cream"
    >
      <div className="marquee-track">
        {run}
        {run}
      </div>
    </div>
  );
}
