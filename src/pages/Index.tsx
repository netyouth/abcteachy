"use client";

import * as React from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import FeaturedTeachersSection from "@/components/FeaturedTeachersSection";
import { ForStudentsSection } from "@/components/ForStudentsSection";
import { ForTeachersSection } from "@/components/ForTeachersSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";
import { BackgroundBeamsWrapper } from "@/components/test-beams";


const Index = () => {
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

export default Index;
