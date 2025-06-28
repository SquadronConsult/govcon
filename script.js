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
    
    // Draw connections after board is ready
    setTimeout(() => {
        drawBoardConnections();
    }, 100);
    
    // Redraw on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            drawBoardConnections();
        }, 100);
    });
    
    loadGameState();
}

// Draw board connections
function drawBoardConnections() {
    requestAnimationFrame(() => {
        addSpecialConnections();
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
        
        // Create background layer
        const bgLayer = document.createElement('div');
        bgLayer.className = 'square-background';
        
        // Add elevation zones to background layer
        if (i <= 20) {
            bgLayer.classList.add('valley-zone');
        } else if (i <= 40) {
            bgLayer.classList.add('mountain-zone-1');
        } else if (i <= 60) {
            bgLayer.classList.add('funding-valley');
        } else if (i <= 80) {
            bgLayer.classList.add('mountain-zone-2');
        } else {
            bgLayer.classList.add('deployment-plateau');
        }
        
        // Create content layer
        const contentLayer = document.createElement('div');
        contentLayer.className = 'square-content';
        
        // Mark special squares
        if (MOUNTAINS[i]) {
            contentLayer.classList.add('mountain');
            square.setAttribute('data-to', MOUNTAINS[i].to);
        } else if (VALLEYS[i]) {
            contentLayer.classList.add('valley');
            square.setAttribute('data-to', VALLEYS[i].to);
        }
        
        // Add square number
        const numberSpan = document.createElement('span');
        numberSpan.className = 'square-number';
        numberSpan.textContent = i;
        contentLayer.appendChild(numberSpan);
        
        // Add labels for special squares
        if (i === 1) {
            const label = document.createElement('div');
            label.className = 'square-label start-label';
            label.textContent = 'START';
            contentLayer.appendChild(label);
        } else if (i === 100) {
            const label = document.createElement('div');
            label.className = 'square-label finish-label';
            label.textContent = 'DEPLOYMENT';
            contentLayer.appendChild(label);
        } else if (MOUNTAINS[i]) {
            const label = document.createElement('div');
            label.className = 'square-label';
            label.textContent = MOUNTAINS[i].name;
            contentLayer.appendChild(label);
        } else if (VALLEYS[i]) {
            const label = document.createElement('div');
            label.className = 'square-label';
            label.textContent = VALLEYS[i].name;
            contentLayer.appendChild(label);
        }
        
        // Append layers to square
        square.appendChild(bgLayer);
        square.appendChild(contentLayer);
        board.appendChild(square);
    }
    
    // Rearrange squares for snake pattern
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
    const boardWrapper = document.querySelector('.board-wrapper');
    
    if (!board || !boardWrapper) {
        console.error('Board or wrapper not found');
        return;
    }
    
    // Remove any existing SVG
    const existingSvg = boardWrapper.querySelector('.mountains-valleys-svg');
    if (existingSvg) {
        existingSvg.remove();
    }
    
    // Create SVG overlay
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('mountains-valleys-svg');
    
    // Get exact board dimensions and position
    const boardRect = board.getBoundingClientRect();
    const wrapperRect = boardWrapper.getBoundingClientRect();
    
    // Position SVG to overlay the board exactly
    svg.style.position = 'absolute';
    svg.style.left = (boardRect.left - wrapperRect.left) + 'px';
    svg.style.top = (boardRect.top - wrapperRect.top) + 'px';
    svg.style.width = boardRect.width + 'px';
    svg.style.height = boardRect.height + 'px';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '1'; // Between background and content layers
    
    // Set viewBox to match board dimensions
    svg.setAttribute('viewBox', `0 0 ${boardRect.width} ${boardRect.height}`);
    
    // Create defs for gradients and patterns
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);
    
    // Create mountain gradient - blue to light blue to white
    const mountainGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    mountainGradient.setAttribute('id', 'mountainGradient');
    mountainGradient.setAttribute('x1', '0%');
    mountainGradient.setAttribute('y1', '100%');
    mountainGradient.setAttribute('x2', '0%');
    mountainGradient.setAttribute('y2', '0%');
    
    const mStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    mStop1.setAttribute('offset', '0%');
    mStop1.setAttribute('style', 'stop-color:#1565C0;stop-opacity:0.9');
    
    const mStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    mStop2.setAttribute('offset', '50%');
    mStop2.setAttribute('style', 'stop-color:#42A5F5;stop-opacity:0.8');
    
    const mStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    mStop3.setAttribute('offset', '75%');
    mStop3.setAttribute('style', 'stop-color:#90CAF9;stop-opacity:0.7');
    
    const mStop4 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    mStop4.setAttribute('offset', '100%');
    mStop4.setAttribute('style', 'stop-color:#ffffff;stop-opacity:0.9');
    
    mountainGradient.appendChild(mStop1);
    mountainGradient.appendChild(mStop2);
    mountainGradient.appendChild(mStop3);
    mountainGradient.appendChild(mStop4);
    defs.appendChild(mountainGradient);
    
    // Create valley gradient
    const valleyGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    valleyGradient.setAttribute('id', 'valleyGradient');
    valleyGradient.setAttribute('x1', '0%');
    valleyGradient.setAttribute('y1', '0%');
    valleyGradient.setAttribute('x2', '0%');
    valleyGradient.setAttribute('y2', '100%');
    
    const vStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    vStop1.setAttribute('offset', '0%');
    vStop1.setAttribute('style', 'stop-color:#8d6e63;stop-opacity:0.6');
    
    const vStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    vStop2.setAttribute('offset', '50%');
    vStop2.setAttribute('style', 'stop-color:#6d4c41;stop-opacity:0.7');
    
    const vStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    vStop3.setAttribute('offset', '100%');
    vStop3.setAttribute('style', 'stop-color:#3e2723;stop-opacity:0.8');
    
    valleyGradient.appendChild(vStop1);
    valleyGradient.appendChild(vStop2);
    valleyGradient.appendChild(vStop3);
    defs.appendChild(valleyGradient);
    
    // Draw connections
    drawMountainConnections(svg, board, boardRect);
    drawValleyConnections(svg, board, boardRect);
    
    // Append SVG to wrapper
    boardWrapper.appendChild(svg);
}

