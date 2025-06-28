// Game state
let gameState = {
    players: [],
    currentPlayerIndex: 0,
    isGameActive: false,
    diceValue: 0
};

// Board configuration
const BOARD_SIZE = 100;
const MOUNTAINS = {
    15: { to: 35, name: "Congressional Champion" },
    28: { to: 52, name: "Pentagon Endorsement" },
    43: { to: 67, name: "Industry Partnership" },
    72: { to: 91, name: "Successful Test" }
};

const VALLEYS = {
    87: { to: 24, name: "Budget Cut" },
    78: { to: 45, name: "Requirements Change" },
    65: { to: 18, name: "Competing Priority" },
    56: { to: 12, name: "Failed Milestone Review" },
    32: { to: 8, name: "Compliance Issue" }
};

// Player colors and names
const PLAYER_CONFIG = [
    { color: 'player-1', name: 'Program Manager Alpha' },
    { color: 'player-2', name: 'Contractor Bravo' },
    { color: 'player-3', name: 'Deputy Director Charlie' },
    { color: 'player-4', name: 'Chief Engineer Delta' }
];

// Initialize game
function initGame() {
    createBoard();
    setupEventListeners();
    loadGameState();
    
    // Redraw connections after a short delay to ensure layout is complete
    setTimeout(() => {
        const svg = document.querySelector('.board svg');
        if (svg) svg.remove();
        addSpecialConnections();
    }, 100);
    
    // Redraw on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const svg = document.querySelector('.board svg');
            if (svg) svg.remove();
            addSpecialConnections();
        }, 100);
    });
}

// Create game board
function createBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    // Create squares in reverse order (100 to 1) for proper snake pattern
    for (let i = BOARD_SIZE; i >= 1; i--) {
        const square = document.createElement('div');
        square.className = 'square';
        square.id = `square-${i}`;
        
        // Add elevation zones
        if (i <= 20) {
            square.classList.add('valley-zone');
        } else if (i <= 40) {
            square.classList.add('mountain-zone-1');
        } else if (i <= 60) {
            square.classList.add('funding-valley');
        } else if (i <= 80) {
            square.classList.add('mountain-zone-2');
        } else {
            square.classList.add('deployment-plateau');
        }
        
        // Mark special squares
        if (MOUNTAINS[i]) {
            square.classList.add('mountain');
            square.setAttribute('data-to', MOUNTAINS[i].to);
        } else if (VALLEYS[i]) {
            square.classList.add('valley');
            square.setAttribute('data-to', VALLEYS[i].to);
        }
        
        // Add square number
        const numberSpan = document.createElement('span');
        numberSpan.className = 'square-number';
        numberSpan.textContent = i;
        square.appendChild(numberSpan);
        
        // Add labels for special squares
        if (MOUNTAINS[i] || VALLEYS[i]) {
            const label = document.createElement('span');
            label.className = 'square-label';
            label.textContent = MOUNTAINS[i]?.name || VALLEYS[i]?.name;
            square.appendChild(label);
        }
        
        // Add START and FINISH labels
        if (i === 1) {
            const startLabel = document.createElement('span');
            startLabel.className = 'square-label start-label';
            startLabel.textContent = 'START';
            square.appendChild(startLabel);
        } else if (i === 100) {
            const finishLabel = document.createElement('span');
            finishLabel.className = 'square-label finish-label';
            finishLabel.textContent = 'DEPLOYMENT!';
            square.appendChild(finishLabel);
        }
        
        board.appendChild(square);
    }
    
    // Rearrange squares for snake pattern
    rearrangeBoardSnakePattern();
    
    // Add visual connections for mountains and valleys
    addSpecialConnections();
}

// Rearrange board in snake pattern
function rearrangeBoardSnakePattern() {
    const board = document.getElementById('gameBoard');
    const squares = Array.from(board.children);
    const rearranged = [];
    
    for (let row = 0; row < 10; row++) {
        const rowSquares = squares.slice(row * 10, (row + 1) * 10);
        if (row % 2 === 0) {
            // Even rows: right to left
            rearranged.push(...rowSquares);
        } else {
            // Odd rows: left to right
            rearranged.push(...rowSquares.reverse());
        }
    }
    
    board.innerHTML = '';
    rearranged.forEach(square => board.appendChild(square));
}

// Add visual connections for special squares
function addSpecialConnections() {
    const board = document.getElementById('gameBoard');
    
    // Create SVG overlay for drawing connections
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '5';
    
    // Draw mountains (ladders)
    Object.entries(MOUNTAINS).forEach(([from, data]) => {
        drawMountain(svg, parseInt(from), data.to);
    });
    
    // Draw valleys (chutes)
    Object.entries(VALLEYS).forEach(([from, data]) => {
        drawValley(svg, parseInt(from), data.to);
    });
    
    board.appendChild(svg);
}

