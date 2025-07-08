import React, { useState, useEffect } from 'react';

const LoadingSpinner = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);
  
  const dynamicWords = ['LEARN', 'COMMUNICATE', 'EXCEL'];
  
  useEffect(() => {
    // Phase 1: Logo appears (0-600ms)
    const timer1 = setTimeout(() => setCurrentPhase(1), 600);
    
    // Phase 2: "ANYONE CAN" appears (600-1000ms)
    const timer2 = setTimeout(() => setCurrentPhase(2), 1000);
    
    // Phase 3: Start word cycling (1000-2200ms)
    const timer3 = setTimeout(() => {
      setCurrentPhase(3);
      const wordInterval = setInterval(() => {
        setCurrentWord(prev => (prev + 1) % dynamicWords.length);
      }, 400); // Word cycling: 400ms each
      
      // Stop word cycling after 1.2 seconds (3 words * 400ms)
      setTimeout(() => {
        clearInterval(wordInterval);
        setCurrentPhase(4); // Final phase
      }, 1200);
    }, 1000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Logo */}
      <div className={`transition-all duration-700 ease-out mb-12 ${
        currentPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}>
        <img 
          src="/lovable-uploads/a48522f4-db07-475a-b8dc-96da5a16426a.png" 
          alt="ABC Teachy Logo" 
          className="h-20 w-auto"
        />
      </div>
      
      {/* Main Text Container */}
      <div className="text-center font-duolingo space-y-6">
        {/* "ANYONE CAN" */}
        <div className={`transition-all duration-800 ease-out ${
          currentPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <span className="text-4xl font-open-sans font-bold text-gray-800 tracking-wide">
            ANYONE CAN
          </span>
        </div>
        
        {/* Dynamic Word */}
        <div className={`transition-all duration-800 ease-out ${
          currentPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="relative h-16 flex items-center justify-center">
            {currentPhase === 4 ? (
                          <span className="text-5xl font-nunito font-black text-coral tracking-wide">
              ABC TEACHY
            </span>
            ) : (
              <span 
                key={dynamicWords[currentWord]}
                className="text-5xl font-nunito font-black text-coral tracking-wide transition-opacity duration-300 ease-in-out"
              >
                {dynamicWords[currentWord]}
              </span>
            )}
          </div>
        </div>
        
        {/* "WITH THE RIGHT TEACHER" */}
        <div className={`transition-all duration-800 ease-out delay-300 ${
          currentPhase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <span className="text-2xl font-open-sans font-semibold text-gray-700 tracking-wide">
            WITH THE RIGHT TEACHER
          </span>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className={`absolute bottom-12 transition-opacity duration-500 ${
        currentPhase >= 1 ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex space-x-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i <= currentPhase - 1 ? 'bg-coral' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 