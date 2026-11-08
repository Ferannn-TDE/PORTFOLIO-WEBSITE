import { useId } from "react";
import { Arrow, Box, Edge, Responsive } from "./svg";
import { svgId } from "@/lib/svgId";

const TITLE = "HTTP security proxy";
const DESC =
  "The browser connects to the proxy. The proxy checks the client's IP address first. " +
  "A prohibited IP gets a local 403 response, and the origin server is never contacted. " +
  "Otherwise the proxy runs two relay threads, one carrying browser-to-server traffic and one carrying server-to-browser traffic, between the browser and the origin server.";

function Wide({ id }) {
  const m = `${id}-m`;
  return (
    <svg viewBox="0 0 960 330" role="img" aria-labelledby={`${id}-t ${id}-d`} className="h-auto w-full">
      <title id={`${id}-t`}>{TITLE}</title>
      <desc id={`${id}-d`}>{DESC}</desc>
      <Arrow id={m} />
      <Box x={10} y={130} w={150} h={64} title="Browser" />
      {/* the proxy, as a frame around its parts */}
      <rect x={220} y={10} width={520} height={310} className="fill-none stroke-ink" strokeWidth="1" strokeDasharray="4 4" />
      <text x={234} y={34} className="fill-muted font-mono text-[11px]">
        proxy (C++, Winsock)
      </text>
      <Box x={250} y={130} w={150} h={64} title="IP check" dark />
      <Box x={470} y={50} w={240} h={56} title="Local 403" sub="origin never contacted" />
      <Box x={470} y={150} w={240} h={56} title="Relay thread" sub="browser → origin" />
      <Box x={470} y={240} w={240} h={56} title="Relay thread" sub="origin → browser" />
      <Box x={800} y={130} w={150} h={64} title="Origin server" />

      <Edge d="M160,162 L248,162" marker={m} />
      <Edge d="M400,150 L468,80" label="blocked" lx={400} ly={104} marker={m} />
      <Edge d="M400,168 L468,178" label="allowed" lx={404} ly={190} marker={m} />
      <Edge d="M400,180 L468,266" marker={m} />
      <Edge d="M710,178 L798,162" marker={m} />
      <Edge d="M798,170 L710,266" marker={m} />
      <Edge d="M470,62 L85,62 L85,128" label="403 response" lx={240} ly={56} marker={m} />
      <Edge d="M470,280 L85,280 L85,196" label="response to browser" lx={240} ly={274} marker={m} />
    </svg>
  );
}

function Stacked({ id }) {
  const m = `${id}-m`;
  return (
    <svg viewBox="0 0 340 390" role="img" aria-labelledby={`${id}-t ${id}-d`} className="h-auto w-full">
      <title id={`${id}-t`}>{TITLE}</title>
      <desc id={`${id}-d`}>{DESC}</desc>
      <Arrow id={m} />
      <Box x={10} y={10} w={320} h={52} title="Browser" />
      <Edge d="M170,62 L170,98" marker={m} />
      <Box x={10} y={100} w={320} h={52} title="IP check" dark />
      <Edge d="M90,152 L90,190" label="blocked" lx={98} ly={176} marker={m} />
      <Box x={10} y={192} w={150} h={70} title="Local 403" sub={["origin never", "contacted"]} />
      <Edge d="M250,152 L250,190" label="allowed" lx={258} ly={176} marker={m} />
      <Box x={180} y={192} w={150} h={70} title="Relay threads" sub={["one per", "direction"]} />
      <Edge d="M255,262 L255,318" both marker={m} />
      <Box x={180} y={320} w={150} h={52} title="Origin" />
      <text x={10} y={300} className="fill-muted font-mono text-[10px]">
        403 goes straight back
      </text>
      <text x={10} y={314} className="fill-muted font-mono text-[10px]">
        to the browser
      </text>
    </svg>
  );
}

export default function ProxyDiagram() {
  const id = svgId(useId());
  return <Responsive wide={<Wide id={`w${id}`} />} stacked={<Stacked id={`s${id}`} />} />;
}
