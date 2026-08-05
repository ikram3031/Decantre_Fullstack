'use client';

import { useState, useEffect } from 'react';
import { padZero } from '../lib/utils';

// Custom hook providing live countdown timer in DAYS : HOURS : MINS : SECS format
export const useCountdown = (initialHours = 24) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: initialHours,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set target end time from now
    const targetTime = new Date().getTime() + initialHours * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [initialHours]);

  // Formatted output string matching screenshot style: 00D : 00h : 00m : 00s
  const formattedString = `${padZero(timeLeft.days)}D : ${padZero(timeLeft.hours)}h : ${padZero(timeLeft.minutes)}m : ${padZero(timeLeft.seconds)}s`;

  return { ...timeLeft, formattedString };
};
