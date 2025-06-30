import { BoardConfig, PlayerConfig, SpecialSquare } from '@/types/game';

export const BOARD_SIZE = 100;

export const MOUNTAINS: Record<number, SpecialSquare> = {
    1: { to: 38, name: "Sole Source Justification", drawFromDeck: 'positive' },
    4: { to: 14, name: "Congressional Earmark", drawFromDeck: 'positive' },
    9: { to: 31, name: "Massive Seed Round", drawFromDeck: 'positive' },
    21: { to: 42, name: "DARPA Interest", drawFromDeck: 'positive' },
    28: { to: 84, name: "Pentagon Champion", drawFromDeck: 'positive' },
    36: { to: 44, name: "Aww, your first SBIR", drawFromDeck: 'positive' },
    51: { to: 67, name: "Cost-Plus Contract", drawFromDeck: 'positive' },
    71: { to: 91, name: "Finally got your ATO", drawFromDeck: 'positive' },
    80: { to: 100, name: "Presidential Priority", drawFromDeck: 'positive' }
};

export const VALLEYS: Record<number, SpecialSquare> = {
    16: { to: 6, name: "Protest Filed", drawFromDeck: 'negative' },
    47: { to: 26, name: "The CR Hit", drawFromDeck: 'negative' },
    49: { to: 11, name: "Test Failure", drawFromDeck: 'negative' },
    56: { to: 53, name: "Scope Creep", drawFromDeck: 'negative' },
    62: { to: 19, name: "Incumbent stole your Tech", drawFromDeck: 'negative' },
    64: { to: 60, name: "Requirement Change", drawFromDeck: 'negative' },
    87: { to: 24, name: "Champion Retired", drawFromDeck: 'negative' },
    93: { to: 73, name: "Committee Review", drawFromDeck: 'negative' },
    95: { to: 75, name: "Environmental Impact", drawFromDeck: 'negative' },
    98: { to: 78, name: "DCAA Audit", drawFromDeck: 'negative' }
};

// Folder squares - these trigger mixed deck draws
export const FOLDER_SQUARES: number[] = [
    5, 12, 18, 25, 32, 39, 45, 52, 58, 65, 72, 79, 85, 92, 96
];

export const PLAYER_CONFIGS: PlayerConfig[] = [
    { color: 'player-1', name: 'Program Manager Alpha' },
    { color: 'player-2', name: 'Contractor Bravo' },
    { color: 'player-3', name: 'Deputy Director Charlie' },
    { color: 'player-4', name: 'Chief Engineer Delta' }
];

export const BOARD_CONFIG: BoardConfig = {
    size: BOARD_SIZE,
    mountains: MOUNTAINS,
    valleys: VALLEYS,
    folderSquares: FOLDER_SQUARES
};

// WebGL colors for players
export const PLAYER_COLORS = {
    'player-1': '#e53e3e', // Red
    'player-2': '#3182ce', // Blue  
    'player-3': '#38a169', // Green
    'player-4': '#d69e2e'  // Yellow
};

// Elevation zone configurations
export const ELEVATION_ZONES = {
    valley: { min: 1, max: 20, color: '#8B4513', height: 0.1 },
    'mountain-1': { min: 21, max: 40, color: '#A0522D', height: 0.3 },
    'funding-valley': { min: 41, max: 60, color: '#654321', height: 0.15 },
    'mountain-2': { min: 61, max: 80, color: '#D2B48C', height: 0.4 },
    'deployment-plateau': { min: 81, max: 100, color: '#F5F5DC', height: 0.5 }
};

// SVG rendering constants
export const SVG_CONFIG = {
    boardSize: 500, // SVG viewBox size
    squareSize: 45,
    margin: 25,
    playerRadius: 8
}; 