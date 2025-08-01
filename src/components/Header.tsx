

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { LogIn, Menu, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationItem {
  href: string;
  label: string;
  external?: boolean;
}

interface HeaderProps {
  className?: string;
  logoSrc?: string;
  logoAlt?: string;
  navigationItems?: NavigationItem[];
  showAuthButton?: boolean;
  onAuthClick?: () => void;
}

const defaultNavigationItems: NavigationItem[] = [
  { href: "#tutors", label: "Find Tutors" },
  { href: "#students", label: "For Students" },
  { href: "#teachers", label: "For Teachers" },
  { href: "#how-it-works", label: "How It Works" },
];

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({
    className,
    logoSrc = "/lovable-uploads/a48522f4-db07-475a-b8dc-96da5a16426a.png",
    logoAlt = "ABC Teachy Logo",
    navigationItems = defaultNavigationItems,
    showAuthButton = true,
    onAuthClick,
    ...props
  }, ref) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const navigate = useNavigate();
    const { user, profile, signOut } = useAuth();

    const handleAuthClick = () => {
      if (onAuthClick) {
        onAuthClick();
      } else {
        navigate('/login');
      }
    };

    const handleSignOut = async () => {
      await signOut();
      navigate('/');
    };

    const handleNavigationClick = (href: string, external?: boolean) => {
      if (external) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        // Smooth scroll to section
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      setIsMobileMenuOpen(false);
    };

    const AuthButton = ({ isMobile = false }: { isMobile?: boolean }) => {
      if (user && profile) {
        return (
          <div className={cn("flex items-center space-x-2", isMobile && "flex-col space-x-0 space-y-2 w-full")}>
            <span className="text-sm text-muted-foreground">
              Welcome, {profile.full_name}
            </span>
            {profile.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className={cn("flex items-center space-x-2", isMobile && "w-full")}
              >
                <User className="w-4 h-4" />
                <span>Admin Panel</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className={cn("flex items-center space-x-2", isMobile && "w-full")}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        );
      }

      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleAuthClick}
          className={cn(
            "flex items-center space-x-2 hover:bg-primary hover:text-primary-foreground transition-colors",
            isMobile && "w-full justify-center"
          )}
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </Button>
      );
    };

    const NavigationLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
      <nav className={cn(
        "flex items-center space-x-6 lg:space-x-8",
        isMobile && "flex-col space-x-0 space-y-4 w-full"
      )}>
        {navigationItems.map((item) => (
          <button
            key={item.href}
            onClick={() => handleNavigationClick(item.href, item.external)}
            className={cn(
              "text-muted-foreground hover:text-primary font-duolingo-ui transition-colors duration-200",
              "text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1",
              isMobile && "text-base w-full text-left py-2"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    );

  return (
      <header
        ref={ref}
        className={cn(
          "w-full bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50",
          className
        )}
        {...props}
      >
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
            <div className="flex items-center">
            <img 
                src={logoSrc}
                alt={logoAlt}
                className="h-12 sm:h-14 lg:h-16 w-auto transition-transform duration-200 hover:scale-105"
            />
          </div>
          
          {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <NavigationLinks />
              
              {showAuthButton && <AuthButton />}
          </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-6 mt-6">
                    <SheetTitle className="text-lg font-semibold">
                      Navigation
                    </SheetTitle>
                    
                    <NavigationLinks isMobile />
                    
                    {showAuthButton && (
                      <div className="mt-6">
                        <AuthButton isMobile />
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
      </div>
    </header>
  );
  }
);

Header.displayName = "Header";

export { Header };
export type { HeaderProps, NavigationItem };
