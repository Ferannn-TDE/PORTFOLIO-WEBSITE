import { ArrowUp } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="w-full py-12 px-4 bg-secondary/30 relative border-border mt-12 pt-8 text-center text-sm">
      <p>
        &copy; {new Date().getFullYear()} Feran Odedairo, All rights reserved
      </p>

      {/* Floating Arrow */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce-small">
        <a href="#hero" className="flex flex-col items-center space-y-1">
          <ArrowUp className="w-6 h-6 text-primary hover:text-primary/dark transition-colors duration-300" />
          Scroll Up
        </a>
      </div>
    </footer>
  );
};

export default Footer;
