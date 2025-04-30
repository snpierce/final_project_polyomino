import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Piece, Pieces, Pos, GameProps } from '../types';
import { useOccupiedCells } from '../OccupiedCellsContext';
import { useGameState } from '../GameStateContext';
import './static/Timer.css';
import './static/Game.css';

const GRID_SIZE = 4;
const CELL_SIZE = 102;
const pieceColors = ["#B7B1F2", "#FDB7EA", "#FBF3B9", "#C1CFA1", "#FFDCCC", "#FFB4A2", "#BFECFF", "#E5E1DA"];



const DraggablePiece: React.FC <{pieceData: [Piece, Pos], index: number, playBoard: Map<string, string> }> = ({ pieceData, index, playBoard }) => {
  const [piece, initialPos] = pieceData;
  const [offset, setOffset] = useState({ x: initialPos[0], y: initialPos[1] });
  const [currPos, setCurrPos] = useState({ x: initialPos[0], y: initialPos[1] });

  useEffect(() => {
    // console.log("pos: ", initialPos[0], initialPos[1]);
    setOffset({ x: initialPos[0], y: initialPos[1] });
    setCurrPos({ x: initialPos[0], y: initialPos[1] });
  }, [pieceData]); 
  
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [ localCells, setLocalCells ] = useState<Pos[]>([]);
  const { occupiedCells, setOccupiedCells } = useOccupiedCells();
  const { gameFinished } = useGameState();
  const nodeRef = useRef<HTMLElement>(null);

  const [scale, setScale] = useState(0.7);

  useEffect(() => {
    const updateScale = () => {
      setScale(window.innerWidth < 768 ? 0.6 : 0.7);
    };

    updateScale(); // call on mount
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const boardElement = document.querySelector(".board-wrapper") as HTMLElement;

  function isInsideVisibleGrid(x: number, y: number): boolean {
    if (!boardElement) return false;
  
    const rect = boardElement.getBoundingClientRect();
    // console.log(rect.left, rect.right);
  
    const visibleMinY = -rect.left / (CELL_SIZE * scale);
    const visibleMaxY = (window.innerWidth - rect.left) / (CELL_SIZE * scale);
  
    const visibleMinX = -rect.top / (CELL_SIZE * scale);
    const visibleMaxX = (window.innerHeight - rect.top) / (CELL_SIZE * scale);
    
    return x >= visibleMinX && x < visibleMaxX && y >= visibleMinY && y < visibleMaxY;
  }


  // Function to check if the target position is free
  const isPositionFree = (gridX: number, gridY: number) => {
    if (gridX === -1 && (gridY === 1 || gridY === 2)){
      return false;
    }

    if (!isInsideVisibleGrid(gridX, gridY)) { return false;}

    const cells = renderPieceCells(piece, [gridX, gridY]);
    const oldCells = renderPieceCells(piece, [currPos.x, currPos.y]);

    // Helper function to check if the position is currently occupied by the piece
    const isCurrentlyOccupiedByPiece = (positionKey: string) => {
      return oldCells.some(([x, y]) => `${x},${y}` === positionKey);
    };

    const isFree = cells.every(([row, col]) => {
      // Check if the cell is free by looking it up in the occupiedCells Map
      const pos = `${row},${col}`;
      return !occupiedCells.has(pos) || isCurrentlyOccupiedByPiece(pos);
    });
  
    return isFree;  // Returns true if all cells are free
  };


  const renderPieceCells = (piece: Piece, [x, y]: Pos) => {
    const cells: [number, number][] = [];
    
    switch (piece.type) {
      case 'Dot':
        cells.push([x, y]);
        break;
      case 'Pair':
        cells.push([x, y], piece.direction === 'Horizontal' ? [x, y + 1] : [x + 1, y]);
        break;
      case 'Stack':
        piece.direction === 'Vertical' ? cells.push([x, y], [x + 1, y], [x + 2, y]) : cells.push([x, y], [x, y + 1], [x, y + 2]);
        break;
      case 'Hook':
        switch (piece.orientation) {
          case 'Standard':
            cells.push([x, y], [x + 1, y], [x, y + 1]);
            break;
          case 'EastSouth':
            cells.push([x, y], [x, y + 1], [x + 1, y + 1]);
            break;
          case 'SouthEast':
            cells.push([x, y], [x + 1, y], [x + 1, y + 1]);
            break;
          case 'SouthWest':
            cells.push([x, y], [x + 1, y], [x + 1, y - 1]);
            break;
          case 'EastNorth':
            cells.push([x, y], [x, y + 1], [x - 1, y + 1]);
            break;
      }
    };
    return cells;
  }

  const cells = renderPieceCells(piece, initialPos);

  if (!Array.isArray(cells)) {
    console.log("Failed");
    return;
  }

  useEffect(() => {
    // Perform side effect, e.g., fetching data or setting a timer
    setOccupiedCells(prev => {
      const updated = new Map(prev);
      localCells.map(([x, y]) => updated.set(`${x},${y}`, playBoard.get(`${x},${y}`) || ''));
      return updated;
    });
  }, [localCells, setOccupiedCells]);

  useEffect(() => {
    const updated = new Map();
    cells.map(([x, y]) => updated.set(`${x},${y}`, playBoard.get(`${x},${y}`) || ''));
    setLocalCells(cells);
  }, [piece, initialPos]);

  const outlineColor = pieceColors[index % pieceColors.length];


  return (  
  <Draggable
    nodeRef={nodeRef as React.RefObject<HTMLElement>}
    enableUserSelectHack={false}
    scale={scale}
    position={position}
    onStop={(_e, data) => {
      const snappedY = Math.round(data.x / (CELL_SIZE)) * (CELL_SIZE);
      const tempSnappedX = Math.round(data.y / (CELL_SIZE)) * (CELL_SIZE);
      
      const tempX = tempSnappedX / (CELL_SIZE) +offset.x;
      const gridY = snappedY / (CELL_SIZE) +offset.y;

      const gridX = (tempX < -1) ? -1 : tempX;
      const snappedX = (tempX < -1) ? -102 : tempSnappedX;

      // Only snap if the position is free
      // console.log(tempSnappedX, snappedY, gridX, gridY);
      if (isPositionFree(gridX, gridY)) {
        const oldCells = renderPieceCells(piece, [currPos.x, currPos.y]);
        const newCells = renderPieceCells(piece, [gridX, gridY]);
        
        const tempMap = new Map(occupiedCells);
        oldCells.forEach(([x, y]) => {
          const pos = `${x},${y}`;
          if (tempMap.has(pos)) {
            tempMap.delete(pos);  // Remove the old cell if it exists in the map
          }
        });
        newCells.forEach(([x, y], idx) => {
          const [i, j] = oldCells[idx]
          const newPos = `${x},${y}`;
          const oldPos = `${i},${j}`;
          tempMap.set(newPos, occupiedCells.get(oldPos) || '');  // Add the new cell to the map
        });

        setPosition({ x: snappedY, y: snappedX });
        setCurrPos({ x: gridX, y: gridY });
        setOccupiedCells(tempMap);
      } else {

        setPosition({ x: position.x, y: position.y }); // Revert if occupied
      }
    }}
  >
    <div className='piece-wrapper'>
    <div 
    className={gameFinished ? 'roll-glow' : ''}
    ref={nodeRef as React.RefObject<HTMLDivElement>} 
    style={{ position: "fixed", animationDelay: `${index * 0.2}s` }}>
      {cells.map(([x, y], index) => {
        const positionKey = `${x},${y}`;

        const cellText = playBoard.get(positionKey) || 'X';
        const allowEvents = gameFinished ? "none" : "auto";

        return (
          <div
            key={index}
            className="tile"
            style={{         
              top: x * (CELL_SIZE),
              left: y * (CELL_SIZE),
              pointerEvents: allowEvents,
              backgroundColor: outlineColor,
            }}
          >
            {cellText} {/* Render the text in the cell */}
          </div>
        );})}
    </div>
    </div>
  </Draggable>
  )
}

const BoardGrid: React.FC <{initialPieces: Pieces, playBoard: Map<string, string>, onWordSelect: React.Dispatch<React.SetStateAction<string>> }> = ({ initialPieces, playBoard, onWordSelect }) => {
  const [pieces, setPieces] = useState<([Piece, [number, number]])[]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [highlightMode, setHighlightMode] = useState<'row' | 'col' | null>(null);
  const { occupiedCells } = useOccupiedCells();
  const { buzzing, gameFinished } = useGameState();

  useEffect(() => {
    setPieces(JSON.parse(JSON.stringify(initialPieces)));
  }, [initialPieces]);

  const extractWord = (mode: 'row' | 'col' | null, localCell: [number, number] ) => {

    if (mode === null || localCell === null) return '';
    return Array.from({ length: GRID_SIZE }, (_, i) => {
      const key = mode === 'row'
        ? `${localCell[1]},${i}`
        : `${i},${localCell[0]}`;
      return occupiedCells.get(key)?.toLowerCase() || '';
    }).join('');
  };

  const [animationFinished, setAnimationFinished] = useState(false);

  // Trigger bounce after all animations finish
  useEffect(() => {
    if (gameFinished) {
      const totalDelay = pieces.length * 0.7; // Adjust delay based on number of pieces
      setTimeout(() => {
        setAnimationFinished(true);
      }, totalDelay + 1000); // 800ms is the duration of the final snap
    }
  }, [gameFinished, pieces.length]);

  const renderCell = (x: number, y: number) => {
    const key = `${x},${y}`;

    const isHighlighted = (() => {
      if (!selectedCell || highlightMode === null) return false;
      const [selX, selY] = selectedCell;
      if (highlightMode === 'row') return selY === y;
      if (highlightMode === 'col') return selX === x;
    })();

    const handleClick = () => {
      if (!gameFinished) return;
      const localCell: [number, number] = [x, y];
      const localMode = (highlightMode === null) ? 'row' : ((highlightMode === 'row') ? 'col' : null);
      const word = extractWord(localMode, localCell); 

      setHighlightMode(localMode);
      setSelectedCell([x, y]);
      onWordSelect(word); // set selected word
      // console.log("word: ", word);
    };

    return (
      <div
        key={key}
        className={`cell ${isHighlighted ? 'highlighted' : ''}`}
        onClick={handleClick}
      />
    );
  };

  return (
    <div className={`board-container ${buzzing ? 'buzz' : ''} ${animationFinished ? 'board-oomph' : ''}` }>
        {Array.from({ length: GRID_SIZE }, (_, y) =>
          Array.from({ length: GRID_SIZE }, (_, x) => renderCell(x, y))
        )}
        <div className="piece-overlays" >
        {pieces.map((pieceData, index) => (
          <DraggablePiece key={index} pieceData={pieceData} index={index} playBoard={playBoard} />
        ))}
        </div>
    </div>
  );
};

const Game: React.FC<GameProps> = ({ playBoard, playPieces, solutionBoard, newGame, onModalChange }) => {
  const { occupiedCells, resetOccupiedCells } = useOccupiedCells();
  const { setBuzzing, gameKey, setGameKey, gameFinished, setGameFinished, gameStarted, setSelectedWord, setGameStarted, setTimerPaused, setShowTimer, setTimerKey } = useGameState();

  const triggerBuzz = () => {
    setBuzzing(true);
    setTimeout(() => setBuzzing(false), 200); // match animation duration
  };
  
  const checkSolution = () => {
    // Transform solution board into map format
    if (solutionBoard.size === occupiedCells.size &&
      [...solutionBoard.entries()].every(([key, letter]) => occupiedCells.get(key) === letter)) {
      onModalChange();
      setTimerPaused(true);
      setGameFinished(true);
      setGameStarted(false);
    } else {
      triggerBuzz();
    }
  };


  return (
    <div className='play-scale-wrapper'>
      <div className='play-container'>

      {/* Center (Board and Buttons) */}
      <div className="board-wrapper" >
        <div className='btns-container'>
          { gameFinished && 
            <button 
              className="new-game"
              onClick={() => { 
                resetOccupiedCells(); 
                newGame(gameKey);  
                setGameFinished(false); 
                setGameKey(prevKey => prevKey + 2);
                setTimerKey(prev => prev + 1); 
                setShowTimer(true); 
                setTimerPaused(false); 
                setSelectedWord("");
                setGameStarted(true);
              }} 
              style={{ borderColor: 'black' }}
            >
              New Game
            </button> }

        {gameStarted && !gameFinished && 
          <>
          <button className="check-btn" onClick={checkSolution} style={{ height: "4rem", width: "7rem" }}>Check</button>
          <button 
            className="skip"
            onClick={() => { 
              resetOccupiedCells(); 
              newGame(gameKey);  
              setGameFinished(false); 
              setGameKey(prevKey => prevKey + 2);
              setTimerKey(prev => prev + 1); 
              setShowTimer(true); 
              setTimerPaused(false); 
              setSelectedWord("");
              setGameStarted(true);
            }} 
            style={{ borderColor: 'black' }}
          >
            Skip
          </button> </>}
        </div>

        <BoardGrid 
          key={gameKey} 
          initialPieces={playPieces} 
          playBoard={playBoard} 
          onWordSelect={setSelectedWord} 
        />

      </div>
      </div>

    </div>

  );
};

export default Game;