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
    g.setAttribute('opacity', '0.85');
    
    // Calculate path direction
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const perpAngle = angle - Math.PI / 2;
    
    // Width of the mountain slope
    const pathWidth = 30;
    
    // Create one-sided mountain slope
    const mountain = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Control points for natural curve
    const cp1X = fromX + (toX - fromX) * 0.3;
    const cp1Y = fromY + (toY - fromY) * 0.3 - 20;
    const cp2X = fromX + (toX - fromX) * 0.7;
    const cp2Y = fromY + (toY - fromY) * 0.7 - 20;
    
    // Create jagged mountain edge
    const jaggedPath = createJaggedLine(fromX, fromY, toX, toY, pathWidth, angle, perpAngle);
    
    // Mountain path - one sided
    const mountainPath = `
        M ${fromX} ${fromY}
        C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${toX} ${toY}
        ${jaggedPath}
        Z
    `;
    
    mountain.setAttribute('d', mountainPath);
    mountain.setAttribute('fill', 'url(#mountainGradient' + fromNum + ')');
    mountain.setAttribute('mask', 'url(#mountainMask' + fromNum + ')');
    
    // Create vertical gradient for mountain elevation
    const gradientId = `mountainGradient${fromNum}`;
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '100%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '0%');
    
    // Green to blue to white gradient
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('style', 'stop-color:#228B22;stop-opacity:1'); // Forest green
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('style', 'stop-color:#4682B4;stop-opacity:1'); // Steel blue
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '85%');
    stop3.setAttribute('style', 'stop-color:#B0C4DE;stop-opacity:1'); // Light steel blue
    
    const stop4 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop4.setAttribute('offset', '100%');
    stop4.setAttribute('style', 'stop-color:#F8F8FF;stop-opacity:1'); // Snow white
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    gradient.appendChild(stop4);
    
    // Create transparency mask for one-sided effect
    const maskId = `mountainMask${fromNum}`;
    const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
    mask.setAttribute('id', maskId);
    
    const maskGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    maskGradient.setAttribute('id', 'maskGrad' + fromNum);
    maskGradient.setAttribute('x1', '0%');
    maskGradient.setAttribute('y1', '0%');
    maskGradient.setAttribute('x2', '100%');
    maskGradient.setAttribute('y2', '0%');
    
    const maskStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    maskStop1.setAttribute('offset', '0%');
    maskStop1.setAttribute('style', 'stop-color:white;stop-opacity:0');
    
    const maskStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    maskStop2.setAttribute('offset', '30%');
    maskStop2.setAttribute('style', 'stop-color:white;stop-opacity:1');
    
    const maskStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    maskStop3.setAttribute('offset', '100%');
    maskStop3.setAttribute('style', 'stop-color:white;stop-opacity:1');
    
    maskGradient.appendChild(maskStop1);
    maskGradient.appendChild(maskStop2);
    maskGradient.appendChild(maskStop3);
    
    const maskRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    maskRect.setAttribute('x', '0');
    maskRect.setAttribute('y', '0');
    maskRect.setAttribute('width', '100%');
    maskRect.setAttribute('height', '100%');
    maskRect.setAttribute('fill', 'url(#maskGrad' + fromNum + ')');
    
    mask.appendChild(maskGradient);
    mask.appendChild(maskRect);
    
    // Create defs if it doesn't exist
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);
    }
    defs.appendChild(gradient);
    defs.appendChild(mask);
    
    // Add snow cap detail
    const snowCap = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const snowCapPath = createSnowCap(fromX, fromY, toX, toY, pathWidth * 0.7);
    snowCap.setAttribute('d', snowCapPath);
    snowCap.setAttribute('fill', '#FFFFFF');
    snowCap.setAttribute('opacity', '0.8');
    
    g.appendChild(mountain);
    g.appendChild(snowCap);
    
    svg.appendChild(g);
}

