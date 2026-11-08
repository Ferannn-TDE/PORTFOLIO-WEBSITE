import { stack } from "@/data/about";

export default function Stack() {
  return (
    <section id="stack" aria-labelledby="stack-h" className="shell flex flex-col gap-8 pb-[140px] pt-10">
      <h2 id="stack-h" data-reveal className="label">
        ( 03 — The stack )
      </h2>
      <dl className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8">
        {stack.map((g) => (
          <div key={g.group} data-reveal className="flex flex-col gap-3 border-t border-hairline pt-5">
            <dt className="font-display text-[28px] leading-[1.1]">{g.group}</dt>
            <dd className="text-[17px] leading-[1.8] text-ink-2">{g.items}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
