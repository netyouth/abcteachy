

import * as React from "react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { cn } from "@/lib/utils";

interface BackgroundBeamsWrapperProps extends React.ComponentPropsWithoutRef<"div"> {
  children?: React.ReactNode;
  showBeams?: boolean;
  intensity?: "low" | "medium" | "high";
  position?: "top" | "full" | "bottom";
}

const BackgroundBeamsWrapper = React.forwardRef<HTMLDivElement, BackgroundBeamsWrapperProps>(
  ({
    className,
    children,
    showBeams = true,
    intensity = "medium",
    position = "top",
    ...props
  }, ref) => {
    if (!showBeams) {
      return (
        <div
          ref={ref}
          className={cn("w-full h-full", className)}
          {...props}
        >
          {children}
        </div>
      );
    }

    const getPositionClasses = () => {
      switch (position) {
        case "top":
          return "absolute inset-x-0 top-20 w-full h-[calc(100vh-5rem)] pointer-events-none z-10";
        case "bottom":
          return "absolute inset-x-0 bottom-0 w-full h-[calc(100vh-5rem)] pointer-events-none z-10";
        case "full":
          return "absolute inset-0 w-full h-full pointer-events-none z-10";
        default:
          return "absolute inset-x-0 top-20 w-full h-[calc(100vh-5rem)] pointer-events-none z-10";
      }
    };

    return (
      <div
        ref={ref}
        className={cn(getPositionClasses(), className)}
        {...props}
      >
        <BackgroundBeamsWithCollision 
          className={cn(
            "h-full",
            intensity === "low" && "opacity-30",
            intensity === "medium" && "opacity-50",
            intensity === "high" && "opacity-70"
          )}
        >
          <div className="relative z-20 w-full h-full">
            {children}
          </div>
        </BackgroundBeamsWithCollision>
      </div>
    );
  }
);

BackgroundBeamsWrapper.displayName = "BackgroundBeamsWrapper";

export { BackgroundBeamsWrapper };
export type { BackgroundBeamsWrapperProps }; 