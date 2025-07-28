import { HeroSection } from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturedTeachersSection from "@/components/FeaturedTeachersSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ForStudentsSection } from "@/components/ForStudentsSection";
import { ForTeachersSection } from "@/components/ForTeachersSection";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (user) {
    return <DashboardLayout />;
  }

  // Otherwise show the landing page
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
