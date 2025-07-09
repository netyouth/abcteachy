

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

const featureCardVariants = cva(
  "transition-all duration-300 hover:scale-105",
  {
    variants: {
      variant: {
        default: "bg-card border border-border shadow-sm hover:shadow-md",
        filled: "bg-primary text-primary-foreground shadow-lg hover:shadow-xl",
        outlined: "border-2 border-primary bg-background hover:bg-primary/5",
        elevated: "shadow-lg hover:shadow-xl border-0",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const iconStyleVariants = cva(
  "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors mb-4",
  {
    variants: {
      iconStyle: {
        coral: "bg-coral text-white",
        "secondary-blue": "bg-secondary-blue text-white", 
        "secondary-green": "bg-secondary-green text-white",
        default: "bg-primary text-primary-foreground",
      },
    },
    defaultVariants: {
      iconStyle: "default",
    },
  }
);

interface FeatureCardProps 
  extends React.ComponentPropsWithoutRef<typeof Card>,
    VariantProps<typeof featureCardVariants> {
  icon: LucideIcon;
  title: string;
  description: string;
  iconStyle?: VariantProps<typeof iconStyleVariants>["iconStyle"];
}

const FeatureCard = React.forwardRef<
  React.ElementRef<typeof Card>,
  FeatureCardProps
>(({
  className,
  variant,
  size,
  icon: Icon,
  title,
  description,
  iconStyle,
  ...props
}, ref) => {
  return (
    <Card
      ref={ref}
      className={cn(featureCardVariants({ variant, size }), className)}
      {...props}
    >
      <CardContent className={cn(
        "flex flex-col items-start text-left",
        size === "sm" ? "p-4" : size === "lg" ? "p-8" : "p-6"
      )}>
        <div className={cn(iconStyleVariants({ iconStyle }))}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        
        <CardTitle className="text-base sm:text-lg font-semibold mb-2 leading-tight">
          {title}
        </CardTitle>
        
        <CardDescription className="text-sm sm:text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
});

FeatureCard.displayName = "FeatureCard";

export { FeatureCard, featureCardVariants, iconStyleVariants };
export type { FeatureCardProps }; 