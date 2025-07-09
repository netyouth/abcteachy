
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Mail, Facebook, Twitter, Instagram, Phone, Clock, MapPin } from "lucide-react";

const Footer = () => {
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  const navigationLinks = [
    { href: "#tutors", label: "Find Tutors" },
    { href: "#students", label: "For Students" },
    { href: "#teachers", label: "For Teachers" },
    { href: "#how-it-works", label: "How It Works" },
  ];

  return (
    <footer className="w-full bg-gray-900 text-white py-12 sm:py-16 md:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info & Newsletter */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/a48522f4-db07-475a-b8dc-96da5a16426a.png" 
                alt="ABC Teachy Logo" 
                className="h-10 w-auto filter brightness-0 invert"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <Badge variant="secondary" className="bg-coral/20 text-coral border-coral/30">
                Cambridge Specialists
              </Badge>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Master Cambridge English exams with expert tutors and interactive lessons. 
              Specializing in KET, PET, and YLE exam preparation.
            </p>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-coral" />
                  <span>Get free English tips weekly!</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit} className="flex space-x-2">
                  <Input 
                    type="email" 
                    placeholder="Enter your email"
                    className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-300 focus:border-coral focus:ring-coral/20"
                  />
                  <Button type="submit" className="bg-coral hover:bg-coral/90 text-white">
                    <Mail className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Info */}
          <div>
            <Card className="bg-transparent border-gray-700 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-coral" />
                  <span>Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Mail className="w-4 h-4 text-coral flex-shrink-0" />
                    <span>support@abcteachy.com</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Phone className="w-4 h-4 text-coral flex-shrink-0" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-start space-x-3 text-gray-300">
                    <Clock className="w-4 h-4 text-coral flex-shrink-0 mt-0.5" />
                    <div>
                      <p>Monday - Friday</p>
                      <p>9AM - 6PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Links */}
          <div>
            <Card className="bg-transparent border-gray-700 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-coral" />
                  <span>Quick Links</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-3">
                  {navigationLinks.map((link) => (
                    <a 
                      key={link.href}
                      href={link.href} 
                      className="block text-sm text-gray-300 hover:text-coral transition-colors duration-200 hover:translate-x-1 transform"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Separator className="bg-gray-700 mb-8" />
        
        {/* Social Links and Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex space-x-4">
            {socialLinks.map((social) => (
              <Button
                key={social.label}
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-gray-400 hover:text-coral hover:bg-coral/10 transition-all duration-200"
                asChild
              >
                <a href={social.href} aria-label={social.label}>
                  <social.icon className="w-5 h-5" />
                </a>
              </Button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>© 2024 ABC Teachy. All rights reserved.</span>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              Made with ❤️
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
