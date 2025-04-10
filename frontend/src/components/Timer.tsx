import React from 'react';
import Countdown from './Countdown';
import Countup from './Countup';
import './Timer.css';

type TimerProps = {
  countDown?: boolean;
  startTime?: number;
  paused: boolean;
};

const Timer: React.FC<TimerProps> = ({ countDown, startTime, paused }) => {
  if (countDown && startTime && startTime > 0) {
    return <Countdown startTime={startTime} />;
  }
  if (!countDown) {
    return <Countup paused={paused} />;
  }
  return <span className="timer"/>;
};

export default Timer;