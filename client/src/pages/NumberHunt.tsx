import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GameHeader } from "@/components/GameHeader";
import { GameInstruction } from "@/components/GameInstruction";
import { FeedbackModal } from "@/components/FeedbackModal";
import { Button } from "@/components/ui/button";
import { LightbulbIcon } from "@/components/ui/icons";
import { useGameTimer } from "@/hooks/useGameTimer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NumberCell {
  id: number;
  value: number;
  found: boolean;
}

export default function NumberHunt() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [numbers, setNumbers] = useState<NumberCell[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  
  const maxNumber = 25; // Grid size 5x5
  const hintPenaltySeconds = 5;
  
  const { toast } = useToast();
  
  const { time, formattedTime, startTimer, pauseTimer, resetTimer } = useGameTimer({
    initialSeconds: 0,
    autoStart: false
  });
  
  // Get a hint
  const { data: hint, refetch: refetchHint } = useQuery({
    queryKey: ["/api/games/3/hint"],
    enabled: false,
  });
  
  // Submit score
  const { mutate: submitScore } = useMutation({
    mutationFn: async (finalScore: number) => {
      const res = await apiRequest("POST", "/api/scores", {
        gameId: 3,
        score: finalScore
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Score saved!",
        description: "Your score has been recorded.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your score.",
      });
    }
  });
  
  // Generate the number grid
  const generateNumberGrid = useCallback(() => {
    // Create an array from 1 to maxNumber
    const numbersArray: NumberCell[] = Array.from({ length: maxNumber }, (_, i) => ({
      id: i,
      value: i + 1,
      found: false
    }));
    
    // Shuffle the array
    for (let i = numbersArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbersArray[i], numbersArray[j]] = [numbersArray[j], numbersArray[i]];
    }
    
    return numbersArray;
  }, [maxNumber]);
  
  // Start a new game
  const startNewGame = useCallback(() => {
    setNumbers(generateNumberGrid());
    setNextNumber(1);
    setHintsUsed(0);
    setIsGameComplete(false);
    resetTimer();
    startTimer();
  }, [generateNumberGrid, resetTimer, startTimer]);
  
  // Handle clicking a number
  const handleNumberClick = (value: number) => {
    if (value === nextNumber) {
      // Correct number found
      setNumbers(prev => 
        prev.map(num => 
          num.value === value ? { ...num, found: true } : num
        )
      );
      
      // Move to next number
      const next = nextNumber + 1;
      setNextNumber(next);
      
      // Check if game is complete
      if (next > maxNumber) {
        finishGame();
      }
    } else {
      // Wrong number, provide feedback
      toast({
        title: "Wrong number",
        description: `Find number ${nextNumber} first!`,
        variant: "destructive"
      });
    }
  };
  
  // Show a hint
  const showHint = async () => {
    if (hintsUsed < 3) {
      // Get a hint from the server
      await refetchHint();
      
      if (hint) {
        toast({
          title: "Hint",
          description: hint.hintText,
        });
      }
      
      // Highlight the next number
      setHighlightedNumber(nextNumber);
      
      // Clear highlight after 1 second
      setTimeout(() => {
        setHighlightedNumber(null);
      }, 1000);
      
      // Increment hints used and add time penalty
      setHintsUsed(prev => prev + 1);
      
      // Add time penalty (adds to final time)
      resetTimer(time + hintPenaltySeconds);
    } else {
      toast({
        title: "Hint limit reached",
        description: "You can only use 3 hints per game.",
        variant: "destructive"
      });
    }
  };
  
  // Finish the game
  const finishGame = () => {
    pauseTimer();
    setIsGameComplete(true);
    
    // Use time as score (lower is better)
    const finalScore = time;
    
    // Submit score
    submitScore(finalScore);
    
    // Show feedback
    setTimeout(() => {
      setShowFeedback(true);
    }, 500);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onShowStats={() => setShowStats(true)} />
      
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <section id="gameArea" className="fade-in">
          <GameHeader 
            timer={formattedTime} 
            score={(nextNumber - 1).toString()} 
            onHelp={() => setShowInstructions(true)}
          />
          
          <div id="gameContainer" className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div id="numberGame">
              <h2 className="text-xl font-bold mb-4 text-center">Number Hunt</h2>
              <p className="text-center text-neutral-300 mb-6">Find numbers in order from 1 to 25 as quickly as possible</p>
              
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-4">
                  <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-mono text-lg">
                    Find: <span className="font-bold">{nextNumber <= maxNumber ? nextNumber : 'Complete!'}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 md:gap-3">
                  {numbers.map(num => (
                    <button
                      key={num.id}
                      className={`number-grid-cell aspect-square 
                        ${num.found ? 'bg-primary/10 text-primary font-bold' : 'bg-white hover:bg-neutral-100'} 
                        border-2 
                        ${num.value === highlightedNumber ? 'border-accent animate-pulse' : 'border-neutral-200'} 
                        rounded-lg flex items-center justify-center font-mono text-lg`}
                      onClick={() => handleNumberClick(num.value)}
                      disabled={num.found || isGameComplete}
                    >
                      {num.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={showHint}
              variant="outline"
              className="flex items-center px-4 py-2 rounded-lg shadow text-accent"
              disabled={isGameComplete}
            >
              <LightbulbIcon className="mr-1" />
              Get a Hint ({3 - hintsUsed} left)
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
      
      <GameInstruction 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)}
        gameType="number"
        onStart={startNewGame}
      />
      
      <FeedbackModal 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        title="Great job!"
        message={`You completed Number Hunt in ${time} seconds!`}
        score={`${time}s`}
        onPlayAgain={() => {
          setShowFeedback(false);
          startNewGame();
        }}
      />
    </div>
  );
}
