import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GameCard } from "@/components/GameCard";
import { StatsModal } from "@/components/StatsModal";
import { type Game } from "@shared/schema";

export default function Home() {
  const [showStats, setShowStats] = useState(false);
  
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const { data: memoryBestScore } = useQuery<{ score: number }>({
    queryKey: ["/api/scores/best?gameId=1"],
  });

  const { data: patternBestScore } = useQuery<{ score: number }>({
    queryKey: ["/api/scores/best?gameId=2"],
  });

  const { data: numberBestScore } = useQuery<{ score: number }>({
    queryKey: ["/api/scores/best?gameId=3"],
  });

  const getScoreForGame = (gameId: number) => {
    if (gameId === 1) return memoryBestScore?.score;
    if (gameId === 2) return patternBestScore?.score;
    if (gameId === 3) return numberBestScore?.score;
    return undefined;
  };

  // Calculate time until midnight for the countdown timer
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const timeUntilMidnight = new Date(midnight.getTime() - now.getTime());
  const hours = timeUntilMidnight.getUTCHours();
  const minutes = timeUntilMidnight.getUTCMinutes();
  const seconds = timeUntilMidnight.getUTCSeconds();
  const countdown = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Header onShowStats={() => setShowStats(true)} />

      <main className="flex-grow container mx-auto p-4 md:p-6">
        <section className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-neutral-400">Daily Challenge</h2>
            <span className="text-sm text-neutral-300">
              New games in <span>{countdown}</span>
            </span>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl shadow-md h-64 animate-pulse">
                  <div className="h-24 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3 w-full"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {games?.map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  bestScore={getScoreForGame(game.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      
      <StatsModal 
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
      />
    </div>
  );
}
