"use client";

import * as React from "react";
import { Calendar, DollarSign, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { FeatureCard } from "@/components/ui/feature-card";
import { cn } from "@/lib/utils";

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
  iconStyle?: "coral" | "secondary-blue" | "secondary-green" | "default";
}

interface ForStudentsSectionProps extends React.ComponentPropsWithoutRef<"section"> {
  title?: string;
  subtitle?: string;
  benefits?: Benefit[];
}

const defaultBenefits: Benefit[] = [
  {
    icon: Users,
    title: "Choose Your Perfect Tutor",
    description: "Browse profiles and find a tutor who matches your learning style and goals.",
    iconStyle: "coral"
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Book lessons at times that work for you, with easy rescheduling options.",
    iconStyle: "secondary-blue"
  },
  {
    icon: DollarSign,
    title: "Affordable Rates",
    description: "Quality English tutoring at prices that fit your budget.",
    iconStyle: "secondary-green"
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your improvement with detailed progress reports and feedback.",
    iconStyle: "coral"
  }
];

const ForStudentsSection = React.forwardRef<HTMLElement, ForStudentsSectionProps>(
  ({
    className,
    title = "Why Students Love ABC Teachy",
    subtitle = "Everything you need to succeed in your English learning journey",
    benefits = defaultBenefits,
    ...props
  }, ref) => {
    return (
      <section
        ref={ref}
        id="students"
        className={cn(
          "w-full bg-muted/30 py-12 sm:py-16 md:py-20",
          className
        )}
        {...props}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              {title}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>
          
          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <FeatureCard
                key={`${benefit.title}-${index}`}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
                iconStyle={benefit.iconStyle}
                variant="default"
                className="transition-all duration-300 hover:scale-105"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }
);

ForStudentsSection.displayName = "ForStudentsSection";

export { ForStudentsSection };
export type { ForStudentsSectionProps, Benefit };
