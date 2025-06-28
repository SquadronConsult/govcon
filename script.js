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
    
    // Draw connections after board is ready with longer delay
    setTimeout(() => {
        drawBoardConnections();
    }, 500);
    
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
    // Wait for next frame to ensure layout is complete
    requestAnimationFrame(() => {
        const svg = document.querySelector('.board svg');
        if (svg) svg.remove();
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
    if (!board) {
        console.error('Board not found');
        return;
    }
    
    // Check if board has squares
    const squares = board.querySelectorAll('.square');
    if (squares.length === 0) {
        console.error('No squares found on board');
        return;
    }
    
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
        try {
            drawMountain(svg, parseInt(from), data.to);
        } catch (e) {
            console.error('Error drawing mountain', from, '->', data.to, e);
        }
    });
    
    // Draw valleys (chutes)
    Object.entries(VALLEYS).forEach(([from, data]) => {
        try {
            drawValley(svg, parseInt(from), data.to);
        } catch (e) {
            console.error('Error drawing valley', from, '->', data.to, e);
        }
    });
    
    board.appendChild(svg);
    console.log('Special connections added');
}

// Draw mountain (upward path) graphic
function drawMountain(svg, fromNum, toNum) {
    const fromSquare = document.getElementById(`square-${fromNum}`);
    const toSquare = document.getElementById(`square-${toNum}`);
    
    if (!fromSquare || !toSquare) {
        console.error('Mountain squares not found:', fromNum, toNum);
        return;
    }
    
    // Get board directly by ID since SVG isn't attached yet
    const board = document.getElementById('gameBoard');
    if (!board) {
        console.error('Board not found');
        return;
    }
    
    const boardRect = board.getBoundingClientRect();
    const fromRect = fromSquare.getBoundingClientRect();
    const toRect = toSquare.getBoundingClientRect();
    
    // Calculate positions relative to board
    const fromX = fromRect.left + fromRect.width / 2 - boardRect.left;
    const fromY = fromRect.top + fromRect.height / 2 - boardRect.top;
    const toX = toRect.left + toRect.width / 2 - boardRect.left;
    const toY = toRect.top + toRect.height / 2 - boardRect.top;
    
    // Create group for the mountain
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Calculate control points for smooth curves
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const perpAngle = angle - Math.PI / 2;
    
    // Width of the mountain path
    const pathWidth = 40;
    const curveFactor = distance * 0.2;
    
    // Create modern curved path
    const mountain = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Calculate edge points
    const fromLeft = {
        x: fromX + Math.cos(perpAngle) * pathWidth/2,
        y: fromY + Math.sin(perpAngle) * pathWidth/2
    };
    const fromRight = {
        x: fromX - Math.cos(perpAngle) * pathWidth/2,
        y: fromY - Math.sin(perpAngle) * pathWidth/2
    };
    const toLeft = {
        x: toX + Math.cos(perpAngle) * pathWidth/2,
        y: toY + Math.sin(perpAngle) * pathWidth/2
    };
    const toRight = {
        x: toX - Math.cos(perpAngle) * pathWidth/2,
        y: toY - Math.sin(perpAngle) * pathWidth/2
    };
    
    // Control points for curves
    const cp1 = {
        x: fromX + Math.cos(angle) * distance * 0.3 - Math.cos(perpAngle) * curveFactor,
        y: fromY + Math.sin(angle) * distance * 0.3 - Math.sin(perpAngle) * curveFactor
    };
    const cp2 = {
        x: toX - Math.cos(angle) * distance * 0.3 - Math.cos(perpAngle) * curveFactor,
        y: toY - Math.sin(angle) * distance * 0.3 - Math.sin(perpAngle) * curveFactor
    };
    
    const mountainPath = `
        M ${fromLeft.x} ${fromLeft.y}
        C ${cp1.x + pathWidth/2 * Math.cos(perpAngle)} ${cp1.y + pathWidth/2 * Math.sin(perpAngle)},
          ${cp2.x + pathWidth/2 * Math.cos(perpAngle)} ${cp2.y + pathWidth/2 * Math.sin(perpAngle)},
          ${toLeft.x} ${toLeft.y}
        L ${toRight.x} ${toRight.y}
        C ${cp2.x - pathWidth/2 * Math.cos(perpAngle)} ${cp2.y - pathWidth/2 * Math.sin(perpAngle)},
          ${cp1.x - pathWidth/2 * Math.cos(perpAngle)} ${cp1.y - pathWidth/2 * Math.sin(perpAngle)},
          ${fromRight.x} ${fromRight.y}
        Z
    `;
    
    mountain.setAttribute('d', mountainPath);
    mountain.setAttribute('fill', 'url(#mountainGradient' + fromNum + ')');
    mountain.setAttribute('filter', 'url(#mountainShadow)');
    mountain.setAttribute('opacity', '0.9');
    
    // Create modern gradient
    const gradientId = `mountainGradient${fromNum}`;
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('style', 'stop-color:#81C784;stop-opacity:1');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('style', 'stop-color:#66BB6A;stop-opacity:1');
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('style', 'stop-color:#4CAF50;stop-opacity:1');
    
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
    
    // Add drop shadow filter if not exists
    if (!defs.querySelector('#mountainShadow')) {
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'mountainShadow');
        
        const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
        shadow.setAttribute('dx', '2');
        shadow.setAttribute('dy', '2');
        shadow.setAttribute('stdDeviation', '3');
        shadow.setAttribute('flood-opacity', '0.3');
        
        filter.appendChild(shadow);
        defs.appendChild(filter);
    }
    
    // Add arrow indicator
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const arrowSize = 15;
    const arrowPos = {
        x: toX - Math.cos(angle) * 20,
        y: toY - Math.sin(angle) * 20
    };
    
    const arrowPath = `
        M ${arrowPos.x - arrowSize * Math.cos(angle - Math.PI/6)} ${arrowPos.y - arrowSize * Math.sin(angle - Math.PI/6)}
        L ${arrowPos.x} ${arrowPos.y}
        L ${arrowPos.x - arrowSize * Math.cos(angle + Math.PI/6)} ${arrowPos.y - arrowSize * Math.sin(angle + Math.PI/6)}
    `;
    
    arrow.setAttribute('d', arrowPath);
    arrow.setAttribute('fill', 'none');
    arrow.setAttribute('stroke', '#ffffff');
    arrow.setAttribute('stroke-width', '3');
    arrow.setAttribute('stroke-linecap', 'round');
    arrow.setAttribute('stroke-linejoin', 'round');
    
    g.appendChild(mountain);
    g.appendChild(arrow);
    
    svg.appendChild(g);
}

