export interface Player {
    id: number;
    color: string;
    name: string;
    position: number;
    programFundingTokens: number;
    handCards: EventCard[];
    activePenalties: ActivePenalty[];
    immunities: string[];
}

export interface EventCard {
    id: number;
    title: string;
    effect: string;
    category: CardCategory;
    cardType: CardType;
    playTiming?: PlayTiming;
    diceModifier?: DiceModifier;
    tokenCost?: number;
    skipTurns?: number;
    moveSpaces?: number;
    keepCard?: boolean;
    targetPlayer?: 'self' | 'opponent' | 'all' | 'highest';
    immunities?: string[];
}

export type CardCategory = 'positive' | 'negative' | 'situational' | 'reaction';
export type CardType = 'immediate' | 'persistent' | 'reaction' | 'choice';
export type PlayTiming = 'on_draw' | 'on_move_back' | 'on_skip_turns' | 'on_pay_token' | 'on_negative_card' | 'before_last_square' | 'before_roll';

export interface DiceModifier {
    type: 'use_d4' | 'even_only' | 'five_six_only' | 'doubles_draw_card';
    duration?: number;
    fixCondition?: string;
}

export interface ActivePenalty {
    cardId: number;
    title: string;
    effect: string;
    turnsRemaining?: number;
    diceModifier?: DiceModifier;
    moveRestriction?: 'even_only' | 'five_six_only' | 'use_d4';
    fixCondition?: string;
}

export interface GameDecks {
    positive: EventCard[];
    negative: EventCard[];
    mixed: EventCard[];
    discardPile: EventCard[];
}

export interface GameState {
    players: Player[];
    currentPlayerIndex: number;
    isGameActive: boolean;
    diceValue: number;
    decks: GameDecks;
    lastCardDrawn?: EventCard;
    lastCardEffect?: string;
    pendingChoice?: PendingChoice;
    gamePhase: GamePhase;
}

export type GamePhase = 'penalty_upkeep' | 'roll_dice' | 'move_token' | 'check_landing' | 'draw_resolve_cards' | 'token_actions' | 'end_turn';

export interface PendingChoice {
    type: 'pay_token_or_penalty' | 'discard_card' | 'choose_opponent' | 'roll_percentile';
    cardId: number;
    options: any[];
    playerId: number;
}

export interface SpecialSquare {
    to: number;
    name: string;
    drawFromDeck?: 'positive' | 'negative' | 'mixed';
}

export interface BoardConfig {
    size: number;
    mountains: Record<number, SpecialSquare>;
    valleys: Record<number, SpecialSquare>;
    folderSquares: number[];
}

export interface PlayerConfig {
    color: string;
    name: string;
}

export interface Position {
    x: number;
    y: number;
    z?: number;
}

export interface SVGBoardProps {
    gameState: GameState;
    boardConfig: BoardConfig;
    onSquareClick?: (squareNumber: number) => void;
}

export interface GameControlsProps {
    gameState: GameState;
    onStartGame: (numPlayers: number) => void;
    onRollDice: () => void;
    onNewGame: () => void;
    onPlayCard?: (cardId: number) => void;
    onMakeChoice?: (choice: any) => void;
    onSpendTokens?: (amount: number, targetPenalty?: number) => void;
}

export type ElevationZone = 'valley' | 'mountain-1' | 'funding-valley' | 'mountain-2' | 'deployment-plateau';

export interface SquareInfo {
    number: number;
    zone: ElevationZone;
    isSpecial: boolean;
    specialType?: 'mountain' | 'valley' | 'folder';
    specialData?: SpecialSquare;
} 