
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full bg-white border-b border-gray-100">
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
            <a href="#tutors" className="text-gray-700 hover:text-coral font-medium transition-colors">
              Find Tutors
            </a>
            <a href="#students" className="text-gray-700 hover:text-coral font-medium transition-colors">
              For Students
            </a>
            <a href="#teachers" className="text-gray-700 hover:text-coral font-medium transition-colors">
              For Teachers
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-coral font-medium transition-colors">
              How It Works
            </a>
          </nav>
          
          {/* Sign In Button */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="border-coral text-coral hover:bg-coral hover:text-white transition-all duration-200"
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
