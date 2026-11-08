import { log } from "@/data/about";

export default function Log() {
  return (
    <section id="log" aria-labelledby="log-h" className="shell pb-[120px] pt-10">
      <h2 id="log-h" className="label mb-8">
        ( 02 — The log )
      </h2>
      <ol className="relative flex flex-col">
        <span aria-hidden="true" className="trunk absolute bottom-9 left-[7px] top-9 w-0.5 bg-violet" />
        {log.map((e, i) => (
          <li
            key={e.role}
            className={`relative flex flex-wrap items-start gap-x-8 gap-y-2 py-[26px] pl-11 ${i > 0 ? "border-t border-ink/[0.12]" : ""}`}
          >
            <span
              aria-hidden="true"
              className="log-dot absolute left-0 top-9 size-3 rounded-full border-2 border-violet bg-violet"
            />
            <span className="flex-[1_1_280px] font-display text-[30px] leading-[1.15]">{e.role}</span>
            <span className="flex-[1_1_240px] pt-1.5 text-[18px] text-ink-2">{e.org}</span>
            <span className="flex-[0_1_200px] pt-2.5 font-mono text-[13px] text-muted md:text-right">{e.when}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