// Helper function to create jagged mountain edge
function createJaggedLine(fromX, fromY, toX, toY, width, angle, perpAngle) {
    const segments = 8;
    let path = '';
    
    for (let i = segments; i >= 0; i--) {
        const t = i / segments;
        const x = fromX + (toX - fromX) * t;
        const y = fromY + (toY - fromY) * t;
        
        // Add random variation for natural look
        const variation = (Math.random() - 0.5) * 10;
        const offsetX = x + Math.cos(perpAngle) * (width + variation);
        const offsetY = y + Math.sin(perpAngle) * (width + variation);
        
        if (i === segments) {
            path += ` L ${offsetX} ${offsetY}`;
        } else {
            path += ` L ${offsetX} ${offsetY}`;
        }
    }
    
    return path;
}

// Helper function to create snow cap on mountain top
function createSnowCap(fromX, fromY, toX, toY, width) {
    const topX = toX;
    const topY = toY;
    
    // Create irregular snow cap shape
    const snowPath = `
        M ${topX - width/2} ${topY + 5}
        Q ${topX - width/4} ${topY - 2}, ${topX} ${topY - 5}
        Q ${topX + width/4} ${topY - 2}, ${topX + width/2} ${topY + 5}
        L ${topX + width/3} ${topY + 10}
        Q ${topX} ${topY + 8}, ${topX - width/3} ${topY + 10}
        Z
    `;
    
    return snowPath;
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
    g.setAttribute('opacity', '0.85');
    
    // Calculate path direction
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const perpAngle = angle + Math.PI / 2; // Opposite side from mountain
    
    // Width of the valley canyon
    const pathWidth = 30;
    
    // Create one-sided canyon wall
    const valley = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Control points for natural curve
    const cp1X = fromX + (toX - fromX) * 0.3;
    const cp1Y = fromY + (toY - fromY) * 0.3 + 15;
    const cp2X = fromX + (toX - fromX) * 0.7;
    const cp2Y = fromY + (toY - fromY) * 0.7 + 15;
    
    // Create rough, rocky edge
    const rockyPath = createRockyEdge(fromX, fromY, toX, toY, pathWidth, angle, perpAngle);
    
    // Valley path - one sided rocky canyon
    const valleyPath = `
        M ${fromX} ${fromY}
        C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${toX} ${toY}
        ${rockyPath}
        Z
    `;
    
    valley.setAttribute('d', valleyPath);
    valley.setAttribute('fill', 'url(#valleyGradient' + fromNum + ')');
    valley.setAttribute('mask', 'url(#valleyMask' + fromNum + ')');
    
    // Create brown gradient for rocky canyon
    const gradientId = `valleyGradient${fromNum}`;
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('style', 'stop-color:#8B6914;stop-opacity:1'); // Dark goldenrod
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('style', 'stop-color:#654321;stop-opacity:1'); // Dark brown
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('style', 'stop-color:#3E2723;stop-opacity:1'); // Very dark brown
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    
    // Create transparency mask for one-sided effect
    const maskId = `valleyMask${fromNum}`;
    const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
    mask.setAttribute('id', maskId);
    
    const maskGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    maskGradient.setAttribute('id', 'valleyMaskGrad' + fromNum);
    maskGradient.setAttribute('x1', '100%');
    maskGradient.setAttribute('y1', '0%');
    maskGradient.setAttribute('x2', '0%');
    maskGradient.setAttribute('y2', '0%');
    
    const maskStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    maskStop1.setAttribute('offset', '0%');
    maskStop1.setAttribute('style', 'stop-color:white;stop-opacity:0');
    
    const maskStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    maskStop2.setAttribute('offset', '30%');
    maskStop2.setAttribute('style', 'stop-color:white;stop-opacity:1');
    
    const maskStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    maskStop3.setAttribute('offset', '100%');
    maskStop3.setAttribute('style', 'stop-color:white;stop-opacity:1');
    
    maskGradient.appendChild(maskStop1);
    maskGradient.appendChild(maskStop2);
    maskGradient.appendChild(maskStop3);
    
    const maskRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    maskRect.setAttribute('x', '0');
    maskRect.setAttribute('y', '0');
    maskRect.setAttribute('width', '100%');
    maskRect.setAttribute('height', '100%');
    maskRect.setAttribute('fill', 'url(#valleyMaskGrad' + fromNum + ')');
    
    mask.appendChild(maskGradient);
    mask.appendChild(maskRect);
    
    // Create defs if it doesn't exist
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);
    }
    defs.appendChild(gradient);
    defs.appendChild(mask);
    
    // Add rocky texture pattern if not exists
    if (!defs.querySelector('#rockyTexture')) {
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', 'rockyTexture');
        pattern.setAttribute('x', '0');
        pattern.setAttribute('y', '0');
        pattern.setAttribute('width', '20');
        pattern.setAttribute('height', '20');
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        
        // Add small rocks
        for (let i = 0; i < 5; i++) {
            const rock = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            rock.setAttribute('cx', Math.random() * 20);
            rock.setAttribute('cy', Math.random() * 20);
            rock.setAttribute('r', Math.random() * 2 + 1);
            rock.setAttribute('fill', '#5D4037');
            rock.setAttribute('opacity', '0.5');
            pattern.appendChild(rock);
        }
        
        defs.appendChild(pattern);
    }
    
    // Add texture overlay
    const textureOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    textureOverlay.setAttribute('d', valleyPath);
    textureOverlay.setAttribute('fill', 'url(#rockyTexture)');
    textureOverlay.setAttribute('opacity', '0.3');
    
    // Add rocks and pebbles along the path
    const rocksGroup = createRocksAndPebbles(fromX, fromY, toX, toY, perpAngle);
    
    g.appendChild(valley);
    g.appendChild(textureOverlay);
    g.appendChild(rocksGroup);
    
    svg.appendChild(g);
}

