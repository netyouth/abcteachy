
import { Search, Calendar, Play } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      icon: Search,
      title: "Choose Your Tutor",
      description: "Browse our qualified tutors and find the perfect match for your learning style."
    },
    {
      number: "2",
      icon: Calendar,
      title: "Book Your Lesson",
      description: "Schedule a lesson at a time that works for you with our flexible booking system."
    },
    {
      number: "3",
      icon: Play,
      title: "Start Learning",
      description: "Join your personalized lesson and start improving your English skills today."
    }
  ];

  return (
    <section id="how-it-works" className="w-full bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Getting started with ABC Teachy is simple - just three easy steps to begin your English learning journey
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-coral-light rounded-full flex items-center justify-center">
                  <span className="text-coral font-bold text-sm">{step.number}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-1/2 transform translate-x-1/2 w-full">
                  <div className="w-8 h-0.5 bg-coral-light"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
