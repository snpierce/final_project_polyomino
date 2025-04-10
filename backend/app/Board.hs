module Board
    ( makeBoard
    , updateBoard
    , printBoard 
    , chooseNextWord
    , isFull
    , getWord
    , boardToJSON
    , mockPlayBoard
    , mockSolutionBoard
    , mockPlayBoard2
    , mockSolutionBoard2
    , Board ) 
where

-- import qualified Trie as T
import qualified Data.Map as M
import qualified Data.Set as S
import qualified Data.List as L
import Data.Maybe (fromMaybe)
import Data.Aeson
import Data.Aeson.Key (fromString)

type Pos = (Int, Int)
type Board = M.Map Pos Char

mockSolutionBoard :: Board
mockSolutionBoard = M.fromList
  [ ((0,0), 'S'), ((0,1), 'L'), ((0,2), 'A'), ((0,3), 'B')
  , ((1,0), 'T'), ((1,1), 'I'), ((1,2), 'L'), ((1,3), 'E')
  , ((2,0), 'O'), ((2,1), 'V'), ((2,2), 'A'), ((2,3), 'L')
  , ((3,0), 'W'), ((3,1), 'E'), ((3,2), 'S'), ((3,3), 'T')
  ]

mockSolutionBoard2 :: Board
mockSolutionBoard2 = M.fromList
  [ ((0,0), 'T'), ((0,1), 'U'), ((0,2), 'R'), ((0,3), 'N')
  , ((1,0), 'S'), ((1,1), 'L'), ((1,2), 'U'), ((1,3), 'E')
  , ((2,0), 'A'), ((2,1), 'N'), ((2,2), 'I'), ((2,3), 'S')
  , ((3,0), 'R'), ((3,1), 'A'), ((3,2), 'N'), ((3,3), 'T')
  ]

mockPlayBoard2 :: Board
mockPlayBoard2 = M.fromList
  [ ((0,0), 'A'), ((0,1), 'N'), ((0,2), 'T'), ((0,3), 'N')
  , ((1,0), 'U'), ((1,1), 'R'), ((1,2), 'T'), ((1,3), 'S')
  , ((2,0), 'L'), ((2,1), 'U'), ((2,2), 'E'), ((2,3), 'A')
  , ((3,0), 'N'), ((3,1), 'I'), ((3,2), 'S'), ((3,3), 'R')
  ]

mockPlayBoard :: Board
mockPlayBoard = M.fromList
  [ ((0,0), 'V'), ((0,1), 'I'), ((0,2), 'A'), ((0,3), 'L')
  , ((1,0), 'E'), ((1,1), 'S'), ((1,2), 'S'), ((1,3), 'T')
  , ((2,0), 'L'), ((2,1), 'E'), ((2,2), 'T'), ((2,3), 'O')
  , ((3,0), 'L'), ((3,1), 'A'), ((3,2), 'B'), ((3,3), 'W')
  ]

-- Convert Pos (Int, Int) to a string "x,y"
posToString :: Pos -> String
posToString (x, y) = show x ++ "," ++ show y

boardToJSON :: Board -> Value
boardToJSON board = object $ map (\(pos, char) -> (fromString $ posToString pos, toJSON [char])) (M.toList board)

type Change = S.Set Pos
type WordSet = M.Map String [Pos]

wordSet :: WordSet
wordSet = M.fromList
    [ ("1a", [(0,0),(0,1),(0,2),(0,3)])
    , ("2a", [(1,0),(1,1),(1,2),(1,3)])
    , ("3a", [(2,0),(2,1),(2,2),(2,3)])
    , ("4a", [(3,0),(3,1),(3,2),(3,3)])
    , ("1d", [(0,0),(1,0),(2,0),(3,0)])
    , ("2d", [(0,1),(1,1),(2,1),(3,1)])
    , ("3d", [(0,2),(1,2),(2,2),(3,2)])
    , ("4d", [(0,3),(1,3),(2,3),(3,3)])
    ]

-- Returns String of word in Board (a.k.a. the pattern)
getWord :: String -> Board -> String
getWord word board =
    let getC p = fromMaybe '_' $ M.lookup p board
    in case M.lookup word wordSet of
        Just positions -> map getC positions  -- If found, map getC over positions
        Nothing -> ""

-- Returns map from any position to list of strings representing the words it is in
-- Could store as constant? 
buildWordInteractions :: WordSet -> M.Map Pos [String]
buildWordInteractions = 
    M.foldrWithKey (\word positions acc -> 
        foldr (\pos -> M.insertWith (++) pos [word]) acc positions
    ) M.empty

-- Returns set of all words that changed based on the changed positions
getChangedWords :: [Pos] -> M.Map Pos [String] -> S.Set String
getChangedWords pos interactions = 
    S.fromList $ concatMap (\p -> M.findWithDefault [] p interactions) pos

makeBoard :: Board
makeBoard = foldr (`M.insert` '_') M.empty
    [(0,0),(0,1),(0,2),(0,3)
    ,(1,0),(1,1),(1,2),(1,3)
    ,(2,0),(2,1),(2,2),(2,3)
    ,(3,0),(3,1),(3,2),(3,3)]

-- Pos -> Word -> Board -> New Board with New Word, Changed words
updateBoard :: String -> String -> Board -> (Board, S.Set String)
updateBoard p word board =
    let pos = fromMaybe [] $ M.lookup p wordSet 
        zipped = zip pos word 
        changed = getChangedWords pos (buildWordInteractions wordSet)
    in 
    (foldr (\(ps, char) acc -> M.insert ps char acc) board zipped, changed)

printBoard :: Maybe Board -> IO ()
printBoard Nothing = pure ()
printBoard (Just b) = putStr $ concatMap formatRow [0..3]
    where
        formatRow row = concatMap (\col -> getC (row, col) : " | ") [0..3] ++ "\n"
        getC pos = fromMaybe '_' (M.lookup pos b)

-- Checks if board is full (i.e. no '_')
isFull :: Board -> Bool
isFull board = 
    let posIsEmpty p = M.lookup p board == Just '_'
        wordAssigns = M.toList $ M.map (length . filter posIsEmpty) wordSet in
    all (\pair -> 0 == snd pair) wordAssigns

-- Choose an unassigned word based on fewest '_' characters
chooseNextWord :: Board -> String
chooseNextWord board = 
    let posIsEmpty p = M.lookup p board == Just '_'
        unassigned = M.toList $ M.filter (> 0) $ M.map (length . filter posIsEmpty) wordSet
    in fst $ head $ L.sortOn snd unassigned

-- Choose an unassigned word based on smallest Trie
