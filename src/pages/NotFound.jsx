// Minimal on-brand placeholder. The themed 404 with a failing pathfinder comes in phase 6.
export default function NotFound() {
  return (
    <main className="on-night dot-grid flex min-h-[100svh] flex-col items-start justify-center gap-6 bg-night px-4 text-cream md:px-10">
      <p className="label">( 404 )</p>
      <h1 className="font-display text-[clamp(56px,11vw,96px)] leading-[1.02] tracking-[-0.02em]">path not found</h1>
      <a href="/" className="link-underline font-mono text-[13px] uppercase tracking-[0.14em]">
        Back home ←
      </a>
    </main>
  );
}
