

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { LogIn, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

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
              "text-muted-foreground hover:text-primary font-medium font-duolingo-body transition-colors duration-200",
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
              
              {showAuthButton && (
            <Button 
              variant="outline" 
              size="sm"
                  onClick={onAuthClick}
                  className="flex items-center space-x-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
            </Button>
              )}
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
              <Button 
                variant="outline" 
                        onClick={onAuthClick}
                        className="flex items-center justify-center space-x-2 w-full mt-6"
              >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
              </Button>
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
