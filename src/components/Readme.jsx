import { useId } from "react";

function Peek({ href, word, file, children }) {
  const id = useId();
  return (
    <span className="peek">
      <a href={href} className="peek-trigger" aria-describedby={id}>
        {word}
      </a>
      <span id={id} role="tooltip" className="peek-card">
        <span className="bar">{file}</span>
        {children}
      </span>
    </span>
  );
}

const L = ({ children, c }) => <span className={`ln ${c ? "c" : ""}`}>{children}</span>;
const K = ({ children }) => <span className="k">{children}</span>;

export default function Readme() {
  return (
    <section id="readme" aria-labelledby="readme-h" className="shell pb-[120px] pt-[140px]">
      <div className="flex max-w-[900px] flex-col gap-7">
        <h2 id="readme-h" className="label">
          ( Readme )
        </h2>
        <p className="text-[clamp(24px,4.4vw,32px)] font-light leading-[1.6] tracking-[-0.02em]">
          I’m Feran, a computer science student at{" "}
          <Peek href="#log" word="SIUE" file="siue.yml">
            <L>
              <K>degree:</K> B.S./M.S. Computer Science
            </L>
            <L>
              <K>minor:</K> Mathematics
            </L>
            <L>
              <K>b.s.:</K> Dec 2026
            </L>
            <L c># Meridian Scholar</L>
          </Peek>{" "}
          who likes the unglamorous parts of software: payouts that reconcile, queues that don’t drop orders, and
          interfaces people can use without a manual. I build{" "}
          <Peek href="#work" word="full‑stack products" file="fairsynq.ts">
            <L>
              <K>type</K> FairSynq = Marketplace&lt;
            </L>
            <L>{"  "}Vendor, Organizer, Fair&gt;</L>
            <L c>// Next.js · Supabase · Stripe Connect</L>
          </Peek>
          , write{" "}
          <Peek href="#work" word="low‑level networking code" file="proxy.cpp">
            <L>
              recv() <K>→</K> relay() <K>→</K> FIN
            </L>
            <L>
              blocked IP <K>→</K> local 403
            </L>
            <L c>// C++ · Winsock · one thread per direction</L>
          </Peek>
          , and test the things I ship — a habit from my QA internship at{" "}
          <Peek href="#log" word="ReliaQuest" file="internship.md">
            <L>
              <K>role:</K> QA / Automation intern
            </L>
            <L>
              <K>team:</K> 20 engineers, distributed
            </L>
          </Peek>
          .
        </p>
        <p className="label !text-[12px]">Hover the underlined words to peek inside</p>
      </div>
    </section>
  );
}
