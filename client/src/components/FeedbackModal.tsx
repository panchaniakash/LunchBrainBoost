import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrophyIcon } from "@/components/ui/icons";
import { Link } from "wouter";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  score: number | string;
  onPlayAgain: () => void;
}

export function FeedbackModal({
  isOpen,
  onClose,
  title,
  message,
  score,
  onPlayAgain
}: FeedbackModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] text-center">
        <div className="mb-4 flex justify-center">
          <TrophyIcon className="text-5xl text-success" size={64} />
        </div>
        
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="mb-6">{message}</p>
        
        <div className="bg-neutral-100 rounded-lg p-4 mb-6">
          <div className="text-sm text-neutral-300 mb-1">Your Score</div>
          <div className="text-3xl font-bold">{score}</div>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={onPlayAgain} 
            className="flex-1 bg-primary text-white px-4 py-3 rounded-lg font-medium"
          >
            Play Again
          </Button>
          <Link href="/">
            <a className="flex-1 bg-neutral-100 text-neutral-400 px-4 py-3 rounded-lg font-medium flex items-center justify-center">
              Home
            </a>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
