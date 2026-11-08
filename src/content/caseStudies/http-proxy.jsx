import { CaseSection, CasePoint, CaseFigure } from "@/components/case/parts";
import ProxyDiagram from "@/components/case/ProxyDiagram";

export const meta = {
  slug: "http-proxy",
  title: "HTTP Security Proxy & TCP Server",
  summary: "A multi-threaded HTTP proxy in C++ that relays traffic both ways and turns away blocked clients.",
  facts: [{ label: "Stack", value: "C++ · Winsock · TCP sockets · threads", wide: true }],
};

export function Body() {
  return (
    <>
      <CaseSection num="01" label="The problem" title="Relay everything, block some">
        <p>
          The proxy sits between a browser and a web server and relays traffic in both directions. Some client IP
          addresses are prohibited: they get a local 403, and the proxy never contacts the origin server for them.
        </p>
      </CaseSection>

      <CaseSection num="02" label="How it works" title="Check first, then relay">
        <p>
          It&apos;s written in C++ with Winsock. Every connection starts with an IP check. A blocked client gets a 403
          straight from the proxy. An allowed client gets two relay threads, one for each direction, between the browser
          and the origin.
        </p>
        <CaseFigure>
          <ProxyDiagram />
        </CaseFigure>
        <p>
          It&apos;s built on a companion multi-client TCP server, which gives every connection its own worker thread.
        </p>
      </CaseSection>

      <CaseSection num="03" label="Decisions" title="Three decisions">
        <CasePoint title="One thread per direction">
          <p>
            <code>recv()</code> blocks until data arrives. A single thread waiting on the browser can&apos;t also notice
            the server sending something, and the other way round. Giving each direction its own thread lets each one
            block on its own socket, and the two sides never wait on each other.
          </p>
        </CasePoint>
        <CasePoint title="Downgrading requests to HTTP/1.0">
          <p>
            With HTTP/1.1, a server can keep the connection open after a response, so the proxy has to work out where
            each response ends. HTTP/1.0 closes the connection when the response is done, which gives the relay a clean,
            unambiguous end-of-response signal.
          </p>
        </CasePoint>
        <CasePoint title="Closing with FIN, not a reset">
          <p>
            A reset tears the connection down at once and can drop data that is still on its way. Closing politely with a
            FIN lets the other side receive everything that was sent before the connection ends.
          </p>
        </CasePoint>
      </CaseSection>
    </>
  );
}
