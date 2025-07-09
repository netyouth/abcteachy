import { MultiStepLoader } from "@/components/ui/multi-step-loader";

const defaultCambridgeStates = [
  {
    text: "Connecting you with Cambridge-certified tutors 🎓",
  },
  {
    text: "Loading authentic Cambridge practice materials 📖",
  },
  {
    text: "Personalizing your Cambridge journey ✨",
  },
  {
    text: "Welcome to ABC Teachy - Your Cambridge success starts now! 🚀",
  },
];

interface CambridgeExamLoaderProps {
  loading: boolean;
  duration?: number;
  examType?: "KET" | "PET" | "YLE" | "GENERAL";
}

export const CambridgeExamLoader = ({ 
  loading, 
  duration = 2000,
  examType = "GENERAL" 
}: CambridgeExamLoaderProps) => {
  
  const getExamSpecificStates = () => {
    switch (examType) {
      case "KET":
        return [
          { text: "Loading KET (A2 Key) expert tutors 🎓" },
          { text: "Preparing authentic Cambridge practice tests 📝" },
          { text: "Setting up A2-level speaking simulations 💬" },
          { text: "Your KET preparation starts now! 🌟" },
        ];
      case "PET":
        return [
          { text: "Connecting PET (B1 Preliminary) specialists 🎯" },
          { text: "Loading B1-level practice materials 📖" },
          { text: "Preparing advanced speaking scenarios 🎤" },
          { text: "Ready to master PET! Let's begin 🚀" },
        ];
      case "YLE":
        return [
          { text: "Finding fun YLE tutors for young learners 🌈" },
          { text: "Loading Starters, Movers & Flyers materials 🎨" },
          { text: "Preparing interactive games and activities 🎮" },
          { text: "Time for a fun English adventure! 🎉" },
        ];
      default:
        return defaultCambridgeStates;
    }
  };

  return (
    <MultiStepLoader
      loadingStates={getExamSpecificStates()}
      loading={loading}
      duration={duration}
      loop={false}
    />
  );
}; 