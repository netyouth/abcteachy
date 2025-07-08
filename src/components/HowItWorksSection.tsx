import { Search, Calendar, Play, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const HowItWorksSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([]);

  const steps = [
    {
      number: "1",
      icon: Search,
      title: "Choose Your Tutor",
      description: "Browse our qualified tutors and find the perfect match for your learning style and goals.",
      color: "bg-secondary-blue",
      lightColor: "bg-secondary-blue-light",
      textColor: "text-secondary-blue"
    },
    {
      number: "2",
      icon: Calendar,
      title: "Book Your Lesson",
      description: "Schedule a lesson at a time that works for you with our flexible booking system.",
      color: "bg-secondary-green",
      lightColor: "bg-secondary-green-light",
      textColor: "text-secondary-green"
    },
    {
      number: "3",
      icon: Play,
      title: "Start Learning",
      description: "Join your personalized lesson and start improving your English skills today.",
      color: "bg-coral",
      lightColor: "bg-coral-light",
      textColor: "text-coral"
    }
  ];

  // Animation on scroll
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Stagger step animations
            steps.forEach((_, index) => {
              setTimeout(() => {
                setVisibleSteps(prev => {
                  const newState = [...prev];
                  newState[index] = true;
                  return newState;
                });
              }, index * 200);
            });
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="w-full bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 sm:py-20 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center px-4 py-2 bg-coral/10 rounded-full mb-4">
            <span className="text-coral font-medium text-sm">Simple Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            How It Works
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Getting started with ABC Teachy is simple - just three easy steps to begin your personalized English learning journey
          </p>
        </div>
        
        {/* Steps */}
        <div className="relative">
          {/* Connection Lines - Desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5">
            <div className="max-w-4xl mx-auto relative">
                             <div className="absolute left-1/6 right-1/6 top-0 h-0.5 bg-gradient-to-r from-secondary-blue-light via-secondary-green-light to-coral-light"></div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`relative transition-all duration-700 ease-out ${
                  visibleSteps[index]
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 group hover:-translate-y-2">
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -left-4">
                    <div className={`w-8 h-8 ${step.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-sm">{step.number}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 ${step.lightColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${step.textColor}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Action Indicator */}
                    <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className={`text-sm font-medium ${step.textColor} flex items-center`}>
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className={`absolute top-4 right-4 w-12 h-12 ${step.lightColor} rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
                  <div className={`absolute bottom-4 left-4 w-8 h-8 ${step.lightColor} rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                </div>

                {/* Mobile Connection Arrow */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-6 mb-2">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-gray-300 to-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-12 sm:mt-16 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '600ms' }}>
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of students who have improved their English with ABC Teachy
            </p>
            <button className="bg-coral hover:bg-coral/90 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
