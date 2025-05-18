import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GameHeader } from "@/components/GameHeader";
import { GameInstruction } from "@/components/GameInstruction";
import { FeedbackModal } from "@/components/FeedbackModal";
import { Button } from "@/components/ui/button";
import { LightbulbIcon } from "@/components/ui/icons";
import { useGameTimer } from "@/hooks/useGameTimer";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SequenceButton {
  id: number;
  color: string;
}

export default function PatternRecall() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [level, setLevel] = useState(1);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'watching' | 'repeating' | 'correct' | 'incorrect'>('waiting');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [highlightedButton, setHighlightedButton] = useState<number | null>(null);
  
  const { toast } = useToast();
  
  const buttons: SequenceButton[] = [
    { id: 1, color: 'bg-red-500' },
    { id: 2, color: 'bg-blue-500' },
    { id: 3, color: 'bg-yellow-500' },
    { id: 4, color: 'bg-green-500' }
  ];
  
  const { time, formattedTime, startTimer, pauseTimer, resetTimer } = useGameTimer({
    initialSeconds: 0,
    autoStart: false
  });
  
  // Get a hint
  const { data: hint, refetch: refetchHint } = useQuery({
    queryKey: ["/api/games/2/hint"],
    enabled: false,
  });
  
  // Submit score
  const { mutate: submitScore } = useMutation({
    mutationFn: async (finalScore: number) => {
      const res = await apiRequest("POST", "/api/scores", {
        gameId: 2,
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
  
  // Start a new game
  const startNewGame = useCallback(() => {
    resetTimer();
    setLevel(1);
    setSequence([]);
    setPlayerSequence([]);
    setGameStatus('waiting');
    setHintsUsed(0);
    generateSequence(1);
    startTimer();
  }, [resetTimer, startTimer]);
  
  // Generate a new sequence for the current level
  const generateSequence = useCallback((currentLevel: number) => {
    setGameStatus('watching');
    
    // Generate sequence - each level adds one more step
    const newSequence = [];
    for (let i = 0; i < currentLevel; i++) {
      // Random number between 1-4 (button IDs)
      newSequence.push(Math.floor(Math.random() * 4) + 1);
    }
    
    setSequence(newSequence);
    setPlayerSequence([]);
    
    // Show the sequence to the player
    showSequence(newSequence);
  }, []);
  
  // Show the sequence animation
  const showSequence = useCallback((seq: number[]) => {
    setIsShowingSequence(true);
    
    let step = 0;
    const interval = setInterval(() => {
      if (step < seq.length) {
        // Highlight button
        setHighlightedButton(seq[step]);
        
        // Clear highlight after a delay
        setTimeout(() => {
          setHighlightedButton(null);
        }, 500);
        
        step++;
      } else {
        // End of sequence
        clearInterval(interval);
        setIsShowingSequence(false);
        setGameStatus('repeating');
      }
    }, 800);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle player clicking a button
  const handleButtonClick = (buttonId: number) => {
    if (gameStatus !== 'repeating' || isShowingSequence) return;
    
    // Highlight the button briefly
    setHighlightedButton(buttonId);
    setTimeout(() => {
      setHighlightedButton(null);
    }, 300);
    
    // Add to player sequence
    const newPlayerSequence = [...playerSequence, buttonId];
    setPlayerSequence(newPlayerSequence);
    
    // Check if the player's input is correct so far
    for (let i = 0; i < newPlayerSequence.length; i++) {
      if (newPlayerSequence[i] !== sequence[i]) {
        // Incorrect sequence
        setGameStatus('incorrect');
        
        // Game over, show feedback
        pauseTimer();
        
        // Submit score (level reached)
        submitScore(level - 1);
        
        setTimeout(() => {
          setShowFeedback(true);
        }, 500);
        
        return;
      }
    }
    
    // If player completed the sequence correctly
    if (newPlayerSequence.length === sequence.length) {
      setGameStatus('correct');
      
      // Move to next level after a delay
      setTimeout(() => {
        const newLevel = level + 1;
        setLevel(newLevel);
        generateSequence(newLevel);
      }, 1000);
    }
  };
  
  // Show a hint (replay the sequence)
  const showHint = async () => {
    if (gameStatus !== 'repeating') return;
    
    if (hintsUsed < 3) {
      // Get a hint from the server
      await refetchHint();
      
      if (hint) {
        toast({
          title: "Hint",
          description: hint.hintText,
        });
      }
      
      // Replay the current sequence
      showSequence(sequence);
      
      // Increment hints used
      setHintsUsed(prev => prev + 1);
    } else {
      toast({
        title: "Hint limit reached",
        description: "You can only use 3 hints per game.",
        variant: "destructive"
      });
    }
  };
  
  // Status message for the player
  const statusMessage = () => {
    switch (gameStatus) {
      case 'waiting': return 'Get ready...';
      case 'watching': return 'Watch the pattern...';
      case 'repeating': return 'Repeat the pattern';
      case 'correct': return 'Correct! Next level...';
      case 'incorrect': return 'Incorrect pattern. Game over!';
      default: return 'Watch the pattern...';
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onShowStats={() => setShowStats(true)} />
      
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <section id="gameArea" className="fade-in">
          <GameHeader 
            timer={formattedTime} 
            score={level.toString()} 
            onHelp={() => setShowInstructions(true)}
          />
          
          <div id="gameContainer" className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div id="patternGame">
              <h2 className="text-xl font-bold mb-4 text-center">Pattern Recall</h2>
              <p className="text-center text-neutral-300 mb-6">Watch the sequence, then repeat it in the same order</p>
              
              <div className="max-w-md mx-auto">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {buttons.map((button) => (
                    <button
                      key={button.id}
                      className={`sequence-btn ${button.color} h-24 rounded-lg ${
                        highlightedButton === button.id ? 'brightness-150' : ''
                      }`}
                      onClick={() => handleButtonClick(button.id)}
                      disabled={gameStatus !== 'repeating' || isShowingSequence}
                    ></button>
                  ))}
                </div>
                
                <div id="sequenceStatus" className="text-center mb-4">
                  <div className="text-sm font-medium text-neutral-300">Level: <span id="sequenceLevel">{level}</span></div>
                  <div className="text-sm mt-1">{statusMessage()}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={showHint}
              variant="outline"
              className="flex items-center px-4 py-2 rounded-lg shadow text-accent"
              disabled={gameStatus !== 'repeating' || isShowingSequence}
            >
              <LightbulbIcon className="mr-1" />
              Replay Sequence ({3 - hintsUsed} left)
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
      
      <GameInstruction 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)}
        gameType="pattern"
        onStart={startNewGame}
      />
      
      <FeedbackModal 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        title="Game Over!"
        message={`You reached level ${level} in Pattern Recall!`}
        score={level - 1}
        onPlayAgain={() => {
          setShowFeedback(false);
          startNewGame();
        }}
      />
    </div>
  );
}
