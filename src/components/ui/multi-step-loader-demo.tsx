"use client";
import React, { useState } from "react";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const loadingStates = [
  {
    text: "Gathering the finest English mentors 🌟",
  },
  {
    text: "Tuning into your learning wavelength 📡",
  },
  {
    text: "Weaving your personalized lesson tapestry 🧵",
  },
  {
    text: "Building your virtual English sanctuary 🏛️",
  },
  {
    text: "Polishing the final details to sparkle ✨",
  },
  {
    text: "Your English adventure awaits! Ready to shine? 🌈",
  },
];

export default function MultiStepLoaderDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      {/* Core Loader Modal */}
      <Loader loadingStates={loadingStates} loading={loading} duration={2000} />

      {/* Demo Button */}
      <Button
        onClick={() => setLoading(true)}
        className="bg-coral hover:bg-coral/90 text-white mx-auto text-sm md:text-base transition font-medium duration-200 h-10 rounded-lg px-8 flex items-center justify-center shadow-lg"
      >
        Begin Your Journey
      </Button>

      {/* Close Button */}
      {loading && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-[120] h-10 w-10 rounded-full bg-background/10 hover:bg-background/20 backdrop-blur-sm"
          onClick={() => setLoading(false)}
          aria-label="Close demo"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
} 