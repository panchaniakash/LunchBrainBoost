import { BrainIcon, StatsIcon } from "@/components/ui/icons";
import { useState, useEffect } from "react";
import { Link } from "wouter";

interface HeaderProps {
  onShowStats: () => void;
}

export function Header({ onShowStats }: HeaderProps) {
  const [today, setToday] = useState("");
  const [timeUntilTomorrow, setTimeUntilTomorrow] = useState("");

  useEffect(() => {
    // Format today's date as "Monday, April 15"
    const formatDate = () => {
      const now = new Date();
      return now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    };

    // Calculate time until midnight (new games)
    const calculateTimeUntilTomorrow = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      let diff = midnight.getTime() - now.getTime();
      diff = Math.max(0, diff);
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Set initial values
    setToday(formatDate());
    setTimeUntilTomorrow(calculateTimeUntilTomorrow());

    // Update countdown every second
    const timer = setInterval(() => {
      setTimeUntilTomorrow(calculateTimeUntilTomorrow());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <BrainIcon className="mr-2" />
            <h1 className="text-2xl font-bold">BrainBreak</h1>
          </div>
        </Link>
        <div className="flex items-center">
          <span className="text-sm mr-3 hidden sm:inline">{today}</span>
          <button 
            className="flex items-center bg-white/10 rounded-full px-3 py-1 text-sm"
            onClick={onShowStats}
          >
            <StatsIcon size={16} className="mr-1" />
            Stats
          </button>
        </div>
      </div>
    </header>
  );
}