// Draw mountain connections
function drawMountainConnections(svg, board, boardRect) {
    Object.entries(MOUNTAINS).forEach(([from, data]) => {
        const fromSquare = document.getElementById(`square-${from}`);
        const toSquare = document.getElementById(`square-${data.to}`);
        
        if (fromSquare && toSquare) {
            drawMountainPath(svg, fromSquare, toSquare, boardRect);
        }
    });
}

// Draw valley connections
function drawValleyConnections(svg, board, boardRect) {
    Object.entries(VALLEYS).forEach(([from, data]) => {
        const fromSquare = document.getElementById(`square-${from}`);
        const toSquare = document.getElementById(`square-${data.to}`);
        
        if (fromSquare && toSquare) {
            drawValleyPath(svg, fromSquare, toSquare, boardRect);
        }
    });
}

// Draw mountain path
function drawMountainPath(svg, fromSquare, toSquare, boardRect) {
    const fromRect = fromSquare.getBoundingClientRect();
    const toRect = toSquare.getBoundingClientRect();
    
    const fromX = (fromRect.left - boardRect.left) + fromRect.width / 2;
    const fromY = (fromRect.top - boardRect.top) + fromRect.height / 2;
    const toX = (toRect.left - boardRect.left) + toRect.width / 2;
    const toY = (toRect.top - boardRect.top) + toRect.height / 2;
    
    // Create group for mountain
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('opacity', '0.85');
    
    // Calculate mountain shape
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const perpAngle = angle - Math.PI / 2;
    const pathWidth = 35;
    
    // Create clean mountain silhouette
    const mountain = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Calculate peak point
    const peakX = midX + Math.cos(perpAngle) * pathWidth * 0.8;
    const peakY = midY + Math.sin(perpAngle) * pathWidth * 0.8 - 20;
    
    // Create simple mountain shape with clean edges
    const mountainPath = `
        M ${fromX},${fromY}
        L ${fromX + Math.cos(perpAngle) * pathWidth * 0.3},${fromY + Math.sin(perpAngle) * pathWidth * 0.3}
        L ${midX - (toX - fromX) * 0.2 + Math.cos(perpAngle) * pathWidth * 0.6},${midY - (toY - fromY) * 0.2 + Math.sin(perpAngle) * pathWidth * 0.6}
        L ${peakX},${peakY}
        L ${midX + (toX - fromX) * 0.2 + Math.cos(perpAngle) * pathWidth * 0.6},${midY + (toY - fromY) * 0.2 + Math.sin(perpAngle) * pathWidth * 0.6}
        L ${toX + Math.cos(perpAngle) * pathWidth * 0.3},${toY + Math.sin(perpAngle) * pathWidth * 0.3}
        L ${toX},${toY}
        Z
    `;
    
    mountain.setAttribute('d', mountainPath);
    mountain.setAttribute('fill', 'url(#mountainGradient)');
    mountain.setAttribute('stroke', '#1565C0');
    mountain.setAttribute('stroke-width', '1');
    mountain.setAttribute('stroke-opacity', '0.5');
    
    g.appendChild(mountain);
    
    // Add subtle ridge line
    const ridge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const ridgePath = `
        M ${fromX},${fromY}
        L ${peakX},${peakY}
        L ${toX},${toY}
    `;
    ridge.setAttribute('d', ridgePath);
    ridge.setAttribute('stroke', 'rgba(255, 255, 255, 0.3)');
    ridge.setAttribute('stroke-width', '1');
    ridge.setAttribute('fill', 'none');
    
    g.appendChild(ridge);
    
    svg.appendChild(g);
}


