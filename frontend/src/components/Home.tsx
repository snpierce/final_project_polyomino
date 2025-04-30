import React, { useEffect, useState, useRef } from 'react';
import Modal from './Popup';
import Game from './Game';
import { Pieces } from '../types';
import { MockData } from '../mockData';
import { OccupiedCellsProvider } from '../OccupiedCellsContext';
import './static/Game.css';
import { useGameState } from '../GameStateContext';
import logo from '../assets/polyomino.png';

const Home: React.FC = () => {
  const [playBoard, setPlayBoard] = useState(new Map());
  const [solutionBoard, setSolutionBoard] = useState(new Map());
  const [pieces, setPieces] = useState<Pieces>([]);
  const [showModal, setShowModal] = useState(false);
  const { gameKey, setShowTimer, setGameStarted, time } = useGameState();

  const hasRun = useRef(false);

  function toggleModal() {
    setShowModal(!showModal);
  }

  const handleModalData = () => {
    const totalDelay = (pieces.length * 0.2 + 0.5 + 0.8)* 1000; // Adjust delay based on number of pieces
    
    setTimeout(() => {
      toggleModal();
    }, totalDelay); // 800ms is the duration of the final snap
  }

  useEffect(() => {
    if (!hasRun.current) {
      newGameBackend(gameKey);
      setShowTimer(true);
      setGameStarted(true);
      hasRun.current = true;
    }
  }), [];

  useEffect(() => {
    console.log("Pieces updated: ", pieces);
  }, [pieces]);

  const newGameBackend = (_key: number) => {
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


  // const newGame = (key: number) => {

  //   const mockData = MockData(key);

  //   setPlayBoard(mockData.mockPlayBoard);
  //   setSolutionBoard(mockData.mockSolutionBoard);
  //   setPieces(mockData.mockPieces);
  // };

  if (!playBoard || !solutionBoard || !pieces) {
    return <div>Loading...</div>;
  }

  return (
    <OccupiedCellsProvider>
      <div className="game-container">
          <Game playBoard={playBoard} solutionBoard={solutionBoard} playPieces={pieces} onModalChange={handleModalData} newGame={newGameBackend} />
          {/* <div className="definition-container" style={{ minWidth: '150px' }}> */}
            {/* You can conditionally render definition or keep it empty */}
            {/* {gameFinished && !showModal && <WordDefinitionModal word={selectedWord} />}
          </div> */}
      </div>
    {showModal && <Modal open={showModal} onClose={toggleModal}>
      <div>
        <img src={logo} alt="Image" style={{ marginBottom: "20px", borderRadius: "10px", border: "2px solid black", position: "relative", height: "110px", width: "110px"}}/>
        <br/>Congratulations!
        <div className="message">
        You finished in {time}.
        </div>
      </div>
    </Modal>}
    </OccupiedCellsProvider>
  );
};

export default Home;
