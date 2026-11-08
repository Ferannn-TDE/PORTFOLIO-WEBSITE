import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Readme from "@/components/Readme";
import Work from "@/components/Work";
import Log from "@/components/Log";
import Stack from "@/components/Stack";
import Marquee from "@/components/Marquee";
import Footer from "@/components/Footer";
import { useReveal } from "@/hooks/useReveal";

export default function Home() {
  useReveal();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[70] bg-button px-4 py-3 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Nav />
      <Hero />
      <main id="main" tabIndex={-1} className="outline-none">
        <Readme />
        <Work />
        <Log />
        <Stack />
      </main>
      <Marquee />
      <Footer />
    </>
  );
}
