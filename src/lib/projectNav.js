import { projects, projectLink } from "@/data/projects";

// Previous and next project, cycling in row order. Projects without anywhere
// to go are skipped, so this never produces a dead link.
export function neighbours(slug, list = projects) {
  const linked = list.filter((p) => projectLink(p));
  const i = linked.findIndex((p) => p.slug === slug);
  if (i === -1 || linked.length < 2) return [];
  const prev = linked[(i - 1 + linked.length) % linked.length];
  const next = linked[(i + 1) % linked.length];
  return prev === next ? [["Next", next]] : [["Previous", prev], ["Next", next]];
}
