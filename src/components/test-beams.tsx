import React from "react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

export default function TestBeams() {
  return (
    <div className="absolute inset-x-0 top-20 w-full h-[calc(100vh-5rem)] pointer-events-none z-10">
      <BackgroundBeamsWithCollision className="h-full">
        <div className="relative z-20 text-center">
          {/* Test content removed */}
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
} 