import React, { createContext, useState, useContext, ReactNode } from 'react';

// interface Position {
//   x: number;
//   y: number;
// }

interface OccupiedCellsContextType {
  occupiedCells: Set<String>;
  setOccupiedCells: React.Dispatch<React.SetStateAction<Set<String>>>;
}

const OccupiedCellsContext = createContext<OccupiedCellsContextType | undefined>(undefined);

export const OccupiedCellsProvider = ({ children }: { children: ReactNode }) => {
  const [occupiedCells, setOccupiedCells] = useState<Set<String>>(new Set());

  return (
    <OccupiedCellsContext.Provider value={{ occupiedCells, setOccupiedCells }}>
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
