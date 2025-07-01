
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ForStudentsSection from "@/components/ForStudentsSection";
import FeaturedTeachersSection from "@/components/FeaturedTeachersSection";
import ForTeachersSection from "@/components/ForTeachersSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";
import InteractiveCursor from "@/components/InteractiveCursor";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <InteractiveCursor />
      <Header />
      <HeroSection />
      <ForStudentsSection />
      <FeaturedTeachersSection />
      <ForTeachersSection />
      <TestimonialsSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default Index;
