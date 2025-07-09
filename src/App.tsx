import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import FeaturedTeachersSection from "@/components/FeaturedTeachersSection";
import { ForStudentsSection } from "@/components/ForStudentsSection";
import { ForTeachersSection } from "@/components/ForTeachersSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";
import { BackgroundBeamsWrapper } from "@/components/test-beams";
import { CambridgeExamLoader } from "@/components/CambridgeExamLoader";
import { NotFound } from "@/pages/NotFound";
import './App.css'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundBeamsWrapper intensity="medium" position="top" />
      <Header />
      <HeroSection />
      <FeaturedTeachersSection />
      <ForStudentsSection />
      <ForTeachersSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 6000); // 6 seconds to show all loading states

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen on initial app load
  if (isLoading) {
    return <CambridgeExamLoader loading={true} duration={1200} />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App; 