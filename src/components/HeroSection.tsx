
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Volume2 } from "lucide-react";
import BookingForm from "./BookingForm";

const HeroSection = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);

  const handleBookTutor = () => {
    setShowBookingForm(true);
  };

  const handleCloseForm = () => {
    setShowBookingForm(false);
  };

  const videoCards = [
    {
      id: 1,
      phrase: "I'm so tired.",
      person: "👨‍💼",
      context: "Work conversation",
    },
    {
      id: 2,
      phrase: "How was your weekend?",
      person: "👩‍🦰",
      context: "Casual chat",
    },
    {
      id: 3,
      phrase: "Can you help me with this?",
      person: "👨‍🎓",
      context: "Office dialogue",
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
                <span className="text-learning-blue">English</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Talk out loud, get instant feedback, and become fluent with ABC Teachy's qualified English tutors.
              </p>
            </div>
            
            <Button 
              onClick={handleBookTutor}
              size="lg" 
              className="bg-learning-blue hover:bg-learning-blue/90 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <span>Start Speaking</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
          
          {/* Right Content - Video Cards */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {!showBookingForm ? (
                <div className="space-y-4">
                  {/* Main Video Card */}
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
                    {/* Video Container */}
                    <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 aspect-[4/5] flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
                      
                      {/* Person Video */}
                      <div className="relative z-10 text-center">
                        <img 
                          src="/lovable-uploads/1892a1a7-97a6-434f-8a92-8634d93c5b92.png"
                          alt="English tutor"
                          className="w-full h-full object-cover absolute inset-0"
                        />
                        <div className="relative z-10 p-6">
                          <p className="text-2xl font-medium text-gray-800 mb-6 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                            {videoCards[currentVideo].phrase}
                          </p>
                        </div>
                      </div>
                      
                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <button className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200">
                          <Play className="w-6 h-6 text-learning-blue ml-1" />
                        </button>
                      </div>
                      
                      {/* Audio Waveform */}
                      <div className="absolute bottom-6 left-6 right-6 z-20">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-3 flex items-center space-x-2">
                          <Volume2 className="w-4 h-4 text-learning-blue" />
                          <div className="flex-1 flex items-center space-x-1">
                            {[...Array(12)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-1 bg-learning-blue rounded-full animate-pulse`}
                                style={{
                                  height: `${Math.random() * 20 + 8}px`,
                                  animationDelay: `${i * 0.1}s`
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Plus Button */}
                      <button className="absolute bottom-6 right-6 w-12 h-12 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors z-20">
                        <span className="text-xl">+</span>
                      </button>
                    </div>
                    
                    {/* Bottom Section */}
                    <div className="p-6 bg-white">
                      <div className="text-center">
                        <p className="text-gray-600 font-medium mb-4">Practice real conversations</p>
                        <div className="flex justify-center space-x-3">
                          {videoCards.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentVideo(index)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index === currentVideo ? 'bg-learning-blue' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Interface Card */}
                  <div className="bg-pink-100 rounded-3xl p-6 shadow-lg">
                    <div className="space-y-4">
                      {/* Bot Message */}
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-energy-orange rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">🤖</span>
                        </div>
                        <div className="bg-white rounded-2xl px-4 py-2 flex-1">
                          <p className="text-gray-800 font-medium">Hello! Ready to practice?</p>
                        </div>
                      </div>
                      
                      {/* User Response Button */}
                      <div className="flex justify-end">
                        <button className="bg-energy-orange text-white px-6 py-3 rounded-2xl font-medium hover:bg-energy-orange/90 transition-colors flex items-center space-x-2">
                          <span>Yes, I'm excited to learn!</span>
                          <span>👨‍🎓</span>
                        </button>
                      </div>
                      
                      {/* Action Icons */}
                      <div className="flex justify-center space-x-4 pt-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <span className="text-energy-orange text-xl">📚</span>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <span className="text-energy-orange text-xl">💬</span>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <span className="text-energy-orange text-xl">👥</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <BookingForm onClose={handleCloseForm} />
              )}
              
              {/* Floating elements */}
              {!showBookingForm && (
                <>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-energy-orange rounded-full flex items-center justify-center animate-float shadow-lg z-10">
                    <span className="text-white text-2xl">📚</span>
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-progress-green rounded-full flex items-center justify-center shadow-lg z-10">
                    <span className="text-white text-lg">✓</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
