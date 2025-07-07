
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
    <section className="w-full bg-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Anyone can learn{" "}
                <span className="text-coral">English</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                ABC Teachy connects you with friendly, qualified English tutors for personalized lessons.
              </p>
            </div>
            
            <Button 
              onClick={handleBookTutor}
              size="lg" 
              className="bg-coral hover:bg-coral/90 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Book a Tutor
            </Button>
          </div>
          
          {/* Right Content - Illustration or Form */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {!showBookingForm ? (
                // Original illustration
                <div className="bg-coral-light rounded-3xl p-8 relative overflow-hidden">
                  {/* Tutor and Student illustration */}
                  <div className="space-y-6">
                    {/* Conversation bubbles */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl p-4 shadow-sm max-w-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">👩‍🏫</span>
                          </div>
                          <p className="text-gray-800 text-sm">Hello! Ready to practice?</p>
                        </div>
                      </div>
                      <div className="bg-coral text-white rounded-2xl p-4 max-w-xs ml-auto shadow-sm">
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
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <BookOpen className="w-6 h-6 text-coral" />
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <MessageCircle className="w-6 h-6 text-coral" />
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <Users className="w-6 h-6 text-coral" />
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
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-coral rounded-full flex items-center justify-center animate-float shadow-lg">
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
