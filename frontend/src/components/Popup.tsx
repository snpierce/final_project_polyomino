import React, { ReactElement, useState } from "react";
import './static/Popup.css';

interface ModalProps {
    onClose: () => void;
    open: boolean;
    children: ReactElement;
  }
  

  export default function Modal(props: ModalProps): ReturnType<React.FC> {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
      setIsVisible(false);
      // console.log("closing");
      setTimeout(props.onClose, 500); // Match with CSS animation duration
    };

    return (
        <div className={`modal-main ${isVisible ? 'slide-in': 'slide-out'}`}>
          <div className="btn-container">
            <button className="btn" onClick={handleClose}>
              Back to puzzle X
            </button>
          </div>
          <div className="modal-body">           
            {props.children}
          </div>
        </div>
    );
  }
  