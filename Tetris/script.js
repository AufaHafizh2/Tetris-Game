const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scale = 30;
const rows = canvas.height / scale;
const cols = canvas.width / scale;

const tetrominoes = [
    // I
    [[1, 1, 1, 1]],
    // O
    [[1, 1], [1, 1]],
    // T
    [[0, 1, 0], [1, 1, 1]],
    // S
    [[0, 1, 1], [1, 1, 0]],
    // Z
    [[1, 1, 0], [0, 1, 1]],
    // J
    [[1, 0, 0], [1, 1, 1]],
    // L
    [[0, 0, 1], [1, 1, 1]]
];

let board;
let currentTetromino;
let position;
let animationFrameId;
let lastDrop = 0;
const dropInterval = 500; // Interval jatuh tetromino dalam ms
let gameStartTime;
let timerIntervalId;
let isGamePaused = false;

function initializeGame() {
    board = Array.from({ length: rows }, () => Array(cols).fill(0));
    currentTetromino = getRandomTetromino();
    position = { x: Math.floor(cols / 2) - 1, y: 0 };
    lastDrop = Date.now();
    gameStartTime = Date.now();
    updateTimer();
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
    }
    timerIntervalId = setInterval(updateTimer, 1000); // Update timer setiap detik
    isGamePaused = false;
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000';

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c]) {
                context.fillStyle = 'white';
                context.fillRect(c * scale, r * scale, scale, scale);
                context.strokeRect(c * scale, r * scale, scale, scale);
            }
        }
    }
}

function drawTetromino() {
    context.fillStyle = 'white';
    currentTetromino.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillRect((position.x + x) * scale, (position.y + y) * scale, scale, scale);
            }
        });
    });
}

function collide(x, y, tetromino) {
    for (let r = 0; r < tetromino.length; r++) {
        for (let c = 0; c < tetromino[r].length; c++) {
            if (tetromino[r][c] && (board[r + y] && board[r + y][c + x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function rotate() {
    const temp = currentTetromino;
    currentTetromino = rotateMatrix(currentTetromino);
    if (collide(position.x, position.y, currentTetromino)) {
        currentTetromino = temp;
    }
}

function rotateMatrix(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

function drop() {
    if (!collide(position.x, position.y + 1, currentTetromino)) {
        position.y++;
    } else {
        mergeTetromino();
        removeFullLines();
        currentTetromino = getRandomTetromino();
        position = { x: Math.floor(cols / 2) - 1, y: 0 };
        if (collide(position.x, position.y, currentTetromino)) {
            // Game Over
            initializeGame();
        }
    }
}

function mergeTetromino() {
    currentTetromino.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[y + position.y][x + position.x] = value;
            }
        });
    });
}

function removeFullLines() {
    for (let r = rows - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r, 1);
            board.unshift(Array(cols).fill(0));
        }
    }
}

function getRandomTetromino() {
    const index = Math.floor(Math.random() * tetrominoes.length);
    return tetrominoes[index];
}

function update() {
    if (!isGamePaused) {
        const now = Date.now();
        const delta = now - lastDrop;

        if (delta > dropInterval) {
            lastDrop = now;
            drop();
        }

        drawBoard();
        drawTetromino();
        animationFrameId = requestAnimationFrame(update);
    }
}

function startGame() {
    if (isGamePaused) {
        isGamePaused = false;
        lastDrop = Date.now() - (Date.now() - lastDrop); // Adjust lastDrop to account for paused time
        update();
    }
}

function stopGame() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
    }
    isGamePaused = true;
}

function restartGame() {
    stopGame();
    initializeGame();
    update();
}

function updateTimer() {
    const now = Date.now();
    const elapsedTime = Math.floor((now - gameStartTime) / 1000); // waktu dalam detik
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    document.getElementById('timer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.getElementById('start').addEventListener('click', startGame);
document.getElementById('stop').addEventListener('click', stopGame);
document.getElementById('restart').addEventListener('click', restartGame);

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            if (!collide(position.x - 1, position.y, currentTetromino)) {
                position.x--;
            }
            break;
        case 'ArrowRight':
            if (!collide(position.x + 1, position.y, currentTetromino)) {
                position.x++;
            }
            break;
        case 'ArrowDown':
            drop();
            break;
        case 'ArrowUp':
            rotate();
            break;
    }
});
