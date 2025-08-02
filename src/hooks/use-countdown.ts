import { useState, useEffect } from 'react';

interface CountdownTimer {
  timeLeft: number;
  isExpired: boolean;
  formattedTime: string;
}

export const useCountdown = (expiresAt: string): CountdownTimer => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(expiresAt).getTime();
      const difference = expiryTime - now;

      if (difference <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
      } else {
        setTimeLeft(difference);
        setIsExpired(false);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isExpired,
    formattedTime: formatTime(timeLeft)
  };
}; 