// Helper function to create rocky, rough edge
function createRockyEdge(fromX, fromY, toX, toY, width, angle, perpAngle) {
    const segments = 12;
    let path = '';
    
    for (let i = segments; i >= 0; i--) {
        const t = i / segments;
        const x = fromX + (toX - fromX) * t;
        const y = fromY + (toY - fromY) * t;
        
        // More variation for rocky appearance
        const variation = (Math.random() - 0.5) * 15;
        const smallVariation = (Math.random() - 0.5) * 5;
        const offsetX = x + Math.cos(perpAngle) * (width + variation);
        const offsetY = y + Math.sin(perpAngle) * (width + variation);
        
        if (i === segments) {
            path += ` L ${offsetX} ${offsetY}`;
        } else if (i % 2 === 0) {
            // Add small jagged edges
            const midX = offsetX + smallVariation;
            const midY = offsetY + smallVariation;
            path += ` L ${midX} ${midY} L ${offsetX} ${offsetY}`;
        } else {
            path += ` L ${offsetX} ${offsetY}`;
        }
    }
    
    return path;
}

// Helper function to create rocks and pebbles
function createRocksAndPebbles(fromX, fromY, toX, toY, perpAngle) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const numRocks = 8;
    
    for (let i = 0; i < numRocks; i++) {
        const t = Math.random();
        const x = fromX + (toX - fromX) * t;
        const y = fromY + (toY - fromY) * t;
        
        // Position rocks along the edge
        const offset = Math.random() * 20 + 5;
        const rockX = x + Math.cos(perpAngle) * offset;
        const rockY = y + Math.sin(perpAngle) * offset;
        
        if (Math.random() > 0.5) {
            // Large rock
            const rock = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            rock.setAttribute('cx', rockX);
            rock.setAttribute('cy', rockY);
            rock.setAttribute('rx', Math.random() * 4 + 3);
            rock.setAttribute('ry', Math.random() * 3 + 2);
            rock.setAttribute('fill', '#5D4037');
            rock.setAttribute('opacity', '0.7');
            rock.setAttribute('transform', `rotate(${Math.random() * 360} ${rockX} ${rockY})`);
            g.appendChild(rock);
        } else {
            // Small pebbles
            const pebble = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            pebble.setAttribute('cx', rockX);
            pebble.setAttribute('cy', rockY);
            pebble.setAttribute('r', Math.random() * 2 + 1);
            pebble.setAttribute('fill', '#6D4C41');
            pebble.setAttribute('opacity', '0.6');
            g.appendChild(pebble);
        }
    }
    
    return g;
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