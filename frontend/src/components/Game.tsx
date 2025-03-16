import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Piece, Pieces, Pos } from '../types';
import { mockPieces, mockPlayBoard } from '../mockData';
import { useOccupiedCells } from '../OccupiedCellsContext';
import './Game.css';

const GRID_SIZE = 4;
const CELL_SIZE = 102;
const pieceColors = ["#B7B1F2", "#FDB7EA", "#FBF3B9", "#C1CFA1", "#FFDCCC", "#FFB4A2", "#BFECFF", "#E5E1DA"];

const DraggablePiece: React.FC <{pieceData: [Piece, Pos], index: number }> = ({ pieceData, index }) => {
  const [piece, initialPos] = pieceData;
  const [offset] = useState({ x: initialPos[0], y: initialPos[1] });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currPos, setCurrPos] = useState({ x: initialPos[0], y: initialPos[1] });
  const { occupiedCells, setOccupiedCells } = useOccupiedCells();
  const nodeRef = useRef<HTMLElement>(null);


  // Function to check if the target position is free
  const isPositionFree = (gridX: number, gridY: number) => {
    const cells = renderPieceCells(piece, [gridX, gridY]);
    const oldCells = renderPieceCells(piece, [currPos.x, currPos.y]);

    // Helper function to check if the position is currently occupied by the piece
    const isCurrentlyOccupiedByPiece = (positionKey: string) => {
      return oldCells.some(([x, y]) => `${x},${y}` === positionKey);
    };
  
    const isFree = cells.every(([row, col]) => {
      // Create a unique key for the position, like a string
      const positionKey = `${row},${col}`;
      return !occupiedCells.has(positionKey) || isCurrentlyOccupiedByPiece(positionKey);
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
    // Get and set absolute grid positions
    setOccupiedCells(prev => {
      const updated = new Set(prev);
      cells.map(([x, y]) => updated.add(`${x},${y}`));
      return updated;
    });
  }, [piece, initialPos]); // This effect will run when piece or initialPos changes

  const outlineColor = pieceColors[index % pieceColors.length];

  return (  
  <Draggable
    nodeRef={nodeRef as React.RefObject<HTMLElement>}
    position={position}
    // onDrag={(e: any, data: { x: number; y: number; }) => setPosition({ x: data.x, y: data.y })}
    onStop={(e, data) => {
      const snappedY = Math.round(data.x / CELL_SIZE) * CELL_SIZE;
      const snappedX = Math.round(data.y / CELL_SIZE) * CELL_SIZE;
      
      const gridX = snappedX / CELL_SIZE +offset.x;
      const gridY = snappedY / CELL_SIZE +offset.y;

      console.log(gridX, gridY);
      console.log(occupiedCells);
      // Only snap if the position is free
      if (isPositionFree(gridX, gridY)) {
        const oldCells = renderPieceCells(piece, [currPos.x, currPos.y]);
        const newCells = renderPieceCells(piece, [gridX, gridY]);

        // Remove previous positions
        const tempSet = new Set(occupiedCells);
        oldCells.map(([x, y]) => tempSet.delete(`${x},${y}`));
        newCells.map(([x, y]) => tempSet.add(`${x},${y}`));

        setPosition({ x: snappedY, y: snappedX });
        setCurrPos({ x: gridX, y: gridY });
        setOccupiedCells(tempSet);
      } else {
        setPosition({ x: position.x, y: position.y }); // Revert if occupied
      }
    }}
  >
    <div ref={nodeRef as React.RefObject<HTMLDivElement>} style={{ position: "absolute" }}>
      {cells.map(([x, y], index) => {
        const positionKey = `${x},${y}`;
        const cellText = mockPlayBoard[positionKey] || '';

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              width: 100,
              height: 100,
              backgroundColor: outlineColor,
              border: "2px solid black",
              top: x * CELL_SIZE,
              left: y * CELL_SIZE,
              display: "flex", // Use flexbox to center the text
              justifyContent: "center", // Center horizontally
              alignItems: "center", // Center vertically
              fontSize: "36px", // Adjust the font size as needed
              fontWeight: "bold", // Optional: Make the text bold
            }}
          >
            {cellText} {/* Render the text in the cell */}
          </div>
        );})}
    </div>
  </Draggable>
  )
}

const BoardGrid: React.FC <{initialPieces: Pieces }> = ({ initialPieces }) => {
  const [pieces] = useState<([Piece, [number, number]])[]>(initialPieces);

  const renderCell = (x: number, y: number) => {
    const key = `${x},${y}`;

    return (
      <div
        key={key}
        className={`cell`}
      />
    );
  };

  return (
    <div className="board-container">
      <div className="grid">
        {Array.from({ length: GRID_SIZE }, (_, y) =>
          Array.from({ length: GRID_SIZE }, (_, x) => renderCell(x, y))
        )}
        <div className="piece-overlays">
        {pieces.map((pieceData, index) => (
          <DraggablePiece key={index} pieceData={pieceData} index={index} />
        ))}
        </div>
      </div>
    </div>
  );
};

const Game: React.FC = () => {
  return (
    <div className="game-container">
      <h1 className="title">Polyomino Puzzle</h1>
        <BoardGrid initialPieces={mockPieces} />
    </div>
  );
};

export default Game;