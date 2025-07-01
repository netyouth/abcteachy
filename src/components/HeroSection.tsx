
import { Button } from "@/components/ui/button";
import { Play, MessageCircle, BookOpen, HelpCircle } from "lucide-react";

const HeroSection = () => {
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
                ABC Teachy helps you master English conversation skills with 
                personalized lessons and friendly guidance.
              </p>
            </div>
            
            <Button 
              size="lg" 
              className="bg-coral hover:bg-coral/90 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Start Learning
            </Button>
          </div>
          
          {/* Right Content - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone Frame */}
              <div className="w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Phone Screen Content */}
                  <div className="p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">English Lesson</h2>
                      <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">👁️</span>
                      </div>
                    </div>
                    
                    {/* Conversation Bubbles */}
                    <div className="space-y-4 mb-8 flex-1">
                      <div className="bg-gray-100 rounded-2xl p-4 max-w-xs">
                        <p className="text-gray-800">Hello! How are you today?</p>
                      </div>
                      <div className="bg-coral text-white rounded-2xl p-4 max-w-xs ml-auto">
                        <p>I'm doing great, thank you!</p>
                      </div>
                      <div className="bg-gray-100 rounded-2xl p-4 max-w-xs">
                        <p className="text-gray-800">Perfect pronunciation! ✨</p>
                      </div>
                    </div>
                    
                    {/* Vocabulary Section */}
                    <div className="bg-coral-light rounded-xl p-4 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Today's Words</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-white px-3 py-1 rounded-full text-sm font-medium">great</span>
                        <span className="bg-white px-3 py-1 rounded-full text-sm font-medium">perfect</span>
                        <span className="bg-white px-3 py-1 rounded-full text-sm font-medium">today</span>
                      </div>
                    </div>
                    
                    {/* Feature Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white border-2 border-coral rounded-xl p-3 text-center hover:bg-coral hover:text-white transition-colors cursor-pointer">
                        <Play className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">Practice Speaking</span>
                      </div>
                      <div className="bg-white border-2 border-coral rounded-xl p-3 text-center hover:bg-coral hover:text-white transition-colors cursor-pointer">
                        <BookOpen className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">Step by Step</span>
                      </div>
                      <div className="bg-white border-2 border-coral rounded-xl p-3 text-center hover:bg-coral hover:text-white transition-colors cursor-pointer">
                        <HelpCircle className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">Ask Questions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-coral rounded-full flex items-center justify-center animate-float shadow-lg">
                <span className="text-white font-bold">A</span>
              </div>
              <div className="absolute -top-2 -right-6 w-10 h-10 bg-coral/80 rounded-full flex items-center justify-center animate-float shadow-lg" style={{animationDelay: '1s'}}>
                <span className="text-white font-bold">B</span>
              </div>
              <div className="absolute -bottom-6 -left-2 w-8 h-8 bg-coral/60 rounded-full flex items-center justify-center animate-float shadow-lg" style={{animationDelay: '2s'}}>
                <span className="text-white font-bold text-sm">C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
