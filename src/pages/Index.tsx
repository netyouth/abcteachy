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

  console.log('Index component - user:', user, 'loading:', loading);

  if (loading) {
    console.log('Rendering loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (user) {
    console.log('Rendering dashboard for user:', user.email);
    return <DashboardLayout />;
  }

  // Otherwise show the landing page
  console.log('Rendering landing page');
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
