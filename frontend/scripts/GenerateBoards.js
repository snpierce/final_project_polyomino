"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
var __dirname = path.resolve();
var inputPath = path.resolve(__dirname, '../data.json');
var outputPath = path.resolve(__dirname, '../src/data/Boards.ts');
var raw = fs.readFileSync(inputPath, 'utf-8');
var lines = raw.split('\n').filter(function (line) { return line.trim(); });
var parsed = lines.map(function (line) { return JSON.parse(line); });
var boardsTsArray = parsed.map(function (_a) {
    var pieces = _a.pieces, playBoard = _a.playBoard, solutionBoard = _a.solutionBoard;
    var playBoardMap = "new Map([".concat(Object.entries(playBoard)
        .map(function (_a) {
        var k = _a[0], v = _a[1];
        return "['".concat(k, "', '").concat(v, "']");
    })
        .join(', '), "])");
    var solutionBoardMap = "new Map([".concat(Object.entries(solutionBoard)
        .map(function (_a) {
        var k = _a[0], v = _a[1];
        return "['".concat(k, "', '").concat(v, "']");
    })
        .join(', '), "])");
    var piecesArray = "[".concat(pieces
        .map(function (_a) {
        var piece = _a.piece, position = _a.position;
        return "[".concat(JSON.stringify(piece), ", [").concat(position[0], ", ").concat(position[1], "]]");
    })
        .join(', '), "]");
    return "[".concat(solutionBoardMap, ", ").concat(playBoardMap, ", ").concat(piecesArray, "]");
});
var fileContent = "\nimport { Board, Pieces } from '../src/types.ts';\n\nexport const Boards: [Board, Board, Pieces][] = [\n  ".concat(boardsTsArray.join(',\n  '), "\n];\n");
fs.writeFileSync(outputPath, fileContent);
console.log('boards.ts generated!');
