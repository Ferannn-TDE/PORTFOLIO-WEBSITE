import { useEffect } from "react";
import { startIntroWatch } from "@/lib/intro";

// Hooks the static boot overlay (index.html) up once React has mounted.
export default function Intro() {
  useEffect(() => startIntroWatch(), []);
  return null;
}
