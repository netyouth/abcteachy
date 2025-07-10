

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
      name: "Sofia Rodriguez",
    location: "🇲🇽 Mexico",
      rating: 5,
      quote: "I passed my PET exam AND got promoted at work! My tutor taught me both exam skills and business English. Life-changing!",
    avatarFallback: "SR"
    },
    {
      name: "Liam Chen",
    location: "🇨🇳 China",
      rating: 5,
      quote: "From struggling with KET to confidently presenting in English meetings. ABC Teachy gave me the tools for real success.",
    avatarFallback: "LC"
    },
    {
      name: "Priya Patel",
    location: "🇮🇳 India",
      rating: 5,
      quote: "My 12-year-old daughter loves her lessons! She's excited about English now and her confidence has soared.",
    avatarFallback: "PP"
    }
  ];

const TestimonialsSection = React.forwardRef<HTMLElement, TestimonialsSectionProps>(
  ({
    className,
    title = "Real Students, Real Results",
    subtitle = "From exam success to career breakthroughs — discover how ABC Teachy transforms lives",
    testimonials = defaultTestimonials,
    ...props
  }, ref) => {
  return (
      <section
        ref={ref}
        className={cn(
          "w-full bg-muted/30 py-12 sm:py-16 md:py-20",
          className
        )}
        {...props}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
