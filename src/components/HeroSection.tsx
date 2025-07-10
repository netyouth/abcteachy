

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import BookingForm from "./BookingForm";
import { PointerHighlight } from "./ui/pointer-highlight";
import { cn } from "@/lib/utils";

const heroSectionVariants = cva(
  "w-full bg-transparent min-h-screen flex items-center justify-center relative z-20 m-0 p-0",
  {
    variants: {
      variant: {
        default: "min-h-screen",
        compact: "min-h-[80vh]",
        full: "h-screen",
      },
      alignment: {
        center: "items-center justify-center",
        top: "items-start justify-center pt-20",
        bottom: "items-end justify-center pb-20",
      },
    },
    defaultVariants: {
      variant: "default",
      alignment: "center",
    },
  }
);

const heroContentVariants = cva(
  "w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto bg-transparent",
  {
    variants: {
      spacing: {
        default: "space-y-8 sm:space-y-12",
        compact: "space-y-6 sm:space-y-8",
        loose: "space-y-10 sm:space-y-16",
      },
    },
    defaultVariants: {
      spacing: "default",
    },
  }
);

interface HeroSectionProps
  extends React.ComponentPropsWithoutRef<"section">,
    VariantProps<typeof heroSectionVariants> {
  title?: string;
  highlightedWord?: string;
  tagline?: string;
  subtitle?: string;
  features?: string[];
  ctaText?: string;
  spacing?: VariantProps<typeof heroContentVariants>["spacing"];
  onCtaClick?: () => void;
  showBookingForm?: boolean;
  onBookingFormToggle?: (show: boolean) => void;
}

const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  ({
    className,
    variant,
    alignment,
    spacing,
    title = "Master English for Life —",
    highlightedWord = "Not Just for Exams",
    tagline = "Build real English skills that boost your confidence in every conversation, meeting, and opportunity.",
    subtitle = "From Cambridge exam prep (KET & PET) to fluent everyday conversations and professional meetings — we help students and professionals achieve their English goals.",
    features = ["1-on-1 personalized lessons", "Cambridge-certified tutors", "Learn on your schedule"],
    ctaText = "Start Your English Journey",
    onCtaClick,
    showBookingForm: controlledShowBookingForm,
    onBookingFormToggle,
    ...props
  }, ref) => {
    const [internalShowBookingForm, setInternalShowBookingForm] = React.useState(false);
    
    // Use controlled state if provided, otherwise use internal state
    const showBookingForm = controlledShowBookingForm ?? internalShowBookingForm;
    const setShowBookingForm = onBookingFormToggle ?? setInternalShowBookingForm;

    const handleCtaClick = React.useCallback(() => {
      if (onCtaClick) {
        onCtaClick();
      } else {
    setShowBookingForm(true);
      }
    }, [onCtaClick, setShowBookingForm]);

    const handleCloseForm = React.useCallback(() => {
    setShowBookingForm(false);
    }, [setShowBookingForm]);

  return (
      <section
        ref={ref}
        className={cn(heroSectionVariants({ variant, alignment }), className)}
        {...props}
      >
        <div className={cn(heroContentVariants({ spacing }))}>
          <div className="flex flex-col items-center text-center bg-transparent space-y-10 sm:space-y-12">
            {/* Main Content */}
            <div className="space-y-6 sm:space-y-8 bg-transparent">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-duolingo-heading text-foreground leading-tight">
                {title}{" "}
                <PointerHighlight containerClassName="align-baseline">
                  <span className="text-coral">{highlightedWord}</span>
                </PointerHighlight>
              </h1>
              
              <p className="text-lg sm:text-xl font-duolingo-body text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {tagline}
              </p>
              
              <p className="text-base sm:text-lg font-duolingo-body text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                {subtitle}
              </p>
              
              {/* Features List */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-coral rotate-45"></div>
                    <span className="text-sm sm:text-base font-duolingo-body text-foreground font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Call to Action */}
            <Button 
              onClick={handleCtaClick}
              size="lg" 
              className={cn(
                "bg-coral hover:bg-coral/90 text-white px-8 sm:px-12 py-4 sm:py-6",
                "text-lg sm:text-xl font-duolingo-bold rounded-full",
                "shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105",
                "focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
              )}
            >
              {ctaText}
            </Button>
          </div>
          
          {/* Booking Form Modal */}
          {showBookingForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="relative w-full max-w-md">
                <BookingForm onClose={handleCloseForm} />
                </div>
            </div>
          )}
      </div>
    </section>
  );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection, heroSectionVariants, heroContentVariants };
export type { HeroSectionProps };
