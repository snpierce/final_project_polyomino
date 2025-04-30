import React, { useEffect, useState } from "react";
import './static/WordDefinitionModal.css'
// import ReactDOM from 'react-dom';

export const WordDefinitionModal: React.FC<{ word: string }> = ({ word }) => {
    const [definition, setDefinition] = useState<[] | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [definitions, setDefinitions] = useState<Map<string, []>>(new Map());

    function toggleModal() {
        setShowModal(!showModal);
      }
    
    const onClose = () => {
        toggleModal();
        }
  
    useEffect(() => {
      const fetchDefinition = async () => {

        if (!definitions.has(word) && word !== "") {
            const url = `https://wordsapiv1.p.rapidapi.com/words/${word}/definitions`;
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': '60bd62752fmsh38a4aa09d621f34p1c3c90jsn23c1abeb6990',
                    'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
                }
            };
            try {
                const response = await fetch(url, options);
                const result = await response.json();
                const definitions = result.definitions;

                if (definitions) {
                    const locDef = definitions;
                    setDefinition(locDef);
                    setDefinitions(prev => new Map(prev).set(word, locDef));
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            const locDef = definitions.get(word) || [];
            setDefinition(locDef);
            return locDef;
        }
      };
      fetchDefinition();
      if (word === "") {
        setShowModal(false);
      } else {
        setShowModal(true);
      }
    }, [word]);
  
    return (
      <div className="def-modal">
        Click word for definition!
        {showModal &&
            <div className="def-modal-main">
                <div className="def-modal-body">
                    <h2>{word}</h2>
                    {definition && definition.length > 0 ? (
                        <div className="definitions-scroll">
                        {definition.map((def, idx) => (
                            <div className="definition-entry" key={idx}>
                            <p className="definition-text">📖 {def["definition"]}</p>
                            {def["partOfSpeech"] && (
                              <p className="definition-pos">🗂 <em>{def["partOfSpeech"]}</em></p>
                            )}
                          </div>
                        ))}
                        </div>
                    ) : (
                        <p>Locating definition...</p>
                )}
            </div>
                <div className="def-btn-container">
                    <button onClick={onClose}>X</button>
                </div>
            </div>  
      }</div>);
  };