import React, { useState } from 'react';
import Home from './components/Home';
import logo from './assets/polyomino.png';
import Header from './components/Header';
import './App.css';
import { GameStateProvider } from './GameStateContext';

const App: React.FC = () => {
  const [started, setStarted] = useState(false);

  function changeBackground () {
    document.body.style.backgroundColor = 'white';
  }
  

  return (
    <div className="home-container">
      {started ? (
        <div className="game-state" >
            <GameStateProvider>
              <Header />
              <Home />
            </GameStateProvider>
          </div>
      ) : (
        <div className="open-screen" >
          <img src={logo} alt="Image" style={{ borderRadius: "10px", border: "2px solid black", position: "relative", height: "125px", width: "125px"}}/>
          <h1 className='name' >Polyomino</h1>
          <h3>Rearrange tiles so every row and column forms a word.</h3>
          <br />
          <button className="play" onClick={() => { setStarted(true); changeBackground(); }}>Play</button>
        </div>
      )}
    </div>
  );
};

export default App;
