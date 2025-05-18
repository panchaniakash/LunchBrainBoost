import { BackIcon, TimerIcon, ScoreIcon, HelpIcon } from "@/components/ui/icons";
import { Link } from "wouter";

interface GameHeaderProps {
  timer: string;
  score: number | string;
  onHelp: () => void;
}

export function GameHeader({ timer, score, onHelp }: GameHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <Link href="/">
        <a className="flex items-center text-neutral-300 hover:text-neutral-400">
          <BackIcon className="mr-1" />
          Back
        </a>
      </Link>
      
      <div className="flex items-center space-x-4">
        <div className="bg-white px-3 py-1 rounded-full shadow flex items-center">
          <TimerIcon className="text-sm text-primary mr-1" size={16} />
          <span className="text-sm font-mono">{timer}</span>
        </div>
        
        <div className="bg-white px-3 py-1 rounded-full shadow flex items-center">
          <ScoreIcon className="text-sm text-accent mr-1" size={16} />
          <span className="text-sm font-mono">{score}</span>
        </div>
        
        <button 
          onClick={onHelp}
          className="bg-white p-2 rounded-full shadow flex items-center justify-center"
        >
          <HelpIcon className="text-neutral-300" size={20} />
        </button>
      </div>
    </div>
  );
}
