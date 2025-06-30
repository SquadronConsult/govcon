import React, { useState } from 'react';
import { GameControlsProps } from '@/types/game';

export const GameControls: React.FC<GameControlsProps> = ({
    gameState,
    onStartGame,
    onRollDice,
    onNewGame
}) => {
    const [isRolling, setIsRolling] = useState(false);

    const handleRollDice = async () => {
        setIsRolling(true);
        // Start the rolling animation
        setTimeout(() => {
            onRollDice();
            // Stop rolling after animation completes
            setTimeout(() => {
                setIsRolling(false);
            }, 500);
        }, 100);
    };

    if (!gameState.isGameActive && gameState.players.length === 0) {
        // Player setup screen
        return (
            <div className="game-controls">
                <div className="player-setup">
                    <h2>Select Players</h2>
                    <div className="player-options">
                        {[2, 3, 4].map(numPlayers => (
                            <button
                                key={numPlayers}
                                className="player-btn"
                                onClick={() => onStartGame(numPlayers)}
                            >
                                {numPlayers} Players
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Compact game controls for side panel
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isHumanPlayerTurn = gameState.currentPlayerIndex === 0;

    return (
        <div className="controls-panel">
            <h3>Mission Control</h3>

            <div className="current-turn">
                <span className="turn-label">Current Turn:</span>
                <span className={`current-player-name ${currentPlayer?.color}`}>
                    {currentPlayer?.name}
                    {gameState.currentPlayerIndex === 0 && <span className="player-indicator"> (YOU)</span>}
                    {gameState.currentPlayerIndex > 0 && <span className="player-indicator"> (NPC)</span>}
                </span>
            </div>

            {gameState.isGameActive ? (
                <>
                    {isHumanPlayerTurn ? (
                        <button
                            className="dice-btn-compact"
                            onClick={handleRollDice}
                            disabled={isRolling}
                        >
                            <div className={`dice-compact ${isRolling ? 'rolling' : ''}`}>
                                <span className="dice-value-compact">
                                    {isRolling ? '🎲' : (gameState.diceValue > 0 ? gameState.diceValue : '?')}
                                </span>
                            </div>
                            <span className="dice-label-compact">
                                {isRolling ? 'Rolling...' : 'Roll Dice'}
                            </span>
                        </button>
                    ) : (
                        <div className="npc-turn-indicator">
                            <div className="npc-status">
                                <span className="npc-icon">🤖</span>
                                <span className="npc-text">NPC is thinking...</span>
                            </div>
                            <div className="npc-dice-display">
                                <span className="dice-value-compact">
                                    {gameState.diceValue > 0 ? gameState.diceValue : '?'}
                                </span>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <button className="new-game-btn" onClick={onNewGame}>
                    New Mission
                </button>
            )}
        </div>
    );
}; 