import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface OccupiedCellsContextType {
  occupiedCells: Map<String, String>;
  setOccupiedCells: React.Dispatch<React.SetStateAction<Map<String, String>>>;
  resetOccupiedCells: () => void;
}

const OccupiedCellsContext = createContext<OccupiedCellsContextType | undefined>(undefined);

export const OccupiedCellsProvider = ({ children }: { children: ReactNode }) => {
  const [occupiedCells, setOccupiedCells] = useState<Map<String, String>>(new Map());

  const resetOccupiedCells = () => {
    // console.log("bef: ", occupiedCells);
    setOccupiedCells(new Map()); // Clears old data
  };

  useEffect(() => {
    setOccupiedCells(new Map()); // Reset on mount
    // console.log('OccupiedCellsProvider reset');
  }, []);

  return (
    <OccupiedCellsContext.Provider value={{ occupiedCells, setOccupiedCells, resetOccupiedCells }}>
      {children}
    </OccupiedCellsContext.Provider>
  );
};

export const useOccupiedCells = () => {
  const context = useContext(OccupiedCellsContext);
  if (!context) {
    throw new Error("useOccupiedCells must be used within an OccupiedCellsProvider");
  }
  return context;
};
