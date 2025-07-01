
import { Button } from "@/components/ui/button";
import { DollarSign, Clock, Heart } from "lucide-react";

const ForTeachersSection = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: "Great Earning Potential",
      description: "Competitive rates with the flexibility to set your own prices"
    },
    {
      icon: Clock,
      title: "Flexible Hours",
      description: "Teach when it works for you - set your own schedule"
    },
    {
      icon: Heart,
      title: "Supportive Community",
      description: "Join a network of passionate educators helping students succeed"
    }
  ];

  return (
    <section id="teachers" className="w-full bg-coral-light py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                Teach with ABC Teachy
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Share your passion for English and make a meaningful impact on students worldwide while earning great income.
              </p>
            </div>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              size="lg" 
              className="bg-coral hover:bg-coral/90 text-white px-8 py-6 text-lg font-semibold rounded-full"
            >
              Join Our Team
            </Button>
          </div>
          
          {/* Right Content - Illustration */}
          <div className="relative">
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center mx-auto">
                  <span className="text-4xl">👩‍🏫</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Start Teaching Today</h3>
                  <p className="text-gray-600">Join thousands of teachers earning while doing what they love</p>
                </div>
                <div className="flex justify-center space-x-8 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-coral">$25+</div>
                    <div className="text-sm text-gray-600">Per Hour</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-coral">10k+</div>
                    <div className="text-sm text-gray-600">Happy Students</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForTeachersSection;
