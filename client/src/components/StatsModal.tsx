import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CloseIcon } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { type Score } from "@shared/schema";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const { data: memoryScores } = useQuery<Score[]>({
    queryKey: ["/api/scores?gameId=1"],
    enabled: isOpen,
  });

  const { data: patternScores } = useQuery<Score[]>({
    queryKey: ["/api/scores?gameId=2"],
    enabled: isOpen,
  });

  const { data: numberScores } = useQuery<Score[]>({
    queryKey: ["/api/scores?gameId=3"],
    enabled: isOpen,
  });

  // Calculate stats
  const calculateStats = (scores: Score[] | undefined) => {
    if (!scores || scores.length === 0) {
      return { highScore: 0, gamesPlayed: 0, averageScore: 0 };
    }

    const highScore = Math.max(...scores.map(score => score.score));
    const gamesPlayed = scores.length;
    const averageScore = Math.round(scores.reduce((acc, curr) => acc + curr.score, 0) / gamesPlayed);

    return { highScore, gamesPlayed, averageScore };
  };

  const memoryStats = calculateStats(memoryScores);
  const patternStats = calculateStats(patternScores);
  const numberStats = calculateStats(numberScores);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="flex justify-between items-center mb-4">
          <DialogTitle className="text-xl font-bold">Your Progress</DialogTitle>
          <button onClick={onClose} className="text-neutral-300 hover:text-neutral-400">
            <CloseIcon />
          </button>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Memory Game Stats */}
          <div className="border-b pb-4 md:border-b-0 md:border-r md:pr-6 md:pb-0">
            <h3 className="font-bold text-lg mb-3">Memory Match</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-300">High Score</span>
                <span className="font-mono">{memoryStats.highScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Games Played</span>
                <span className="font-mono">{memoryStats.gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Average Score</span>
                <span className="font-mono">{memoryStats.averageScore}</span>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div>
              <div className="text-sm">7-day trend</div>
              <div className="h-24 mt-2 flex items-end space-x-1">
                {/* This would ideally be driven by real data */}
                <div className="bg-primary/20 w-full h-1/4"></div>
                <div className="bg-primary/20 w-full h-2/4"></div>
                <div className="bg-primary/20 w-full h-1/3"></div>
                <div className="bg-primary/20 w-full h-3/5"></div>
                <div className="bg-primary/20 w-full h-2/5"></div>
                <div className="bg-primary w-full h-4/5"></div>
                <div className="bg-primary/20 w-full h-3/5"></div>
              </div>
            </div>
          </div>
          
          {/* Pattern Game Stats */}
          <div className="border-b py-4 md:border-b-0 md:border-r md:px-6 md:py-0">
            <h3 className="font-bold text-lg mb-3">Pattern Recall</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-300">Highest Level</span>
                <span className="font-mono">{patternStats.highScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Games Played</span>
                <span className="font-mono">{patternStats.gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Average Level</span>
                <span className="font-mono">{patternStats.averageScore}</span>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div>
              <div className="text-sm">7-day trend</div>
              <div className="h-24 mt-2 flex items-end space-x-1">
                <div className="bg-secondary/20 w-full h-2/5"></div>
                <div className="bg-secondary/20 w-full h-3/5"></div>
                <div className="bg-secondary/20 w-full h-1/2"></div>
                <div className="bg-secondary/20 w-full h-3/4"></div>
                <div className="bg-secondary w-full h-4/5"></div>
                <div className="bg-secondary/20 w-full h-1/2"></div>
                <div className="bg-secondary/20 w-full h-3/5"></div>
              </div>
            </div>
          </div>
          
          {/* Number Game Stats */}
          <div className="pt-4 md:pt-0 md:pl-6">
            <h3 className="font-bold text-lg mb-3">Number Hunt</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-300">Best Time</span>
                <span className="font-mono">{numberStats.highScore}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Games Played</span>
                <span className="font-mono">{numberStats.gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Average Time</span>
                <span className="font-mono">{numberStats.averageScore}s</span>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div>
              <div className="text-sm">7-day trend</div>
              <div className="h-24 mt-2 flex items-end space-x-1">
                <div className="bg-accent/20 w-full h-1/5"></div>
                <div className="bg-accent/20 w-full h-2/5"></div>
                <div className="bg-accent/20 w-full h-1/2"></div>
                <div className="bg-accent w-full h-4/5"></div>
                <div className="bg-accent/20 w-full h-3/5"></div>
                <div className="bg-accent/20 w-full h-2/5"></div>
                <div className="bg-accent/20 w-full h-3/5"></div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
