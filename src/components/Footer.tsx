
import { Button } from "@/components/ui/button";
import { Mail, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo and Newsletter */}
          <div className="md:col-span-2 space-y-6">
            <img 
              src="/lovable-uploads/a48522f4-db07-475a-b8dc-96da5a16426a.png" 
              alt="ABC Teachy Logo" 
              className="h-12 w-auto brightness-0 invert"
            />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Get free English tips weekly!</h3>
              <div className="flex space-x-3">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg text-gray-900"
                />
                <Button className="bg-coral hover:bg-coral/90">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-2 text-gray-300">
              <p>support@abcteachy.com</p>
              <p>+1 (555) 123-4567</p>
              <p>Monday - Friday: 9AM - 6PM</p>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <a href="#tutors" className="block text-gray-300 hover:text-coral transition-colors">
                Find Tutors
              </a>
              <a href="#students" className="block text-gray-300 hover:text-coral transition-colors">
                For Students
              </a>
              <a href="#teachers" className="block text-gray-300 hover:text-coral transition-colors">
                For Teachers
              </a>
              <a href="#how-it-works" className="block text-gray-300 hover:text-coral transition-colors">
                How It Works
              </a>
            </div>
          </div>
        </div>
        
        {/* Social Links and Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Facebook className="w-5 h-5 text-gray-400 hover:text-coral cursor-pointer transition-colors" />
            <Twitter className="w-5 h-5 text-gray-400 hover:text-coral cursor-pointer transition-colors" />
            <Instagram className="w-5 h-5 text-gray-400 hover:text-coral cursor-pointer transition-colors" />
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 ABC Teachy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
