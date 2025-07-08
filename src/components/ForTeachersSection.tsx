"use client";

import * as React from "react";
import { DollarSign, Clock, Heart, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { cn } from "@/lib/utils";

interface TeacherBenefit {
  icon: LucideIcon;
  title: string;
  description: string;
  iconStyle?: "coral" | "secondary-blue" | "secondary-green" | "default";
}

interface ForTeachersSectionProps extends React.ComponentPropsWithoutRef<"section"> {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  benefits?: TeacherBenefit[];
  onCtaClick?: () => void;
  showIllustration?: boolean;
}

const defaultBenefits: TeacherBenefit[] = [
  {
    icon: DollarSign,
    title: "Great Earning Potential",
    description: "Competitive rates with the flexibility to set your own prices",
    iconStyle: "coral"
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    description: "Teach when it works for you - set your own schedule",
    iconStyle: "secondary-blue"
  },
  {
    icon: Heart,
    title: "Supportive Community",
    description: "Join a network of passionate educators helping students succeed",
    iconStyle: "secondary-green"
  }
];

const ForTeachersSection = React.forwardRef<HTMLElement, ForTeachersSectionProps>(
  ({
    className,
    title = "Teach with ABC Teachy",
    subtitle = "Share your passion for English and make a meaningful impact on students worldwide while earning great income.",
    ctaText = "Join Our Team",
    benefits = defaultBenefits,
    onCtaClick,
    showIllustration = true,
    ...props
  }, ref) => {
    return (
      <section
        ref={ref}
        id="teachers"
        className={cn(
          "w-full bg-coral/5 py-16 sm:py-20 md:py-24",
          className
        )}
        {...props}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                  {title}
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  {subtitle}
                </p>
              </div>
              
              {/* Benefits */}
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={`${benefit.title}-${index}`} className="flex items-start space-x-4">
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                      benefit.iconStyle === "coral" && "bg-coral text-white",
                      benefit.iconStyle === "secondary-blue" && "bg-secondary-blue text-white",
                      benefit.iconStyle === "secondary-green" && "bg-secondary-green text-white",
                      (!benefit.iconStyle || benefit.iconStyle === "default") && "bg-primary text-primary-foreground"
                    )}>
                      <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 leading-tight">
                        {benefit.title}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Call to Action */}
              <Button 
                size="lg" 
                onClick={onCtaClick}
                className={cn(
                  "bg-coral hover:bg-coral/90 text-white px-8 py-6 text-lg font-semibold rounded-full",
                  "transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl",
                  "focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2"
                )}
              >
                {ctaText}
              </Button>
            </div>
            
            {/* Right Content - Illustration */}
            {showIllustration && (
              <div className="relative">
                <div className="bg-gradient-to-br from-coral/10 to-secondary-blue/10 rounded-3xl p-8 sm:p-12">
                  <div className="text-center space-y-6">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 bg-coral rounded-full flex items-center justify-center mx-auto">
                      <span className="text-6xl sm:text-7xl" role="img" aria-label="Teacher">
                        👨‍🏫
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                        Ready to Start Teaching?
                      </h3>
                      <p className="text-base sm:text-lg text-muted-foreground">
                        Join thousands of educators making a difference
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-coral/20 rounded-full" />
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-secondary-blue/20 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
);

ForTeachersSection.displayName = "ForTeachersSection";

export { ForTeachersSection };
export type { ForTeachersSectionProps, TeacherBenefit };
