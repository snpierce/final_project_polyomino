// frontend/src/types.ts

export interface GameProps {
  playBoard: Map<string, string>;
  playPieces: Pieces;
  solutionBoard: Map<string, string>;
  onModalChange: () => void;
  newGame: (key: number) => void;
}

// Position on the board: (x, y)
export type Pos = [number, number];

// Board is a map of positions to characters
export type Board = Map<string, string>; // Using string keys like "x,y" for simplicity

export type Direction = 'Vertical' | 'Horizontal';
export type Orientation = 'Standard' | 'EastSouth' | 'SouthEast' | 'EastNorth' | 'SouthWest';

// The different possible piece types
export type Piece =
  | { type: "Dot" }
  | { type: "Pair"; direction: Direction }
  | { type: "Stack"; direction: Direction }
  | { type: "Hook"; orientation: Orientation };

// A list of pieces with their positions
export type Pieces = Array<[Piece, Pos]>;