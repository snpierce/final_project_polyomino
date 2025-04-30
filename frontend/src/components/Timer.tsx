import React, { useEffect, useState, useRef } from 'react';
import { useGameState } from '../GameStateContext';

type TimerProps = {
  countDown?: boolean;
  startTime?: number; // in ms
  paused: boolean;
};

const Timer: React.FC<TimerProps> = ({ countDown, startTime, paused }) => {
  const [time, setTime] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const startTimestamp = useRef<number | null>(null);
  const { setTime: setGameTime } = useGameState();


  const convertTime = (mSec: number) => {
    const seconds = Math.round(mSec / 1000);
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    const strMin = minutes < 10 ? '0' + minutes : '' + minutes;
    const strSec = sec < 10 ? '0' + sec : '' + sec;
    return strMin + ':' + strSec;
  };

  useEffect(() => {
    if (!paused) {
      if (countDown && startTime && startTime > 0) {
        setTime(startTime);
        startTimestamp.current = Date.now();
      } else {
        setTime(0);
        startTimestamp.current = Date.now();
      }
  
      intervalRef.current = window.setInterval(() => {
        if (startTimestamp.current !== null) {
          const elapsed = Date.now() - startTimestamp.current;
          const newTime = startTime ? Math.max(startTime - elapsed, 0) : elapsed;
        
          setTime(newTime);
          setGameTime(convertTime(newTime)); // <-- update context here
        }
      }, 1000);
    } else {
      // Pause: just stop the interval, keep current offset
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  
    return () => {
      if (intervalRef.current != null) clearInterval(intervalRef.current);
    };
  
  }, [countDown, startTime, paused]);

  return (
    <span>{convertTime(time)}</span>
  );
};

export default Timer;
