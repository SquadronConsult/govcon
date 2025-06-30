import React from 'react';
import { Player, EventCard, ActivePenalty, PendingChoice } from '@/types/game';
import { PFT_CONSTANTS } from '@/constants/cardData';

interface CardManagerProps {
    currentPlayer: Player;
    lastCardDrawn?: EventCard;
    pendingChoice?: PendingChoice;
    onPlayCard: (cardId: number) => void;
    onSpendTokens: (amount: number, targetPenalty?: number) => void;
    onMakeChoice: (choice: any) => void;
}

export const CardManager: React.FC<CardManagerProps> = ({
    currentPlayer,
    lastCardDrawn,
    pendingChoice,
    onPlayCard,
    onSpendTokens,
    onMakeChoice
}) => {
    if (!currentPlayer) return null;

    const renderCard = (card: EventCard, isInHand: boolean = false) => (
        <div
            key={card.id}
            className={`card ${card.category} ${isInHand ? 'in-hand' : ''}`}
        >
            <div className="card-header">
                <h4 className="card-title">{card.title}</h4>
                <span className={`card-category ${card.category}`}>
                    {card.category.toUpperCase()}
                </span>
            </div>
            <p className="card-effect">{card.effect}</p>
            {isInHand && card.cardType === 'reaction' && (
                <div className="card-actions">
                    <button
                        className={`play-card-btn ${!canPlayCard(card) ? 'disabled' : ''}`}
                        onClick={() => onPlayCard(card.id)}
                        disabled={!canPlayCard(card)}
                        title={!canPlayCard(card) ? 'Cannot play this card right now' : `Play timing: ${card.playTiming || 'any time'}`}
                    >
                        🎴 Play Card
                    </button>
                    {card.playTiming && (
                        <div className="play-timing">
                            <small>📅 Timing: {card.playTiming.replace(/_/g, ' ')}</small>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const canPlayCard = (card: EventCard): boolean => {
        // Only reaction cards can be played from hand
        if (card.cardType !== 'reaction') return false;

        // Check if it's the current player's turn
        if (!currentPlayer) return false;

        // Basic validation - reaction cards can generally be played during your turn
        // More specific timing validation would depend on the card's playTiming property
        if (card.playTiming) {
            switch (card.playTiming) {
                case 'before_roll':
                    // Can be played before rolling dice
                    return true;
                case 'on_move_back':
                case 'on_skip_turns':
                case 'on_negative_card':
                    // These are reactive - can be played in response to events
                    return true;
                case 'before_last_square':
                    // Can be played when approaching the last square
                    return currentPlayer.position >= 95; // Close to winning
                default:
                    return true;
            }
        }

        return true;
    };

    const renderPenalty = (penalty: ActivePenalty, index: number) => (
        <div key={index} className="penalty-item">
            <div className="penalty-header">
                <h5>{penalty.title}</h5>
                {penalty.turnsRemaining !== undefined && (
                    <span className="turns-remaining">
                        {penalty.turnsRemaining} turns left
                    </span>
                )}
            </div>
            <p className="penalty-effect">{penalty.effect}</p>
            {(currentPlayer.programFundingTokens || 0) >= PFT_CONSTANTS.COST_TO_REMOVE_PENALTY && (
                <button
                    className="remove-penalty-btn"
                    onClick={() => onSpendTokens(PFT_CONSTANTS.COST_TO_REMOVE_PENALTY, penalty.cardId)}
                >
                    Remove (2 tokens)
                </button>
            )}
        </div>
    );

    const renderPendingChoice = () => {
        if (!pendingChoice || pendingChoice.playerId !== currentPlayer.id) return null;

        switch (pendingChoice.type) {
            case 'pay_token_or_penalty':
                return (
                    <div className="pending-choice">
                        <h4>Choose your response:</h4>
                        <div className="choice-buttons">
                            {(currentPlayer.programFundingTokens || 0) > 0 && (
                                <button
                                    className="choice-btn pay"
                                    onClick={() => onMakeChoice('pay')}
                                >
                                    Pay 1 Token
                                </button>
                            )}
                            <button
                                className="choice-btn penalty"
                                onClick={() => onMakeChoice('penalty')}
                            >
                                Accept Penalty
                            </button>
                        </div>
                    </div>
                );

            case 'discard_card':
                return (
                    <div className="pending-choice">
                        <h4>Your hand is full. Choose a card to discard:</h4>
                        <div className="discard-options">
                            {pendingChoice.options.map((card: EventCard) => (
                                <button
                                    key={card.id}
                                    className="discard-option"
                                    onClick={() => onMakeChoice(card)}
                                >
                                    {card.title}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="card-manager">
            {/* Player Status */}
            <div className="player-status">
                <h3>{currentPlayer.name}</h3>
                <div className="status-info">
                    <div className="tokens">
                        <span className="token-count">
                            💰 {currentPlayer.programFundingTokens || 0}/{PFT_CONSTANTS.MAX_TOKENS} Tokens
                        </span>
                    </div>
                    <div className="position">
                        Position: {currentPlayer.position}
                    </div>
                </div>
            </div>

            {/* Program Funding Tokens */}
            <div className="token-section">
                <h4>Program Funding Tokens</h4>
                <div className="token-display">
                    {Array.from({ length: PFT_CONSTANTS.MAX_TOKENS }, (_, i) => (
                        <span
                            key={i}
                            className={`token ${i < (currentPlayer.programFundingTokens || 0) ? 'filled' : 'empty'}`}
                        >
                            💰
                        </span>
                    ))}
                </div>
                <p className="token-help">
                    Spend 2 tokens to remove any penalty • End-game tokens push opponents back
                </p>
            </div>

            {/* Hand Cards */}
            <div className="hand-section">
                <h4>Hand Cards ({currentPlayer.handCards?.length || 0}/2)</h4>
                {(currentPlayer.handCards?.length || 0) > 0 ? (
                    <div className="hand-cards">
                        {currentPlayer.handCards?.map(card => renderCard(card, true))}
                    </div>
                ) : (
                    <p className="no-cards">No reaction cards in hand</p>
                )}
            </div>

            {/* Active Penalties */}
            {(currentPlayer.activePenalties?.length || 0) > 0 && (
                <div className="penalties-section">
                    <h4>Active Penalties</h4>
                    <div className="penalties-list">
                        {currentPlayer.activePenalties?.map(renderPenalty)}
                    </div>
                </div>
            )}

            {/* Immunities */}
            {(currentPlayer.immunities?.length || 0) > 0 && (
                <div className="immunities-section">
                    <h4>Active Immunities</h4>
                    <div className="immunities-list">
                        {currentPlayer.immunities?.map((immunity, index) => (
                            <span key={index} className="immunity-badge">
                                🛡️ {immunity}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Last Card Drawn */}
            {lastCardDrawn && (
                <div className="last-card-section">
                    <h4>Last Card Drawn</h4>
                    {renderCard(lastCardDrawn)}
                </div>
            )}

            {/* Pending Choice */}
            {renderPendingChoice()}

        </div>
    );
}; 