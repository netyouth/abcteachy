
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
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20 xl:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 animate-slide-up">
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Anyone can learn{" "}
                <span className="text-coral relative inline-block">
                  English
                  <div className="absolute -inset-1 bg-coral/20 blur-xl animate-pulse-glow rounded-lg -z-10"></div>
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg animate-fade-in">
                ABC Teachy connects you with friendly, qualified English tutors for personalized lessons.
              </p>
            </div>
            
            <div className="animate-bounce-gentle">
              <Button 
                onClick={handleBookTutor}
                size="lg" 
                className="bg-coral hover:bg-coral/90 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover-glow group"
              >
                <span className="group-hover:animate-bounce">📚</span>
                <span className="ml-2">Book a Tutor</span>
              </Button>
            </div>
          </div>
          
          {/* Right Content - Illustration or Form */}
          <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative w-full max-w-sm sm:max-w-md">
              {!showBookingForm ? (
                // Original illustration with enhanced animations
                <div className="bg-coral-light rounded-3xl p-6 sm:p-8 relative overflow-hidden hover-lift animate-float">
                  {/* Background decorative elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-coral/10 rounded-full blur-2xl animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-coral/5 rounded-full blur-xl animate-pulse delay-1000"></div>
                  
                  {/* Tutor and Student illustration */}
                  <div className="space-y-4 sm:space-y-6 relative z-10">
                    {/* Conversation bubbles */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm max-w-xs hover-scale transition-all duration-300 animate-slide-up">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-coral rounded-full flex items-center justify-center animate-bounce-gentle">
                            <span className="text-white text-xs sm:text-sm">👩‍🏫</span>
                          </div>
                          <p className="text-gray-800 text-xs sm:text-sm">Hello! Ready to practice?</p>
                        </div>
                      </div>
                      <div className="bg-coral text-white rounded-2xl p-3 sm:p-4 max-w-xs ml-auto shadow-sm hover-scale transition-all duration-300 animate-slide-up delay-200">
                        <div className="flex items-center space-x-2">
                          <p className="text-xs sm:text-sm">Yes, I'm excited to learn!</p>
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center animate-bounce-gentle delay-500">
                            <span className="text-white text-xs sm:text-sm">👨‍🎓</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Learning elements */}
                    <div className="flex justify-center space-x-3 sm:space-x-4">
                      <div className="bg-white rounded-xl p-2 sm:p-3 shadow-sm hover-lift hover-glow transition-all duration-300 animate-bounce-gentle">
                        <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-coral" />
                      </div>
                      <div className="bg-white rounded-xl p-2 sm:p-3 shadow-sm hover-lift hover-glow transition-all duration-300 animate-bounce-gentle delay-200">
                        <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 text-coral" />
                      </div>
                      <div className="bg-white rounded-xl p-2 sm:p-3 shadow-sm hover-lift hover-glow transition-all duration-300 animate-bounce-gentle delay-400">
                        <Users className="w-4 h-4 sm:w-6 sm:h-6 text-coral" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Booking form with animation
                <div className="animate-slide-up">
                  <BookingForm onClose={handleCloseForm} />
                </div>
              )}
              
              {/* Floating mascot */}
              {!showBookingForm && (
                <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-coral rounded-full flex items-center justify-center animate-float shadow-lg hover-glow cursor-pointer transition-all duration-300 hover:scale-110">
                  <span className="text-white text-lg sm:text-2xl animate-bounce-gentle">📚</span>
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