// Draw valley path
function drawValleyPath(svg, fromSquare, toSquare, boardRect) {
    const fromRect = fromSquare.getBoundingClientRect();
    const toRect = toSquare.getBoundingClientRect();
    
    const fromX = (fromRect.left - boardRect.left) + fromRect.width / 2;
    const fromY = (fromRect.top - boardRect.top) + fromRect.height / 2;
    const toX = (toRect.left - boardRect.left) + toRect.width / 2;
    const toY = (toRect.top - boardRect.top) + toRect.height / 2;
    
    // Create group for valley
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('opacity', '0.85');
    
    // Calculate valley shape
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const perpAngle = angle + Math.PI / 2;
    const pathWidth = 35;
    
    // Create clean valley/canyon shape
    const valley = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Calculate canyon depth point
    const canyonX = midX + Math.cos(perpAngle) * pathWidth * 0.8;
    const canyonY = midY + Math.sin(perpAngle) * pathWidth * 0.8 + 15;
    
    // Create simple canyon shape with clean edges
    const valleyPath = `
        M ${fromX},${fromY}
        L ${fromX + Math.cos(perpAngle) * pathWidth * 0.3},${fromY + Math.sin(perpAngle) * pathWidth * 0.3}
        L ${midX - (toX - fromX) * 0.2 + Math.cos(perpAngle) * pathWidth * 0.6},${midY - (toY - fromY) * 0.2 + Math.sin(perpAngle) * pathWidth * 0.6}
        L ${canyonX},${canyonY}
        L ${midX + (toX - fromX) * 0.2 + Math.cos(perpAngle) * pathWidth * 0.6},${midY + (toY - fromY) * 0.2 + Math.sin(perpAngle) * pathWidth * 0.6}
        L ${toX + Math.cos(perpAngle) * pathWidth * 0.3},${toY + Math.sin(perpAngle) * pathWidth * 0.3}
        L ${toX},${toY}
        Z
    `;
    
    valley.setAttribute('d', valleyPath);
    valley.setAttribute('fill', 'url(#valleyGradient)');
    valley.setAttribute('stroke', '#5d4037');
    valley.setAttribute('stroke-width', '1');
    valley.setAttribute('stroke-opacity', '0.5');
    
    g.appendChild(valley);
    
    // Add subtle sedimentary lines
    for (let i = 0; i < 3; i++) {
        const strata = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const t = 0.3 + i * 0.2;
        const strataY = fromY + (toY - fromY) * t;
        const strataX = fromX + (toX - fromX) * t;
        
        const strataPath = `
            M ${strataX + Math.cos(perpAngle) * pathWidth * 0.2},${strataY + Math.sin(perpAngle) * pathWidth * 0.2}
            L ${strataX + Math.cos(perpAngle) * pathWidth * 0.6},${strataY + Math.sin(perpAngle) * pathWidth * 0.6}
        `;
        strata.setAttribute('d', strataPath);
        strata.setAttribute('stroke', 'rgba(93, 64, 55, 0.3)');
        strata.setAttribute('stroke-width', '1');
        strata.setAttribute('fill', 'none');
        g.appendChild(strata);
    }
    
    // Add canyon depth line
    const depthLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const depthPath = `
        M ${fromX},${fromY}
        L ${canyonX},${canyonY}
        L ${toX},${toY}
    `;
    depthLine.setAttribute('d', depthPath);
    depthLine.setAttribute('stroke', 'rgba(62, 39, 35, 0.3)');
    depthLine.setAttribute('stroke-width', '1');
    depthLine.setAttribute('fill', 'none');
    
    g.appendChild(depthLine);
    
    svg.appendChild(g);
}



