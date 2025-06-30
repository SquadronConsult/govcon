import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GameState, BoardConfig, SquareInfo, ElevationZone, SVGBoardProps } from '@/types/game';
import { BOARD_CONFIG, ELEVATION_ZONES, PLAYER_COLORS, SVG_CONFIG } from '@/constants/gameConfig';

export const SVGBoard: React.FC<SVGBoardProps> = ({ gameState, boardConfig, onSquareClick }) => {
    const BOARD_SIZE = SVG_CONFIG.boardSize;
    const SQUARE_SIZE = SVG_CONFIG.squareSize;
    const MARGIN = SVG_CONFIG.margin;

    // Helper function to get elevation zone for a square
    const getElevationZone = (squareNumber: number): ElevationZone => {
        if (squareNumber <= 20) return 'valley';
        if (squareNumber <= 40) return 'mountain-1';
        if (squareNumber <= 60) return 'funding-valley';
        if (squareNumber <= 80) return 'mountain-2';
        return 'deployment-plateau';
    };

    // Convert square number to board coordinates (snake pattern)
    const getSquarePosition = (squareNumber: number): { x: number; y: number } => {
        const index = squareNumber - 1;
        const row = Math.floor(index / 10);
        const col = index % 10;

        // Snake pattern: odd rows go right-to-left
        const actualCol = row % 2 === 0 ? col : 9 - col;

        return {
            x: MARGIN + actualCol * SQUARE_SIZE,
            y: MARGIN + (9 - row) * SQUARE_SIZE // Flip Y so 1 is at bottom
        };
    };

    // Generate square info for all board squares
    const squares: SquareInfo[] = useMemo(() => {
        const result: SquareInfo[] = [];
        for (let i = 1; i <= BOARD_CONFIG.size; i++) {
            const zone = getElevationZone(i);
            const isMountain = !!BOARD_CONFIG.mountains[i];
            const isValley = !!BOARD_CONFIG.valleys[i];

            result.push({
                number: i,
                zone,
                isSpecial: isMountain || isValley,
                specialType: isMountain ? 'mountain' : isValley ? 'valley' : undefined,
                specialData: BOARD_CONFIG.mountains[i] || BOARD_CONFIG.valleys[i]
            });
        }
        return result;
    }, []);

    // Get zone color for styling
    const getZoneColor = (zone: ElevationZone): string => {
        const colors = {
            'valley': '#8B4513',
            'mountain-1': '#A0522D',
            'funding-valley': '#654321',
            'mountain-2': '#D2B48C',
            'deployment-plateau': '#F5F5DC'
        };
        return colors[zone];
    };

    // Draw mountains (ladders)
    const renderMountains = () => {
        return Object.entries(BOARD_CONFIG.mountains).map(([from, data]) => {
            const fromPos = getSquarePosition(parseInt(from));
            const toPos = getSquarePosition(data.to);

            const fromX = fromPos.x + SQUARE_SIZE / 2;
            const fromY = fromPos.y + SQUARE_SIZE / 2;
            const toX = toPos.x + SQUARE_SIZE / 2;
            const toY = toPos.y + SQUARE_SIZE / 2;

            // Create mountain path with peaks
            const midX = (fromX + toX) / 2;
            const midY = (fromY + toY) / 2;
            const angle = Math.atan2(toY - fromY, toX - fromX);
            const perpAngle = angle - Math.PI / 2;
            const peakHeight = 15;

            // Create mountain silhouette
            const peak1X = midX + Math.cos(perpAngle) * peakHeight;
            const peak1Y = midY + Math.sin(perpAngle) * peakHeight;

            const pathData = `M ${fromX},${fromY} L ${peak1X},${peak1Y} L ${toX},${toY} Z`;

            return (
                <g key={`mountain-${from}`}>
                    {/* Mountain shape */}
                    <path
                        d={pathData}
                        fill="url(#mountainGradient)"
                        stroke="#1565C0"
                        strokeWidth="2"
                        opacity="0.8"
                    />
                    {/* Arrow indicating direction */}
                    <path
                        d={`M ${toX - 8},${toY - 3} L ${toX},${toY} L ${toX - 8},${toY + 3}`}
                        stroke="#1565C0"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                    />
                </g>
            );
        });
    };

    // Draw valleys (chutes)  
    const renderValleys = () => {
        return Object.entries(BOARD_CONFIG.valleys).map(([from, data]) => {
            const fromPos = getSquarePosition(parseInt(from));
            const toPos = getSquarePosition(data.to);

            const fromX = fromPos.x + SQUARE_SIZE / 2;
            const fromY = fromPos.y + SQUARE_SIZE / 2;
            const toX = toPos.x + SQUARE_SIZE / 2;
            const toY = toPos.y + SQUARE_SIZE / 2;

            // Create curved chute path
            const midX = (fromX + toX) / 2;
            const midY = (fromY + toY) / 2 + 20; // Curve downward

            const pathData = `M ${fromX},${fromY} Q ${midX},${midY} ${toX},${toY}`;

            return (
                <g key={`valley-${from}`}>
                    {/* Chute curve */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="url(#valleyGradient)"
                        strokeWidth="8"
                        opacity="0.8"
                    />
                    {/* Arrow indicating direction */}
                    <path
                        d={`M ${toX - 8},${toY - 3} L ${toX},${toY} L ${toX - 8},${toY + 3}`}
                        stroke="#8B4513"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                    />
                </g>
            );
        });
    };

    // Render player pieces
    const renderPlayers = () => {
        return gameState.players.map((player, index) => {
            const position = getSquarePosition(player.position);

            // Offset multiple players on same square
            const playersOnSquare = gameState.players.filter(p => p.position === player.position);
            const playerIndex = playersOnSquare.findIndex(p => p.id === player.id);
            const offsetX = (playerIndex - (playersOnSquare.length - 1) / 2) * 12;

            const x = position.x + SQUARE_SIZE / 2 + offsetX;
            const y = position.y + SQUARE_SIZE / 2;

            return (
                <motion.circle
                    key={player.id}
                    cx={x}
                    cy={y}
                    r={SVG_CONFIG.playerRadius}
                    fill={PLAYER_COLORS[player.color as keyof typeof PLAYER_COLORS] || '#ff0000'}
                    stroke="#ffffff"
                    strokeWidth="3"
                    animate={{ cx: x, cy: y }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}
                />
            );
        });
    };

    return (
        <div className="svg-board-container">
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
                style={{
                    minHeight: '600px',
                    maxHeight: 'min(85vh, 1000px)',
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '1/1',
                    border: '3px solid #2c3e50',
                    borderRadius: '8px'
                }}
            >
                {/* Gradients */}
                <defs>
                    <linearGradient id="mountainGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#1565C0" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#42A5F5" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#E3F2FD" stopOpacity="0.9" />
                    </linearGradient>

                    <linearGradient id="valleyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8d6e63" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#6d4c41" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#3e2723" stopOpacity="0.8" />
                    </linearGradient>

                    {/* Zone gradients */}
                    <linearGradient id="valleyZone" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B4513" />
                        <stop offset="100%" stopColor="#A0522D" />
                    </linearGradient>

                    <linearGradient id="mountainZone" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#A0522D" />
                        <stop offset="100%" stopColor="#D2B48C" />
                    </linearGradient>

                    <linearGradient id="plateauZone" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#D2B48C" />
                        <stop offset="100%" stopColor="#F5F5DC" />
                    </linearGradient>
                </defs>

                {/* Board squares */}
                {squares.map((square) => {
                    const pos = getSquarePosition(square.number);
                    const zoneColor = getZoneColor(square.zone);

                    return (
                        <g key={square.number}>
                            {/* Square background */}
                            <rect
                                x={pos.x}
                                y={pos.y}
                                width={SQUARE_SIZE}
                                height={SQUARE_SIZE}
                                fill={square.isSpecial ?
                                    (square.specialType === 'mountain' ? '#E3F2FD' : '#EFEBE9') :
                                    zoneColor
                                }
                                stroke="#2c3e50"
                                strokeWidth="1"
                                opacity="0.9"
                                onClick={() => onSquareClick?.(square.number)}
                                style={{ cursor: onSquareClick ? 'pointer' : 'default' }}
                            />

                            {/* Folder icon for folder squares */}
                            {BOARD_CONFIG.folderSquares.includes(square.number) && (
                                <text
                                    x={pos.x + SQUARE_SIZE / 2}
                                    y={pos.y + 10}
                                    textAnchor="middle"
                                    fontSize="16"
                                    fill="#3498db"
                                >
                                    📁
                                </text>
                            )}

                            {/* Mountain/Valley icons */}
                            {square.specialType === 'mountain' && (
                                <text
                                    x={pos.x + SQUARE_SIZE / 2}
                                    y={pos.y + 10}
                                    textAnchor="middle"
                                    fontSize="16"
                                    fill="#1565C0"
                                >
                                    ⛰️
                                </text>
                            )}

                            {square.specialType === 'valley' && (
                                <text
                                    x={pos.x + SQUARE_SIZE / 2}
                                    y={pos.y + 10}
                                    textAnchor="middle"
                                    fontSize="16"
                                    fill="#8B4513"
                                >
                                    🕳️
                                </text>
                            )}

                            {/* Square number */}
                            <text
                                x={pos.x + SQUARE_SIZE / 2}
                                y={pos.y + SQUARE_SIZE / 2 + 5}
                                textAnchor="middle"
                                fontSize="14"
                                fontWeight="bold"
                                fill={square.number === 1 || square.number === 100 ? '#e74c3c' : '#2c3e50'}
                            >
                                {square.number}
                            </text>

                            {/* Special square labels */}
                            {square.number === 1 && (
                                <text
                                    x={pos.x + SQUARE_SIZE / 2}
                                    y={pos.y + SQUARE_SIZE - 3}
                                    textAnchor="middle"
                                    fontSize="8"
                                    fontWeight="bold"
                                    fill="#e74c3c"
                                >
                                    START
                                </text>
                            )}

                            {square.number === 100 && (
                                <text
                                    x={pos.x + SQUARE_SIZE / 2}
                                    y={pos.y + SQUARE_SIZE - 3}
                                    textAnchor="middle"
                                    fontSize="6"
                                    fontWeight="bold"
                                    fill="#e74c3c"
                                >
                                    PROGRAM OF RECORD
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Mountains and Valleys */}
                {renderMountains()}
                {renderValleys()}

                {/* Player pieces */}
                {renderPlayers()}
            </svg>
        </div>
    );
}; 