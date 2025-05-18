import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";

interface GameInstructionProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'memory' | 'pattern' | 'number';
  onStart?: () => void;
}

export function GameInstruction({ isOpen, onClose, gameType, onStart }: GameInstructionProps) {
  const titles = {
    memory: 'Memory Match Instructions',
    pattern: 'Pattern Recall Instructions',
    number: 'Number Hunt Instructions'
  };

  const handleStart = () => {
    onStart?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl font-bold">{titles[gameType]}</DialogTitle>
          <button onClick={onClose} className="text-neutral-300 hover:text-neutral-400">
            <CloseIcon />
          </button>
        </DialogHeader>

        {gameType === 'memory' && (
          <div>
            <p className="mb-4">Test your visual memory by finding matching pairs of cards.</p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Click on a card to flip it and reveal what's underneath</li>
              <li>Try to remember where each symbol is located</li>
              <li>Find all matching pairs to complete the game</li>
              <li>The faster you complete the game, the higher your score</li>
            </ul>
            <p className="text-sm text-neutral-300">Use the hint button if you get stuck, but using hints will reduce your final score.</p>
          </div>
        )}

        {gameType === 'pattern' && (
          <div>
            <p className="mb-4">Test your working memory by repeating increasingly complex sequences.</p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Watch as the colored buttons light up in a specific sequence</li>
              <li>After the sequence plays, repeat it by clicking the buttons in the same order</li>
              <li>Each successful round adds another step to the sequence</li>
              <li>The game ends when you make a mistake</li>
            </ul>
            <p className="text-sm text-neutral-300">Use the hint button to replay the current sequence, but this will reduce your final level score.</p>
          </div>
        )}

        {gameType === 'number' && (
          <div>
            <p className="mb-4">Test your visual scanning and processing speed by finding numbers in order.</p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Numbers 1-25 are scattered randomly on the grid</li>
              <li>Find and click on each number in ascending order (1, 2, 3...)</li>
              <li>The current number you need to find is shown above the grid</li>
              <li>Complete the sequence as quickly as possible</li>
            </ul>
            <p className="text-sm text-neutral-300">Use the hint button if you get stuck, and the target number will briefly flash, but this will add time to your final score.</p>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button onClick={handleStart} className="w-full sm:w-auto">
            Got it, let's play!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
