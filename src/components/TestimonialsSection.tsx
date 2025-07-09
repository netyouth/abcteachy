

import * as React from "react";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { cn } from "@/lib/utils";

interface Testimonial {
  name: string;
  location?: string;
  rating: number;
  quote: string;
  avatar?: string;
  avatarFallback?: string;
}

interface TestimonialsSectionProps extends React.ComponentPropsWithoutRef<"section"> {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
    {
      name: "Maria Santos",
    location: "🇧🇷 Brazil",
      rating: 5,
      quote: "ABC Teachy helped me gain confidence in speaking English. My tutor was so patient and encouraging!",
    avatarFallback: "MS"
    },
    {
      name: "Hiroshi Tanaka",
    location: "🇯🇵 Japan",
      rating: 5,
      quote: "The flexible scheduling made it perfect for my busy work life. I improved so much in just 3 months!",
    avatarFallback: "HT"
    },
    {
      name: "Ahmed Hassan",
    location: "🇪🇬 Egypt",
      rating: 5,
      quote: "My pronunciation has improved dramatically. The one-on-one lessons were exactly what I needed.",
    avatarFallback: "AH"
    }
  ];

const TestimonialsSection = React.forwardRef<HTMLElement, TestimonialsSectionProps>(
  ({
    className,
    title = "Student Success Stories",
    subtitle = "See how ABC Teachy has helped students from around the world improve their English",
    testimonials = defaultTestimonials,
    ...props
  }, ref) => {
  return (
      <section
        ref={ref}
        className={cn(
          "w-full bg-muted/30 py-16 sm:py-20 md:py-24",
          className
        )}
        {...props}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
              {title}
          </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {subtitle}
          </p>
        </div>
        
          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.name}-${index}`}
                name={testimonial.name}
                location={testimonial.location}
                rating={testimonial.rating}
                quote={testimonial.quote}
                avatar={testimonial.avatar}
                avatarFallback={testimonial.avatarFallback}
                variant="default"
                className="h-full transition-all duration-300 hover:scale-105"
              />
                ))}
              </div>
              
          {/* Optional CTA Section */}
          <div className="text-center mt-12 sm:mt-16">
            <div className="inline-flex items-center px-6 py-3 bg-coral/10 rounded-full">
              <span className="text-coral font-medium text-sm sm:text-base">
                ⭐ Join thousands of satisfied students
              </span>
            </div>
        </div>
      </div>
    </section>
  );
  }
);

TestimonialsSection.displayName = "TestimonialsSection";

export { TestimonialsSection };
export type { TestimonialsSectionProps, Testimonial };