// Draw mountain (upward path) graphic
function drawMountain(svg, fromNum, toNum) {
    const fromSquare = document.getElementById(`square-${fromNum}`);
    const toSquare = document.getElementById(`square-${toNum}`);
    
    if (!fromSquare || !toSquare) return;
    
    const fromRect = fromSquare.getBoundingClientRect();
    const toRect = toSquare.getBoundingClientRect();
    const boardRect = svg.parentElement.getBoundingClientRect();
    
    const fromX = fromRect.left + fromRect.width / 2 - boardRect.left;
    const fromY = fromRect.top + fromRect.height / 2 - boardRect.top;
    const toX = toRect.left + toRect.width / 2 - boardRect.left;
    const toY = toRect.top + toRect.height / 2 - boardRect.top;
    
    // Create mountain group
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Calculate mountain path
    const midX = (fromX + toX) / 2;
    const midY = Math.min(fromY, toY) - 40; // Peak of mountain
    
    // Mountain shape with jagged edges
    const mountain = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const mountainPath = `
        M ${fromX - 30} ${fromY + 10}
        L ${fromX - 20} ${fromY - 5}
        L ${midX - 25} ${midY + 20}
        L ${midX - 10} ${midY + 5}
        L ${midX} ${midY}
        L ${midX + 10} ${midY + 5}
        L ${midX + 25} ${midY + 20}
        L ${toX + 20} ${toY - 5}
        L ${toX + 30} ${toY + 10}
        L ${toX + 15} ${toY}
        L ${toX} ${toY}
        L ${toX - 15} ${toY + 5}
        C ${midX + 10} ${midY + 40}, ${midX - 10} ${midY + 40}, ${fromX + 15} ${fromY + 5}
        L ${fromX} ${fromY}
        Z
    `;
    
    mountain.setAttribute('d', mountainPath);
    mountain.setAttribute('fill', 'url(#mountainGradient' + fromNum + ')');
    mountain.setAttribute('stroke', '#4a6741');
    mountain.setAttribute('stroke-width', '2');
    mountain.setAttribute('opacity', '0.85');
    
    // Create gradient for mountain
    const gradientId = `mountainGradient${fromNum}`;
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '100%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '0%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('style', 'stop-color:#5a8f52;stop-opacity:1');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('style', 'stop-color:#7fa875;stop-opacity:1');
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('style', 'stop-color:#a8c5a2;stop-opacity:1');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    
    // Create defs if it doesn't exist
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);
    }
    defs.appendChild(gradient);
    
    // Add snow cap
    const snowCap = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const snowPath = `
        M ${midX - 10} ${midY + 5}
        L ${midX} ${midY}
        L ${midX + 10} ${midY + 5}
        L ${midX + 5} ${midY + 10}
        L ${midX - 5} ${midY + 10}
        Z
    `;
    snowCap.setAttribute('d', snowPath);
    snowCap.setAttribute('fill', '#ffffff');
    snowCap.setAttribute('opacity', '0.9');
    
    // Add climbing path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const climbPath = `M ${fromX} ${fromY} Q ${midX} ${midY + 20} ${toX} ${toY}`;
    path.setAttribute('d', climbPath);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#ffffff');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-dasharray', '5,5');
    path.setAttribute('opacity', '0.6');
    
    g.appendChild(mountain);
    g.appendChild(snowCap);
    g.appendChild(path);
    
    svg.appendChild(g);
}

