import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface OccupiedCellsContextType {
  occupiedCells: Map<String, String>;
  setOccupiedCells: React.Dispatch<React.SetStateAction<Map<String, String>>>;
}

const OccupiedCellsContext = createContext<OccupiedCellsContextType | undefined>(undefined);

export const OccupiedCellsProvider = ({ children }: { children: ReactNode }) => {
  const [occupiedCells, setOccupiedCells] = useState<Map<String, String>>(new Map());

  useEffect(() => {
    setOccupiedCells(new Map()); // Reset on mount
    console.log('OccupiedCellsProvider reset');
  }, []);

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
