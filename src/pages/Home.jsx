import React from "react";
import ThemeToggle from "@/components/ThemeToggle";
import StarBackground from "@/components/StarBackground";
import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import AboutMeSection from "@/components/AboutMeSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactsSection from "@/components/ContactsSection";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ThemeToggle />
      <StarBackground />
      <NavBar />
      <main>
        <HeroSection />
        <AboutMeSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
