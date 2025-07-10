

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
      title: "Cambridge-Certified Tutors",
    description: "Learn from qualified teachers who've helped hundreds pass KET, PET, and speak fluently in real conversations.",
    iconStyle: "coral"
    },
    {
      icon: Calendar,
      title: "Authentic Practice Materials",
    description: "Master real Cambridge tests and practice speaking scenarios you'll actually use in work and life.",
    iconStyle: "secondary-blue"
    },
    {
      icon: DollarSign,
      title: "Fits Your Schedule & Budget",
    description: "Affordable 1-on-1 lessons that work around your life — perfect for students and working professionals.",
    iconStyle: "secondary-green"
    },
    {
      icon: TrendingUp,
      title: "See Real Progress Fast",
    description: "Track improvements with personalized feedback and celebrate milestones in your English journey.",
    iconStyle: "coral"
    }
  ];

const ForStudentsSection = React.forwardRef<HTMLElement, ForStudentsSectionProps>(
  ({
    className,
    title = "Why Students Love Learning with ABC Teachy",
    subtitle = "From passing Cambridge exams to speaking confidently in real life — we help you achieve your English goals",
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
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
