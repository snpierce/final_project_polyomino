import React, { useState } from "react";
import Timer from './Timer';
import './static/Header.css';
import move from '../assets/ move-tile.gif';
import { useGameState } from "../GameStateContext";
import Modal from './Popup';

const Header: React.FC = () => {
  const { showTimer, timerKey, timerPaused } = useGameState();
  const [showModal, setShowModal] = useState(false);

  function toggleModal() {
    // console.log("toggling");
    setShowModal(!showModal);
  }

  return (
    <>
    <header className="header-container">
      <a href="/polyomino/index.html">
        Polyomino
      </a>
      {/* Left side (Timer) */}
      <div className="timer-container">
          {showTimer && <Timer key={timerKey} paused={timerPaused} />}
        </div>
      <button className="help-btn" onClick={toggleModal}>
        Help
      </button>
    </header>
      {showModal && 
        <Modal open={showModal} onClose={toggleModal}>
          <div>
            <div className="how-to-title">
              How To Play
            </div>
            <img src={move} alt="Image" style={{ marginBottom: "20px", position: "relative", height: "15rem", width: "27rem"}}/>
            <ul className="tips">
              <li>Rearrange tiles so every row and column forms a word.</li>
              <li>Drag each tile using a cursor or touch.</li>
              <li>Use the whitespace to place tiles while solving.</li>
              <li>Click the "Check" button to submit your solution.</li>
            </ul>
          </div>  
        </Modal>
      }
    </>
  );
};

export default Header;