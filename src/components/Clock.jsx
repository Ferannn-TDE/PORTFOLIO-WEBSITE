import { useEffect, useState } from "react";
import { site } from "@/data/site";

const fmt = () => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: site.timeZone,
    }).format(new Date());
  } catch {
    return "--:--";
  }
};

// Edwardsville time with a blinking colon. Re-renders only when the minute changes.
export default function Clock({ dot = true, className = "" }) {
  const [time, setTime] = useState(fmt);

  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  const [hh, mm] = time.split(":");

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {dot && <span className="pulse relative inline-block size-[7px] rounded-full bg-ok" aria-hidden="true" />}
      <span>{site.location}</span>
      <span aria-hidden="true">·</span>
      <time aria-label={`Local time ${time}, Central`}>
        {hh}
        <span className="blink">:</span>
        {mm}
      </time>
    </span>
  );
}
