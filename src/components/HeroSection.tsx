import { useState } from "react";
import { Button } from "@/components/ui/button";
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
          
          {/* Right Content - Booking Form */}
          {showBookingForm && (
          <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
                <BookingForm onClose={handleCloseForm} />
                </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
