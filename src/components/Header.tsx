
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/a48522f4-db07-475a-b8dc-96da5a16426a.png" 
              alt="ABC Teachy Logo" 
              className="h-16 w-auto"
            />
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#tutors" className="text-gray-700 hover:text-learning-blue font-medium transition-all duration-200 hover-lift">
              Find Tutors
            </a>
            <a href="#students" className="text-gray-700 hover:text-learning-blue font-medium transition-all duration-200 hover-lift">
              For Students
            </a>
            <a href="#teachers" className="text-gray-700 hover:text-learning-blue font-medium transition-all duration-200 hover-lift">
              For Teachers
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-learning-blue font-medium transition-all duration-200 hover-lift">
              How It Works
            </a>
          </nav>
          
          {/* Sign In Button - Trust Building Blue */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="border-learning-blue text-learning-blue hover:bg-learning-blue hover:text-white transition-all duration-200 hover-glow"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
