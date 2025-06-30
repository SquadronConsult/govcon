import React, { useState, useEffect } from 'react';
import { SVGBoard } from './SVGBoard';
import { GameControls } from './GameControls';
import { CardManager } from './CardManager';
import { useGameLogic } from '@/hooks/useGameLogic';
import { BOARD_CONFIG, MOUNTAINS, VALLEYS } from '@/constants/gameConfig';

export const BureaucraticMountainsGame: React.FC = () => {
    const [isLegendVisible, setIsLegendVisible] = useState(false);
    const [isFieldManualPopupOpen, setIsFieldManualPopupOpen] = useState(false);
    const [isActivityLogExpanded, setIsActivityLogExpanded] = useState(false);
    const [cardDrawPopup, setCardDrawPopup] = useState<{
        card: any;
        isVisible: boolean;
    }>({ card: null, isVisible: false });
    const [lastProcessedCardId, setLastProcessedCardId] = useState<number | null>(null);
    const {
        gameState,
        winner,
        canDispute,
        lastMove,
        gameLog,
        startNewGame,
        rollDice,
        newGame,
        playCard,
        makeChoice,
        spendTokens,
        disputeWin,
        currentPlayer,
        isGameActive
    } = useGameLogic();

    // Watch for card draws and show popup
    useEffect(() => {
        if (gameState.lastCardDrawn &&
            gameState.lastCardDrawn.id !== lastProcessedCardId &&
            !cardDrawPopup.isVisible) {

            console.log('Card notification check:', {
                cardId: gameState.lastCardDrawn.id,
                cardTitle: gameState.lastCardDrawn.title,
                currentPlayerIndex: gameState.currentPlayerIndex,
                lastProcessedCardId
            });

            const humanPlayer = gameState.players[0]; // The human player
            let shouldShowNotification = false;

            // Show notification if it's the human player drawing the card OR any card that affects the human player
            if (gameState.currentPlayerIndex === 0) {
                shouldShowNotification = true;
                console.log('Showing notification: Human player drew card');
            }
            // Show notification for cards that affect the human player when drawn by NPCs
            else if (gameState.lastCardDrawn.targetPlayer === 'highest' && humanPlayer) {
                const highestPlayer = gameState.players.reduce((highest, current) =>
                    current.position > highest.position ? current : highest
                );
                if (highestPlayer.id === humanPlayer.id) {
                    shouldShowNotification = true;
                    console.log('Showing notification: Card affects human player');
                }
            }

            if (shouldShowNotification) {
                console.log('Displaying card popup for:', gameState.lastCardDrawn.title);
                setCardDrawPopup({
                    card: gameState.lastCardDrawn,
                    isVisible: true
                });

                setLastProcessedCardId(gameState.lastCardDrawn.id);

                // Auto-dismiss after 5 seconds
                const timeoutId = setTimeout(() => {
                    dismissCardPopup();
                }, 5000);

                // Cleanup timeout if component unmounts
                return () => clearTimeout(timeoutId);
            } else {
                console.log('Not showing notification for card:', gameState.lastCardDrawn.title);
                // Mark card as processed even if not shown to prevent showing later
                setLastProcessedCardId(gameState.lastCardDrawn.id);
            }
        }
    }, [gameState.lastCardDrawn]); // Removed currentPlayerIndex from dependencies

    // Clear card notifications when game resets
    useEffect(() => {
        if (!gameState.isGameActive) {
            setLastProcessedCardId(null);
            dismissCardPopup();
        }
    }, [gameState.isGameActive]);

    const handleSquareClick = (squareNumber: number) => {
        console.log(`Clicked square ${squareNumber}`);
        // Could be used for debugging or additional features
    };

    // Wrapper function to handle token spending for current player
    const handleSpendTokens = (amount: number, targetPenalty?: number) => {
        if (currentPlayer) {
            spendTokens(currentPlayer.id, amount, targetPenalty);
        }
    };

    const toggleLegend = () => {
        setIsLegendVisible(!isLegendVisible);
    };

    const openFieldManualPopup = () => {
        setIsFieldManualPopupOpen(true);
    };

    const closeFieldManualPopup = () => {
        setIsFieldManualPopupOpen(false);
    };

    const dismissCardPopup = () => {
        setCardDrawPopup({ card: null, isVisible: false });
    };

    const toggleActivityLog = () => {
        setIsActivityLogExpanded(!isActivityLogExpanded);
    };

    // Handle escape key to close popups
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (isFieldManualPopupOpen) {
                    closeFieldManualPopup();
                }
                if (cardDrawPopup.isVisible) {
                    dismissCardPopup();
                }
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [isFieldManualPopupOpen, cardDrawPopup.isVisible]);

    // Auto-process NPC turns
    useEffect(() => {
        if (gameState.isGameActive &&
            gameState.currentPlayerIndex > 0 && // It's an NPC's turn (not player 0)
            gameState.players.length > 0) {

            const npcThinkingTime = 1500 + Math.random() * 1000; // 1.5-2.5 seconds

            const timeoutId = setTimeout(() => {
                rollDice(); // Automatically roll dice for NPC
            }, npcThinkingTime);

            return () => clearTimeout(timeoutId);
        }
    }, [gameState.currentPlayerIndex, gameState.isGameActive, rollDice]);

    return (
        <div className="game-container">
            <header className="game-header">
                <h1>
                    Bureaucratic Mountains
                    <br />
                    <span className="subtitle">and Valleys of Death</span>
                </h1>
                <p className="tagline">Navigate the Treacherous Terrain of Defense Acquisition</p>
            </header>

            {/* Player setup screen when no players */}
            {!gameState.isGameActive && gameState.players.length === 0 && (
                <GameControls
                    gameState={gameState}
                    onStartGame={startNewGame}
                    onRollDice={rollDice}
                    onNewGame={newGame}
                    onPlayCard={playCard}
                    onMakeChoice={makeChoice}
                    onSpendTokens={handleSpendTokens}
                />
            )}

            {gameState.players.length > 0 && (
                <>
                    <div className="game-layout">
                        {/* Mission Personnel - Now horizontal above the board */}
                        <div className="mission-personnel-section">
                            <div className="mission-personnel-header">
                                <h3>Mission Personnel</h3>
                                <button
                                    className="new-game-personnel-btn"
                                    onClick={newGame}
                                    title="Start a completely new game"
                                >
                                    🚀 New Mission
                                </button>
                            </div>
                            <div className="players-list-horizontal">
                                {gameState.players.map((player, index) => (
                                    <div
                                        key={player.id}
                                        className={`player-card ${player.color} ${gameState.currentPlayerIndex === index ? 'current' : ''
                                            }`}
                                    >
                                        <div className="player-info">
                                            <span className="player-name">{player.name}</span>
                                            <span className="player-position">Position: {player.position}</span>
                                            <span className="player-tokens">PFT: {player.programFundingTokens || 0}</span>
                                            {index === 0 && <span className="player-type">👤 YOU</span>}
                                            {index > 0 && <span className="player-type">🤖 NPC</span>}
                                        </div>
                                        <div className="player-status">
                                            {gameState.currentPlayerIndex === index && (
                                                <span className="current-indicator">🎯</span>
                                            )}
                                            {(player.activePenalties?.length || 0) > 0 && (
                                                <span className="penalty-indicator">⚠️ {player.activePenalties?.length || 0}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main section with board and controls */}
                        <div className="main-section">
                            <div className="board-section">
                                <div className="board-wrapper">
                                    <SVGBoard
                                        gameState={gameState}
                                        boardConfig={BOARD_CONFIG}
                                        onSquareClick={handleSquareClick}
                                    />
                                </div>

                                {/* Move turn info under the board */}
                                {lastMove && (
                                    <div className="turn-info-compact">
                                        <p>
                                            <strong>{lastMove.player.name}</strong> moved from {lastMove.from} to {lastMove.to}
                                            {lastMove.isSpecial && lastMove.specialMessage && (
                                                <span className="special-move"> - {lastMove.specialMessage}</span>
                                            )}
                                        </p>
                                    </div>
                                )}

                                {/* Recent Game Activity */}
                                <div className="recent-activity">
                                    <div className="activity-header" onClick={toggleActivityLog}>
                                        <h4>Recent Activity</h4>
                                        <button className="activity-toggle">
                                            {isActivityLogExpanded ? '⮟' : '⮞'}
                                        </button>
                                    </div>
                                    {isActivityLogExpanded && (
                                        <div className="activity-log">
                                            {gameLog.slice(-3).reverse().map((logEntry, index) => (
                                                <div key={index} className="log-entry">
                                                    {logEntry}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="controls-section">
                                {/* Mission Control */}
                                <div className="mission-control-wrapper">
                                    <GameControls
                                        gameState={gameState}
                                        onStartGame={startNewGame}
                                        onRollDice={rollDice}
                                        onNewGame={newGame}
                                        onPlayCard={playCard}
                                        onMakeChoice={makeChoice}
                                        onSpendTokens={handleSpendTokens}
                                    />
                                </div>

                                {/* Card Control and Program Funding under Mission Control */}
                                {currentPlayer && gameState.currentPlayerIndex === 0 && (
                                    <div className="card-control-section">
                                        <CardManager
                                            currentPlayer={currentPlayer}
                                            lastCardDrawn={gameState.lastCardDrawn}
                                            pendingChoice={gameState.pendingChoice}
                                            onPlayCard={playCard}
                                            onSpendTokens={(amount, targetPenalty) =>
                                                spendTokens(currentPlayer.id, amount, targetPenalty)
                                            }
                                            onMakeChoice={makeChoice}
                                        />
                                    </div>
                                )}

                                {/* NPC Information Display */}
                                {currentPlayer && gameState.currentPlayerIndex > 0 && (
                                    <div className="npc-info-section">
                                        <h4>🤖 NPC Status</h4>
                                        <div className="npc-player-info">
                                            <div className="npc-basic-info">
                                                <span className="npc-name">{currentPlayer.name}</span>
                                                <span className="npc-position">Position: {currentPlayer.position}</span>
                                                <span className="npc-tokens">Tokens: {currentPlayer.programFundingTokens || 0}</span>
                                            </div>
                                            {(currentPlayer.activePenalties?.length || 0) > 0 && (
                                                <div className="npc-penalties">
                                                    <span>Active Penalties: {currentPlayer.activePenalties?.length}</span>
                                                </div>
                                            )}
                                            {(currentPlayer.handCards?.length || 0) > 0 && (
                                                <div className="npc-cards">
                                                    <span>Hand Cards: {currentPlayer.handCards?.length}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Field Manual Show Button */}
                    <button
                        className="legend-show-btn"
                        onClick={openFieldManualPopup}
                    >
                        📖 Show Field Manual
                    </button>

                    {/* Field Manual Popup */}
                    {isFieldManualPopupOpen && (
                        <div
                            className="field-manual-overlay"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    closeFieldManualPopup();
                                }
                            }}
                        >
                            <div className="field-manual-popup" onClick={(e) => e.stopPropagation()}>
                                <div className="field-manual-header">
                                    <h3>Field Manual</h3>
                                    <button
                                        className="field-manual-close"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            closeFieldManualPopup();
                                        }}
                                        aria-label="Close field manual"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="field-manual-content">
                                    <div className="legend-section">
                                        <h4>📈 Mountains (Climb Up)</h4>
                                        <ul>
                                            {Object.entries(MOUNTAINS).map(([from, data]) => (
                                                <li key={from}>
                                                    <span className="square-ref">{from}→{data.to}</span>
                                                    <span className="legend-text">{data.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="legend-section">
                                        <h4>📉 Valleys (Fall Down)</h4>
                                        <ul>
                                            {Object.entries(VALLEYS).map(([from, data]) => (
                                                <li key={from}>
                                                    <span className="square-ref">{from}→{data.to}</span>
                                                    <span className="legend-text">{data.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Card Draw Popup */}
                    {cardDrawPopup.isVisible && cardDrawPopup.card && (
                        <div
                            className="card-draw-overlay"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    dismissCardPopup();
                                }
                            }}
                        >
                            <div className="card-draw-popup" onClick={(e) => e.stopPropagation()}>
                                <div className="card-draw-header">
                                    <div className={`card-category-badge ${cardDrawPopup.card.category}`}>
                                        {cardDrawPopup.card.category === 'positive' ? '✨ POSITIVE' : '⚠️ NEGATIVE'}
                                    </div>
                                    <button
                                        className="card-draw-close"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            dismissCardPopup();
                                        }}
                                        aria-label="Close card popup"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="card-draw-content">
                                    <h3 className="card-draw-title">{cardDrawPopup.card.title}</h3>
                                    <div className="card-draw-effect">
                                        <strong>Effect:</strong> {cardDrawPopup.card.effect}
                                    </div>
                                    <div className="card-impact">
                                        <strong>Impact:</strong>
                                        {cardDrawPopup.card.moveSpaces && (
                                            <span className="impact-item">
                                                📍 {cardDrawPopup.card.moveSpaces > 0 ? 'Moved forward' : 'Moved backward'} {Math.abs(cardDrawPopup.card.moveSpaces)} spaces
                                            </span>
                                        )}
                                        {cardDrawPopup.card.id === 2 && (
                                            <span className="impact-item">💰 Gained 1 Program Funding Token</span>
                                        )}
                                        {cardDrawPopup.card.id === 46 && (
                                            <span className="impact-item">⚠️ Highest-ranked player moved back (dice roll applied)</span>
                                        )}
                                        {cardDrawPopup.card.skipTurns && (
                                            <span className="impact-item">⏱️ Will skip {cardDrawPopup.card.skipTurns} turn(s)</span>
                                        )}
                                        {cardDrawPopup.card.immunities && (
                                            <span className="impact-item">🛡️ Gained immunity to {cardDrawPopup.card.immunities.join(', ')}</span>
                                        )}
                                        {cardDrawPopup.card.keepCard && (
                                            <span className="impact-item">🎴 Card added to hand</span>
                                        )}
                                    </div>
                                </div>
                                <div className="card-draw-footer">
                                    <small>Auto-dismisses in 5 seconds • Press ESC or click outside to close</small>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {winner && (
                <div className="win-overlay">
                    <div className="win-content">
                        <h2>Mission Accomplished!</h2>
                        <p className="win-player">{winner.name} wins!</p>
                        <p className="win-message">
                            Successfully navigated the bureaucratic nightmare and achieved Program of Record status!
                        </p>
                        <div className="win-actions">
                            {canDispute && (
                                <button className="dispute-btn" onClick={disputeWin}>
                                    ⚖️ Legal Challenge
                                </button>
                            )}
                            <button className="new-game-btn" onClick={newGame}>
                                New Mission
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .player-tokens {
                    color: #d4920e;
                    font-weight: bold;
                    margin-left: 0.5rem;
                }

                .penalty-indicator {
                    color: #dc3545;
                    font-size: 0.8rem;
                    margin-left: 0.25rem;
                }

                .game-layout {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .mission-personnel-section {
                    background: var(--glass);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    box-shadow: var(--shadow-md);
                }

                .mission-personnel-section h3 {
                    color: var(--text-primary);
                    font-size: 1.4rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .mission-personnel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .mission-personnel-header h3 {
                    margin: 0;
                    text-align: left;
                }

                .new-game-personnel-btn {
                    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition);
                    box-shadow: var(--shadow-sm);
                }

                .new-game-personnel-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .player-type {
                    color: var(--accent-tertiary);
                    font-size: 0.8rem;
                    font-weight: bold;
                    margin-left: 0.5rem;
                }

                .player-indicator {
                    color: var(--accent-tertiary);
                    font-size: 0.8rem;
                    font-weight: bold;
                }

                .npc-turn-indicator {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem;
                    background: var(--surface);
                    border-radius: var(--radius-md);
                    border: 2px dashed var(--glass-border);
                }

                .npc-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .npc-icon {
                    font-size: 1.5rem;
                    animation: pulse 2s infinite;
                }

                .npc-text {
                    color: var(--text-secondary);
                    font-weight: 500;
                    font-style: italic;
                }

                .npc-dice-display {
                    padding: 0.75rem;
                    background: var(--glass);
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--glass-border);
                }

                .players-list-horizontal {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .main-section {
                    display: flex;
                    gap: 2rem;
                    align-items: flex-start;
                }

                .board-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .controls-section {
                    flex: 0 0 400px;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .mission-control-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .card-control-section {
                    background: var(--glass);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: 1rem;
                    box-shadow: var(--shadow-md);
                }

                .turn-info-compact {
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: #f8f9fa;
                    border-radius: 6px;
                    max-width: 500px;
                    text-align: center;
                }

                .special-move {
                    color: #007bff;
                    font-style: italic;
                }

                .current-indicator {
                    font-size: 1.2rem;
                }

                .field-manual-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease-out;
                }

                .field-manual-popup {
                    background: var(--glass);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-xl);
                    padding: 2rem;
                    max-width: 90vw;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-xl);
                    animation: scaleIn 0.3s ease-out;
                }

                .field-manual-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--glass-border);
                }

                .field-manual-header h3 {
                    color: var(--text-primary);
                    font-size: 1.8rem;
                    font-weight: 600;
                    margin: 0;
                }

                .field-manual-close {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: var(--radius-sm);
                    transition: var(--transition);
                }

                .field-manual-close:hover {
                    background: var(--surface-hover);
                    color: var(--text-primary);
                }

                .field-manual-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }

                @media (max-width: 1200px) {
                    .main-section {
                        flex-direction: column;
                    }

                    .controls-section {
                        flex: none;
                        width: 100%;
                    }

                    .field-manual-content {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .players-list-horizontal {
                        flex-direction: column;
                        align-items: center;
                    }

                    .field-manual-popup {
                        padding: 1.5rem;
                        margin: 1rem;
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .game-header {
                    text-align: center;
                    padding: 3rem 2rem;
                    background: var(--glass);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-lg);
                    position: relative;
                    overflow: hidden;
                }

                .card-draw-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1100;
                    animation: cardFadeIn 0.4s ease-out;
                }

                .card-draw-popup {
                    background: var(--glass);
                    backdrop-filter: blur(20px);
                    border: 2px solid var(--glass-border);
                    border-radius: var(--radius-xl);
                    padding: 2rem;
                    max-width: 500px;
                    width: 90vw;
                    box-shadow: var(--shadow-xl);
                    animation: cardSlideIn 0.4s ease-out;
                    position: relative;
                }

                .card-draw-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .card-category-badge {
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    font-size: 0.9rem;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                .card-category-badge.positive {
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    color: white;
                    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
                }

                .card-category-badge.negative {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                .card-draw-close {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: var(--radius-sm);
                    transition: var(--transition);
                }

                .card-draw-close:hover {
                    background: var(--surface-hover);
                    color: var(--text-primary);
                }

                .card-draw-content {
                    margin-bottom: 1.5rem;
                }

                .card-draw-title {
                    color: var(--text-primary);
                    font-size: 1.4rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    line-height: 1.3;
                }

                .card-draw-effect {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    line-height: 1.5;
                    padding: 1rem;
                    background: var(--surface);
                    border-radius: var(--radius-md);
                    border-left: 4px solid var(--accent-tertiary);
                }

                .card-draw-footer {
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    font-style: italic;
                }

                @keyframes cardFadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes cardSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .card-draw-popup {
                        padding: 1.5rem;
                        margin: 1rem;
                    }

                    .card-draw-title {
                        font-size: 1.2rem;
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                }

                .npc-info-section {
                    background: var(--surface);
                    border: 2px dashed var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: 1rem;
                }

                .npc-info-section h4 {
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                }

                .npc-player-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .npc-basic-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .npc-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .npc-position, .npc-tokens {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                .npc-penalties, .npc-cards {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    font-style: italic;
                }

                .recent-activity {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: var(--glass);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-md);
                    max-width: 500px;
                    box-shadow: var(--shadow-sm);
                }

                .recent-activity h4 {
                    color: var(--text-primary);
                    margin-bottom: 0.75rem;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .activity-log {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .log-entry {
                    padding: 0.5rem;
                    background: var(--surface);
                    border-radius: var(--radius-sm);
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    line-height: 1.4;
                    border-left: 3px solid var(--accent-tertiary);
                }

                .card-impact {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: var(--glass);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--accent-tertiary);
                    color: var(--text-primary);
                }

                .impact-item {
                    display: block;
                    margin-top: 0.5rem;
                    padding-left: 1rem;
                    text-indent: -1rem;
                    color: var(--accent-tertiary);
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}; 