module Trie 
    ( loadCSV
    , Trie
    , empty
    , getWords
    , find
    , make
    , insert ) 
where

import qualified Data.Map.Strict as M
import Data.Char (toLower)

-- Help functions to load csv file into String list
loadCSV :: FilePath -> IO [String]
loadCSV filePath = do
    content <- readFile filePath
    pure $ map (map toLower) $ lines content

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
data Trie = Node String (M.Map Char Trie) | Empty (M.Map Char Trie)
  deriving (Eq, Show)

empty :: Trie
empty = Empty M.empty

getChildren :: Trie -> M.Map Char Trie
getChildren (Node _ c) = c
getChildren (Empty c) = c

setChildren :: Trie -> M.Map Char Trie -> Trie
setChildren (Node s _) newChildren = Node s newChildren
setChildren (Empty _) newChildren = Empty newChildren

-- Every Trie should be Empty ('#':actual trie)
make :: [String] -> Trie
make ss = let t = foldl (flip insert) empty ss in 
    Empty (M.insert '#' t M.empty)

insert :: String -> Trie -> Trie
insert word trie = recurse word trie
  where
    recurse :: String -> Trie -> Trie
    recurse "" t = Node word (getChildren t)
    recurse (c:rest) node = 
        let children = getChildren node in
        -- Check if the character already exists in children
        case M.lookup c children of
            Nothing -> setChildren node $ M.insert c (recurse rest empty) children -- doesn't exist, add new Trie
            Just childTrie -> setChildren node (M.insert c (recurse rest childTrie) children) -- already exists, move to next 

-- Using Monoid so this can be used in different contexts (like Maybe)
getValue :: (Applicative m, Monoid (m String)) => Trie -> m String
getValue (Empty _) = mempty
getValue (Node nodeValue _) = pure nodeValue

getWords :: Trie -> [ String ]
getWords t = getValue t <> 
               foldMap getWords (getChildren t)

-- Helper function that recurses and prunes invalid Tries according to string pattern
prune :: String -> Trie -> Trie
prune "" node = node
prune ('_':rest) node = setChildren node (M.map (prune rest) (getChildren node))
prune (c:rest) node =
    case M.lookup c (getChildren node) of
        Nothing -> Empty M.empty
        Just m  -> setChildren node (M.singleton c (prune rest m))

-- Returns Trie representing all words (paths) that satisfy string pattern
find :: String -> Trie -> Maybe Trie
find word t = prune word <$> M.lookup '#' (getChildren t)
            