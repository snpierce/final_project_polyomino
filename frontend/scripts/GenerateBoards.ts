import * as fs from 'fs';
import * as path from 'path';

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

const __dirname = path.resolve();

interface RawPiece {
  piece: Record<string, any>;
  position: [number, number];
}

interface RawData {
  pieces: RawPiece[];
  playBoard: Record<string, string>;
  solutionBoard: Record<string, string>;
}

const inputPath = path.resolve(__dirname, './data.json');
const outputPath = path.resolve(__dirname, './src/data/Boards.ts');

const raw = fs.readFileSync(inputPath, 'utf-8');

const lines = raw.split('\n').filter(line => line.trim());
const parsed: RawData[] = lines.map(line => JSON.parse(line));

const boardsTsArray = parsed.map(({ pieces, playBoard, solutionBoard }) => {
  const playBoardMap = `new Map([${Object.entries(playBoard)
    .map(([k, v]) => `['${k}', '${v}']`)
    .join(', ')}])`;

  const solutionBoardMap = `new Map([${Object.entries(solutionBoard)
    .map(([k, v]) => `['${k}', '${v}']`)
    .join(', ')}])`;

  const piecesArray = `[${pieces
    .map(
      ({ piece, position }) =>
        `[${JSON.stringify(piece)}, [${position[0]}, ${position[1]}]]`
    )
    .join(', ')}]`;

  return `[${solutionBoardMap}, ${playBoardMap}, ${piecesArray}]`;
});

const fileContent = `
import { Board, Pieces } from '../src/types.ts';

export const Boards: [Board, Board, Pieces][] = [
  ${boardsTsArray.join(',\n  ')}
];
`;

fs.writeFileSync(outputPath, fileContent);
console.log('boards.ts generated!');
