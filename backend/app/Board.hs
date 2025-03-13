module Board
    ( makeBoard
    , updateBoard
    , printBoard 
    , chooseNextWord
    , isFull
    , getWord
    , Board ) 
where

-- import qualified Trie as T
import qualified Data.Map as M
import qualified Data.Set as S
import qualified Data.List as L
import Data.Maybe (fromMaybe)

type Pos = (Int, Int)
type Board = M.Map Pos Char
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
