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
import { MemoryCard } from "@shared/schema";

export default function MemoryMatch() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [highlightedCardId, setHighlightedCardId] = useState<number | null>(null);
  
  const { toast } = useToast();
  
  const { time, formattedTime, startTimer, pauseTimer, resetTimer } = useGameTimer({
    initialSeconds: 0,
    autoStart: false
  });
  
  // Get memory cards
  const { data: memoryCards, isLoading, refetch } = useQuery<MemoryCard[]>({
    queryKey: ["/api/games/memory-cards"],
    enabled: false,
  });
  
  // Get a hint
  const { data: hint, refetch: refetchHint } = useQuery({
    queryKey: ["/api/games/1/hint"],
    enabled: false,
  });
  
  // Submit score
  const { mutate: submitScore } = useMutation({
    mutationFn: async (finalScore: number) => {
      const res = await apiRequest("POST", "/api/scores", {
        gameId: 1,
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
  
  // Start new game
  const startNewGame = useCallback(async () => {
    setIsGameComplete(false);
    setIsGameStarted(false);
    setFlippedCards([]);
    setMatchedCards([]);
    setScore(0);
    setHintsUsed(0);
    resetTimer();
    
    // Fetch new cards
    await refetch();
  }, [refetch, resetTimer]);
  
  // Setup game when cards are loaded
  useEffect(() => {
    if (memoryCards && !isGameStarted) {
      setCards(memoryCards);
      setIsGameStarted(true);
      startTimer();
    }
  }, [memoryCards, isGameStarted, startTimer]);
  
  // Handle card flipping
  const handleCardClick = (cardId: number) => {
    // Ignore if card is already flipped or matched
    if (flippedCards.includes(cardId) || matchedCards.includes(cardId)) {
      return;
    }
    
    // Can only flip two cards at a time unless they match
    if (flippedCards.length === 2) {
      return;
    }
    
    // Add card to flipped cards
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    // Check for a match if we have two cards flipped
    if (newFlippedCards.length === 2) {
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);
      
      if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
        // Match found!
        setMatchedCards([...matchedCards, firstId, secondId]);
        setFlippedCards([]);
        
        // Update score - base score + time bonus
        const matchPoints = 100;
        const timeBonus = Math.max(0, 300 - time);
        const points = matchPoints + timeBonus;
        setScore(prevScore => prevScore + points);
      } else {
        // No match, reset flipped cards after a delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  
  // Check if game is complete
  useEffect(() => {
    if (cards.length > 0 && matchedCards.length === cards.length && !isGameComplete) {
      // Game complete!
      pauseTimer();
      setIsGameComplete(true);
      
      // Calculate final score
      const timeBonus = Math.max(0, 2000 - time * 10);
      const hintPenalty = hintsUsed * 100;
      const finalScore = score + timeBonus - hintPenalty;
      
      setScore(finalScore);
      
      // Save score
      submitScore(finalScore);
      
      // Show feedback
      setTimeout(() => {
        setShowFeedback(true);
      }, 500);
    }
  }, [cards.length, matchedCards.length, isGameComplete, pauseTimer, score, time, hintsUsed, submitScore]);
  
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
      
      // Find an unmatched card to highlight
      const unmatchedCards = cards.filter(card => !matchedCards.includes(card.id));
      if (unmatchedCards.length > 0) {
        // Choose a random unmatched card
        const randomCard = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
        setHighlightedCardId(randomCard.id);
        
        // Clear highlight after 1 second
        setTimeout(() => {
          setHighlightedCardId(null);
        }, 1000);
        
        // Increment hints used
        setHintsUsed(prev => prev + 1);
      }
    } else {
      toast({
        title: "Hint limit reached",
        description: "You can only use 3 hints per game.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onShowStats={() => setShowStats(true)} />
      
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <section id="gameArea" className="fade-in">
          <GameHeader 
            timer={formattedTime} 
            score={score.toString()} 
            onHelp={() => setShowInstructions(true)}
          />
          
          <div id="gameContainer" className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div id="memoryGame">
              <h2 className="text-xl font-bold mb-4 text-center">Memory Match</h2>
              <p className="text-center text-neutral-300 mb-6">Find all matching pairs before time runs out</p>
              
              {isLoading ? (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4 max-w-2xl mx-auto">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4 max-w-2xl mx-auto">
                  {cards.map((card) => (
                    <div 
                      key={card.id} 
                      className={`flip-card aspect-square ${
                        flippedCards.includes(card.id) || matchedCards.includes(card.id) ? 'flipped' : ''
                      }`}
                      onClick={() => handleCardClick(card.id)}
                    >
                      <div className={`flip-card-inner relative w-full h-full ${
                        highlightedCardId === card.id ? 'ring-2 ring-accent animate-pulse' : ''
                      }`}>
                        <div className="flip-card-front absolute w-full h-full bg-primary rounded-lg flex items-center justify-center">
                          <span className="material-icons text-white text-3xl">psychology</span>
                        </div>
                        <div className="flip-card-back absolute w-full h-full bg-white rounded-lg border-2 border-primary flex items-center justify-center">
                          <span className="material-icons text-primary text-3xl">{card.icon}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={showHint}
              variant="outline"
              className="flex items-center px-4 py-2 rounded-lg shadow text-accent"
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
        gameType="memory"
        onStart={startNewGame}
      />
      
      <FeedbackModal 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        title="Great job!"
        message={`You completed Memory Match with a score of ${score}!`}
        score={score}
        onPlayAgain={() => {
          setShowFeedback(false);
          startNewGame();
        }}
      />
    </div>
  );
}
