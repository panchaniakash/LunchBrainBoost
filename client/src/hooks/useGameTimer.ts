import { useState, useEffect, useCallback } from 'react';

interface UseGameTimerProps {
  initialSeconds?: number;
  autoStart?: boolean;
  countDown?: boolean;
  onTimeUp?: () => void;
}

interface GameTimerReturn {
  time: number;
  isRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (newTime?: number) => void;
  formattedTime: string;
}

export function useGameTimer({
  initialSeconds = 0,
  autoStart = false,
  countDown = false,
  onTimeUp
}: UseGameTimerProps = {}): GameTimerReturn {
  const [time, setTime] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback((newTime?: number) => {
    setTime(newTime !== undefined ? newTime : initialSeconds);
    setIsRunning(autoStart);
  }, [initialSeconds, autoStart]);

  // Format time as MM:SS
  const formattedTime = useCallback(() => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [time]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          // For countdown timer
          if (countDown) {
            const newTime = prevTime - 1;
            if (newTime <= 0) {
              clearInterval(interval);
              setIsRunning(false);
              onTimeUp && onTimeUp();
              return 0;
            }
            return newTime;
          }
          // For count-up timer
          return prevTime + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, countDown, onTimeUp]);

  return {
    time,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    formattedTime: formattedTime()
  };
}
