
import { useState } from "react";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const loadingStates = [
  {
    text: "Assembling your dream team of Cambridge experts ✨",
  },
  {
    text: "Crafting personalized KET & PET preparation plans 🎯",
  },
  {
    text: "Loading authentic Cambridge practice materials 📚",
  },
  {
    text: "Setting up interactive speaking simulations 🎤",
  },
  {
    text: "Preparing your exam confidence toolkit 💪",
  },
  {
    text: "Ready to master your Cambridge English exam! 🚀",
  },
];

export default function MultiStepLoaderDemo() {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      {/* Core Loader Modal */}
      <Loader loadingStates={loadingStates} loading={loading} duration={2000} />

      {/* The buttons are for demo only, remove it in your actual code ⬇️ */}
      <Button
        onClick={() => setLoading(true)}
        className="bg-coral hover:bg-coral/90 text-white mx-auto text-sm md:text-base transition font-medium duration-200 h-10 rounded-lg px-8 flex items-center justify-center shadow-lg"
      >
        Start Cambridge Prep
      </Button>

      {loading && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-[120] h-10 w-10 rounded-full bg-background/10 hover:bg-background/20 backdrop-blur-sm"
          onClick={() => setLoading(false)}
          aria-label="Close loader"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
} 