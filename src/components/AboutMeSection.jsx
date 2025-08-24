import { Briefcase, Code, User } from "lucide-react";
import React from "react";

const AboutMeSection = () => {
  return (
    <section id="about" className="py-24 px-4 relative">
      <div className="container max-w-5xl mx-auto text-center z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-12">
          About <span className="text-primary">Me</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">
              Creative Coder & CS Student
            </h3>
            <p className="text-muted-foreground">
              I have over 4 years of experience in web development, I’m
              passionate about building innovative, user-friendly applications
              and solving complex problems through code.
            </p>
            <p className="text-muted-foreground">
              I also have a background in data analysis, software engineering,
              machine learning, and web development, I’m constantly exploring
              new technologies to bring ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <a href="#contact" className="cosmic-button">
                Get In Touch
              </a>
              <a
                href="/Oluwaferanmi's Resume 6.9.26.pdf"
                className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors duration-300"
              >
                Download Resume
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">Web Development</h4>
                  <p className="text-muted-foreground">
                    I turn coffee into websites faster than you can say “Have
                    you tried clearing your cache?”.
                  </p>
                </div>
              </div>
            </div>
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">Project Management</h4>
                  <p className="text-muted-foreground">
                    I've led teams through projects from conception to
                    completion with agile methodoligies.
                  </p>
                </div>
              </div>
            </div>
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">
                    Software Engineering
                  </h4>
                  <p className="text-muted-foreground">
                    I also build scalable, efficient, and maintainable software
                    solutions — the kind that won’t collapse when your user base
                    suddenly triples overnight.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMeSection;
