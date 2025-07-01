
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const FeaturedTeachersSection = () => {
  const teachers = [
    {
      name: "Sarah Johnson",
      specialty: "Business English",
      rating: 4.9,
      description: "Friendly tutor specializing in professional communication and presentation skills.",
      availability: "Available today",
      avatar: "👩‍🏫"
    },
    {
      name: "Michael Chen",
      specialty: "Conversation Practice",
      rating: 4.8,
      description: "Patient teacher focused on building confidence through natural conversation.",
      availability: "Next available: Tomorrow",
      avatar: "👨‍🏫"
    },
    {
      name: "Emma Rodriguez",
      specialty: "Grammar & Writing",
      rating: 5.0,
      description: "Experienced educator helping students master English grammar and writing.",
      availability: "Available now",
      avatar: "👩‍💼"
    },
    {
      name: "David Thompson",
      specialty: "Pronunciation",
      rating: 4.9,
      description: "Native speaker specializing in accent reduction and clear pronunciation.",
      availability: "Available today",
      avatar: "👨‍💼"
    }
  ];

  return (
    <section className="w-full bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16 animate-slide-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Meet Our Featured Teachers
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Learn from qualified, friendly tutors who are passionate about helping you succeed
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map((teacher, index) => (
            <div 
              key={index} 
              className={`bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover-lift hover-glow animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-coral-light rounded-full flex items-center justify-center mx-auto mb-3 hover-scale transition-all duration-300 animate-bounce-gentle">
                  <span className="text-3xl">{teacher.avatar}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                <p className="text-coral font-medium">{teacher.specialty}</p>
              </div>
              
              <div className="flex items-center justify-center mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current animate-pulse" />
                  <span className="text-sm font-medium">{teacher.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 text-center">
                {teacher.description}
              </p>
              
              <p className="text-xs text-gray-500 text-center mb-4">
                {teacher.availability}
              </p>
              
              <Button 
                className="w-full bg-coral hover:bg-coral/90 text-white hover-glow transition-all duration-300 hover:scale-105"
                size="sm"
              >
                Book Lesson
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTeachersSection;
