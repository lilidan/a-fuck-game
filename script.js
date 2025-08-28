class WordDefenseGame {
    constructor() {
        this.player = document.getElementById('player');
        this.gameArea = document.getElementById('gameArea');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.gameOverScreen = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        
        this.playerPosition = 50;
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.fallingWords = [];
        this.gameSpeed = 2;
        
        this.badWords = [
            'DAMN', 'HELL', 'CRAP', 'SHIT', 'FUCK', 'BITCH', 'ASS',
            'PISS', 'DICK', 'COCK', 'TITS', 'SLUT', 'WHORE'
        ];
        
        this.setupEventListeners();
        this.setupKeyboardControls();
    }
    
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.movePlayer(-5);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.movePlayer(5);
                    break;
            }
        });
    }
    
    movePlayer(direction) {
        this.playerPosition += direction;
        this.playerPosition = Math.max(5, Math.min(95, this.playerPosition));
        this.player.style.left = this.playerPosition + '%';
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.lives = 3;
        this.gameSpeed = 2;
        this.fallingWords = [];
        this.playerPosition = 50;
        
        this.updateUI();
        this.player.style.left = '50%';
        this.gameOverScreen.style.display = 'none';
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        
        this.gameLoop();
        this.wordSpawner();
    }
    
    pauseGame() {
        this.gameRunning = !this.gameRunning;
        document.getElementById('pauseBtn').textContent = this.gameRunning ? 'Pause' : 'Resume';
        
        if (this.gameRunning) {
            this.gameLoop();
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.updateFallingWords();
        this.checkCollisions();
        this.cleanupWords();
        
        if (this.lives > 0) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    wordSpawner() {
        if (!this.gameRunning) return;
        
        this.spawnWord();
        
        const spawnDelay = Math.max(800, 2000 - (this.score * 10));
        setTimeout(() => this.wordSpawner(), spawnDelay);
    }
    
    spawnWord() {
        const word = this.badWords[Math.floor(Math.random() * this.badWords.length)];
        const wordElement = document.createElement('div');
        wordElement.className = 'falling-word';
        wordElement.textContent = word;
        wordElement.style.left = Math.random() * 80 + 10 + '%';
        wordElement.style.animationDuration = (6 - this.gameSpeed) + 's';
        
        this.gameArea.appendChild(wordElement);
        this.fallingWords.push({
            element: wordElement,
            startTime: Date.now()
        });
    }
    
    updateFallingWords() {
        this.fallingWords.forEach(wordObj => {
            const elapsed = Date.now() - wordObj.startTime;
            const duration = (6 - this.gameSpeed) * 1000;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                this.score += 10;
                this.updateUI();
                
                if (this.score > 0 && this.score % 100 === 0) {
                    this.gameSpeed = Math.min(4, this.gameSpeed + 0.2);
                }
            }
        });
    }
    
    checkCollisions() {
        const playerRect = this.player.getBoundingClientRect();
        
        this.fallingWords.forEach((wordObj, index) => {
            const wordRect = wordObj.element.getBoundingClientRect();
            
            if (this.isColliding(playerRect, wordRect)) {
                this.lives--;
                this.updateUI();
                
                wordObj.element.style.background = 'rgba(255, 0, 0, 0.8)';
                wordObj.element.style.animation = 'none';
                
                setTimeout(() => {
                    if (wordObj.element.parentNode) {
                        wordObj.element.parentNode.removeChild(wordObj.element);
                    }
                }, 200);
                
                this.fallingWords.splice(index, 1);
                
                // 检查是否碰到3个单词，如果是则结束游戏
                if (this.lives <= 0) {
                    this.endGame();
                }
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    cleanupWords() {
        this.fallingWords = this.fallingWords.filter(wordObj => {
            const elapsed = Date.now() - wordObj.startTime;
            const duration = (6 - this.gameSpeed) * 1000;
            
            if (elapsed >= duration) {
                if (wordObj.element.parentNode) {
                    wordObj.element.parentNode.removeChild(wordObj.element);
                }
                return false;
            }
            return true;
        });
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
    }
    
    endGame() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.gameOverScreen.style.display = 'block';
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = 'Pause';
        
        this.fallingWords.forEach(wordObj => {
            if (wordObj.element.parentNode) {
                wordObj.element.parentNode.removeChild(wordObj.element);
            }
        });
        this.fallingWords = [];
    }
    
    restartGame() {
        this.startGame();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WordDefenseGame();
});