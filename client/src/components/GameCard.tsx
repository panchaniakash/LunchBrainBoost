import { Card } from "@/components/ui/card";
import { ScoreIcon } from "@/components/ui/icons";
import { Link } from "wouter";
import { type Game } from "@shared/schema";

interface GameCardProps {
  game: Game;
  bestScore?: number;
  onClick?: () => void;
}

export function GameCard({ game, bestScore, onClick }: GameCardProps) {
  const gameRoutes: Record<string, string> = {
    "Memory Match": "/memory-match",
    "Pattern Recall": "/pattern-recall",
    "Number Hunt": "/number-hunt"
  };

  const gameColors: Record<string, { bg: string, text: string }> = {
    "Memory Match": { bg: "bg-primary/10", text: "text-primary" },
    "Pattern Recall": { bg: "bg-secondary/10", text: "text-secondary" },
    "Number Hunt": { bg: "bg-accent/10", text: "text-accent" }
  };
  
  const { bg, text } = gameColors[game.name] || { bg: "bg-primary/10", text: "text-primary" };
  const route = gameRoutes[game.name] || "/";

  return (
    <Card className="overflow-hidden">
      <div className={`h-24 ${bg} flex items-center justify-center`}>
        <span className={`material-icons text-5xl ${text}`}>{game.iconName}</span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">{game.name}</h3>
          <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
            {game.timeEstimate}
          </span>
        </div>
        <p className="text-sm text-neutral-300 mb-3">{game.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ScoreIcon className="text-sm text-success mr-1" size={16} />
            <span className="text-sm">
              {bestScore !== undefined 
                ? `Best: ${game.name === "Number Hunt" ? `${bestScore}s` : bestScore}`
                : "No score yet"
              }
            </span>
          </div>
          <Link href={route}>
            <a 
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium"
              onClick={onClick}
            >
              Play
            </a>
          </Link>
        </div>
      </div>
    </Card>
  );
}
