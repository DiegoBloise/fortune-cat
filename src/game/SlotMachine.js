class SlotMachine {
    constructor() {
        this.board = [];
        this.wallet = {
            balance: 1000,
            bet: 10
        };
        
        this.isSpinning = false;
        this.currentMultiplier = 1;
        this.lastWinningPositions = [];
        this.lastWin = null;
        
        this.symbolManager = new SymbolManager();
        this.winningDetector = new WinningDetector(this.symbolManager);
        this.multiplierEngine = new MultiplierEngine();
        
        this.canvas = null;
        this.touchController = null;
        
        this.initializeBoard();
        this.loadWalletFromStorage();
    }

    init() {
        this.canvas = new Canvas('gameCanvas');
        this.touchController = new TouchController(this.canvas.canvas);
        
        this.setupEventListeners();
        this.updateUI();
        this.drawBoard();
        
        window.slotMachine = this;
        
        window.addEventListener('resize', () => {
            this.canvas.resize();
        });
    }

    initializeBoard() {
        this.board = this.symbolManager.generateBoard(false);
    }

    setupEventListeners() {
        document.getElementById('spinButton').addEventListener('click', () => {
            this.spin();
        });

        document.getElementById('bet-decrease').addEventListener('click', () => {
            this.changeBet(-5);
        });

        document.getElementById('bet-increase').addEventListener('click', () => {
            this.changeBet(5);
        });

        this.touchController.addEventListener('tap', (event) => {
            if (!this.isSpinning) {
                const cell = event.detail.cell;
                this.handleCellTap(cell);
            }
        });

        this.touchController.addEventListener('swipe', (event) => {
            if (!this.isSpinning && event.detail.direction === 'up') {
                this.spin();
            }
        });
    }

    handleCellTap(cell) {
        this.canvas.animateCell(cell.index, 'bounce', 300);
    }

    changeBet(amount) {
        const newBet = this.wallet.bet + amount;
        
        if (newBet >= 5 && newBet <= this.wallet.balance && newBet <= 500) {
            this.wallet.bet = newBet;
            this.updateUI();
            this.saveWalletToStorage();
        }
    }

    async spin() {
        if (this.isSpinning) {
            return;
        }

        if (this.wallet.balance < this.wallet.bet) {
            this.showInsufficientFunds();
            return;
        }

        this.isSpinning = true;
        this.updateSpinButton(true);
        
        this.wallet.balance -= this.wallet.bet;
        this.updateUI();
        this.saveWalletToStorage();

        try {
            await this.performSpinAnimation();
            
            const includeWild = Math.random() < 0.15;
            this.board = this.symbolManager.shuffleBoard(this.board, includeWild);
            
            const finalMultiplier = await this.multiplierEngine.revealMultiplier(2000);
            this.currentMultiplier = finalMultiplier;
            
            await this.canvas.animateShuffle(this.board, 1500);
            
            const winAnalysis = this.winningDetector.analyzeWin(this.board, this.wallet.bet);
            const finalWinAmount = this.multiplierEngine.calculateFinalWin(winAnalysis.winAmount);
            
            this.lastWin = {
                ...winAnalysis,
                multiplier: this.currentMultiplier,
                finalWinAmount: finalWinAmount
            };
            
            this.lastWinningPositions = this.winningDetector.getWinningPositions(this.board);
            
            this.drawBoard();
            
            if (winAnalysis.hasWin) {
                await this.handleWin(finalWinAmount, winAnalysis);
            } else {
                this.showNoWin();
            }
            
        } catch (error) {
            console.error('Erro durante o spin:', error);
            this.showError();
        } finally {
            this.isSpinning = false;
            this.updateSpinButton(false);
            this.multiplierEngine.resetMultiplier();
        }
    }

    async performSpinAnimation() {
        const spinDuration = 1500;
        const startTime = Date.now();
        
        return new Promise(resolve => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / spinDuration, 1);
                
                const tempBoard = this.symbolManager.getMultipleRandomSymbols(9);
                this.drawBoard(tempBoard);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    async handleWin(winAmount, winAnalysis) {
        // Mostrar tabuleiro com as combinações primeiro
        this.drawBoard();
        
        // Mostrar multiplicador por cima
        if (this.currentMultiplier > 1) {
            await this.showMultiplierOverlay();
        }
        
        // Animar os símbolos vencedores
        await this.canvas.animateWin(this.lastWinningPositions, winAnalysis.isBigWin ? 'big' : 'normal');
        
        // Atualizar saldo
        this.wallet.balance += winAmount;
        this.updateUI();
        this.saveWalletToStorage();
        
        // Mostrar display de vitória com contagem animada
        await this.showWinDisplayAnimated(winAmount, winAnalysis);
        
        if (winAnalysis.isBigWin || winAnalysis.isMegaWin) {
            this.createWinEffects();
        }
    }

    async showMultiplierOverlay() {
        const multiplierDisplay = document.getElementById('multiplier');
        const multiplierValue = multiplierDisplay.querySelector('.multiplier-value');
        
        multiplierDisplay.style.display = 'block';
        multiplierValue.textContent = `${this.currentMultiplier}x`;
        
        // Aguardar para mostrar o multiplicador
        return new Promise(resolve => {
            setTimeout(() => {
                multiplierDisplay.style.display = 'none';
                resolve();
            }, 2000);
        });
    }

    async showWinDisplayAnimated(winAmount, winAnalysis) {
        const winDisplay = document.getElementById('winDisplay');
        const winAmountElement = document.getElementById('winAmount');
        const winMultiplierElement = document.getElementById('winMultiplier');
        
        // Configurar estilo baseado no tipo de vitória
        if (winAnalysis.isMegaWin) {
            winDisplay.style.background = 'linear-gradient(45deg, #ff1744, #d500f9)';
        } else if (winAnalysis.isBigWin) {
            winDisplay.style.background = 'linear-gradient(45deg, #ff9800, #ffc107)';
        } else {
            winDisplay.style.background = 'linear-gradient(45deg, #4caf50, #45a049)';
        }
        
        winDisplay.style.display = 'block';
        
        // Mostrar multiplicador
        winMultiplierElement.textContent = this.currentMultiplier > 1 ? 
            `Multiplicador: ${this.currentMultiplier}x` : '';
        
        // Animação de contagem de 0 até o valor final
        return this.animateWinAmount(winAmount, winAnalysis);
    }

    animateWinAmount(targetAmount, winAnalysis) {
        const winAmountElement = document.getElementById('winAmount');
        const duration = 2000; // 2 segundos
        const startTime = Date.now();
        const startAmount = 0;
        
        return new Promise(resolve => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Função de easing para animação suave
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentAmount = startAmount + (targetAmount - startAmount) * easeOutQuart;
                
                // Atualizar texto baseado no tipo de vitória
                let prefixText = '';
                if (winAnalysis.isMegaWin) {
                    prefixText = 'MEGA WIN! ';
                } else if (winAnalysis.isBigWin) {
                    prefixText = 'BIG WIN! ';
                }
                
                winAmountElement.textContent = `${prefixText}R$ ${currentAmount.toFixed(2)}`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    winAmountElement.textContent = `${prefixText}R$ ${targetAmount.toFixed(2)}`;
                    
                    // Adicionar botão de confirmação
                    this.addContinueButton(resolve);
                }
            };
            
            animate();
        });
    }

    addContinueButton(resolve) {
        const winDisplay = document.getElementById('winDisplay');
        const winContent = winDisplay.querySelector('.win-content');
        
        // Remover botão anterior se existir
        const existingButton = document.getElementById('continueButton');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Criar botão de continuar
        const continueButton = document.createElement('button');
        continueButton.id = 'continueButton';
        continueButton.textContent = 'Continuar';
        continueButton.style.cssText = `
            margin-top: 20px;
            padding: 10px 30px;
            background: #ffd700;
            color: #1a1a2e;
            border: none;
            border-radius: 25px;
            font-size: 1.1em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
        `;
        
        continueButton.addEventListener('click', () => {
            winDisplay.style.display = 'none';
            continueButton.remove();
            resolve();
        });
        
        continueButton.addEventListener('mouseenter', () => {
            continueButton.style.transform = 'translateY(-2px)';
            continueButton.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6)';
        });
        
        continueButton.addEventListener('mouseleave', () => {
            continueButton.style.transform = 'translateY(0)';
            continueButton.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.4)';
        });
        
        winContent.appendChild(continueButton);
    }

    showNoWin() {
        const canvas = this.canvas.canvas;
        const ctx = canvas.getContext('2d');
        
        ctx.save();
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('Tente novamente!', canvas.width / 2, canvas.height / 2);
        ctx.restore();
        
        setTimeout(() => {
            this.drawBoard();
        }, 1000);
    }

    showInsufficientFunds() {
        const winDisplay = document.getElementById('winDisplay');
        const winAmountElement = document.getElementById('winAmount');
        const winMultiplierElement = document.getElementById('winMultiplier');
        
        winDisplay.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';
        winAmountElement.textContent = 'Saldo insuficiente!';
        winMultiplierElement.textContent = 'Aumente seu saldo para continuar jogando';
        
        winDisplay.style.display = 'block';
        
        setTimeout(() => {
            winDisplay.style.display = 'none';
        }, 2000);
    }

    showError() {
        const winDisplay = document.getElementById('winDisplay');
        const winAmountElement = document.getElementById('winAmount');
        const winMultiplierElement = document.getElementById('winMultiplier');
        
        winDisplay.style.background = 'linear-gradient(45deg, #9e9e9e, #757575)';
        winAmountElement.textContent = 'Erro no jogo';
        winMultiplierElement.textContent = 'Tente novamente';
        
        winDisplay.style.display = 'block';
        
        setTimeout(() => {
            winDisplay.style.display = 'none';
        }, 2000);
    }

    createWinEffects() {
        const canvas = this.canvas.canvas;
        const rect = canvas.getBoundingClientRect();
        
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                this.canvas.createParticleEffect(x, y, '#ffd700', 15);
            }, i * 100);
        }
    }

    drawBoard(board = this.board) {
        this.canvas.drawBoard(board, this.lastWinningPositions);
    }

    updateUI() {
        document.getElementById('balance').textContent = `R$ ${this.wallet.balance.toFixed(2)}`;
        document.getElementById('bet').textContent = `R$ ${this.wallet.bet.toFixed(2)}`;
        document.querySelector('.spin-cost').textContent = `R$ ${this.wallet.bet.toFixed(2)}`;
    }

    updateSpinButton(isSpinning) {
        const spinButton = document.getElementById('spinButton');
        spinButton.disabled = isSpinning;
        
        const spinText = spinButton.querySelector('.spin-text');
        spinText.textContent = isSpinning ? 'GIRANDO...' : 'GIRAR';
        
        if (isSpinning) {
            spinButton.classList.add('spinning');
        } else {
            spinButton.classList.remove('spinning');
        }
    }

    saveWalletToStorage() {
        try {
            localStorage.setItem('fortuneCatWallet', JSON.stringify(this.wallet));
        } catch (error) {
            console.warn('Não foi possível salvar o saldo:', error);
        }
    }

    loadWalletFromStorage() {
        try {
            const saved = localStorage.getItem('fortuneCatWallet');
            if (saved) {
                const savedWallet = JSON.parse(saved);
                this.wallet = {
                    balance: Math.min(Math.max(savedWallet.balance || 1000, 0), 100000),
                    bet: Math.min(Math.max(savedWallet.bet || 10, 5), this.wallet.balance)
                };
            }
        } catch (error) {
            console.warn('Não foi possível carregar o saldo salvo:', error);
        }
    }

    resetWallet() {
        this.wallet = {
            balance: 1000,
            bet: 10
        };
        this.updateUI();
        this.saveWalletToStorage();
    }

    getStats() {
        return {
            currentBalance: this.wallet.balance,
            currentBet: this.wallet.bet,
            lastWin: this.lastWin,
            totalSpins: this.getStat('totalSpins'),
            totalWins: this.getStat('totalWins'),
            biggestWin: this.getStat('biggestWin')
        };
    }

    getStat(statName) {
        try {
            const stats = JSON.parse(localStorage.getItem('fortuneCatStats') || '{}');
            return stats[statName] || 0;
        } catch {
            return 0;
        }
    }

    updateStat(statName, value) {
        try {
            const stats = JSON.parse(localStorage.getItem('fortuneCatStats') || '{}');
            stats[statName] = value;
            localStorage.setItem('fortuneCatStats', JSON.stringify(stats));
        } catch (error) {
            console.warn('Não foi possível atualizar estatísticas:', error);
        }
    }
}