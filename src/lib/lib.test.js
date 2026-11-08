import { describe, it, expect } from "vitest";
import { fuzzyMatch, fuzzyFilter } from "./fuzzy.js";
import { timeAgo } from "./time.js";

describe("fuzzyMatch", () => {
  it("matches characters in order, case-insensitively", () => {
    expect(fuzzyMatch("cpy", "Copy email")).not.toBeNull();
    expect(fuzzyMatch("ypc", "Copy email")).toBeNull();
    expect(fuzzyMatch("COPY", "copy email")).not.toBeNull();
  });

  it("ignores spaces in the query", () => {
    expect(fuzzyMatch("go work", "Go to The work")).not.toBeNull();
  });

  it("ranks word starts and consecutive runs above scattered hits", () => {
    const items = ["Open résumé", "Reduce motion", "Go to The stack"];
    const ranked = fuzzyFilter("re", items, (x) => x).map((r) => r.item);
    expect(ranked[0]).toBe("Reduce motion");
  });

  it("keeps the original order for an empty query", () => {
    const items = ["b", "a", "c"];
    expect(fuzzyFilter("  ", items, (x) => x).map((r) => r.item)).toEqual(items);
  });

  it("returns the matched indices for highlighting", () => {
    expect(fuzzyMatch("fs", "FairSynq").indices).toEqual([0, 4]);
  });
});

describe("timeAgo", () => {
  const now = Date.parse("2026-11-08T12:00:00Z");
  const ago = (ms) => new Date(now - ms).toISOString();
  it("formats seconds, minutes, hours, days and weeks", () => {
    expect(timeAgo(ago(20e3), now)).toBe("just now");
    expect(timeAgo(ago(5 * 60e3), now)).toBe("5m ago");
    expect(timeAgo(ago(3 * 3600e3), now)).toBe("3h ago");
    expect(timeAgo(ago(2 * 86400e3), now)).toBe("2d ago");
    expect(timeAgo(ago(15 * 86400e3), now)).toBe("2w ago");
  });
  it("returns an empty string for a bad date", () => {
    expect(timeAgo("nope", now)).toBe("");
  });
});
