import React, { createContext, useState, useContext, ReactNode } from 'react';

interface GameStateContextType {
  gameKey: number;
  setGameKey:React.Dispatch<React.SetStateAction<number>>;
  timerKey: number;
  setTimerKey:React.Dispatch<React.SetStateAction<number>>;
  showTimer: boolean;
  setShowTimer:React.Dispatch<React.SetStateAction<boolean>>;
  timerPaused: boolean;
  setTimerPaused:React.Dispatch<React.SetStateAction<boolean>>;
  gameStarted: boolean;
  setGameStarted:React.Dispatch<React.SetStateAction<boolean>>;
  gameFinished: boolean;
  setGameFinished:React.Dispatch<React.SetStateAction<boolean>>;
  selectedWord: string;
  setSelectedWord: React.Dispatch<React.SetStateAction<string>>;
  buzzing: boolean;
  setBuzzing: React.Dispatch<React.SetStateAction<boolean>>;
  time: string;
  setTime: (time: string) => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const [gameKey, setGameKey ] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [buzzing, setBuzzing] = useState(false);
  const [time, setTime] = useState("");

  return (
    <GameStateContext.Provider value={{ 
        gameKey, gameStarted, gameFinished, timerKey, timerPaused, showTimer, selectedWord, buzzing, time,
        setGameKey, setGameStarted, setGameFinished, setTimerKey, setTimerPaused, setShowTimer, setSelectedWord, setBuzzing, setTime
     }}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGameState must be used within an GameStateProvider");
  }
  return context;
};
