
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 hover-scale">
            <img 
              src="/lovable-uploads/a48522f4-db07-475a-b8dc-96da5a16426a.png" 
              alt="ABC Teachy Logo" 
              className="h-12 sm:h-16 w-auto transition-all duration-300 hover:drop-shadow-lg"
            />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#tutors" className="text-gray-700 hover:text-coral font-medium transition-all duration-300 hover-lift relative group">
              Find Tutors
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#students" className="text-gray-700 hover:text-coral font-medium transition-all duration-300 hover-lift relative group">
              For Students
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#teachers" className="text-gray-700 hover:text-coral font-medium transition-all duration-300 hover-lift relative group">
              For Teachers
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-coral font-medium transition-all duration-300 hover-lift relative group">
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>
          
          {/* Desktop Sign In Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="border-coral text-coral hover:bg-coral hover:text-white transition-all duration-300 hover-lift hover-glow"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-slide-up">
            <nav className="flex flex-col space-y-4">
              <a 
                href="#tutors" 
                className="text-gray-700 hover:text-coral font-medium transition-colors py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Find Tutors
              </a>
              <a 
                href="#students" 
                className="text-gray-700 hover:text-coral font-medium transition-colors py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                For Students
              </a>
              <a 
                href="#teachers" 
                className="text-gray-700 hover:text-coral font-medium transition-colors py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                For Teachers
              </a>
              <a 
                href="#how-it-works" 
                className="text-gray-700 hover:text-coral font-medium transition-colors py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <Button 
                variant="outline" 
                className="border-coral text-coral hover:bg-coral hover:text-white transition-all duration-300 mt-4 self-start"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
