
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
    <section id="students" className="w-full bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Students Love ABC Teachy
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to succeed in your English learning journey
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-coral-light rounded-xl flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-coral" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
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
