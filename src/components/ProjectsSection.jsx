import { ArrowRight, ExternalLink, Github } from "lucide-react";
import React from "react";

const projects = [
  {
    id: 1,
    title: "Saas Landing Page",
    description:
      "A modern and responsive landing page for a SaaS product, built with React and Tailwind CSS. This project showcases a sleek, user-friendly interface with fully responsive design across desktop, tablet, and mobile devices. It includes interactive components, smooth animations, and optimized performance for fast loading times.",
    image: "/projects/project1.png",
    tags: ["React", "Tailwind CSS", "JavaScript"],
    demoUrl: "https://ferans-shopping-app.netlify.app/",
    gitHubUrl: "https://github.com/Ferannn-TDE/SHOPPING-APP",
  },
  {
    id: 2,
    title: "Tic-Tac-Toe Game",
    description:
      "An interactive Tic-Tac-Toe game built with React and styled using Tailwind CSS. It features a clean, responsive design, smooth game logic, and real-time winner detection, providing a fun and engaging user experience across all devices.",
    image: "/projects/project2.png",
    tags: ["React", "Tailwind CSS", "JavaScript"],
    demoUrl: "https://ferans-tic-tac-toe-demo-game.netlify.app/",
    gitHubUrl: "https://github.com/Ferannn-TDE/TIC-TAC-TOE-GAME",
  },
  {
    id: 3,
    title: "Timer Challenge Game",
    description:
      "A fast-paced Timer Challenge game built with React and Tailwind CSS. Players test their reflexes by stopping the timer as close as possible to the target time. The project features dynamic state management, responsive UI design, and smooth user interactions for an engaging experience.",
    image: "/projects/project3.png",
    tags: ["React", "Tailwind CSS", "JavaScript"],
    demoUrl: "https://ferans-timer-challenge.netlify.app/",
    gitHubUrl: "https://github.com/Ferannn-TDE/TIMER-CHALLENGE-GAME",
  },
];

const ProjectsSection = () => {
  return (
    <section id="projects" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Featured <span className="text-primary"> Projects</span>
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
              <div className="h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                    >
                      <ExternalLink size={20} />
                    </a>
                    <a
                      target="_blank"
                      href={project.gitHubUrl}
                      className="text-foreground/80 hover:text-primary transition-colors duration-300"
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
