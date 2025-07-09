import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FeaturedTeachersSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeVideo, setActiveVideo] = useState<'cat' | 'nicko'>('cat'); // Track which video is active

  // Initialize videos as muted
  useEffect(() => {
    const video = videoRef.current;
    const secondVideo = secondVideoRef.current;
    
    if (video && secondVideo) {
      video.muted = true;
      secondVideo.muted = true;
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const secondVideo = secondVideoRef.current;
    
    if (!video || !secondVideo) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Enable sound and play the active video when in view
            if (activeVideo === 'cat') {
              video.muted = false; // Enable sound on scroll
              video.play().catch((error) => {
                console.log("Autoplay failed:", error);
              });
              secondVideo.pause();
              secondVideo.muted = true; // Keep inactive video muted
            } else {
              secondVideo.muted = false; // Enable sound on scroll
              secondVideo.play().catch((error) => {
                console.log("Autoplay failed:", error);
              });
              video.pause();
              video.muted = true; // Keep inactive video muted
            }
          } else {
            // Pause and mute both videos when out of view
            video.pause();
            video.muted = true;
            secondVideo.pause();
            secondVideo.muted = true;
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "0px 0px -100px 0px"
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [activeVideo]);

  // Handle video switching
  const handleVideoSwitch = (videoType: 'cat' | 'nicko') => {
    const video = videoRef.current;
    const secondVideo = secondVideoRef.current;
    
    if (!video || !secondVideo) return;

    setActiveVideo(videoType);
    
    if (videoType === 'cat') {
      secondVideo.pause();
      secondVideo.muted = true; // Mute the inactive video
      video.muted = false; // Unmute the active video
      video.play().catch((error) => {
        console.log("Play failed:", error);
      });
    } else {
      video.pause();
      video.muted = true; // Mute the inactive video
      secondVideo.muted = false; // Unmute the active video
      secondVideo.play().catch((error) => {
        console.log("Play failed:", error);
      });
    }
  };

  // SPYLT-style scroll animations
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-white py-12 sm:py-16 md:py-20 overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-coral/10 rounded-full mb-4">
            <span className="text-coral font-medium text-sm">Cambridge Specialists</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Meet Our Cambridge Experts
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Learn from our AI-powered Cambridge specialists who make KET, PET, and YLE exam preparation fun and effective
          </p>
        </div>
        
        {/* Video Cards Section - SPYLT-style slide in from both sides */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8">
          {/* First Video Card - Meet Teachy Cat (plays first) */}
          <div 
            className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border-2 relative overflow-hidden backdrop-blur-sm max-w-md transition-all duration-1000 ease-out transform cursor-pointer hover:scale-105 ${
              isVisible 
                ? 'translate-x-0 opacity-100 scale-100' 
                : '-translate-x-full opacity-0 scale-95'
            } ${
              activeVideo === 'cat' 
                ? 'border-coral shadow-coral/20' 
                : 'border-gray-100 hover:border-coral/50'
            }`}
            onClick={() => handleVideoSwitch('cat')}
          >
            <div className="aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                loop
                playsInline
                controls={false}
              >
                <source 
                  src="https://orwybezmxvlgenhvwqhj.storage.supabase.co/v1/object/public/teachies//Teachy%20Cat.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>
            
            {/* Video Card Footer */}
            <div className="mt-3 sm:mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Teachy Cat - KET Expert
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
                Master KET (A2 Key) and YLE with interactive lessons, practice tests, and speaking simulations.
              </p>
              {activeVideo === 'cat' && (
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-coral rounded-full animate-pulse"></div>
                  <span className="ml-2 text-xs text-coral font-medium">Now Playing</span>
                </div>
              )}
              {/* Book Lesson Button */}
              <Button 
                className="w-full bg-coral hover:bg-coral/90 text-white transition-all duration-200 hover:shadow-md"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent video switching when clicking button
                }}
              >
                Start KET Prep with Cat
              </Button>
            </div>
          </div>

          {/* Second Video Card - Meet Teachy Nicko (click to play) */}
          <div 
            className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border-2 relative overflow-hidden backdrop-blur-sm max-w-md transition-all duration-1000 ease-out transform cursor-pointer hover:scale-105 ${
              isVisible 
                ? 'translate-x-0 opacity-100 scale-100' 
                : 'translate-x-full opacity-0 scale-95'
            } ${
              activeVideo === 'nicko' 
                ? 'border-coral shadow-coral/20' 
                : 'border-gray-100 hover:border-coral/50'
            }`} 
            style={{ transitionDelay: '200ms' }}
            onClick={() => handleVideoSwitch('nicko')}
          >
            <div className="aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
              <video
                ref={secondVideoRef}
                className="w-full h-full object-cover"
                loop
                playsInline
                controls={false}
              >
                <source 
                  src="https://orwybezmxvlgenhvwqhj.storage.supabase.co/v1/object/public/teachies//Teachy%20Nicko.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
              </div>
              
            {/* Video Card Footer */}
            <div className="mt-3 sm:mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Teachy Nicko - PET Expert
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
                Excel at PET (B1 Preliminary) with advanced speaking practice and real Cambridge exam formats.
              </p>
              {activeVideo === 'nicko' && (
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-coral rounded-full animate-pulse"></div>
                  <span className="ml-2 text-xs text-coral font-medium">Now Playing</span>
                </div>
              )}
              {/* Book Lesson Button */}
              <Button 
                className="w-full bg-coral hover:bg-coral/90 text-white transition-all duration-200 hover:shadow-md"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent video switching when clicking button
                }}
              >
                Start PET Prep with Nicko
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTeachersSection;
