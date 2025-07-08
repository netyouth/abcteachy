import { PointerHighlight } from "@/components/ui/pointer-highlight";

export default function PointerHighlightDemo() {
  return (
    <div className="mx-auto max-w-lg py-20 text-2xl font-bold font-duolingo tracking-tight md:text-4xl">
      The best way to learn is to
      <PointerHighlight>
        <span>practice with tutors</span>
      </PointerHighlight>
    </div>
  );
} 