module Trie 
    ( loadCSV
    , Trie
    , empty
    , getWords
    , find
    , make
    , insert
    , isEmpty ) 
where

import qualified Data.Map.Strict as M
import Data.Char (toLower)
import Data.List.Split (splitOn)

-- Help functions to load csv file into String list
loadCSV :: FilePath -> IO [(String, Int)]
loadCSV filePath = do
    content <- readFile filePath
    let parseLine line = case splitOn "," line of
                            [str, numStr] -> (str, read numStr :: Int)
                            _             -> error $ "Invalid line: " ++ line
    pure $ map parseLine $ lines content

-- Deprecated: used to reform words.csv into correct format (lowercase, no "")
processCSV :: String -> String
processCSV content = unlines (map (map toLower . filter (/= '"')) (lines content))

transformCSV :: FilePath -> FilePath -> IO ()
transformCSV inputFile outputFile = do
    content <- readFile inputFile
    let transformedContent = processCSV content
    writeFile outputFile transformedContent

-- TRIE Data Structure functions

-- Note: Redundant because all words are 4-letters
-- Node "word" ChildTries | Empty (Map of following char:Trie)
data Trie = Node (String, Int) (M.Map Char Trie) | Empty (M.Map Char Trie)
  deriving (Eq, Show)

empty :: Trie
empty = Empty M.empty

isEmpty :: Trie -> Bool
isEmpty (Node _ _) = False   
isEmpty (Empty m) = case M.toList m of
    [('#', t)] -> isEmpty t  -- Check that actual trie is empty
    []         -> True       
    _          -> False 

getChildren :: Trie -> M.Map Char Trie
getChildren (Node _ c) = c
getChildren (Empty c) = c

setChildren :: Trie -> M.Map Char Trie -> Trie
setChildren (Node s _) newChildren = Node s newChildren
setChildren (Empty _) newChildren = Empty newChildren

-- Every Trie should be Empty ('#':actual trie)
make :: [(String, Int)] -> Trie
make ss = let t = foldl (flip insert) empty ss in 
    Empty (M.insert '#' t M.empty)

insert :: (String, Int) -> Trie -> Trie
insert (word, idx) = recurse (word, idx)
  where
    recurse :: (String, Int) -> Trie -> Trie
    recurse ("", idx) t = Node (word, idx) (getChildren t)
    recurse (c:rest, idx) node = 
        let children = getChildren node in
        -- Check if the character already exists in children
        case M.lookup c children of
            Nothing -> setChildren node $ M.insert c (recurse (rest, idx) empty) children -- doesn't exist, add new Trie
            Just childTrie -> setChildren node (M.insert c (recurse (rest, idx) childTrie) children) -- already exists, move to next 

-- Using Monoid so this can be used in different contexts (like Maybe)
getValue :: (Applicative m, Monoid (m (String, Int))) => Trie -> m (String, Int)
getValue (Empty _) = mempty
getValue (Node nodeValue _) = pure nodeValue

getWords :: Trie ->  [(String, Int)]
getWords t = getValue t <> 
               foldMap getWords (getChildren t)

-- Helper function that recurses and prunes invalid Tries according to string pattern
prune :: String -> Trie -> Trie
prune "" node = node
prune ('_':rest) node = setChildren node (M.map (prune rest) (getChildren node))
prune (c:rest) node =
    case M.lookup c (getChildren node) of
        Nothing -> Empty M.empty
        Just m  -> let r = prune rest m 
            in if isEmpty r then Empty M.empty
                    else setChildren node (M.singleton c r)

-- Returns Trie representing all words (paths) that satisfy string pattern
find :: String -> Trie -> Maybe Trie
find word t = 
    let res = prune word <$> M.lookup '#' (getChildren t)
    in case res of
        Just nt -> if isEmpty nt then Nothing else Just $ Empty (M.insert '#' nt M.empty) 
        Nothing -> Nothing
            