// Draw valley (chute) graphic
function drawValley(svg, fromNum, toNum) {
    const fromSquare = document.getElementById(`square-${fromNum}`);
    const toSquare = document.getElementById(`square-${toNum}`);
    
    if (!fromSquare || !toSquare) return;
    
    const fromRect = fromSquare.getBoundingClientRect();
    const toRect = toSquare.getBoundingClientRect();
    const boardRect = svg.parentElement.getBoundingClientRect();
    
    const fromX = fromRect.left + fromRect.width / 2 - boardRect.left;
    const fromY = fromRect.top + fromRect.height / 2 - boardRect.top;
    const toX = toRect.left + toRect.width / 2 - boardRect.left;
    const toY = toRect.top + toRect.height / 2 - boardRect.top;
    
    // Create curved slide path
    const slideWidth = 35;
    
    // Calculate the curve based on distance
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const curveFactor = Math.min(distance * 0.3, 100);
    
    // Determine curve direction based on relative positions
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const perpAngle = angle + Math.PI / 2;
    
    // Control points for a smooth S-curve
    const cp1X = fromX + Math.cos(perpAngle) * curveFactor;
    const cp1Y = fromY + Math.sin(perpAngle) * curveFactor;
    const cp2X = toX - Math.cos(perpAngle) * curveFactor;
    const cp2Y = toY - Math.sin(perpAngle) * curveFactor;
    
    // Main slide path
    const slide = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const centerPath = `M ${fromX} ${fromY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${toX} ${toY}`;
    
    // Create offset paths for slide edges
    const perpX = -Math.sin(angle) * slideWidth / 2;
    const perpY = Math.cos(angle) * slideWidth / 2;
    
    const slidePath = `M ${fromX - perpX} ${fromY - perpY} 
                       C ${cp1X - perpX} ${cp1Y - perpY}, ${cp2X - perpX} ${cp2Y - perpY}, ${toX - perpX} ${toY - perpY}
                       L ${toX + perpX} ${toY + perpY}
                       C ${cp2X + perpX} ${cp2Y + perpY}, ${cp1X + perpX} ${cp1Y + perpY}, ${fromX + perpX} ${fromY + perpY}
                       Z`;
    
    slide.setAttribute('d', slidePath);
    slide.setAttribute('fill', '#E85D5D');
    slide.setAttribute('stroke', '#C41E1E');
    slide.setAttribute('stroke-width', '2');
    slide.setAttribute('opacity', '0.85');
    
    // Add slide gradient
    const gradientId = `slideGradient${fromNum}`;
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('style', 'stop-color:#FF6B6B;stop-opacity:1');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('style', 'stop-color:#E85D5D;stop-opacity:1');
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('style', 'stop-color:#C41E1E;stop-opacity:1');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    
    // Create defs if it doesn't exist
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);
    }
    defs.appendChild(gradient);
    
    slide.setAttribute('fill', `url(#${gradientId})`);
    
    // Add center line for visual effect
    const centerLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const centerPath = `M ${fromX} ${fromY} 
                        C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${toX} ${toY}`;
    centerLine.setAttribute('d', centerPath);
    centerLine.setAttribute('fill', 'none');
    centerLine.setAttribute('stroke', '#A41010');
    centerLine.setAttribute('stroke-width', '2');
    centerLine.setAttribute('stroke-dasharray', '5,5');
    centerLine.setAttribute('opacity', '0.5');
    
    svg.appendChild(slide);
    svg.appendChild(centerLine);
}

// Setup event listeners
function setupEventListeners() {
    // Player selection
    document.querySelectorAll('.player-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const playerCount = parseInt(e.target.dataset.players);
            startNewGame(playerCount);
        });
    });
    
    // Dice roll
    document.getElementById('rollDice').addEventListener('click', rollDice);
    
    // New game button
    document.getElementById('newGameBtn').addEventListener('click', resetGame);
}

// Start new game
function startNewGame(playerCount) {
    gameState.players = [];
    gameState.currentPlayerIndex = 0;
    gameState.isGameActive = true;
    
    // Initialize players
    for (let i = 0; i < playerCount; i++) {
        gameState.players.push({
            id: i,
            name: PLAYER_CONFIG[i].name,
            position: 0,
            color: PLAYER_CONFIG[i].color
        });
    }
    
    // Hide setup, show game
    document.getElementById('playerSetup').classList.add('hidden');
    document.getElementById('gameStatus').classList.remove('hidden');
    
    // Create player pieces
    createPlayerPieces();
    updateCurrentPlayer();
    saveGameState();
}

// Create player pieces on board
function createPlayerPieces() {
    // Remove existing pieces
    document.querySelectorAll('.player-piece').forEach(piece => piece.remove());
    
    // Create new pieces
    gameState.players.forEach(player => {
        const piece = document.createElement('div');
        piece.className = `player-piece ${player.color}`;
        piece.id = `player-${player.id}`;
        piece.textContent = player.id + 1;
        
        // Position at start
        positionPlayerPiece(player.id, 0);
        document.getElementById('gameBoard').appendChild(piece);
    });
}

// Position player piece
function positionPlayerPiece(playerId, position) {
    const piece = document.getElementById(`player-${playerId}`);
    if (!piece) return;
    
    if (position === 0) {
        // Position at start (outside board)
        piece.style.left = '-40px';
        piece.style.top = '50%';
    } else {
        // Position on square
        const square = document.getElementById(`square-${position}`);
        if (square) {
            const rect = square.getBoundingClientRect();
            const boardRect = document.getElementById('gameBoard').getBoundingClientRect();
            
            // Calculate offset for multiple players on same square
            const playersOnSquare = gameState.players.filter(p => p.position === position);
            const playerIndex = playersOnSquare.findIndex(p => p.id === playerId);
            const offsetX = (playerIndex % 2) * 15 - 7.5;
            const offsetY = Math.floor(playerIndex / 2) * 15 - 7.5;
            
            piece.style.left = `${rect.left - boardRect.left + rect.width/2 - 15 + offsetX}px`;
            piece.style.top = `${rect.top - boardRect.top + rect.height/2 - 15 + offsetY}px`;
        }
    }
}

