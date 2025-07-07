
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, BookOpen, Users } from "lucide-react";
import BookingForm from "./BookingForm";

const HeroSection = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState(0);

  const handleBookTutor = () => {
    setShowBookingForm(true);
  };

  const handleCloseForm = () => {
    setShowBookingForm(false);
  };

  const conversationCards = [
    {
      text: "I'm so tired.",
      speaker: "student",
      avatar: "👨‍🎓"
    },
    {
      text: "Do you want to go...",
      speaker: "tutor",
      avatar: "👩‍🏫"
    },
    {
      text: "Making reservations",
      speaker: "tutor",
      avatar: "👩‍🏫"
    }
  ];

  return (
    <section className="w-full bg-gradient-to-br from-gray-50 to-blue-50 py-20 lg:py-32 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                The most effective way to learn{" "}
                <span className="text-blue-600">English</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Talk out loud, get instant feedback, and become fluent with ABC Teachy's qualified English tutors.
              </p>
            </div>
            
            <Button 
              onClick={handleBookTutor}
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <span>Start Speaking</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
          
          {/* Right Content - Interactive Cards */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {!showBookingForm ? (
                <div className="space-y-4">
                  {/* Main conversation cards */}
                  {conversationCards.map((card, index) => (
                    <div
                      key={index}
                      className={`
                        relative bg-white rounded-3xl p-6 shadow-lg transition-all duration-300 cursor-pointer
                        ${selectedCard === index ? 'scale-105 shadow-xl' : 'hover:scale-102 hover:shadow-lg'}
                        ${index === 1 ? 'opacity-70' : ''}
                        ${index === 2 ? 'opacity-50' : ''}
                      `}
                      onClick={() => setSelectedCard(index)}
                      style={{
                        transform: `translateX(${index * 20}px) translateY(${index * -10}px)`,
                        zIndex: conversationCards.length - index
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">{card.avatar}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{card.text}</p>
                          {index === 0 && (
                            <div className="mt-2 flex space-x-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-100"></div>
                              <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse delay-200"></div>
                            </div>
                          )}
                        </div>
                        {card.speaker === 'student' && (
                          <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <span className="text-gray-600 text-lg">+</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Bottom interaction area */}
                  <div className="mt-8 bg-white rounded-2xl p-4 shadow-lg">
                    <div className="flex justify-center space-x-4">
                      <div className="bg-coral/10 rounded-xl p-3 hover:bg-coral/20 transition-colors cursor-pointer">
                        <BookOpen className="w-6 h-6 text-coral" />
                      </div>
                      <div className="bg-coral/10 rounded-xl p-3 hover:bg-coral/20 transition-colors cursor-pointer">
                        <MessageCircle className="w-6 h-6 text-coral" />
                      </div>
                      <div className="bg-coral/10 rounded-xl p-3 hover:bg-coral/20 transition-colors cursor-pointer">
                        <Users className="w-6 h-6 text-coral" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <BookingForm onClose={handleCloseForm} />
              )}
              
              {/* Floating book icon */}
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
