import React, { useState, useEffect } from 'react';
import './AliasLLM.css';
import { getOpenAIDescription } from './api';
import words from './words.json';

function AliasGame() {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [descriptions, setDescriptions] = useState([]);
    const [currentDescriptionIndex, setCurrentDescriptionIndex] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [history, setHistory] = useState([]);

    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        fetchDescriptions(currentWordIndex);
    }, [currentWordIndex]);

    const fetchDescriptions = async (wordIndex) => {
        const word = words[wordIndex];
        const newDescriptions = await getOpenAIDescription(word);
        setDescriptions(newDescriptions);
        setCurrentDescriptionIndex(0);
    };

    const fetchNewDescriptionOnMistake = async () => {
        const word = words[currentWordIndex];

        const previousInteractions = history.map(entry =>
            `Description: ${entry.description}, Answer: ${entry.answer}`
        ).join("; ");

        const newDescription = await getOpenAIDescription(word, true, previousInteractions);
        setDescriptions([...descriptions, newDescription]);
    };

    const checkAnswer = (event) => {
        event.preventDefault();
        const currentWord = words[currentWordIndex].toLowerCase();
        const input = userInput.trim().toLowerCase();

        const newEntry = {
            answer: userInput,
            correct: input === currentWord,
            wordIndex: currentWordIndex,
            description: descriptions[currentDescriptionIndex]
        };

        setHistory([newEntry, ...history]);

        if (input === currentWord) {
            setFeedbackMessage('Correct');
            setDescriptions([]);
        } else {
            setFeedbackMessage('Incorrect');
            setCurrentDescriptionIndex(currentDescriptionIndex + 1);
        }

        setShowFeedback(true);
        setTimeout(() => {
            if (input === currentWord) {
                moveToNextWord();
            } else {
                fetchNewDescriptionOnMistake();
            }

            setShowFeedback(false);
            setUserInput("");
        }, 1000);
    };

    const moveToNextWord = () => {
        const nextIndex = (currentWordIndex + 1) % words.length;
        setCurrentWordIndex(nextIndex);
        setDescriptions([]);
        setUserInput("");
    };

    return (
        <div className="alias-game">
            <h1>Alias</h1>
            <div className="current-description">
                {showFeedback && (
                    <p className={feedbackMessage.toLowerCase()}>{feedbackMessage}</p>
                )}
                {descriptions.length > 0 && currentDescriptionIndex >= descriptions.length - 1 && (
                    <p>{descriptions[currentDescriptionIndex]}</p>
                )}
            </div>
            <form onSubmit={checkAnswer} className="input-form">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your guess"
                />
                <button type="submit">Submit</button>
                <button type="button" onClick={moveToNextWord}>Skip</button>
            </form>
            <div className="history">
                {history.map((entry, index) => (
                    <div key={index} className="history-entry">
                        <p>{entry.description}</p>
                        <p className={entry.correct ? 'correct' : 'incorrect' }>
                            {entry.correct ? "Correct: " : "Incorrect: "} {entry.answer}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AliasGame;