// Update current player display
function updateCurrentPlayer() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    document.getElementById('currentPlayerName').textContent = currentPlayer.name;
}

// Roll dice
function rollDice() {
    if (!gameState.isGameActive) return;
    
    const dice = document.getElementById('dice');
    const diceBtn = document.getElementById('rollDice');
    
    // Disable button during roll
    diceBtn.disabled = true;
    dice.classList.add('rolling');
    
    // Animate dice
    let rollCount = 0;
    const rollInterval = setInterval(() => {
        dice.querySelector('.dice-value').textContent = Math.floor(Math.random() * 6) + 1;
        rollCount++;
        
        if (rollCount > 10) {
            clearInterval(rollInterval);
            
            // Final value
            gameState.diceValue = Math.floor(Math.random() * 6) + 1;
            dice.querySelector('.dice-value').textContent = gameState.diceValue;
            dice.classList.remove('rolling');
            
            // Move player
            moveCurrentPlayer();
        }
    }, 100);
}

// Move current player
function moveCurrentPlayer() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const targetPosition = Math.min(currentPlayer.position + gameState.diceValue, BOARD_SIZE);
    
    // Animate movement
    animatePlayerMovement(currentPlayer.id, currentPlayer.position, targetPosition, () => {
        currentPlayer.position = targetPosition;
        
        // Check for mountains or valleys
        checkSpecialSquare(currentPlayer);
        
        // Check for win
        if (currentPlayer.position === BOARD_SIZE) {
            endGame(currentPlayer);
        } else {
            // Next turn
            nextTurn();
        }
        
        saveGameState();
    });
}

// Animate player movement
function animatePlayerMovement(playerId, fromPos, toPos, callback) {
    const piece = document.getElementById(`player-${playerId}`);
    piece.classList.add('moving');
    
    let currentPos = fromPos;
    const moveInterval = setInterval(() => {
        currentPos++;
        positionPlayerPiece(playerId, currentPos);
        
        if (currentPos >= toPos) {
            clearInterval(moveInterval);
            piece.classList.remove('moving');
            callback();
        }
    }, 200);
}

// Check for special squares
function checkSpecialSquare(player) {
    const position = player.position;
    let specialMove = null;
    
    if (MOUNTAINS[position]) {
        specialMove = MOUNTAINS[position];
        showTurnInfo(`${specialMove.name}! Climbing to square ${specialMove.to}!`, 'success');
    } else if (VALLEYS[position]) {
        specialMove = VALLEYS[position];
        showTurnInfo(`${specialMove.name}! Falling to square ${specialMove.to}!`, 'danger');
    }
    
    if (specialMove) {
        setTimeout(() => {
            animatePlayerMovement(player.id, position, specialMove.to, () => {
                player.position = specialMove.to;
                positionPlayerPiece(player.id, specialMove.to);
            });
        }, 1500);
    }
}

// Show turn info
function showTurnInfo(message, type = 'info') {
    const turnInfo = document.getElementById('turnInfo');
    turnInfo.textContent = message;
    turnInfo.className = `turn-info ${type}`;
    
    setTimeout(() => {
        turnInfo.textContent = '';
    }, 3000);
}

// Next turn
function nextTurn() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    updateCurrentPlayer();
    document.getElementById('rollDice').disabled = false;
}

// End game
function endGame(winner) {
    gameState.isGameActive = false;
    document.getElementById('winPlayer').textContent = `${winner.name} wins!`;
    document.getElementById('winOverlay').classList.remove('hidden');
}

// Reset game
function resetGame() {
    gameState = {
        players: [],
        currentPlayerIndex: 0,
        isGameActive: false,
        diceValue: 0
    };
    
    document.getElementById('playerSetup').classList.remove('hidden');
    document.getElementById('gameStatus').classList.add('hidden');
    document.getElementById('winOverlay').classList.add('hidden');
    document.getElementById('dice').querySelector('.dice-value').textContent = '?';
    
    // Remove player pieces
    document.querySelectorAll('.player-piece').forEach(piece => piece.remove());
    
    saveGameState();
}

// Save game state to localStorage
function saveGameState() {
    localStorage.setItem('bureaucraticMountainsGameState', JSON.stringify(gameState));
}

// Load game state from localStorage
function loadGameState() {
    const savedState = localStorage.getItem('bureaucraticMountainsGameState');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            if (parsed.isGameActive && parsed.players.length > 0) {
                gameState = parsed;
                
                // Restore game UI
                document.getElementById('playerSetup').classList.add('hidden');
                document.getElementById('gameStatus').classList.remove('hidden');
                
                // Recreate player pieces
                createPlayerPieces();
                gameState.players.forEach(player => {
                    positionPlayerPiece(player.id, player.position);
                });
                
                updateCurrentPlayer();
            }
        } catch (e) {
            console.error('Failed to load game state:', e);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGame);