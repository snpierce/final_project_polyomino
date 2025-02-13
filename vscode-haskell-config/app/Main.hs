module Main where

import qualified Trie as T
import qualified Board as B

import qualified Data.Map as M
import qualified Data.Set as S
import Data.Maybe (fromMaybe)
import System.Random.Shuffle (shuffleM)

type Tries = M.Map String T.Trie

main :: IO ()
main = do
    wordsList <- T.loadCSV "wordlist.txt"
    let fullTrie = T.make wordsList
        -- Map from word to Trie (starts as full Trie - all words possible)
        tries = foldr (`M.insert` fullTrie) M.empty ["1a","2a","3a","4a","1d","2d","3d","4d"]
    res <- run B.makeBoard tries
    case res of
        Nothing -> pure ()
        Just (board, _) -> B.printBoard $ Just board


-- Returns true only if any words contain empty Trie
isTriesEmpty :: Tries -> Bool
isTriesEmpty = not . M.null . M.filter T.isEmpty

-- Update the Trie for each word in String set
-- The updated word's Trie is not updated **otherwise will trigger isTriesEmpty
updateTries :: Tries -> S.Set String -> B.Board  -> Tries
updateTries tries changedWords board = foldr (\k acc ->
    let f w =
            let search = T.find (B.getWord k board) (M.findWithDefault T.empty k tries)
            in fromMaybe T.empty search
    in M.adjust f k acc) tries changedWords

run :: B.Board -> Tries -> IO (Maybe (B.Board, Tries))
run board tries
  | B.isFull board = pure $ if isTriesEmpty tries then
        Nothing else Just (board, tries) -- If there is an empty Trie (invalid word) then backtrack
  | otherwise
  = do
        let next = B.chooseNextWord board-- which loc to update
        try <- tryWords next board tries
        case try of
            Nothing -> pure Nothing
            Just (newBoard, newTries) -> do
                run newBoard newTries

tryWords :: String -> B.Board -> Tries -> IO (Maybe (B.Board, Tries))
tryWords next board tries
  | isTriesEmpty tries = pure Nothing -- backtrack (?)
  | otherwise = do
    let
      tryOptions _ _ [] _ = pure Nothing  -- No words left, backtrack
      tryOptions b n (word:words) ts = do
        let (newBoard, changedWords) = B.updateBoard n word b
            newTries = updateTries ts changedWords newBoard

        if isTriesEmpty newTries  -- If empty, keep trying the rest of the words
            then tryOptions b n words ts
            else do
                nextRes <- run newBoard newTries  -- Return the first valid board found
                case nextRes of
                    Nothing -> tryOptions b n words ts
                    Just (nextBoard, nextTries) -> pure nextRes
    opts <- shuffleM $ T.getWords (fromMaybe T.empty (M.lookup next tries)) -- list of available words at loc
    tryOptions board next opts tries
