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
    
    // Draw connections for mountains (green arrows up)
    Object.entries(MOUNTAINS).forEach(([from, data]) => {
        drawConnection(svg, parseInt(from), data.to, 'mountain');
    });
    
    // Draw connections for valleys (red arrows down)
    Object.entries(VALLEYS).forEach(([from, data]) => {
        drawConnection(svg, parseInt(from), data.to, 'valley');
    });
    
    board.appendChild(svg);
}

// Draw connection line between squares
function drawConnection(svg, fromNum, toNum, type) {
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
    
    // Create path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${(fromY + toY) / 2 - 50} ${toX} ${toY}`;
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', type === 'mountain' ? '#5a8f52' : '#c0392b');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-dasharray', '5,5');
    path.setAttribute('opacity', '0.4');
    
    // Add arrow marker
    const markerId = `arrow-${type}-${fromNum}`;
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', markerId);
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerUnits', 'strokeWidth');
    
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrow.setAttribute('d', 'M0,0 L0,6 L9,3 z');
    arrow.setAttribute('fill', type === 'mountain' ? '#5a8f52' : '#c0392b');
    
    marker.appendChild(arrow);
    svg.appendChild(marker);
    path.setAttribute('marker-end', `url(#${markerId})`);
    
    svg.appendChild(path);
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