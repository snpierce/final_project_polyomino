import React, { useEffect, useState } from 'react';
import Modal from './components/Popup';
import Game from './components/Game';
import { OccupiedCellsProvider } from './OccupiedCellsContext';

const App: React.FC = () => {
  const [playBoard, setPlayBoard] = useState(new Map());
  const [solutionBoard, setSolutionBoard] = useState(new Map());
  const [pieces, setPieces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState("");

  function toggleModal() {
    setShowModal(!showModal);
  }

  const handleModalData = ( newText: string) => {
    setModalData(newText);
    toggleModal();
  }

  useEffect(() => {
    console.log("Pieces updated: ", pieces);
  }, [pieces]);


  const newGame = () => {
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
  };

  if (!playBoard || !solutionBoard || !pieces) {
    return <div>Loading...</div>;
  }

  return (
    <OccupiedCellsProvider>
    <div> 
      <div className="game-container">
        {/* <h1 className="title" style={{fontSize:'36px'}} >Polyomino</h1> */}
          <Game playBoard={playBoard} solutionBoard={solutionBoard} playPieces={pieces} onModalChange={handleModalData} newGame={newGame} />
      </div>
    </div>
    <Modal open={showModal} onClose={toggleModal}>
      <div>
        {modalData}
      </div>
    </Modal>
    </OccupiedCellsProvider>
  );
};

export default App;
