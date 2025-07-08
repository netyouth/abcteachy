import { useState } from "react";
import { Button } from "@/components/ui/button";
import BookingForm from "./BookingForm";
import { PointerHighlight } from "./ui/pointer-highlight";

const HeroSection = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleBookTutor = () => {
    setShowBookingForm(true);
  };

  const handleCloseForm = () => {
    setShowBookingForm(false);
  };

  return (
    <section className="w-full bg-transparent min-h-screen flex items-center justify-center relative z-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="flex flex-col items-center text-center space-y-8 sm:space-y-12 bg-transparent">
          {/* Centered Content */}
          <div className="space-y-6 sm:space-y-8 bg-transparent">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-duolingo-heading text-gray-900 leading-tight sm:whitespace-nowrap">
              Anyone can learn{" "}
              <PointerHighlight containerClassName="align-baseline">
                <span className="text-coral">English</span>
              </PointerHighlight>
            </h1>
            <p className="text-lg sm:text-xl font-duolingo-body text-gray-600 leading-relaxed max-w-2xl mx-auto">
              ABC Teachy connects you with friendly, qualified English tutors for personalized lessons.
            </p>
          </div>
          
          <Button 
            onClick={handleBookTutor}
            size="lg" 
            className="bg-coral hover:bg-coral/90 text-white px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-semibold font-duolingo-body rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Book a Tutor
          </Button>
          
          {/* Booking Form */}
          {showBookingForm && (
            <div className="w-full max-w-md mx-auto mt-8">
              <BookingForm onClose={handleCloseForm} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
