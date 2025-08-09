import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HeroSection } from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturedTeachersSection from "@/components/FeaturedTeachersSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ForStudentsSection } from "@/components/ForStudentsSection";
import { ForTeachersSection } from "@/components/ForTeachersSection";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  console.log('🏠 Index component rendered - loading:', loading, 'user:', !!user, 'role:', role);

  useEffect(() => {
    console.log('🔄 Index useEffect - loading:', loading, 'user:', !!user, 'role:', role);
    
    // Immediate redirect for authenticated users
    if (!loading && user && role) {
      console.log('🚀 Index: Immediate redirect for user:', role);
      navigate('/dashboard', { replace: true });
    }
  }, [user, role, loading, navigate]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
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
