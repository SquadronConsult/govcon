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
        if (i === 1) {
            const label = document.createElement('div');
            label.className = 'square-label start-label';
            label.textContent = 'START';
            square.appendChild(label);
        } else if (i === 100) {
            const label = document.createElement('div');
            label.className = 'square-label finish-label';
            label.textContent = 'DEPLOYMENT';
            square.appendChild(label);
        } else if (MOUNTAINS[i]) {
            const label = document.createElement('div');
            label.className = 'square-label';
            label.textContent = MOUNTAINS[i].name;
            square.appendChild(label);
        } else if (VALLEYS[i]) {
            const label = document.createElement('div');
            label.className = 'square-label';
            label.textContent = VALLEYS[i].name;
            square.appendChild(label);
        }
        
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
    svg.style.zIndex = '1';
    
    console.log('SVG positioning:', {
        left: svg.style.left,
        top: svg.style.top,
        width: svg.style.width,
        height: svg.style.height,
        boardRect,
        wrapperRect
    });
    
    // Set viewBox to match board dimensions
    svg.setAttribute('viewBox', `0 0 ${boardRect.width} ${boardRect.height}`);
    
    // Add debug background to verify SVG is visible
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', '0');
    bgRect.setAttribute('y', '0');
    bgRect.setAttribute('width', boardRect.width);
    bgRect.setAttribute('height', boardRect.height);
    bgRect.setAttribute('fill', 'rgba(255, 0, 0, 0.1)');
    bgRect.setAttribute('stroke', 'red');
    bgRect.setAttribute('stroke-width', '2');
    svg.appendChild(bgRect);
    
    // Draw connections
    drawMountainConnections(svg, board);
    drawValleyConnections(svg, board);
    
    // Append SVG to wrapper
    boardWrapper.appendChild(svg);
    
    console.log('SVG appended. Total paths:', svg.querySelectorAll('path').length);
    console.log('SVG element:', svg);
}

// Draw mountain connections
function drawMountainConnections(svg, board) {
    Object.entries(MOUNTAINS).forEach(([from, data]) => {
        const fromSquare = document.getElementById(`square-${from}`);
        const toSquare = document.getElementById(`square-${data.to}`);
        
        if (fromSquare && toSquare) {
            drawCurvedPath(svg, board, fromSquare, toSquare, '#228B22', true);
        }
    });
}

// Draw valley connections
function drawValleyConnections(svg, board) {
    Object.entries(VALLEYS).forEach(([from, data]) => {
        const fromSquare = document.getElementById(`square-${from}`);
        const toSquare = document.getElementById(`square-${data.to}`);
        
        if (fromSquare && toSquare) {
            drawCurvedPath(svg, board, fromSquare, toSquare, '#d32f2f', false);
        }
    });
}

// Draw a curved path between two squares
function drawCurvedPath(svg, board, fromSquare, toSquare, color, isUpward) {
    const boardRect = board.getBoundingClientRect();
    const fromRect = fromSquare.getBoundingClientRect();
    const toRect = toSquare.getBoundingClientRect();
    
    // Calculate centers relative to the board
    const fromX = (fromRect.left - boardRect.left) + fromRect.width / 2;
    const fromY = (fromRect.top - boardRect.top) + fromRect.height / 2;
    const toX = (toRect.left - boardRect.left) + toRect.width / 2;
    const toY = (toRect.top - boardRect.top) + toRect.height / 2;
    
    // Create curved path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Calculate control point for curve
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const curveOffset = isUpward ? -40 : 40;
    const controlY = midY + curveOffset;
    
    // Create path data
    const pathData = `M ${fromX},${fromY} Q ${midX},${controlY} ${toX},${toY}`;
    
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '10');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.6');
    path.setAttribute('stroke-linecap', 'round');
    
    svg.appendChild(path);
    
    console.log('Path drawn:', {
        from: fromSquare.id,
        to: toSquare.id,
        pathData,
        color
    });
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
        document.getElementById('square-1').appendChild(piece);
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
            newSquare.appendChild(player.element);
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
        newSquare.appendChild(player.element);
        positionPlayersOnSquare(newPosition);
    }
}

// Position multiple players on same square
function positionPlayersOnSquare(squareNum) {
    const square = document.getElementById(`square-${squareNum}`);
    const pieces = square.querySelectorAll('.player-piece');
    
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
                        square.appendChild(piece);
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