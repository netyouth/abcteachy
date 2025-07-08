
import { Button } from "@/components/ui/button";
import { LogIn, Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/a48522f4-db07-475a-b8dc-96da5a16426a.png" 
              alt="ABC Teachy Logo" 
              className="h-12 sm:h-14 lg:h-16 w-auto"
            />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#tutors" className="text-gray-700 hover:text-coral font-medium font-duolingo-body transition-colors duration-200 text-sm lg:text-base">
              Find Tutors
            </a>
            <a href="#students" className="text-gray-700 hover:text-coral font-medium font-duolingo-body transition-colors duration-200 text-sm lg:text-base">
              For Students
            </a>
            <a href="#teachers" className="text-gray-700 hover:text-coral font-medium font-duolingo-body transition-colors duration-200 text-sm lg:text-base">
              For Teachers
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-coral font-medium font-duolingo-body transition-colors duration-200 text-sm lg:text-base">
              How It Works
            </a>
          </nav>
          
          {/* Desktop Sign In Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="border-coral text-coral hover:bg-coral hover:text-white font-duolingo-body transition-all duration-200 text-sm lg:text-base"
              size="sm"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-3 pt-4">
              <a href="#tutors" className="text-gray-700 hover:text-coral font-medium font-duolingo-body transition-colors duration-200 py-2">
                Find Tutors
              </a>
              <a href="#students" className="text-gray-700 hover:text-coral font-medium font-duolingo-body transition-colors duration-200 py-2">
                For Students
              </a>
              <a href="#teachers" className="text-gray-700 hover:text-coral font-medium font-duolingo-body transition-colors duration-200 py-2">
                For Teachers
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-coral font-medium font-duolingo-body transition-colors duration-200 py-2">
                How It Works
              </a>
              <Button 
                variant="outline" 
                className="border-coral text-coral hover:bg-coral hover:text-white font-duolingo-body transition-all duration-200 mt-4 w-full"
                size="sm"
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
