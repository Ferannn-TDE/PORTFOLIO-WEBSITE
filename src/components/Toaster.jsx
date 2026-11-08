import { useSyncExternalStore } from "react";
import { getToast, subscribeToast } from "@/lib/toast";

// The live region is always mounted so screen readers pick up each message.
// Motion (fade + rise) is switched off by html.reduce-motion.
export default function Toaster() {
  const t = useSyncExternalStore(subscribeToast, getToast, () => null);
  return (
    <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      <div
        key={t?.id}
        className={`toast bg-button px-4 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-cream ${t ? "is-shown" : ""}`}
      >
        {t?.message}
      </div>
    </div>
  );
}
