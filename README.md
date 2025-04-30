# vscode-haskell-config

Commands for dev:

stack ghci
- Opens ghci interface
- :load Trie will open module Trie and you can run functions in the ghci terminal

stack ghc app/Trie.hs
- Will compile an executable from Trie.hs
- app/Trie will run the executable

Commands to run locally:

stack build
stack exec backend-exe
- These build and run the Yesod backend locally.

npm run dev
- Run in separate terminal
- Hosts the frontend on localhost/polyomino

Deployment:

npm run build
npm run deploy
- Builds frontend and pushes to Github Pages branch

Switching between static boards and backend generated:

Currently, I've been manually updating the code to use newGame() or newGameBackend().
In Home.ts, switch out the two references to newGame() with newGameBackend() (or vice versa).

In order to update the boards which the static version uses, edit the Boards.ts in data/ - this
has many boards, some which are pre-optimization and many that are commented out to prevent the
load of the npm build.
