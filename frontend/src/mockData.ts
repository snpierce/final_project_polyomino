import { Board, Pieces } from './types';

export const mockSolutionBoard: Board = {
  '0,0': 'S','0,1': 'L','0,2': 'A','0,3': 'B',
  '1,0': 'T','1,1': 'I','1,2': 'L','1,3': 'E',
  '2,0': 'O','2,1': 'V','2,2': 'A','2,3': 'L',
  '3,0': 'W','3,1': 'E','3,2': 'S','3,3': 'T',
};

export const mockPlayBoard: Board = {
    '0,0': 'V','0,1': 'I','0,2': 'A','0,3': 'L',
    '1,0': 'E','1,1': 'S','1,2': 'S','1,3': 'T',
    '2,0': 'L','2,1': 'E','2,2': 'T','2,3': 'O',
    '3,0': 'L','3,1': 'A','3,2': 'B','3,3': 'W',
  };

export const mockPieces: Pieces = [
  [{ type: 'Dot' }, [0, 1]],
  [{ type: 'Pair', direction: 'Horizontal' }, [2, 0]],
  [{ type: 'Pair', direction: 'Vertical' }, [1, 2]],
  [{ type: 'Pair', direction: 'Vertical' }, [2, 3]],
  [{ type: 'Hook', orientation: 'EastSouth' }, [0, 2]],
  [{ type: 'Hook', orientation: 'SouthEast' }, [0, 0]],
  [{ type: 'Stack', direction: 'Horizontal' }, [3, 0]],
];
