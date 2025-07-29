import { HeroSection } from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturedTeachersSection from "@/components/FeaturedTeachersSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ForStudentsSection } from "@/components/ForStudentsSection";
import { ForTeachersSection } from "@/components/ForTeachersSection";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <FeaturedTeachersSection />
      <TestimonialsSection />
      <ForStudentsSection />
      <ForTeachersSection />
      <Footer />
    </div>
  );
};

export default Index;
