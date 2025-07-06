
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, BookOpen, Users } from "lucide-react";
import BookingForm from "./BookingForm";

const HeroSection = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleBookTutor = () => {
    setShowBookingForm(true);
  };

  const handleCloseForm = () => {
    setShowBookingForm(false);
  };

  return (
    <section className="w-full py-20 lg:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-learning-blue-light/20 to-transparent" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-learning-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-energy-orange/5 rounded-full blur-2xl" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 z-10">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Anyone can learn{" "}
                <span className="text-learning-blue relative">
                  English
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-learning-blue to-progress-green rounded-full" />
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                ABC Teachy connects you with friendly, qualified English tutors for personalized lessons.
              </p>
            </div>
            
            {/* Trust-building CTA Button - Learning Blue */}
            <Button 
              onClick={handleBookTutor}
              size="lg" 
              className="bg-learning-blue hover:bg-learning-blue-dark text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 pulse-trust"
            >
              Book a Tutor
            </Button>
          </div>
          
          {/* Right Content - Illustration or Form */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {!showBookingForm ? (
                // Updated illustration with new color scheme
                <div className="bg-learning-blue-light rounded-3xl p-8 relative overflow-hidden hover-glow">
                  {/* Tutor and Student illustration */}
                  <div className="space-y-6">
                    {/* Conversation bubbles */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl p-4 shadow-sm max-w-xs hover-lift">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-learning-blue rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">👩‍🏫</span>
                          </div>
                          <p className="text-gray-800 text-sm">Hello! Ready to practice?</p>
                        </div>
                      </div>
                      {/* Energy Orange for student engagement */}
                      <div className="bg-energy-orange text-white rounded-2xl p-4 max-w-xs ml-auto shadow-sm hover-lift">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm">Yes, I'm excited to learn!</p>
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">👨‍🎓</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Learning elements */}
                    <div className="flex justify-center space-x-4">
                      <div className="bg-white rounded-xl p-3 shadow-sm hover-lift">
                        <BookOpen className="w-6 h-6 text-learning-blue" />
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm hover-lift">
                        <MessageCircle className="w-6 h-6 text-energy-orange" />
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm hover-lift">
                        <Users className="w-6 h-6 text-progress-green" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Booking form
                <BookingForm onClose={handleCloseForm} />
              )}
              
              {/* Floating mascot */}
              {!showBookingForm && (
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-progress-green rounded-full flex items-center justify-center animate-float shadow-lg">
                  <span className="text-white text-2xl">📚</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
