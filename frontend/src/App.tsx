import React from 'react';
import Game from './components/Game';
import { OccupiedCellsProvider } from './OccupiedCellsContext';

const App: React.FC = () => {
  return (
    <OccupiedCellsProvider>
    <div> 
        <Game  />
    </div>
    </OccupiedCellsProvider>
  );
};

export default App;
