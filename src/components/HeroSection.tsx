
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
    <section className="w-full bg-white py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                Anyone can learn{" "}
                <span className="text-coral">English</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                ABC Teachy connects you with friendly, qualified English tutors for personalized lessons.
              </p>
            </div>
            
            <Button 
              onClick={handleBookTutor}
              size="lg" 
              className="bg-coral hover:bg-coral/90 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              Book a Tutor
            </Button>
          </div>
          
          {/* Right Content - Video Card or Form */}
          <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
              {!showBookingForm ? (
                // Video Card
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100 relative overflow-hidden backdrop-blur-sm">
                  <div className="aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      playsInline
                      controls={false}
                    >
                      <source 
                        src="https://orwybezmxvlgenhvwqhj.supabase.co/storage/v1/object/public/teachies//Teachy%20Cat%20Supabase%20Video.mp4" 
                        type="video/mp4" 
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  {/* Video Card Footer */}
                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Interactive Learning
                      </h3>
                      <div className="flex space-x-1 sm:space-x-2">
                        <div className="bg-coral-light rounded-lg sm:rounded-xl p-1.5 sm:p-2 transition-colors hover:bg-coral/20">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-coral" />
                        </div>
                        <div className="bg-coral-light rounded-lg sm:rounded-xl p-1.5 sm:p-2 transition-colors hover:bg-coral/20">
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-coral" />
                        </div>
                        <div className="bg-coral-light rounded-lg sm:rounded-xl p-1.5 sm:p-2 transition-colors hover:bg-coral/20">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-coral" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Experience personalized English learning with our AI-powered tutoring system.
                    </p>
                  </div>
                </div>
              ) : (
                // Booking form
                <BookingForm onClose={handleCloseForm} />
              )}
              
              {/* Floating mascot - only show on larger screens and when form is not visible */}
              {!showBookingForm && (
                <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-coral rounded-full flex items-center justify-center animate-float shadow-lg transition-transform hover:scale-110 hidden sm:flex">
                  <span className="text-lg sm:text-2xl">📚</span>
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
