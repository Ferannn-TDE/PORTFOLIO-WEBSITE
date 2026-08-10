import { ArrowRight, ExternalLink, Github } from "lucide-react";
import React from "react";

const projects = [
  {
    id: 1,
    title: "FairSynq",
    description:
      "A multi-vendor food ordering platform for live events. Vendors manage menus and orders in real time while organizers run multi-fair marketplaces with built-in Stripe Connect payouts, queue-based order scheduling, and live status broadcasting.",
    image: "/projects/fairsynq.png",
    tags: [
      "Next.js",
      "TypeScript",
      "Tailwind",
      "Clerk",
      "Stripe Connect",
      "Supabase",
      "Firebase",
      "Upstash/BullMQ",
    ],
    demoUrl: "https://fair-synq.vercel.app/",
    gitHubUrl: "https://github.com/Ferannn-TDE",
  },
  {
    id: 2,
    title: "Cougar Connection CRM",
    description:
      "A web-based CRM built for the SIUE School of Engineering to track K–12 outreach across schools, contacts, and events. Surfaces county-level engagement analytics with color-coded rate badges, handles CSV and Excel bulk import with client-side column mapping, and generates filtered contact lists for email and mailing-label export — all backed by a live Supabase database.",
    image: "/projects/cougar-connection.png",
    tags: ["React", "TypeScript", "Supabase"],
    demoUrl: "#", // Update later — not deployed yet
    gitHubUrl: "https://github.com/Ferannn-TDE/School-Engagement-CRM",
  },
  {
    id: 3,
    title: "SIUE Campus Routing Visualizer",
    description:
      "A full-stack tool for visualizing and comparing shortest-path algorithms across a graph of the SIUE campus. Runs Dijkstra and Floyd–Warshall side by side with step-by-step playback, and reports total distance, run time, nodes visited, and edges relaxed over 50+ mapped buildings and 70+ weighted edges.",
    image: "/projects/siue-navigator.png",
    tags: ["Next.js", "FastAPI", "Pathfinding Algorithm"],
    demoUrl: "#", // Update later — localhost only
    gitHubUrl: "https://github.com/Ferannn-TDE/Algo-Main",
  },
  {
    id: 4,
    title: "HTTP Security Proxy & TCP Server",
    description:
      "A multi-threaded HTTP proxy built in C++ with Winsock that relays browser-to-server traffic in both directions and serves a local 403 to prohibited client IPs without ever contacting the origin. Spawns per-direction relay threads around blocking recv(), downgrades requests to HTTP/1.0 to force clean end-of-response signaling, and closes sockets with a polite FIN rather than a data-dropping reset. Built on a companion multi-client TCP server that hands every connection its own worker thread.",
    image: "/projects/http-proxy.png",
    tags: ["C++", "Winsock", "TCP Sockets"],
    demoUrl: "#", // Update later — console app, no live demo
    gitHubUrl: "https://github.com/Ferannn-TDE/cs447-http-security-proxy",
  },
  {
    id: 5,
    title: "SafeSite",
    description:
      "A mobile-first construction safety inspection app, designed and prototyped through a full HCI process, that guides workers through a four-part shift workflow. Moves from a PPE checklist to a color-coded floor plan, GPS-tagged hazard reporting with severity levels, and post-shift supervisor sign-off. Refined across two rounds of user testing and a Nielsen heuristic evaluation that surfaced eleven usability issues resolved before the final prototype.",
    image: "/projects/safesite.png",
    tags: ["React", "Tailwind CSS", "HCI Research"],
    demoUrl: "#", // Update later
    gitHubUrl: "https://github.com/Ferannn-TDE/Safe-Site",
  },
  {
    id: 6,
    title: "RA Shift Scheduling System",
    description:
      "A comprehensive Resident Assistant scheduling platform designed to streamline shift management across campus housing. Features automated shift assignment, calendar integration, availability tracking, and real-time notifications. The system includes morning/evening shift toggles, user management, and an intuitive dashboard for viewing monthly rosters. Built with a clean, professional interface that makes scheduling effortless.",
    image: "/projects/ra-scheduler.png",
    tags: ["React", "Calendar API", "TypeScript"],
    demoUrl: "#", // Update later
    gitHubUrl: "#", // Update later
  },
  {
    id: 7,
    title: "Recipe Discovery & Management App",
    description:
      "A beautifully designed recipe application featuring a curated collection of international dishes. Includes recipe search by ingredients or cuisine type, favorites management system, detailed cooking instructions with timing, and serving size information. The app showcases stunning food photography with category filters (Beef, Chicken, Dessert, Lamb) and an elegant, minimalist interface optimized for mobile cooking experiences.",
    image: "/projects/recipe-app-1.png",
    tags: ["React Native", "Recipe API", "Mobile UI"],
    demoUrl: "#", // Update later
    gitHubUrl: "#", // Update later
  },
  {
    id: 8,
    title: "Saas Landing Page",
    description:
      "A modern and responsive landing page for a SaaS product, built with React and Tailwind CSS. This project showcases a sleek, user-friendly interface with fully responsive design across desktop, tablet, and mobile devices. It includes interactive components, smooth animations, and optimized performance for fast loading times.",
    image: "/projects/project1.png",
    tags: ["React", "Tailwind CSS", "JavaScript"],
    demoUrl: "https://ferans-shopping-app.netlify.app/",
    gitHubUrl: "https://github.com/Ferannn-TDE/SHOPPING-APP",
  },
  {
    id: 9,
    title: "Tic-Tac-Toe Game",
    description:
      "An interactive Tic-Tac-Toe game built with React and styled using Tailwind CSS. It features a clean, responsive design, smooth game logic, and real-time winner detection, providing a fun and engaging user experience across all devices.",
    image: "/projects/project2.png",
    tags: ["React", "Tailwind CSS", "JavaScript"],
    demoUrl: "https://ferans-tic-tac-toe-demo-game.netlify.app/",
    gitHubUrl: "https://github.com/Ferannn-TDE/TIC-TAC-TOE-GAME",
  },
];

const ProjectsSection = () => {
  return (
    <section id="projects" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Featured <span className="text-primary">Projects</span>
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Here are some of my recent projects that showcase my skills and
          creativity. Each project was made with great attention to detail,
          performance, and user experience.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, key) => (
            <div
              key={key}
              className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover transition-shadow duration-300 flex flex-col"
            >
              <div className="h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback gradient if image doesn't exist yet
                    e.target.style.display = "none";
                  }}
                />
              </div>

              <div className="p-4 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, index) => (
                    <span
                      className="px-2 py-1 text-xs border font-medium rounded-full bg-secondary text-secondary-foreground"
                      key={index}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm mb-4 flex-1">
                  {project.description}
                </p>

                {/* Footer with border */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex space-x-3">
                    {project.demoUrl && project.demoUrl !== "#" && (
                      <a
                        target="_blank"
                        href={project.demoUrl}
                        className="text-foreground/80 hover:text-primary transition-colors duration-300"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                    {project.gitHubUrl && project.gitHubUrl !== "#" && (
                      <a
                        target="_blank"
                        href={project.gitHubUrl}
                        className="text-foreground/80 hover:text-primary transition-colors duration-300"
                        rel="noopener noreferrer"
                      >
                        <Github size={20} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://github.com/Ferannn-TDE"
            target="_blank"
            rel="noopener noreferrer"
            className="cosmic-button w-fit flex items-center justify-center gap-2 mx-auto"
          >
            Check my Github <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
