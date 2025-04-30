import { Board, Pieces } from './types';
import { Boards } from './data/Boards.ts';

type MockData = {
  mockPlayBoard: Board;
  mockSolutionBoard: Board;
  mockPieces: Pieces;
};

export const MockData = ( key: number ) => {
  const idx = key % 50;

  return { mockPlayBoard: Boards[idx][1], 
    mockSolutionBoard: Boards[idx][0], 
    mockPieces: Boards[idx][2] 
  }
}
