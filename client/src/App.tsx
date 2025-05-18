import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MemoryMatch from "@/pages/MemoryMatch";
import PatternRecall from "@/pages/PatternRecall";
import NumberHunt from "@/pages/NumberHunt";
import { useEffect, useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/memory-match" component={MemoryMatch} />
      <Route path="/pattern-recall" component={PatternRecall} />
      <Route path="/number-hunt" component={NumberHunt} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a quick loading time for initial resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold text-primary mb-4 flex items-center">
            <span className="material-icons mr-2">psychology</span>
            BrainBreak
          </div>
          <div className="w-32 h-1 bg-muted relative overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-primary animate-[pulse_1s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