// Draw valley (downward path) graphic
function drawValley(svg, fromNum, toNum) {
    const fromSquare = document.getElementById(`square-${fromNum}`);
    const toSquare = document.getElementById(`square-${toNum}`);
    
    if (!fromSquare || !toSquare) {
        console.error('Valley squares not found:', fromNum, toNum);
        return;
    }
    
    // Get board directly by ID since SVG isn't attached yet
    const board = document.getElementById('gameBoard');
    if (!board) {
        console.error('Board not found');
        return;
    }
    
    const boardRect = board.getBoundingClientRect();
    const fromRect = fromSquare.getBoundingClientRect();
    const toRect = toSquare.getBoundingClientRect();
    
    const fromX = fromRect.left + fromRect.width / 2 - boardRect.left;
    const fromY = fromRect.top + fromRect.height / 2 - boardRect.top;
    const toX = toRect.left + toRect.width / 2 - boardRect.left;
    const toY = toRect.top + toRect.height / 2 - boardRect.top;
    
    // Create group for the valley
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Calculate control points for smooth curves
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const perpAngle = angle - Math.PI / 2;
    
    // Width of the valley path
    const pathWidth = 40;
    const curveFactor = distance * 0.25;
    
    // Create modern curved path
    const valley = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Calculate edge points
    const fromLeft = {
        x: fromX + Math.cos(perpAngle) * pathWidth/2,
        y: fromY + Math.sin(perpAngle) * pathWidth/2
    };
    const fromRight = {
        x: fromX - Math.cos(perpAngle) * pathWidth/2,
        y: fromY - Math.sin(perpAngle) * pathWidth/2
    };
    const toLeft = {
        x: toX + Math.cos(perpAngle) * pathWidth/2,
        y: toY + Math.sin(perpAngle) * pathWidth/2
    };
    const toRight = {
        x: toX - Math.cos(perpAngle) * pathWidth/2,
        y: toY - Math.sin(perpAngle) * pathWidth/2
    };
    
    // Control points for S-curve
    const cp1 = {
        x: fromX + Math.cos(angle) * distance * 0.3 + Math.cos(perpAngle) * curveFactor,
        y: fromY + Math.sin(angle) * distance * 0.3 + Math.sin(perpAngle) * curveFactor
    };
    const cp2 = {
        x: toX - Math.cos(angle) * distance * 0.3 - Math.cos(perpAngle) * curveFactor,
        y: toY - Math.sin(angle) * distance * 0.3 - Math.sin(perpAngle) * curveFactor
    };
    
    const valleyPath = `
        M ${fromLeft.x} ${fromLeft.y}
        C ${cp1.x + pathWidth/2 * Math.cos(perpAngle)} ${cp1.y + pathWidth/2 * Math.sin(perpAngle)},
          ${cp2.x + pathWidth/2 * Math.cos(perpAngle)} ${cp2.y + pathWidth/2 * Math.sin(perpAngle)},
          ${toLeft.x} ${toLeft.y}
        L ${toRight.x} ${toRight.y}
        C ${cp2.x - pathWidth/2 * Math.cos(perpAngle)} ${cp2.y - pathWidth/2 * Math.sin(perpAngle)},
          ${cp1.x - pathWidth/2 * Math.cos(perpAngle)} ${cp1.y - pathWidth/2 * Math.sin(perpAngle)},
          ${fromRight.x} ${fromRight.y}
        Z
    `;
    
    valley.setAttribute('d', valleyPath);
    valley.setAttribute('fill', 'url(#valleyGradient' + fromNum + ')');
    valley.setAttribute('filter', 'url(#valleyShadow)');
    valley.setAttribute('opacity', '0.9');
    
    // Create modern gradient
    const gradientId = `valleyGradient${fromNum}`;
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('style', 'stop-color:#FF7043;stop-opacity:1');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('style', 'stop-color:#FF5722;stop-opacity:1');
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('style', 'stop-color:#D84315;stop-opacity:1');
    
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
    
    // Add drop shadow filter if not exists
    if (!defs.querySelector('#valleyShadow')) {
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'valleyShadow');
        
        const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
        shadow.setAttribute('dx', '2');
        shadow.setAttribute('dy', '2');
        shadow.setAttribute('stdDeviation', '3');
        shadow.setAttribute('flood-opacity', '0.3');
        
        filter.appendChild(shadow);
        defs.appendChild(filter);
    }
    
    // Add arrow indicator pointing down
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const arrowSize = 15;
    const arrowPos = {
        x: fromX + Math.cos(angle) * 20,
        y: fromY + Math.sin(angle) * 20
    };
    
    const arrowPath = `
        M ${arrowPos.x + arrowSize * Math.cos(angle - Math.PI/6)} ${arrowPos.y + arrowSize * Math.sin(angle - Math.PI/6)}
        L ${arrowPos.x} ${arrowPos.y}
        L ${arrowPos.x + arrowSize * Math.cos(angle + Math.PI/6)} ${arrowPos.y + arrowSize * Math.sin(angle + Math.PI/6)}
    `;
    
    arrow.setAttribute('d', arrowPath);
    arrow.setAttribute('fill', 'none');
    arrow.setAttribute('stroke', '#ffffff');
    arrow.setAttribute('stroke-width', '3');
    arrow.setAttribute('stroke-linecap', 'round');
    arrow.setAttribute('stroke-linejoin', 'round');
    
    // Add wavy pattern inside valley
    const wavyLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const waveCount = Math.floor(distance / 40);
    let wavePath = `M ${fromX} ${fromY}`;
    
    for (let i = 1; i <= waveCount; i++) {
        const t = i / waveCount;
        const x = fromX + (toX - fromX) * t;
        const y = fromY + (toY - fromY) * t;
        const offset = (i % 2 === 0 ? 1 : -1) * 10;
        wavePath += ` Q ${x + Math.cos(perpAngle) * offset} ${y + Math.sin(perpAngle) * offset}, ${x} ${y}`;
    }
    
    wavyLine.setAttribute('d', wavePath);
    wavyLine.setAttribute('fill', 'none');
    wavyLine.setAttribute('stroke', '#ffffff');
    wavyLine.setAttribute('stroke-width', '2');
    wavyLine.setAttribute('stroke-opacity', '0.3');
    wavyLine.setAttribute('stroke-dasharray', '4,4');
    
    g.appendChild(valley);
    g.appendChild(wavyLine);
    g.appendChild(arrow);
    
    svg.appendChild(g);
}

// Setup event listeners
function setupEventListeners() {
    // Player selection - use event delegation for better reliability
    const playerSetup = document.getElementById('playerSetup');
    if (playerSetup) {
        playerSetup.addEventListener('click', (e) => {
            if (e.target.classList.contains('player-btn')) {
                const playerCount = parseInt(e.target.dataset.players);
                console.log('Starting game with', playerCount, 'players');
                startNewGame(playerCount);
            }
        });
    }
    
    // Dice roll
    const diceBtn = document.getElementById('rollDice');
    if (diceBtn) {
        diceBtn.addEventListener('click', rollDice);
    }
    
    // New game button
    const newGameBtn = document.getElementById('newGameBtn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', resetGame);
    }
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
    
    // Redraw connections to ensure they're visible with longer delay
    setTimeout(() => {
        drawBoardConnections();
    }, 500);
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

// Manual function to force redraw connections (for debugging)
window.redrawConnections = function() {
    console.log('Manually redrawing connections...');
    drawBoardConnections();
};