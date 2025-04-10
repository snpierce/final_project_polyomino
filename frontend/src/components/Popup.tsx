import React, { ReactElement } from "react";
import ReactDOM from 'react-dom';
import './Popup.css';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: ReactElement;
  }
  
  export default function Modal(props: ModalProps): ReturnType<React.FC> {
    return ReactDOM.createPortal(props.open && 
        <div className="modal-overlay">
        <div className="modal-main">
          <div className="modal-body">{props.children}</div>
          <div className="btn-container">
            <button type="button" className="btn" onClick={props.onClose}>
              Close
            </button>
          </div>
        </div>
        </div>, document.body
    );
  }
  