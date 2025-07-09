
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  const aboutLinks = [
    { href: "#teachers", label: "For Teachers" },
    { href: "#students", label: "For Students" },
    { href: "#careers", label: "Careers" },
    { href: "#contact", label: "Contact" },
    { href: "#blog", label: "Blog" },
  ];

  const supportLinks = [
    { href: "#help", label: "Help Center" },
    { href: "#privacy", label: "Privacy" },
    { href: "#terms", label: "Terms" },
  ];

  const examLinks = [
    { href: "#ket", label: "KET (A2 Key)" },
    { href: "#pet", label: "PET (B1 Preliminary)" },
    { href: "#yle", label: "Young Learners" },
    { href: "#fce", label: "FCE (B2 First)" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="w-full bg-coral py-12 sm:py-16 md:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-white text-3xl font-duolingo-heading mb-6">
              ABC Teachy
            </h2>
          </div>

          {/* About Us */}
          <div>
            <h3 className="text-white font-duolingo-bold text-lg mb-4">About us</h3>
            <nav className="space-y-3">
              {aboutLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-white/80 hover:text-white transition-colors duration-200 text-sm font-duolingo-body"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-duolingo-bold text-lg mb-4">Support</h3>
            <nav className="space-y-3">
              {supportLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-white/80 hover:text-white transition-colors duration-200 text-sm font-duolingo-body"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Cambridge Exams */}
          <div>
            <h3 className="text-white font-duolingo-bold text-lg mb-4">Cambridge Exams</h3>
            <nav className="space-y-3">
              {examLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-white/80 hover:text-white transition-colors duration-200 text-sm font-duolingo-body"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Social Links and Copyright */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                  asChild
                >
                  <a href={social.href} aria-label={social.label}>
                    <social.icon className="w-5 h-5" />
                  </a>
                </Button>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-white/70 text-sm font-duolingo-ui tracking-wide">
              © 2024 ABC TEACHY. ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
