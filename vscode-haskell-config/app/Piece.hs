module Piece
    ( printPieces
    , initAssign
    , assign
    , scramble
    , getCells
    , Piece(..)
    , Direction(..)
    , Orientation(..)
    , Pieces
    , Assignment
    , Pos ) 
where

import qualified Board as B
import qualified Data.Map as M
import qualified Data.Set as S
import qualified Data.List as L
import Data.Maybe (fromMaybe)
import System.Random.Shuffle (shuffleM)


type Pos = (Int, Int)
data Direction = Vertical | Horizontal deriving (Show, Eq)
data Orientation = Standard | EastSouth | SouthEast | EastNorth | SouthWest deriving (Show, Eq)
data Piece = Dot
    | Pair Direction
    | Stack Direction
    | Hook Orientation
    deriving (Show, Eq)

type Pieces = [(Piece, Pos)]
type Assignment = M.Map Pos Bool  -- True if assigned, False if empty

-- Initialize a 4x4 board with all positions unassigned
initAssign :: Assignment
initAssign = M.fromList [((i, j), False) | i <- [0..3], j <- [0..3]]

-- Generate all positions in a 4x4 board
fullBoard :: S.Set Pos
fullBoard = S.fromList [(i, j) | i <- [0..3], j <- [0..3]]

-- function that gets index positions
getCells :: Piece -> Pos -> [Pos]
getCells piece (i, j) = case piece of
    Dot ->  [(i, j)]
    Pair Vertical ->  [(i, j), (i + 1, j)]
    Pair Horizontal ->  [(i, j), (i, j + 1)]
    Stack Vertical ->  [(i, j), (i + 1, j), (i + 2, j)]
    Stack Horizontal ->  [(i, j), (i, j + 1), (i, j + 2)]
    Hook Standard ->  [(i, j), (i + 1, j), (i, j + 1)]
    Hook EastSouth ->  [(i, j), (i, j + 1), (i + 1, j + 1)]
    Hook SouthEast ->  [(i, j), (i + 1, j), (i + 1, j + 1)]
    Hook EastNorth ->  [(i, j), (i, j + 1), (i - 1, j + 1)]
    Hook SouthWest ->  [(i, j), (i + 1, j), (i + 1, j - 1)]

-- for each cell, make sure not assigned and in bounds
inBounds :: [Pos] -> Bool
inBounds  = all (\(i, j) -> (i >= 0) && (i < 4) && (j >= 0) && (j < 4))

-- Returns true if every cell is assigned a piece
-- Note: No overlap is ensure by piece placement
isComplete :: Pieces -> Bool
isComplete pieces =
    let occupiedCells = S.fromList $ concatMap (uncurry getCells) pieces
    in occupiedCells == fullBoard

-- Returns True if duplicates exist (cells overlap) 
hasOverlap :: Pieces -> Bool
hasOverlap pieces =
    let allCells = concatMap (uncurry getCells) pieces
        uniqueCells = S.fromList allCells
    in length allCells /= S.size uniqueCells

formatPiece :: Piece -> Pos -> B.Board -> String
formatPiece piece (i, j) board = 
    let formatCell p = fromMaybe '_' (M.lookup p board) in
    case piece of
        Dot -> formatCell (i, j) : "|"
        Pair Vertical -> formatCell (i, j) : '|' : '\n' : formatCell (i + 1, j) : "|"
        Pair Horizontal -> formatCell (i, j) : '|' : ' ' : formatCell (i, j + 1) : "|"
        Stack Vertical -> formatCell (i, j) : '|' : '\n' : formatCell (i + 1, j) : '|' : '\n' : formatCell (i + 2, j) : "|"
        Stack Horizontal -> formatCell (i, j) : '|' : ' ' : formatCell (i, j + 1) : '|' : ' ' : formatCell (i, j + 2) : "|"
        Hook Standard -> formatCell (i, j) : '|' : ' ' : formatCell (i, j + 1) : '|' : '\n' : formatCell (i + 1, j) : "|"
        Hook EastSouth -> formatCell (i, j) : '|' : ' ' : formatCell (i, j + 1) : '|' : "\n   " ++ formatCell (i + 1, j + 1) : "|"
        Hook SouthEast -> formatCell (i, j) : '|' : '\n' : formatCell (i + 1, j) : '|' : ' ' : formatCell (i + 1, j + 1) : "|"
        Hook EastNorth -> "   " ++ formatCell (i - 1, j + 1) : '|' : '\n' : formatCell (i, j) : '|' : ' ' : formatCell (i, j + 1) : "|"
        Hook SouthWest -> "   " ++ formatCell (i, j) : '|' : '\n' : formatCell (i + 1, j - 1) : '|' : ' ' : formatCell (i + 1, j) : "|"

printPieces :: Pieces -> B.Board -> IO ()
printPieces pieces board =
    putStr $ concatMap (\(p, pos) -> formatPiece p pos board ++ "\n_____\n") pieces


-- Returns first (lowest) position not assigned
nextUnassigned :: Assignment -> Maybe Pos
nextUnassigned board = fst <$> M.lookupMin (M.filter not board)

