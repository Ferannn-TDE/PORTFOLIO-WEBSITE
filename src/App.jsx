import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Intro from "./components/motion/Intro";
import Cursor from "./components/motion/Cursor";
import Palette from "./components/palette/Palette";
import Toaster from "./components/Toaster";

export default function App() {
  return (
    <BrowserRouter>
      <Intro />
      <Cursor />
      <Palette />
      <Toaster />
      <Routes>
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
