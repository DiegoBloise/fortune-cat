class WinningDetector {
    constructor(symbolManager) {
        this.symbolManager = symbolManager;
        this.winningLines = this.generateWinningLines();
    }

    generateWinningLines() {
        return [
            // Linhas horizontais
            [0, 1, 2], // Linha 1
            [3, 4, 5], // Linha 2  
            [6, 7, 8], // Linha 3
            
            // Linhas verticais
            [0, 3, 6], // Coluna 1
            [1, 4, 7], // Coluna 2
            [2, 5, 8], // Coluna 3
            
            // Diagonais
            [0, 4, 8], // Diagonal principal
            [2, 4, 6], // Diagonal secundária
        ];
    }

    checkWinningLines(board) {
        const wins = [];
        
        this.winningLines.forEach((line, index) => {
            const [pos1, pos2, pos3] = line;
            const symbol1 = board[pos1];
            const symbol2 = board[pos2];
            const symbol3 = board[pos3];
            
            if (this.isMatchingLine(symbol1, symbol2, symbol3)) {
                const baseSymbol = this.getBaseSymbol(symbol1, symbol2, symbol3);
                const lineInfo = {
                    line,
                    symbol: baseSymbol,
                    symbolInfo: this.symbolManager.getSymbolInfo(baseSymbol),
                    multiplier: this.symbolManager.getSymbolMultiplier(baseSymbol),
                    wildCount: this.countWilds(symbol1, symbol2, symbol3),
                    lineType: this.getLineType(index)
                };
                wins.push(lineInfo);
            }
        });
        
        return wins;
    }

    isMatchingLine(symbol1, symbol2, symbol3) {
        if (symbol1 === symbol2 && symbol2 === symbol3) {
            return true;
        }
        
        const wilds = this.countWilds(symbol1, symbol2, symbol3);
        if (wilds >= 2) {
            return true;
        }
        
        if (wilds === 1) {
            const nonWildSymbols = [symbol1, symbol2, symbol3].filter(s => !this.symbolManager.isWild(s));
            return nonWildSymbols.length === 1 || (nonWildSymbols.length === 2 && nonWildSymbols[0] === nonWildSymbols[1]);
        }
        
        return false;
    }

    getBaseSymbol(symbol1, symbol2, symbol3) {
        const nonWildSymbols = [symbol1, symbol2, symbol3].filter(s => !this.symbolManager.isWild(s));
        
        if (nonWildSymbols.length === 0) {
            return 'tiger';
        }
        
        if (nonWildSymbols.length === 1) {
            return nonWildSymbols[0];
        }
        
        return nonWildSymbols[0] === nonWildSymbols[1] ? nonWildSymbols[0] : null;
    }

    countWilds(symbol1, symbol2, symbol3) {
        const symbols = [symbol1, symbol2, symbol3];
        return symbols.filter(s => this.symbolManager.isWild(s)).length;
    }

    getLineType(lineIndex) {
        const types = [
            'Linha 1', 'Linha 2', 'Linha 3',
            'Coluna 1', 'Coluna 2', 'Coluna 3',
            'Diagonal Principal', 'Diagonal Secundária'
        ];
        return types[lineIndex];
    }

    checkFullBoardWin(board) {
        const firstSymbol = board[0];
        
        if (board.every(symbol => symbol === firstSymbol)) {
            return {
                type: 'fullBoard',
                symbol: firstSymbol,
                symbolInfo: this.symbolManager.getSymbolInfo(firstSymbol),
                multiplier: this.symbolManager.getSymbolMultiplier(firstSymbol) * 10,
                bonusMultiplier: 10
            };
        }
        
        const wilds = board.filter(symbol => this.symbolManager.isWild(symbol)).length;
        if (wilds >= 3) {
            return {
                type: 'wildBoard',
                symbol: 'tiger',
                symbolInfo: this.symbolManager.getSymbolInfo('tiger'),
                multiplier: this.symbolManager.getSymbolMultiplier('tiger') * 5,
                bonusMultiplier: 5
            };
        }
        
        return null;
    }

    calculateWinAmount(bet, wins, fullBoardWin = null) {
        let totalWin = 0;
        
        if (fullBoardWin) {
            totalWin += bet * fullBoardWin.multiplier;
        }
        
        wins.forEach(win => {
            let lineMultiplier = win.multiplier;
            
            if (win.wildCount > 0) {
                lineMultiplier *= (1 + win.wildCount * 0.5);
            }
            
            totalWin += bet * lineMultiplier;
        });
        
        return totalWin;
    }

    analyzeWin(board, bet) {
        const wins = this.checkWinningLines(board);
        const fullBoardWin = this.checkFullBoardWin(board);
        const winAmount = this.calculateWinAmount(bet, wins, fullBoardWin);
        
        return {
            wins,
            fullBoardWin,
            winAmount,
            totalWins: wins.length,
            hasWin: wins.length > 0 || fullBoardWin !== null,
            isBigWin: fullBoardWin !== null || wins.length >= 3,
            isMegaWin: winAmount >= bet * 50
        };
    }

    getWinningPositions(board) {
        const winningPositions = [];
        
        this.winningLines.forEach((line, index) => {
            const [pos1, pos2, pos3] = line;
            const symbol1 = board[pos1];
            const symbol2 = board[pos2];
            const symbol3 = board[pos3];
            
            if (this.isMatchingLine(symbol1, symbol2, symbol3)) {
                winningPositions.push(...line);
            }
        });
        
        return [...new Set(winningPositions)];
    }
}