"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const featureCardVariants = cva(
  "group transition-all duration-300 hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-background border hover:-translate-y-1",
        filled: "bg-muted/50 border-0",
        outlined: "border-2 hover:border-primary/50",
        elevated: "shadow-sm hover:shadow-xl",
      },
      size: {
        default: "p-5 sm:p-6",
        sm: "p-4",
        lg: "p-6 sm:p-8",
      },
      iconStyle: {
        default: "bg-primary/10 text-primary",
        coral: "bg-coral/10 text-coral",
        "secondary-blue": "bg-secondary-blue/10 text-secondary-blue",
        "secondary-green": "bg-secondary-green/10 text-secondary-green",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      iconStyle: "coral",
    },
  }
);

const iconContainerVariants = cva(
  "flex items-center justify-center rounded-lg transition-colors duration-300",
  {
    variants: {
      size: {
        default: "w-10 h-10 sm:w-12 sm:h-12",
        sm: "w-8 h-8",
        lg: "w-14 h-14",
      },
      iconStyle: {
        default: "bg-primary/10 text-primary group-hover:bg-primary/20",
        coral: "bg-coral/10 text-coral group-hover:bg-coral/20",
        "secondary-blue": "bg-secondary-blue/10 text-secondary-blue group-hover:bg-secondary-blue/20",
        "secondary-green": "bg-secondary-green/10 text-secondary-green group-hover:bg-secondary-green/20",
      },
    },
    defaultVariants: {
      size: "default",
      iconStyle: "coral",
    },
  }
);

export interface FeatureCardProps
  extends React.ComponentPropsWithoutRef<typeof Card>,
    VariantProps<typeof featureCardVariants> {
  icon: LucideIcon;
  title: string;
  description: string;
  iconSize?: VariantProps<typeof iconContainerVariants>["size"];
}

const FeatureCard = React.forwardRef<
  React.ElementRef<typeof Card>,
  FeatureCardProps
>(({ 
  className, 
  variant, 
  size, 
  iconStyle, 
  iconSize, 
  icon: Icon, 
  title, 
  description, 
  ...props 
}, ref) => {
  return (
    <Card
      ref={ref}
      className={cn(featureCardVariants({ variant, className }))}
      {...props}
    >
      <CardContent className={cn("space-y-3 sm:space-y-4", size === "sm" ? "p-4" : size === "lg" ? "p-6 sm:p-8" : "p-5 sm:p-6")}>
        <div className={cn(iconContainerVariants({ size: iconSize || size, iconStyle }))}>
          <Icon className={cn(
            "transition-transform duration-300 group-hover:scale-110",
            iconSize === "sm" || size === "sm" ? "w-4 h-4" : 
            iconSize === "lg" || size === "lg" ? "w-7 h-7" : 
            "w-5 h-5 sm:w-6 sm:h-6"
          )} />
        </div>
        <div className="space-y-2">
          <CardTitle className={cn(
            "font-semibold text-foreground leading-tight",
            size === "sm" ? "text-sm" : size === "lg" ? "text-lg sm:text-xl" : "text-base sm:text-lg"
          )}>
            {title}
          </CardTitle>
          <CardDescription className={cn(
            "text-muted-foreground leading-relaxed",
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm sm:text-base"
          )}>
            {description}
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
});

FeatureCard.displayName = "FeatureCard";

export { FeatureCard, featureCardVariants }; 