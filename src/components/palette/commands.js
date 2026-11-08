import { projects, projectLink } from "@/data/projects";
import { site } from "@/data/site";

// Builds the palette's command list. `ctx` supplies the side effects so this
// stays a plain description of what the palette can do.
export function buildCommands(ctx) {
  const { onHome, reduced } = ctx;
  const cmds = [];

  const sections = [
    ["top", "Top"],
    ["readme", "Readme"],
    ["work", "The work"],
    ["log", "The log"],
    ["stack", "The stack"],
    ["contact", "Contact"],
  ];
  for (const [id, label] of sections) {
    cmds.push({ id: `go-${id}`, group: "Go to", label, run: () => ctx.goToSection(id) });
  }

  for (const p of projects) {
    const url = projectLink(p);
    if (!url) continue; // e.g. no public repo yet
    cmds.push({
      id: `project-${p.slug}`,
      group: p.href ? "Case study" : "Project",
      label: p.title,
      hint: p.href ? "" : "GitHub ↗",
      run: () => (p.href ? ctx.navigate(p.href) : ctx.openExternal(url)),
    });
  }

  cmds.push(
    { id: "copy-email", group: "Contact", label: "Copy email", hint: site.email, run: ctx.copyEmail },
    { id: "resume", group: "Links", label: "Open résumé", hint: "PDF ↗", run: () => ctx.openExternal(site.resume, "resume") },
    { id: "github", group: "Links", label: "Open GitHub", hint: "↗", run: () => ctx.openExternal(site.github) },
    { id: "linkedin", group: "Links", label: "Open LinkedIn", hint: "↗", run: () => ctx.openExternal(site.linkedin) },
    { id: "colophon", group: "Links", label: "Colophon", hint: "how this site is made", run: () => ctx.navigate("/colophon") }
  );

  if (onHome) {
    for (const [algo, label] of [
      ["bfs", "BFS"],
      ["dijkstra", "Dijkstra"],
      ["astar", "A*"],
    ]) {
      cmds.push({
        id: `algo-${algo}`,
        group: "Pathfinder",
        label: `Switch to ${label}`,
        run: () => ctx.pathfinder({ type: "algo", value: algo }),
      });
    }
    cmds.push({ id: "new-route", group: "Pathfinder", label: "Run a new route", run: () => ctx.pathfinder({ type: "route" }) });
  }

  cmds.push({
    id: "reduce-motion",
    group: "Settings",
    label: reduced ? "Turn motion back on" : "Reduce motion",
    hint: "this session",
    keywords: "animation accessibility",
    run: ctx.toggleMotion,
  });

  return cmds;
}
