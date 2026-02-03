import { ArrowRight, ExternalLink, Github } from "lucide-react";
import React from "react";

const projects = [
  {
    id: 1,
    title: "Weather Forecast App",
    description:
      "A sleek and modern weather application built with React and Tailwind CSS. Features real-time weather data with a beautiful glassmorphism design, search functionality for any city worldwide, and displays temperature, humidity, and wind speed. The app provides accurate weather information with an intuitive purple gradient interface optimized for both desktop and mobile devices.",
    image: "/projects/weather-app.png",
    tags: ["React", "Tailwind CSS", "Weather API"],
    demoUrl: "#", // Update later
    gitHubUrl: "#", // Update later
  },
  {
    id: 2,
    title: "RA Shift Scheduling System",
    description:
      "A comprehensive Resident Assistant scheduling platform designed to streamline shift management across campus housing. Features automated shift assignment, calendar integration, availability tracking, and real-time notifications. The system includes morning/evening shift toggles, user management, and an intuitive dashboard for viewing monthly rosters. Built with a clean, professional interface that makes scheduling effortless.",
    image: "/projects/ra-scheduling.png",
    tags: ["React", "Calendar API", "TypeScript"],
    demoUrl: "#", // Update later
    gitHubUrl: "#", // Update later
  },
  {
    id: 3,
    title: "SIUE Campus Navigation Optimizer",
    description:
      "An intelligent campus navigation tool specifically designed for SIUE students. Features multi-factor pathfinding that considers distance, stairs, hills, crowding, and accessibility needs. The system provides real-time route recommendations with adjustable preferences (speed vs. comfort), displays multiple route options with detailed turn-by-turn directions, and adapts to class transition times. Includes SIUE-branded design with the iconic 'e' sculpture as a design element.",
    image: "/projects/siue-navigator.png",
    tags: ["React", "Pathfinding Algorithm", "Maps API"],
    demoUrl: "#", // Update later
    gitHubUrl: "#", // Update later
  },
  {
    id: 4,
    title: "Recipe Discovery & Management App",
    description:
      "A beautifully designed recipe application featuring a curated collection of international dishes. Includes recipe search by ingredients or cuisine type, favorites management system, detailed cooking instructions with timing, and serving size information. The app showcases stunning food photography with category filters (Beef, Chicken, Dessert, Lamb) and an elegant, minimalist interface optimized for mobile cooking experiences.",
    image: "/projects/recipe-app.png",
    tags: ["React Native", "Recipe API", "Mobile UI"],
    demoUrl: "#", // Update later
    gitHubUrl: "#", // Update later
  },
  {
    id: 5,
    title: "Saas Landing Page",
    description:
      "A modern and responsive landing page for a SaaS product, built with React and Tailwind CSS. This project showcases a sleek, user-friendly interface with fully responsive design across desktop, tablet, and mobile devices. It includes interactive components, smooth animations, and optimized performance for fast loading times.",
    image: "/projects/saas-landing.png",
    tags: ["React", "Tailwind CSS", "JavaScript"],
    demoUrl: "https://ferans-shopping-app.netlify.app/",
    gitHubUrl: "https://github.com/Ferannn-TDE/SHOPPING-APP",
  },
  {
    id: 6,
    title: "Tic-Tac-Toe Game",
    description:
      "An interactive Tic-Tac-Toe game built with React and styled using Tailwind CSS. It features a clean, responsive design, smooth game logic, and real-time winner detection, providing a fun and engaging user experience across all devices.",
    image: "/projects/tic-tac-toe.png",
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
                    <a
                      target="_blank"
                      href={project.demoUrl}
                      className="text-foreground/80 hover:text-primary transition-colors duration-300"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={20} />
                    </a>
                    <a
                      target="_blank"
                      href={project.gitHubUrl}
                      className="text-foreground/80 hover:text-primary transition-colors duration-300"
                      rel="noopener noreferrer"
                    >
                      <Github size={20} />
                    </a>
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
