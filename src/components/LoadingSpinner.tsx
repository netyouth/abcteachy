

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const loadingSpinnerVariants = cva(
  "fixed inset-0 flex flex-col items-center justify-center z-50",
  {
    variants: {
      variant: {
        default: "bg-background",
        transparent: "bg-background/80 backdrop-blur-sm",
        solid: "bg-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type AnimationPhase = 'logo' | 'tagline' | 'cycling' | 'final';

interface LoadingSpinnerProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof loadingSpinnerVariants> {
  logoSrc?: string;
  logoAlt?: string;
  dynamicWords?: string[];
  finalText?: string;
  taglineText?: string;
  subtitleText?: string;
  duration?: {
    logo?: number;
    tagline?: number;
    cycling?: number;
    wordCycle?: number;
  };
  onComplete?: () => void;
  showProgress?: boolean;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({
    className,
    variant,
    logoSrc = "/lovable-uploads/a48522f4-db07-475a-b8dc-96da5a16426a.png",
    logoAlt = "ABC Teachy Logo",
    dynamicWords = ['LEARN', 'COMMUNICATE', 'EXCEL'],
    finalText = "ABC TEACHY",
    taglineText = "ANYONE CAN",
    subtitleText = "WITH THE RIGHT TEACHER",
    duration = {
      logo: 600,
      tagline: 400,
      cycling: 1200,
      wordCycle: 400,
    },
    onComplete,
    showProgress = true,
    ...props
  }, ref) => {
    const [currentPhase, setCurrentPhase] = React.useState<AnimationPhase | null>(null);
    const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
    const [isComplete, setIsComplete] = React.useState(false);

    const timersRef = React.useRef<NodeJS.Timeout[]>([]);

    const clearAllTimers = React.useCallback(() => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    }, []);

    React.useEffect(() => {
      const timers: NodeJS.Timeout[] = [];

      // Phase 1: Logo appears
      const logoTimer = setTimeout(() => setCurrentPhase('logo'), duration.logo || 600);
      timers.push(logoTimer);

      // Phase 2: Tagline appears
      const taglineTimer = setTimeout(() => setCurrentPhase('tagline'), 
        (duration.logo || 600) + (duration.tagline || 400));
      timers.push(taglineTimer);

      // Phase 3: Start word cycling
      const cyclingTimer = setTimeout(() => {
        setCurrentPhase('cycling');
        
        const wordInterval = setInterval(() => {
          setCurrentWordIndex(prev => (prev + 1) % dynamicWords.length);
        }, duration.wordCycle || 400);

        // Stop word cycling and move to final phase
        const finalTimer = setTimeout(() => {
          clearInterval(wordInterval);
          setCurrentPhase('final');
          setIsComplete(true);
          
          // Call onComplete callback if provided
          if (onComplete) {
            const completeTimer = setTimeout(onComplete, 500);
            timers.push(completeTimer);
          }
        }, duration.cycling || 1200);
        
        timers.push(finalTimer);
      }, (duration.logo || 600) + (duration.tagline || 400) + 200);
      
      timers.push(cyclingTimer);
      timersRef.current = timers;

      return clearAllTimers;
    }, [dynamicWords.length, duration, onComplete, clearAllTimers]);

    const getPhaseNumber = (phase: AnimationPhase | null): number => {
      switch (phase) {
        case 'logo': return 1;
        case 'tagline': return 2;
        case 'cycling': return 3;
        case 'final': return 4;
        default: return 0;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(loadingSpinnerVariants({ variant }), className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        {/* Logo */}
        <div 
          className={cn(
            "transition-all duration-700 ease-out mb-12",
            currentPhase ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          )}
        >
          <img 
            src={logoSrc}
            alt={logoAlt}
            className="h-20 w-auto"
          />
        </div>
        
        {/* Main Text Container */}
        <div className="text-center font-duolingo space-y-6">
          {/* Tagline */}
          <div 
            className={cn(
              "transition-all duration-800 ease-out",
              currentPhase && getPhaseNumber(currentPhase) >= 2 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            )}
          >
            <span className="text-4xl font-duolingo font-bold text-foreground tracking-wide">
              {taglineText}
            </span>
          </div>
          
          {/* Dynamic Word / Final Text */}
          <div 
            className={cn(
              "transition-all duration-800 ease-out",
              currentPhase && getPhaseNumber(currentPhase) >= 3 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            )}
          >
            <div className="relative h-16 flex items-center justify-center">
              {currentPhase === 'final' ? (
                <span 
                  className={cn(
                    "text-5xl font-duolingo font-black text-coral tracking-wide",
                    "transition-all duration-500 ease-in-out"
                  )}
                >
                  {finalText}
                </span>
              ) : (
                <span 
                  key={`${dynamicWords[currentWordIndex]}-${currentWordIndex}`}
                  className={cn(
                    "text-5xl font-duolingo font-black text-coral tracking-wide",
                    "transition-opacity duration-300 ease-in-out"
                  )}
                >
                  {dynamicWords[currentWordIndex]}
                </span>
              )}
            </div>
          </div>
          
          {/* Subtitle */}
          <div 
            className={cn(
              "transition-all duration-800 ease-out delay-300",
              isComplete 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            )}
          >
            <span className="text-2xl font-duolingo font-semibold text-muted-foreground tracking-wide">
              {subtitleText}
            </span>
          </div>
        </div>
        
        {/* Progress Indicator */}
        {showProgress && (
          <div 
            className={cn(
              "absolute bottom-12 transition-opacity duration-500",
              currentPhase ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="flex space-x-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    i < getPhaseNumber(currentPhase) ? 'bg-coral' : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner, loadingSpinnerVariants };
export type { LoadingSpinnerProps, AnimationPhase }; 