import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Intro from "./components/motion/Intro";
import Cursor from "./components/motion/Cursor";
import Palette from "./components/palette/Palette";
import Toaster from "./components/Toaster";
import RouteEffects from "./components/RouteEffects";

// Secondary pages are split out of the home page bundle.
const CaseStudy = lazy(() => import("./pages/CaseStudy"));
const Colophon = lazy(() => import("./pages/Colophon"));

export default function App() {
  return (
    <BrowserRouter>
      <Intro />
      <Cursor />
      <Palette />
      <Toaster />
      <RouteEffects />
      <Suspense fallback={null}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="work/:slug" element={<CaseStudy />} />
          <Route path="colophon" element={<Colophon />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
