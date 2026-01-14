class Canvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 100;
        this.padding = 20;
        this.symbols = [];
        this.animatingCells = new Map();
        
        this.setupCanvas();
    }

    setupCanvas() {
        const containerWidth = this.canvas.parentElement.clientWidth - 40;
        const size = Math.min(containerWidth, 400);
        
        this.canvas.width = size;
        this.canvas.height = size;
        
        this.cellSize = (size - this.padding * 4) / 3;
        this.resizeFonts();
    }

    resizeFonts() {
        this.symbolFontSize = this.cellSize * 0.6;
        this.gridLineWidth = 2;
    }

    clear() {
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawGrid() {
        if (!this.ctx || !this.canvas) {
            return;
        }
        
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        this.ctx.lineWidth = this.gridLineWidth;
        
        for (let i = 0; i <= 3; i++) {
            const pos = this.padding + i * (this.cellSize + this.padding);
            
            this.ctx.beginPath();
            this.ctx.moveTo(pos, this.padding);
            this.ctx.lineTo(pos, this.canvas.height - this.padding);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, pos);
            this.ctx.lineTo(this.canvas.width - this.padding, pos);
            this.ctx.stroke();
        }
    }

    drawBackground() {
        if (!this.ctx || !this.canvas) {
            return;
        }
        
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
    }

    drawSymbol(symbolKey, row, col, highlight = false, animation = null) {
        if (!this.ctx || !this.canvas) {
            console.error('Canvas context not available');
            return;
        }
        
        const x = this.padding + col * (this.cellSize + this.padding) + this.cellSize / 2;
        const y = this.padding + row * (this.cellSize + this.padding) + this.cellSize / 2;
        
        this.ctx.save();
        
        if (highlight) {
            this.drawHighlight(x, y);
        }
        
        if (animation) {
            this.applyAnimation(x, y, animation);
        }
        
        this.ctx.font = `${this.symbolFontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const symbolManager = window.slotMachine?.symbolManager;
        const emoji = symbolManager ? symbolManager.getSymbolEmoji(symbolKey) : '❓';
        
        this.ctx.fillText(emoji, x, y);
        
        this.ctx.restore();
    }

    drawHighlight(x, y) {
        const radius = this.cellSize / 2 - 5;
        
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    applyAnimation(x, y, animation) {
        switch (animation.type) {
            case 'spin':
                const spinAngle = (animation.progress || 0) * Math.PI * 4;
                this.ctx.translate(x, y);
                this.ctx.rotate(spinAngle);
                this.ctx.translate(-x, -y);
                break;
                
            case 'bounce':
                const bounce = Math.sin((animation.progress || 0) * Math.PI * 2) * 10;
                this.ctx.translate(0, -bounce);
                break;
                
            case 'fade':
                const opacity = animation.opacity || 1;
                this.ctx.globalAlpha = opacity;
                break;
                
            case 'scale':
                const scale = animation.scale || 1;
                this.ctx.translate(x, y);
                this.ctx.scale(scale, scale);
                this.ctx.translate(-x, -y);
                break;
        }
    }

    drawBoard(board, winningPositions = []) {
        this.clear();
        this.drawBackground();
        
        for (let i = 0; i < board.length; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const highlight = winningPositions.includes(i);
            
            const animation = this.animatingCells.has(i) ? 
                this.animatingCells.get(i) : null;
            
            this.drawSymbol(board[i], row, col, highlight, animation);
        }
    }

    animateCell(index, animationType, duration = 1000) {
        return new Promise(resolve => {
            const startTime = Date.now();
            const row = Math.floor(index / 3);
            const col = index % 3;
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                this.animatingCells.set(index, {
                    type: animationType,
                    progress: progress,
                    opacity: animationType === 'fade' ? 1 - progress : 1,
                    scale: animationType === 'scale' ? 1 + Math.sin(progress * Math.PI) * 0.3 : 1
                });
                
                this.drawBoard(window.slotMachine.board, window.slotMachine.lastWinningPositions || []);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.animatingCells.delete(index);
                    resolve();
                }
            };
            
            animate();
        });
    }

    animateShuffle(board, duration = 2000) {
        return new Promise(resolve => {
            const startTime = Date.now();
            const shuffleCount = 10;
            let currentShuffle = 0;
            
            const shuffle = () => {
                if (currentShuffle >= shuffleCount) {
                    resolve();
                    return;
                }
                
                const cellPromises = [];
                for (let i = 0; i < board.length; i++) {
                    const delay = i * 50;
                    setTimeout(() => {
                        cellPromises.push(this.animateCell(i, 'spin', 300));
                    }, delay);
                }
                
                Promise.all(cellPromises).then(() => {
                    currentShuffle++;
                    if (currentShuffle < shuffleCount) {
                        setTimeout(shuffle, 100);
                    } else {
                        resolve();
                    }
                });
            };
            
            shuffle();
        });
    }

    animateWin(winningPositions, type = 'normal') {
        const animations = winningPositions.map((index, i) => {
            const delay = i * 100;
            const animationType = type === 'big' ? 'bounce' : 'scale';
            
            return new Promise(resolve => {
                setTimeout(() => {
                    this.animateCell(index, animationType, 800).then(resolve);
                }, delay);
            });
        });
        
        return Promise.all(animations);
    }

    createParticleEffect(x, y, color = '#ffd700', count = 20) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                life: 1.0,
                color: color
            });
        }
        
        const animateParticles = () => {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.2;
                particle.life -= 0.02;
                
                if (particle.life > 0) {
                    this.ctx.save();
                    this.ctx.globalAlpha = particle.life;
                    this.ctx.fillStyle = particle.color;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            });
            
            const aliveParticles = particles.filter(p => p.life > 0);
            if (aliveParticles.length > 0) {
                requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }

    resize() {
        this.setupCanvas();
        this.drawBoard(window.slotMachine?.board || []);
    }
}