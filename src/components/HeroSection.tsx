
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
          
          {/* Right Content - Video Card or Form */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {!showBookingForm ? (
                // Video Card
                <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      <source 
                        src="https://orwybezmxvlgenhvwqhj.supabase.co/storage/v1/object/public/teachies//Teachy%20Cat%20Supabase%20Video.mp4" 
                        type="video/mp4" 
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  {/* Video Card Footer */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Interactive Learning
                      </h3>
                      <div className="flex space-x-2">
                        <div className="bg-coral-light rounded-xl p-2">
                          <BookOpen className="w-4 h-4 text-coral" />
                        </div>
                        <div className="bg-coral-light rounded-xl p-2">
                          <MessageCircle className="w-4 h-4 text-coral" />
                        </div>
                        <div className="bg-coral-light rounded-xl p-2">
                          <Users className="w-4 h-4 text-coral" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Experience personalized English learning with our AI-powered tutoring system.
                    </p>
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
