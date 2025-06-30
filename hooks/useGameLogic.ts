import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, EventCard, ActivePenalty, PendingChoice, GamePhase } from '@/types/game';
import { BOARD_CONFIG, PLAYER_CONFIGS } from '@/constants/gameConfig';
import { createGameDecks, PFT_CONSTANTS, ALL_CARDS } from '@/constants/cardData';

const INITIAL_GAME_STATE: GameState = {
    players: [],
    currentPlayerIndex: 0,
    isGameActive: false,
    diceValue: 0,
    decks: createGameDecks(),
    gamePhase: 'penalty_upkeep'
};

export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
    const [winner, setWinner] = useState<Player | null>(null);
    const [canDispute, setCanDispute] = useState<boolean>(false);
    const [lastMove, setLastMove] = useState<{
        player: Player;
        from: number;
        to: number;
        isSpecial: boolean;
        specialMessage?: string;
        cardDrawn?: EventCard;
        cardEffect?: string;
    } | null>(null);
    const [gameLog, setGameLog] = useState<string[]>([]);

    // Initialize game with specified number of players
    const startNewGame = useCallback((numPlayers: number) => {
        const players: Player[] = [];
        for (let i = 0; i < numPlayers; i++) {
            players.push({
                id: i,
                color: PLAYER_CONFIGS[i].color,
                name: PLAYER_CONFIGS[i].name,
                position: 1,
                programFundingTokens: 0,
                handCards: [],
                activePenalties: [],
                immunities: []
            });
        }

        const newGameState: GameState = {
            players,
            currentPlayerIndex: 0,
            isGameActive: true,
            diceValue: 0,
            decks: createGameDecks(),
            gamePhase: 'penalty_upkeep'
        };

        setGameState(newGameState);
        setWinner(null);
        setLastMove(null);
        setGameLog(['Game started!']);
    }, []);

    // Execute the 7-phase turn structure
    const executeTurn = useCallback(() => {
        if (!gameState.isGameActive || gameState.players.length === 0) {
            console.log('ExecuteTurn: Game not active or no players');
            return;
        }

        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        console.log(`ExecuteTurn: Phase ${gameState.gamePhase} for ${currentPlayer?.name}`);

        switch (gameState.gamePhase) {
            case 'penalty_upkeep':
                handlePenaltyUpkeep(currentPlayer);
                break;
            case 'roll_dice':
                handleRollDice(currentPlayer);
                break;
            case 'move_token':
                handleMoveToken(currentPlayer);
                break;
            case 'check_landing':
                handleCheckLanding(currentPlayer);
                break;
            case 'draw_resolve_cards':
                handleDrawResolveCards(currentPlayer);
                break;
            case 'token_actions':
                handleTokenActions(currentPlayer);
                break;
            case 'end_turn':
                handleEndTurn();
                break;
        }
    }, [gameState]);

    // Phase A: Penalty Upkeep
    const handlePenaltyUpkeep = (player: Player) => {
        let shouldSkipTurn = false;
        const updatedPenalties: ActivePenalty[] = [];

        (player.activePenalties || []).forEach(penalty => {
            if (penalty.turnsRemaining !== undefined) {
                if (penalty.turnsRemaining > 0) {
                    if (penalty.turnsRemaining === 1) {
                        // Last turn of penalty
                        addToLog(`${player.name}'s penalty "${penalty.title}" expires.`);
                    } else {
                        updatedPenalties.push({
                            ...penalty,
                            turnsRemaining: penalty.turnsRemaining - 1
                        });
                        shouldSkipTurn = true;
                    }
                } else if (penalty.turnsRemaining === 0) {
                    shouldSkipTurn = true;
                }
            } else {
                // Persistent penalty without turn limit
                updatedPenalties.push(penalty);
            }
        });

        updatePlayerData(player.id, { activePenalties: updatedPenalties });

        if (shouldSkipTurn) {
            addToLog(`${player.name} skips their turn due to active penalties.`);
            setGamePhase('end_turn');
        } else {
            setGamePhase('roll_dice');
        }
    };

    // Phase B: Roll Dice
    const handleRollDice = (player: Player) => {
        let diceType = 6; // Default d6
        let diceValue: number;

        // Check for dice modifiers from penalties
        const diceModifier = (player.activePenalties || []).find(p => p.diceModifier);

        if (diceModifier?.diceModifier?.type === 'use_d4') {
            diceType = 4;
        }

        diceValue = Math.floor(Math.random() * diceType) + 1;

        // Check for movement restrictions
        if (diceModifier?.diceModifier?.type === 'even_only' && diceValue % 2 !== 0) {
            addToLog(`${player.name} rolled ${diceValue} but can only move on even rolls. No movement.`);
            diceValue = 0;
        } else if (diceModifier?.diceModifier?.type === 'five_six_only' && diceValue < 5) {
            addToLog(`${player.name} rolled ${diceValue} but can only move on 5 or 6. No movement.`);
            diceValue = 0;
        }

        // House rule: doubles earn a token and draw a card
        if (diceValue === 6 && Math.random() < 0.16667) { // 1/6 chance for "doubles"
            awardProgramFundingToken(player, 'Rolled doubles!');
            // Could draw a card here as house rule
        }

        updateGameState({ diceValue });
        addToLog(`${player.name} rolled ${diceValue} on a d${diceType}.`);

        setGamePhase('move_token');
    };

    // Phase C: Move Token
    const handleMoveToken = (player: Player) => {
        if (gameState.diceValue === 0) {
            setGamePhase('end_turn');
            return;
        }

        // Get current player data from gameState to avoid stale closure data
        const currentPlayer = gameState.players.find(p => p.id === player.id);
        if (!currentPlayer) {
            setGamePhase('end_turn');
            return;
        }

        const newPosition = Math.min(currentPlayer.position + gameState.diceValue, BOARD_CONFIG.size);
        updatePlayerData(player.id, { position: newPosition });

        addToLog(`${currentPlayer.name} moves from ${currentPlayer.position} to ${newPosition}.`);

        // Set up lastMove for UI feedback
        setLastMove({
            player: currentPlayer,
            from: currentPlayer.position,
            to: newPosition,
            isSpecial: false
        });

        setGamePhase('check_landing');
    };

    // Phase D: Check Landing Square
    const handleCheckLanding = (player: Player) => {
        // Get current player data from gameState to avoid stale closure data
        const currentPlayer = gameState.players.find(p => p.id === player.id);
        if (!currentPlayer) {
            setGamePhase('end_turn');
            return;
        }

        const { finalPosition, specialMessage, cardDrawType } = handleSpecialSquare(currentPlayer);

        if (finalPosition !== currentPlayer.position) {
            updatePlayerData(player.id, { position: finalPosition });
            if (specialMessage) {
                addToLog(specialMessage);
            }

            // Update lastMove for special moves
            setLastMove({
                player: currentPlayer,
                from: currentPlayer.position,
                to: finalPosition,
                isSpecial: true,
                specialMessage
            });
        }

        // Check for winner
        if (finalPosition >= BOARD_CONFIG.size) {
            setWinner(player);
            setCanDispute(player.id !== 0); // Can dispute if winner is not the human player
            addToLog(`🎉 ${player.name} wins the game!`);

            // End-game token effects
            const unusedTokens = player.programFundingTokens;
            if (unusedTokens > 0) {
                addToLog(`${player.name}'s ${unusedTokens} unused tokens push all opponents back!`);
                gameState.players.forEach(p => {
                    if (p.id !== player.id) {
                        const newPos = Math.max(1, p.position - unusedTokens);
                        updatePlayerData(p.id, { position: newPos });
                    }
                });
            }

            updateGameState({ isGameActive: false });
            return;
        }

        // Award token for reaching summit
        if (BOARD_CONFIG.mountains[finalPosition]) {
            awardProgramFundingToken(player, 'Reached mountain summit!');
        }

        setGamePhase('draw_resolve_cards');
    };

    // Phase E: Draw/Resolve Cards
    const handleDrawResolveCards = (player: Player) => {
        const shouldDrawCard = determineShouldDrawCard(player);

        if (shouldDrawCard.draw) {
            const card = drawCard(shouldDrawCard.deckType!);
            if (card) {
                addToLog(`${player.name} draws: "${card.title}"`);
                resolveCard(card, player);
                updateGameState({ lastCardDrawn: card });
            }
        }

        setGamePhase('token_actions');
    };

    // Phase F: Token Actions
    const handleTokenActions = (player: Player) => {
        // This phase allows voluntary token spending
        // In UI, player can choose to spend 2 tokens to remove penalties
        setGamePhase('end_turn');
    };

    // Phase G: End Turn
    const handleEndTurn = () => {
        const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
        updateGameState({
            currentPlayerIndex: nextPlayerIndex,
            gamePhase: 'penalty_upkeep'
        });
    };

    // Helper function to determine if player should draw a card
    const determineShouldDrawCard = (player: Player): { draw: boolean; deckType?: 'positive' | 'negative' | 'mixed' } => {
        // Check if on a folder square
        if (BOARD_CONFIG.folderSquares.includes(player.position)) {
            return { draw: true, deckType: 'mixed' };
        }

        // Check if just moved due to mountain/valley (would have been set in handleSpecialSquare)
        const mountain = BOARD_CONFIG.mountains[player.position];
        const valley = BOARD_CONFIG.valleys[player.position];

        if (mountain?.drawFromDeck) {
            return { draw: true, deckType: mountain.drawFromDeck };
        }

        if (valley?.drawFromDeck) {
            return { draw: true, deckType: valley.drawFromDeck };
        }

        return { draw: false };
    };

    // Draw a card from specified deck
    const drawCard = (deckType: 'positive' | 'negative' | 'mixed'): EventCard | null => {
        const deck = gameState.decks[deckType];

        if (deck.length === 0) {
            // Reshuffle discard pile
            const shuffledDiscard = [...gameState.decks.discardPile].sort(() => Math.random() - 0.5);
            gameState.decks[deckType] = shuffledDiscard;
            gameState.decks.discardPile = [];
            addToLog(`${deckType} deck reshuffled from discard pile.`);
        }

        if (gameState.decks[deckType].length > 0) {
            const card = gameState.decks[deckType].pop()!;
            return card;
        }

        return null;
    };

    // Resolve card effects
    const resolveCard = (card: EventCard, player: Player) => {
        const cardType = card.category === 'positive' ? '✨ POSITIVE' : '⚠️ NEGATIVE';
        addToLog(`🎴 CARD DRAWN: ${player.name} drew "${card.title}" (${cardType})`);

        // Handle immediate effects
        if (card.cardType === 'immediate') {
            resolveImmediateCard(card, player);
        } else if (card.cardType === 'persistent') {
            resolvePersistentCard(card, player);
        } else if (card.cardType === 'reaction' && card.keepCard) {
            // Add to hand if it's a reaction card - get fresh player data
            const freshPlayer = gameState.players.find(p => p.id === player.id);
            if (freshPlayer) {
                const handCards = freshPlayer.handCards || [];
                if (handCards.length < 2) { // Hand limit
                    updatePlayerData(player.id, {
                        handCards: [...handCards, card]
                    });
                    addToLog(`🎴 CARD KEPT: "${card.title}" added to ${player.name}'s hand`);
                } else {
                    addToLog(`🎴 HAND FULL: ${player.name}'s hand is full. Must discard a card first.`);
                    // Set pending choice for discarding
                    setPendingChoice({
                        type: 'discard_card',
                        cardId: card.id,
                        options: handCards,
                        playerId: player.id
                    });
                }
            }
        }

        // Move card to discard pile (unless it's kept in hand)
        if (!card.keepCard || card.cardType !== 'reaction') {
            gameState.decks.discardPile.push(card);
        }
    };

    // Resolve immediate card effects
    const resolveImmediateCard = (card: EventCard, player: Player) => {
        // Handle special targeting for cards that affect specific players
        if (card.targetPlayer === 'highest') {
            // Find the highest-ranked player (furthest position)
            const highestPlayer = gameState.players.reduce((highest, current) =>
                current.position > highest.position ? current : highest
            );

            if (card.id === 46) { // DCAA Surprise Audit
                const rollValue = Math.floor(Math.random() * 6) + 1;
                const newPosition = Math.max(1, highestPlayer.position - rollValue);
                updatePlayerData(highestPlayer.id, { position: newPosition });
                addToLog(`⚠️ DCAA SURPRISE AUDIT: ${highestPlayer.name} (highest-ranked) rolled ${rollValue} and moves back to position ${newPosition}`);
                return;
            }
        }

        // Handle movement
        if (card.moveSpaces) {
            const newPosition = Math.max(1, Math.min(BOARD_CONFIG.size, player.position + card.moveSpaces));
            updatePlayerData(player.id, { position: newPosition });
            const moveType = card.moveSpaces > 0 ? '⬆️ ADVANCED' : '⬇️ MOVED BACK';
            addToLog(`📍 ${moveType}: ${player.name} moves ${card.moveSpaces > 0 ? '+' : ''}${card.moveSpaces} spaces to position ${newPosition}`);
        }

        // Handle token awards
        if (card.id === 2) { // Congressional Add-On
            awardProgramFundingToken(player, card.title);
        }

        // Handle skip turns
        if (card.skipTurns) {
            const freshPlayer = gameState.players.find(p => p.id === player.id);
            if (freshPlayer) {
                const penalty: ActivePenalty = {
                    cardId: card.id,
                    title: card.title,
                    effect: card.effect,
                    turnsRemaining: card.skipTurns
                };
                updatePlayerData(player.id, {
                    activePenalties: [...(freshPlayer.activePenalties || []), penalty]
                });
                addToLog(`⏱️ PENALTY APPLIED: ${player.name} will skip ${card.skipTurns} turn(s) due to "${card.title}"`);
            }
        }

        // Handle immunities
        if (card.immunities) {
            const freshPlayer = gameState.players.find(p => p.id === player.id);
            if (freshPlayer) {
                updatePlayerData(player.id, {
                    immunities: [...(freshPlayer.immunities || []), ...card.immunities]
                });
                addToLog(`🛡️ IMMUNITY GAINED: ${player.name} is now immune to ${card.immunities.join(', ')}`);
            }
        }

        // Handle choice cards
        if (card.cardType === 'choice') {
            setPendingChoice({
                type: 'pay_token_or_penalty',
                cardId: card.id,
                options: [],
                playerId: player.id
            });
        }
    };

    // Resolve persistent card effects
    const resolvePersistentCard = (card: EventCard, player: Player) => {
        const freshPlayer = gameState.players.find(p => p.id === player.id);
        if (freshPlayer) {
            const penalty: ActivePenalty = {
                cardId: card.id,
                title: card.title,
                effect: card.effect,
                turnsRemaining: card.skipTurns,
                diceModifier: card.diceModifier
            };

            updatePlayerData(player.id, {
                activePenalties: [...(freshPlayer.activePenalties || []), penalty]
            });

            if (card.diceModifier) {
                addToLog(`🎲 DICE PENALTY: ${player.name} has ongoing dice restriction from "${card.title}"`);
            } else {
                addToLog(`⚠️ ONGOING PENALTY: ${player.name} has active penalty "${card.title}"`);
            }
        }
    };

    // Resolve effects for cards played from hand (reaction cards)
    const resolvePlayedCard = (card: EventCard, player: Player) => {
        const cardType = card.category === 'positive' ? '✨ POSITIVE' : '⚠️ NEGATIVE';
        addToLog(`🎴 REACTION CARD: ${player.name} played "${card.title}" (${cardType})`);

        // Handle movement
        if (card.moveSpaces) {
            const newPosition = Math.max(1, Math.min(BOARD_CONFIG.size, player.position + card.moveSpaces));
            updatePlayerData(player.id, { position: newPosition });
            const moveType = card.moveSpaces > 0 ? '⬆️ ADVANCED' : '⬇️ MOVED BACK';
            addToLog(`📍 ${moveType}: ${player.name} moves ${card.moveSpaces > 0 ? '+' : ''}${card.moveSpaces} spaces to position ${newPosition}`);
        }

        // Handle token awards
        if (card.id === 2) { // Congressional Add-On
            awardProgramFundingToken(player, card.title);
        }

        // Handle immunities
        if (card.immunities) {
            const freshPlayer = gameState.players.find(p => p.id === player.id);
            if (freshPlayer) {
                updatePlayerData(player.id, {
                    immunities: [...(freshPlayer.immunities || []), ...card.immunities]
                });
                addToLog(`🛡️ IMMUNITY GAINED: ${player.name} is now immune to ${card.immunities.join(', ')}`);
            }
        }

        // Handle special reaction card effects based on playTiming
        if (card.playTiming) {
            switch (card.playTiming) {
                case 'on_move_back':
                    // Cancel movement back if this was played in response
                    addToLog(`🛡️ PROTECTION: ${card.title} prevents movement back!`);
                    break;
                case 'on_skip_turns':
                    // Cancel skip turns if this was played in response
                    addToLog(`🛡️ PROTECTION: ${card.title} prevents turn skipping!`);
                    break;
                case 'on_negative_card':
                    // Cancel negative card effects if this was played in response
                    addToLog(`🛡️ PROTECTION: ${card.title} negates negative card effects!`);
                    break;
            }
        }
    };

    // Award Program Funding Token
    const awardProgramFundingToken = (player: Player, reason: string) => {
        // Get fresh player data to avoid stale state issues
        const freshPlayer = gameState.players.find(p => p.id === player.id);
        if (!freshPlayer) return;

        if ((freshPlayer.programFundingTokens || 0) < PFT_CONSTANTS.MAX_TOKENS) {
            const newTokenCount = (freshPlayer.programFundingTokens || 0) + 1;
            updatePlayerData(player.id, {
                programFundingTokens: newTokenCount
            });
            addToLog(`💰 TOKEN AWARDED: ${player.name} gains 1 Program Funding Token (${reason}) - Total: ${newTokenCount}`);
        } else {
            addToLog(`💰 TOKEN LIMIT: ${player.name} would gain a token but is at maximum (${PFT_CONSTANTS.MAX_TOKENS})`);
        }
    };

    // Handle special squares (mountains and valleys)
    const handleSpecialSquare = (player: Player): {
        finalPosition: number;
        specialMessage?: string;
        cardDrawType?: 'positive' | 'negative' | 'mixed';
    } => {
        const { position } = player;

        // Check for mountain (ladder)
        if (BOARD_CONFIG.mountains[position]) {
            const mountain = BOARD_CONFIG.mountains[position];
            return {
                finalPosition: mountain.to,
                specialMessage: `${player.name} climbed up: ${mountain.name}! (${position} → ${mountain.to})`,
                cardDrawType: mountain.drawFromDeck
            };
        }

        // Check for valley (chute)
        if (BOARD_CONFIG.valleys[position]) {
            const valley = BOARD_CONFIG.valleys[position];
            return {
                finalPosition: valley.to,
                specialMessage: `${player.name} fell down: ${valley.name}! (${position} → ${valley.to})`,
                cardDrawType: valley.drawFromDeck
            };
        }

        return { finalPosition: position };
    };

    // Spend Program Funding Tokens
    const spendTokens = useCallback((playerId: number, amount: number, targetPenalty?: number) => {
        const player = gameState.players.find(p => p.id === playerId);
        if (!player || player.programFundingTokens < amount) {
            return false;
        }

        if (targetPenalty !== undefined) {
            // Remove specific penalty
            const updatedPenalties = (player.activePenalties || []).filter(p => p.cardId !== targetPenalty);
            updatePlayerData(playerId, {
                programFundingTokens: player.programFundingTokens - amount,
                activePenalties: updatedPenalties
            });
            addToLog(`${player.name} spends ${amount} tokens to remove a penalty.`);
        } else {
            // General token spending
            updatePlayerData(playerId, {
                programFundingTokens: player.programFundingTokens - amount
            });
        }

        return true;
    }, [gameState.players]);

    // Play a reaction card
    const playCard = useCallback((cardId: number) => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        const card = (currentPlayer.handCards || []).find(c => c.id === cardId);

        if (!card || card.cardType !== 'reaction') {
            console.log('Cannot play card:', card ? 'Not a reaction card' : 'Card not found');
            return false;
        }

        // Remove card from hand
        const updatedHand = (currentPlayer.handCards || []).filter(c => c.id !== cardId);
        updatePlayerData(currentPlayer.id, { handCards: updatedHand });

        // Resolve card effect - but mark it as played from hand
        resolvePlayedCard(card, currentPlayer);
        addToLog(`🎴 CARD PLAYED: ${currentPlayer.name} plays "${card.title}" from hand.`);

        // Move card to discard pile
        const updatedDecks = { ...gameState.decks };
        updatedDecks.discardPile.push(card);
        updateGameState({ decks: updatedDecks });

        return true;
    }, [gameState]);

    // Make a choice for pending decisions
    const makeChoice = useCallback((choice: any) => {
        if (!gameState.pendingChoice) return;

        const player = gameState.players.find(p => p.id === gameState.pendingChoice!.playerId);
        if (!player) return;

        switch (gameState.pendingChoice.type) {
            case 'pay_token_or_penalty':
                if (choice === 'pay' && player.programFundingTokens > 0) {
                    spendTokens(player.id, 1);
                } else {
                    // Apply the harsher penalty
                    addToLog(`${player.name} cannot or chooses not to pay. Penalty applied.`);
                }
                break;
            case 'discard_card':
                // Remove the chosen card from hand and add the new card
                const updatedHand = (player.handCards || []).filter(c => c.id !== choice.id);
                const newCard = ALL_CARDS.find(c => c.id === gameState.pendingChoice!.cardId);
                if (newCard) {
                    updatePlayerData(player.id, { handCards: [...updatedHand, newCard] });
                    addToLog(`${player.name} discards "${choice.title}" and adds "${newCard.title}" to hand.`);

                    // Move discarded card to discard pile
                    const updatedDecks = { ...gameState.decks };
                    updatedDecks.discardPile.push(choice);
                    updateGameState({ decks: updatedDecks });
                }
                break;
        }

        updateGameState({ pendingChoice: undefined });
    }, [gameState.pendingChoice, spendTokens]);

    // Helper functions
    const updateGameState = (updates: Partial<GameState>) => {
        setGameState(prev => ({ ...prev, ...updates }));
    };

    const updatePlayerData = (playerId: number, updates: Partial<Player>) => {
        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p =>
                p.id === playerId ? { ...p, ...updates } : p
            )
        }));
    };

    const setGamePhase = (phase: GamePhase) => {
        updateGameState({ gamePhase: phase });
    };

    const setPendingChoice = (choice: PendingChoice) => {
        updateGameState({ pendingChoice: choice });
    };

    const addToLog = (message: string) => {
        setGameLog(prev => [...prev.slice(-9), message]); // Keep last 10 messages
    };

    // Main turn execution - this replaces the old rollDice function
    const rollDice = useCallback(() => {
        if (!gameState.isGameActive || gameState.players.length === 0) {
            return;
        }

        console.log('Starting turn execution...');

        // Execute a complete turn sequence
        const executeCompleteTurn = () => {
            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            let player = currentPlayer;

            console.log(`Starting turn for ${player.name}`);

            // Clear dice value at start of turn so UI shows fresh state
            // Only clear if we're starting a new penalty upkeep phase
            if (gameState.gamePhase === 'penalty_upkeep') {
                updateGameState({
                    diceValue: 0
                    // Don't clear lastCardDrawn here - let it persist until next card is drawn
                });
            }

            // Phase 1: Penalty Upkeep
            let shouldSkipTurn = false;
            const updatedPenalties: ActivePenalty[] = [];

            (player.activePenalties || []).forEach(penalty => {
                if (penalty.turnsRemaining !== undefined) {
                    if (penalty.turnsRemaining > 0) {
                        if (penalty.turnsRemaining === 1) {
                            addToLog(`${player.name}'s penalty "${penalty.title}" expires.`);
                        } else {
                            updatedPenalties.push({
                                ...penalty,
                                turnsRemaining: penalty.turnsRemaining - 1
                            });
                            shouldSkipTurn = true;
                        }
                    } else if (penalty.turnsRemaining === 0) {
                        shouldSkipTurn = true;
                    }
                } else {
                    updatedPenalties.push(penalty);
                }
            });

            updatePlayerData(player.id, { activePenalties: updatedPenalties });

            if (shouldSkipTurn) {
                addToLog(`${player.name} skips their turn due to active penalties.`);
                // End turn and move to next player
                const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
                updateGameState({
                    currentPlayerIndex: nextPlayerIndex,
                    gamePhase: 'penalty_upkeep'
                });
                return;
            }

            // Phase 2: Roll Dice
            let diceType = 6;
            let diceValue: number;

            const diceModifier = (player.activePenalties || []).find(p => p.diceModifier);

            if (diceModifier?.diceModifier?.type === 'use_d4') {
                diceType = 4;
            }

            diceValue = Math.floor(Math.random() * diceType) + 1;

            // Update dice value immediately so UI shows current roll
            updateGameState({ diceValue, gamePhase: 'move_token' }); // Set phase to indicate rolling is done

            if (diceModifier?.diceModifier?.type === 'even_only' && diceValue % 2 !== 0) {
                addToLog(`${player.name} rolled ${diceValue} but can only move on even rolls. No movement.`);
                diceValue = 0;
            } else if (diceModifier?.diceModifier?.type === 'five_six_only' && diceValue < 5) {
                addToLog(`${player.name} rolled ${diceValue} but can only move on 5 or 6. No movement.`);
                diceValue = 0;
            }

            if (diceValue === 6 && Math.random() < 0.16667) {
                awardProgramFundingToken(player, 'Rolled doubles!');
            }

            addToLog(`${player.name} rolled ${diceValue} on a d${diceType}.`);

            // Add pause after rolling to show the result before moving
            // For human players, pause longer to see the roll
            const pauseTime = player.id === 0 ? 1500 : 800; // 1.5s for human, 0.8s for NPCs

            setTimeout(() => {
                continueAfterRoll(player, diceValue);
            }, pauseTime);

            // Don't continue immediately - use timeout for pause
            return; // Exit early, timeout will continue the turn
        };

        // Continue turn execution after dice roll pause
        const continueAfterRoll = (player: Player, diceValue: number) => {
            // Phase 3: Move Token
            if (diceValue > 0) {
                // Get fresh player data
                const freshPlayer = gameState.players.find(p => p.id === player.id);
                if (freshPlayer) {
                    const newPosition = Math.min(freshPlayer.position + diceValue, BOARD_CONFIG.size);
                    updatePlayerData(player.id, { position: newPosition });
                    addToLog(`${player.name} moves from ${freshPlayer.position} to ${newPosition}.`);

                    setLastMove({
                        player: freshPlayer,
                        from: freshPlayer.position,
                        to: newPosition,
                        isSpecial: false
                    });

                    // Phase 4: Check Landing - get special square effects
                    const updatedPlayer = { ...freshPlayer, position: newPosition };
                    const { finalPosition, specialMessage } = handleSpecialSquare(updatedPlayer);

                    if (finalPosition !== newPosition) {
                        updatePlayerData(player.id, { position: finalPosition });
                        if (specialMessage) {
                            addToLog(specialMessage);
                        }
                        setLastMove({
                            player: updatedPlayer,
                            from: newPosition,
                            to: finalPosition,
                            isSpecial: true,
                            specialMessage
                        });
                    }

                    // Check for winner
                    if (finalPosition >= BOARD_CONFIG.size) {
                        setWinner(player);
                        setCanDispute(player.id !== 0); // Can dispute if winner is not the human player
                        addToLog(`🎉 ${player.name} wins the game!`);

                        const unusedTokens = player.programFundingTokens;
                        if (unusedTokens > 0) {
                            addToLog(`${player.name}'s ${unusedTokens} unused tokens push all opponents back!`);
                            gameState.players.forEach(p => {
                                if (p.id !== player.id) {
                                    const newPos = Math.max(1, p.position - unusedTokens);
                                    updatePlayerData(p.id, { position: newPos });
                                }
                            });
                        }

                        updateGameState({ isGameActive: false });
                        return;
                    }

                    // Award token for reaching summit
                    if (BOARD_CONFIG.mountains[finalPosition]) {
                        // Get fresh player data for token awarding
                        const freshPlayerForToken = gameState.players.find(p => p.id === player.id);
                        if (freshPlayerForToken) {
                            awardProgramFundingToken(freshPlayerForToken, 'Reached mountain summit!');
                        }
                    }

                    // Phase 5: Draw/Resolve Cards
                    // Get fresh player data with updated position for card drawing
                    const freshPlayerForCards = gameState.players.find(p => p.id === player.id);
                    if (freshPlayerForCards) {
                        const shouldDrawCard = determineShouldDrawCard({ ...freshPlayerForCards, position: finalPosition });
                        if (shouldDrawCard.draw) {
                            // For human player, show immediate notification about landing on card square
                            if (player.id === 0) {
                                const squareType = BOARD_CONFIG.folderSquares.includes(finalPosition)
                                    ? 'folder square'
                                    : BOARD_CONFIG.mountains[finalPosition]
                                        ? `${BOARD_CONFIG.mountains[finalPosition].name} (mountain)`
                                        : BOARD_CONFIG.valleys[finalPosition]
                                            ? `${BOARD_CONFIG.valleys[finalPosition].name} (valley)`
                                            : 'card-drawing square';

                                addToLog(`📍 ${player.name} lands on ${squareType} - drawing from ${shouldDrawCard.deckType} deck!`);

                                // Draw and show card immediately for human player notification
                                const card = drawCard(shouldDrawCard.deckType!);
                                if (card) {
                                    console.log(`Player ${player.name} (ID: ${player.id}) drawing card: ${card.title}`);
                                    addToLog(`${player.name} draws: "${card.title}"`);

                                    // Show notification popup immediately for human player
                                    updateGameState({ lastCardDrawn: card });

                                    // Add delay before resolving effects to let player read the card
                                    setTimeout(() => {
                                        resolveCard(card, { ...freshPlayerForCards, position: finalPosition });
                                    }, 2000); // 2 second delay for human player
                                }
                            } else {
                                // For NPCs, just draw and resolve immediately without notification popup
                                const card = drawCard(shouldDrawCard.deckType!);
                                if (card) {
                                    console.log(`Player ${player.name} (ID: ${player.id}) drawing card: ${card.title}`);
                                    addToLog(`${player.name} draws: "${card.title}"`);

                                    // NPCs don't trigger notification popup, but still set lastCardDrawn for game state
                                    updateGameState({ lastCardDrawn: card });

                                    // Resolve immediately for NPCs
                                    setTimeout(() => {
                                        resolveCard(card, { ...freshPlayerForCards, position: finalPosition });
                                    }, 100);
                                }
                            }
                        }
                    }
                }
            }

            // Phase 6: Token Actions (skipped in auto mode)
            // Phase 7: End Turn
            const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
            updateGameState({
                currentPlayerIndex: nextPlayerIndex,
                gamePhase: 'penalty_upkeep',
                diceValue: 0  // Clear dice for next player
            });
        };

        executeCompleteTurn();
    }, [gameState]);

    // Start new game
    const newGame = useCallback(() => {
        // Reset to clean initial state
        const cleanState: GameState = {
            players: [],
            currentPlayerIndex: 0,
            isGameActive: false,
            diceValue: 0, // Ensure dice starts at 0
            decks: createGameDecks(),
            gamePhase: 'penalty_upkeep'
        };

        setGameState(cleanState);
        setWinner(null);
        setCanDispute(false);
        setLastMove(null);
        setGameLog([]);
    }, []);

    // Each visitor gets their own unique game session (no localStorage sharing)
    const saveGameState = (state: GameState) => {
        // Games are now unique per browser session, no persistent storage
        // This ensures each visitor gets their own game
    };

    // No loading from localStorage - each session starts fresh
    const loadGameState = useCallback(() => {
        // Each visitor starts with a clean slate
    }, []);

    // Legal dispute mechanism
    const disputeWin = useCallback(() => {
        if (!winner || !canDispute) return false;

        addToLog(`⚖️ LEGAL DISPUTE: Challenging ${winner.name}'s victory in court...`);

        // Roll 10d10
        const rolls: number[] = [];
        let total = 0;
        for (let i = 0; i < 10; i++) {
            const roll = Math.floor(Math.random() * 10) + 1;
            rolls.push(roll);
            total += roll;
        }

        addToLog(`🎲 COURT ROLLS: [${rolls.join(', ')}] = ${total}/1000`);

        if (total > 800) {
            // Dispute successful
            addToLog(`⚖️ DISPUTE SUCCESSFUL! ${winner.name} is moved back 50 spaces due to legal complications.`);

            const newPosition = Math.max(1, winner.position - 50);
            updatePlayerData(winner.id, { position: newPosition });

            // Resume game
            setWinner(null);
            setCanDispute(false);
            updateGameState({ isGameActive: true });

            addToLog(`🎮 GAME RESUMED: ${winner.name} continues from position ${newPosition}.`);
            return true;
        } else {
            // Dispute failed
            addToLog(`⚖️ DISPUTE FAILED: Court ruled in favor of ${winner.name}. Victory stands.`);
            setCanDispute(false);
            return false;
        }
    }, [winner, canDispute, gameState.players]);

    // No need to load saved game on mount
    useEffect(() => {
        // Each session starts fresh
    }, []);

    return {
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
        currentPlayer: gameState.players[gameState.currentPlayerIndex],
        isGameActive: gameState.isGameActive
    };
}; 