// Setup event listeners
function setupEventListeners() {
    // Player selection buttons
    const playerBtns = document.querySelectorAll('.player-btn');
    playerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const numPlayers = parseInt(e.target.dataset.players);
            startNewGame(numPlayers);
        });
    });
    
    // Roll dice button
    const rollBtn = document.getElementById('rollDice');
    rollBtn.addEventListener('click', rollDice);
    
    // New game button
    const newGameBtn = document.getElementById('newGameBtn');
    newGameBtn.addEventListener('click', () => {
        location.reload();
    });
}

// Start new game
function startNewGame(numPlayers) {
    gameState.players = [];
    for (let i = 0; i < numPlayers; i++) {
        gameState.players.push({
            id: i,
            name: PLAYER_CONFIG[i].name,
            color: PLAYER_CONFIG[i].color,
            position: 0,
            element: null
        });
    }
    
    gameState.currentPlayerIndex = 0;
    gameState.isGameActive = true;
    
    // Create player pieces
    gameState.players.forEach(player => {
        const piece = document.createElement('div');
        piece.className = `player-piece ${player.color}`;
        piece.textContent = player.id + 1;
        player.element = piece;
        const startSquare = document.getElementById('square-1');
        const startContent = startSquare.querySelector('.square-content');
        if (startContent) {
            startContent.appendChild(piece);
        }
        player.position = 1;
    });
    
    // Update UI
    document.getElementById('playerSetup').classList.add('hidden');
    document.getElementById('gameStatus').classList.remove('hidden');
    updateCurrentPlayerDisplay();
    
    // Position pieces
    positionPlayersOnSquare(1);
    
    // Redraw connections after game starts
    setTimeout(() => {
        drawBoardConnections();
    }, 100);
    
    saveGameState();
}

// Roll dice
function rollDice() {
    if (!gameState.isGameActive) return;
    
    const dice = document.getElementById('dice');
    const diceValue = Math.floor(Math.random() * 6) + 1;
    gameState.diceValue = diceValue;
    
    // Animate dice
    dice.classList.add('rolling');
    dice.querySelector('.dice-value').textContent = '?';
    
    setTimeout(() => {
        dice.classList.remove('rolling');
        dice.querySelector('.dice-value').textContent = diceValue;
        moveCurrentPlayer(diceValue);
    }, 500);
}

// Move current player
function moveCurrentPlayer(steps) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const currentPos = player.position;
    let newPos = currentPos + steps;
    
    // Cap at 100
    if (newPos > BOARD_SIZE) {
        newPos = BOARD_SIZE;
    }
    
    // Animate movement
    animatePlayerMovement(player, currentPos, newPos, () => {
        // Check for special squares
        checkSpecialSquare(player);
        
        // Check win condition
        if (player.position === BOARD_SIZE) {
            endGame(player);
        } else {
            // Next player's turn
            gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
            updateCurrentPlayerDisplay();
        }
        
        saveGameState();
    });
}

// Animate player movement
function animatePlayerMovement(player, fromPos, toPos, callback) {
    const steps = toPos - fromPos;
    let currentStep = 0;
    
    player.element.classList.add('moving');
    
    const moveInterval = setInterval(() => {
        currentStep++;
        player.position = fromPos + currentStep;
        
        // Remove from current square
        const currentSquare = player.element.parentElement;
        if (currentSquare) {
            currentSquare.removeChild(player.element);
        }
        
        // Add to new square
        const newSquare = document.getElementById(`square-${player.position}`);
        if (newSquare) {
            const contentLayer = newSquare.querySelector('.square-content');
            if (contentLayer) {
                contentLayer.appendChild(player.element);
            }
            positionPlayersOnSquare(player.position);
        }
        
        if (currentStep >= steps) {
            clearInterval(moveInterval);
            player.element.classList.remove('moving');
            callback();
        }
    }, 300);
}

