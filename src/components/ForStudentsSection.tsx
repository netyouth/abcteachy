
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
    <section id="students" className="w-full bg-gray-50 py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Why Students Love ABC Teachy
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to succeed in your English learning journey
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-coral-light rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-colors group-hover:bg-coral/20">
                <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-coral" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 leading-tight">
                {benefit.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
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
