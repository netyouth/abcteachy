

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonialCardVariants = cva(
  "group transition-all duration-300 hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-background border",
        filled: "bg-muted/50 border-0",
        elevated: "shadow-sm hover:shadow-xl",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface TestimonialCardProps
  extends React.ComponentPropsWithoutRef<typeof Card>,
    VariantProps<typeof testimonialCardVariants> {
  name: string;
  location?: string;
  rating: number;
  quote: string;
  avatar?: string;
  avatarFallback?: string;
}

const TestimonialCard = React.forwardRef<
  React.ElementRef<typeof Card>,
  TestimonialCardProps
>(({ 
  className, 
  variant, 
  size, 
  name, 
  location, 
  rating, 
  quote, 
  avatar, 
  avatarFallback, 
  ...props 
}, ref) => {
  const maxRating = 5;
  const fallback = avatarFallback || name.charAt(0).toUpperCase();

  return (
    <Card
      ref={ref}
      className={cn(testimonialCardVariants({ variant, className }))}
      {...props}
    >
      <CardContent className={cn("space-y-4", size === "sm" ? "p-4" : size === "lg" ? "p-8" : "p-6")}>
        {/* Rating */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: maxRating }, (_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4 transition-colors",
                i < rating
                  ? "text-yellow-400 fill-current"
                  : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className={cn(
          "text-foreground leading-relaxed",
          size === "sm" ? "text-sm" : size === "lg" ? "text-base" : "text-sm sm:text-base"
        )}>
          &ldquo;{quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="flex items-center space-x-3 pt-2">
          <Avatar className="h-10 w-10">
            {avatar && <img src={avatar} alt={name} />}
            <AvatarFallback className="bg-coral/10 text-coral text-sm font-medium">
              {fallback}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-semibold text-foreground truncate",
              size === "sm" ? "text-sm" : "text-base"
            )}>
              {name}
            </p>
            {location && (
              <p className={cn(
                "text-muted-foreground truncate",
                size === "sm" ? "text-xs" : "text-sm"
              )}>
                {location}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TestimonialCard.displayName = "TestimonialCard";

export { TestimonialCard, testimonialCardVariants }; 