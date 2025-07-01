
import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";

const ForStudentsSection = () => {
  const benefits = [
    {
      icon: Users,
      title: "Choose Your Perfect Tutor",
      description: "Browse profiles and find a tutor who matches your learning style and goals."
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Book lessons at times that work for you, with easy rescheduling options."
    },
    {
      icon: DollarSign,
      title: "Affordable Rates",
      description: "Quality English tutoring at prices that fit your budget."
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed progress reports and feedback."
    }
  ];

  return (
    <section id="students" className="w-full bg-gray-50 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16 animate-slide-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Students Love ABC Teachy
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to succeed in your English learning journey
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover-lift hover-glow animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-coral-light rounded-xl flex items-center justify-center mb-4 hover-scale transition-all duration-300">
                <benefit.icon className="w-6 h-6 text-coral animate-bounce-gentle" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForStudentsSection;