// Check for special squares
function checkSpecialSquare(player) {
    const position = player.position;
    const turnInfo = document.getElementById('turnInfo');
    
    if (MOUNTAINS[position]) {
        const destination = MOUNTAINS[position].to;
        const message = `${MOUNTAINS[position].name}! Climbing to ${destination}`;
        
        turnInfo.textContent = message;
        turnInfo.className = 'turn-info success';
        
        setTimeout(() => {
            movePlayerToPosition(player, destination);
        }, 1000);
    } else if (VALLEYS[position]) {
        const destination = VALLEYS[position].to;
        const message = `${VALLEYS[position].name}! Falling to ${destination}`;
        
        turnInfo.textContent = message;
        turnInfo.className = 'turn-info danger';
        
        setTimeout(() => {
            movePlayerToPosition(player, destination);
        }, 1000);
    } else {
        turnInfo.textContent = '';
        turnInfo.className = 'turn-info';
    }
}

// Move player to specific position
function movePlayerToPosition(player, newPosition) {
    // Remove from current square
    const currentSquare = player.element.parentElement;
    if (currentSquare) {
        currentSquare.removeChild(player.element);
    }
    
    // Update position
    player.position = newPosition;
    
    // Add to new square
    const newSquare = document.getElementById(`square-${newPosition}`);
    if (newSquare) {
        const contentLayer = newSquare.querySelector('.square-content');
        if (contentLayer) {
            contentLayer.appendChild(player.element);
        }
        positionPlayersOnSquare(newPosition);
    }
}

// Position multiple players on same square
function positionPlayersOnSquare(squareNum) {
    const square = document.getElementById(`square-${squareNum}`);
    const contentLayer = square.querySelector('.square-content');
    const pieces = contentLayer ? contentLayer.querySelectorAll('.player-piece') : [];
    
    pieces.forEach((piece, index) => {
        const offset = index * 15;
        piece.style.transform = `translate(${offset}px, ${offset}px)`;
    });
}

// Update current player display
function updateCurrentPlayerDisplay() {
    const player = gameState.players[gameState.currentPlayerIndex];
    document.getElementById('currentPlayerName').textContent = player.name;
}

// End game
function endGame(winner) {
    gameState.isGameActive = false;
    document.getElementById('winPlayer').textContent = winner.name;
    document.getElementById('winOverlay').classList.remove('hidden');
}

// Save game state to localStorage
function saveGameState() {
    localStorage.setItem('bureaucraticMountainsGame', JSON.stringify(gameState));
}

// Load game state from localStorage
function loadGameState() {
    const saved = localStorage.getItem('bureaucraticMountainsGame');
    if (saved && saved !== 'undefined') {
        try {
            const savedState = JSON.parse(saved);
            
            // Restore game state
            if (savedState.players && savedState.players.length > 0) {
                gameState = savedState;
                
                // Recreate player elements
                gameState.players.forEach(player => {
                    const piece = document.createElement('div');
                    piece.className = `player-piece ${player.color}`;
                    piece.textContent = player.id + 1;
                    player.element = piece;
                    
                    const square = document.getElementById(`square-${player.position}`);
                    if (square) {
                        const contentLayer = square.querySelector('.square-content');
                        if (contentLayer) {
                            contentLayer.appendChild(piece);
                        }
                    }
                });
                
                // Update UI
                document.getElementById('playerSetup').classList.add('hidden');
                document.getElementById('gameStatus').classList.remove('hidden');
                updateCurrentPlayerDisplay();
                
                // Position pieces
                const positions = [...new Set(gameState.players.map(p => p.position))];
                positions.forEach(pos => positionPlayersOnSquare(pos));
                
                // Redraw connections after loading
                setTimeout(() => {
                    drawBoardConnections();
                }, 100);
            }
        } catch (e) {
            console.error('Error loading game state:', e);
            localStorage.removeItem('bureaucraticMountainsGame');
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initGame);