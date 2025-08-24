import { Mail, Phone, MapPin, Linkedin, Instagram, Send } from "lucide-react";
import React from "react";
import { cn } from "@/lib/util";
import { useToast } from "../hooks/use-toast";
import { useState } from "react";

const ContactsSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thank you for reaching out! I'll get back to you soon.",
      });
      setIsSubmitting(false);
    }, 1500); // Simulate a delay for form submission
    // Handle form submission logic here
    console.log("Form submitted");
  };
  return (
    <section id="contact" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left side: Contact Information */}
          <div className="space-y-8">
            <h3 className="text-2xl font-semibold text-center md:text-left">
              Contact Information
            </h3>

            <div className="space-y-6 text-left">
              {/* Email */}
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Email</h4>
                  <a
                    href="mailto:feranmidyro@gmail.com"
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    feranmidyro@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Phone</h4>
                  <a
                    href="tel:+16187914711"
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    +1 (618) 791-4711
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Location</h4>
                  <p className="text-muted-foreground">Edwardsville, IL</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-6 flex flex-col items-center md:items-start text-left">
              <h4 className="font-semibold mb-3 text-center md:text-left">
                Connect With Me
              </h4>
              <div className="flex space-x-4">
                <a
                  href="https://www.linkedin.com/in/oluwaferanmi-odedairo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  <Linkedin />
                </a>
                <a
                  href="https://www.instagram.com/ferannn_/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  <Instagram />
                </a>
              </div>
            </div>
          </div>

          {/* Right side: Message Form */}
          <div className="bg-card p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-6 text-center">
              Send a Message
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2 text-muted-foreground"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300"
                  placeholder="Feran Odedairo..."
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 text-muted-foreground"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300"
                  placeholder="hello@gmail.com..."
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2 text-muted-foreground"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="w-full px-4 py-3 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300 resize-none placeholder:text-muted-foreground"
                  placeholder="Hello, I would like to talk about..."
                  required
                />
              </div>
              <button
                disabled={isSubmitting}
                type="submit"
                className={cn(
                  "cosmic-button w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold hover:bg-primary/dark transition-colors duration-300"
                )}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactsSection;
