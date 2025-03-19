import React, { useEffect, useState } from 'react';
import { Pieces } from './types';
import Game from './components/Game';
import { OccupiedCellsProvider } from './OccupiedCellsContext';

const App: React.FC = () => {
  const [playBoard, setPlayBoard] = useState<Map<string, string> | null>(null);
  const [solutionBoard, setSolutionBoard] = useState<Map<string, string> | null>(null);
  const [pieces, setPieces] = useState<Pieces | null>(null);

  useEffect(() => {
    console.log("Pieces updated: ", pieces);
  }, [pieces]);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch('/api/home');
        if (!response.ok) {
          throw new Error('Failed to fetch game data');
        }
        const data = await response.json();

        // Convert the playBoard and solutionBoard into Maps
        const playBoardMap = new Map<string, string>(Object.entries(data.playBoard));
        const solutionBoardMap = new Map<string, string>(Object.entries(data.solutionBoard));

        setPlayBoard(playBoardMap);
        setSolutionBoard(solutionBoardMap);
        setPieces(data.pieces);
        console.log(data.playBoard, data.solutionBoard, data.pieces);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };

    fetchGameData();
  }, []);

  if (!playBoard || !solutionBoard || !pieces) {
    return <div>Loading...</div>;
  }


  return (
    <OccupiedCellsProvider>
    <div> 
        <Game playBoard={playBoard} solutionBoard={solutionBoard} playPieces={pieces} />
    </div>
    </OccupiedCellsProvider>
  );
};

export default App;