assignPiece :: Pieces -> Piece -> Pos -> Pieces
assignPiece pieces piece pos = (piece, pos):pieces

updateAssigned :: [Pos] -> Assignment -> Assignment
updateAssigned ps assn = foldr (`M.insert` True) assn ps


-- Takes Pieces used, Pieces available to use, Assignment Map
assign :: Pieces -> [Piece] -> Assignment -> IO (Maybe (Pieces, [Piece], Assignment))
assign ps psLeft assn
    | isComplete ps = pure $ Just (ps, psLeft, assn) -- If board has been completely assigned
    | otherwise
    = do
        case nextUnassigned assn of -- Get next unassigned cell
            Just pos -> do
                try <- tryPieces ps pos assn psLeft -- Attempt to assign it a piece
                case try of
                    Nothing -> pure Nothing
                    Just (newPieces, newPsLeft, newAssn) -> do
                        assign newPieces newPsLeft newAssn
            Nothing -> pure Nothing

tryPieces :: Pieces -> Pos -> Assignment -> [Piece] -> IO (Maybe (Pieces, [Piece], Assignment))
tryPieces psCurr pos assn psLeft = do
    let
      tryOptions _ _ [] = pure Nothing  -- No pieces left, backtrack
      tryOptions assignment next (piece:ps) = do
        let cells = getCells piece next
        if inBounds cells then do
            let newPieces = assignPiece psCurr piece next -- Try to add new assignment to pieces
            if hasOverlap newPieces then do
                result <- tryOptions assignment next ps
                case result of -- inbounds but overlaps
                    Just (np, psRest, a) -> pure $ Just (np, piece:psRest, a) -- adding unused pieces back into the selection
                    Nothing -> pure Nothing
            else do
                nextAssn <- assign newPieces (removePiece piece psLeft) (updateAssigned cells assignment) -- Return first valid assignment found
                case nextAssn of
                    Nothing -> do
                        result <- tryOptions assignment next ps
                        case result of -- Backtrack to another piece if no valid board
                            Just (np, psRest, a) -> pure $ Just (np, piece:psRest, a)
                            Nothing -> pure Nothing
                    Just (nextPieces, ps, assn) -> pure nextAssn
        else do
            result <- tryOptions assignment next ps
            case result of -- piece isn't inbounds
                Just (np, ps, a) -> pure $ Just (np, piece:ps, a)
                Nothing -> pure Nothing
    opts <- shuffleM psLeft -- list of available pieces left
    tryOptions assn pos opts

removePiece :: Piece -> [Piece] -> [Piece]
removePiece p ps =
    let (before, after) = break (== p) ps
    in before ++ drop 1 after

removePieces :: (Piece, Pos) -> Pieces -> Pieces
removePieces (piece, (x, y)) ps =
    let isPos (x, y) (i, j) = x == i && y == j
        (before, after) = break (\(p, pos) -> piece == p && isPos (x, y) pos) ps
    in before ++ drop 1 after

-- Evaluate "difficulty" by making Tries for piece and looking at size

-- Rearrange set of pieces on board
{-

[(Stack Horizontal, (0,0)), (Dot, (2,3))] => [(Dot, (0,1)), (Stack Horizontal, (2, 0))]
1) Select location
2) Select piece (cannot be same as current assignment)
3) If none fit, backtrack
4) Another empty Assignment that gets updated

-}

-- Placement algorithm (Pieces placed, Pieces to place, Assignment)
scramble :: Pieces -> Pieces -> (Assignment, M.Map Pos Pos) -> IO (Maybe (Pieces, Pieces, (Assignment, M.Map Pos Pos)))
scramble pieces [] (assn, ts) = pure $ Just (pieces, [], (assn, ts))
scramble pieces ps (assn, ts) = do
        case nextUnassigned assn of -- Get next unassigned cell
            Just pos -> do
                try <- tryTiles pos ps pieces (assn, ts) -- Attempt to assign it a piece
                case try of
                    Nothing -> pure Nothing
                    Just (newPieces, newPsLeft, (newAssn, newTs)) -> do
                        scramble newPieces newPsLeft (newAssn, newTs)
            Nothing -> pure Nothing

tryTiles :: Pos -> Pieces -> Pieces -> (Assignment, M.Map Pos Pos) -> IO (Maybe (Pieces, Pieces, (Assignment, M.Map Pos Pos)))
tryTiles pos psLeft psCurr (assn, ts) = do
    let
      tryOptions [] = pure Nothing  -- No pieces left, backtrack
      tryOptions ((piece, p):ps) = do
        if pos /= p then do
            let cells = getCells piece pos
            if inBounds cells then do
                let newPieces = assignPiece psCurr piece pos -- Try to add new assignment to pieces
                if hasOverlap newPieces then tryOptions ps
                else do
                    nextAssn <- scramble newPieces (removePieces (piece, p) psLeft) (updateAssigned cells assn, M.insert pos p ts) -- Return first valid assignment found
                    case nextAssn of
                        Nothing -> tryOptions ps
                        Just (nextPieces, ps, (assn, ts)) -> pure nextAssn
            else tryOptions ps
        else tryOptions ps
    opts <- shuffleM psLeft -- list of available pieces left
    tryOptions opts