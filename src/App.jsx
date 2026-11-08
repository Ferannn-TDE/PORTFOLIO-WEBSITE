import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Intro from "./components/motion/Intro";
import Cursor from "./components/motion/Cursor";

export default function App() {
  return (
    <BrowserRouter>
      <Intro />
      <Cursor />
      <Routes>
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
