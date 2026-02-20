import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";

interface Flashcard {
  front: string;
  back: string;
  category: string;
}

interface FlashcardViewProps {
  flashcards: Flashcard[];
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ flashcards }) => {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) return null;
  const card = flashcards[index];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
        <span>{card.category}</span>
        <span>
          {index + 1} / {flashcards.length}
        </span>
      </div>

      <div
        className="relative h-64 w-full cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-secondary/20 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-lg font-medium text-foreground">{card.front}</p>
            <div className="absolute bottom-4 flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
              <Repeat className="w-3 h-3" /> Click to reveal
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-primary/5 rounded-2xl border-2 border-primary/20 flex items-center justify-center p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-lg font-medium text-foreground">{card.back}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => {
            setIndex((prev) => Math.max(0, prev - 1));
            setIsFlipped(false);
          }}
          disabled={index === 0}
        >
          Previous
        </Button>
        <Button
          variant="default"
          onClick={() => {
            setIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
            setIsFlipped(false);
          }}
          disabled={index === flashcards.length - 1}
        >
          Next Card
        </Button>
      </div>
    </div>
  );
};

export default FlashcardView;
