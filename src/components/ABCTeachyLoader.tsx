

import * as React from "react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const englishLearningStates = [
  {
    text: "Assembling your dream team of English wizards ✨",
  },
  {
    text: "Crafting lessons as unique as your accent 🎯",
  },
  {
    text: "Sprinkling some grammar magic on your materials 📚",
  },
  {
    text: "Designing your path to English mastery 🛤️",
  },
  {
    text: "Adding the finishing touches to perfection 🎨",
  },
  {
    text: "Ready to unlock your English superpowers! 🚀",
  },
];

interface ABCTeachyLoaderProps {
  loading?: boolean;
  onComplete?: () => void;
  duration?: number;
  autoComplete?: boolean;
  autoCompleteDelay?: number;
}

export const ABCTeachyLoader = React.forwardRef<HTMLDivElement, ABCTeachyLoaderProps>(
  ({
    loading = true,
    onComplete,
    duration = 1200,
    autoComplete = true,
    autoCompleteDelay = 6000,
  }, ref) => {
    const [isLoading, setIsLoading] = React.useState(loading);

    React.useEffect(() => {
      setIsLoading(loading);
    }, [loading]);

    React.useEffect(() => {
      if (autoComplete && isLoading) {
        const timer = setTimeout(() => {
          setIsLoading(false);
          if (onComplete) {
            onComplete();
          }
        }, autoCompleteDelay);

        return () => clearTimeout(timer);
      }
    }, [autoComplete, autoCompleteDelay, isLoading, onComplete]);

    const handleClose = () => {
      setIsLoading(false);
      if (onComplete) {
        onComplete();
      }
    };

    return (
      <div ref={ref}>
        <MultiStepLoader
          loadingStates={englishLearningStates}
          loading={isLoading}
          duration={duration}
          loop={false}
        />
        
        {/* Close Button */}
        {isLoading && (
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 right-4 z-[120] h-10 w-10 rounded-full bg-background/10 hover:bg-background/20 backdrop-blur-sm"
            onClick={handleClose}
            aria-label="Skip loading"
          >
            <X className="h-5 w-5 text-foreground" />
          </Button>
        )}
      </div>
    );
  }
);

ABCTeachyLoader.displayName = "ABCTeachyLoader";

export { englishLearningStates };
export type { ABCTeachyLoaderProps }; 