class SymbolManager {
    constructor() {
        this.symbols = {
            bomb: { emoji: '💣', value: 1, name: 'Bomba', multiplier: 5 },
            card: { emoji: '🃏', value: 2, name: 'Carta', multiplier: 10 },
            barrel: { emoji: '🛢️', value: 3, name: 'Barril', multiplier: 15 },
            goldPot: { emoji: '🪙', value: 4, name: 'Pote de Ouro', multiplier: 20 },
            frog: { emoji: '🐸', value: 5, name: 'Sapo', multiplier: 30 },
            cat: { emoji: '🐱', value: 6, name: 'Gato', multiplier: 50 },
            tiger: { emoji: '🐅', value: 10, name: 'Tigre', multiplier: 100, isWild: true }
        };
        
        this.symbolKeys = Object.keys(this.symbols);
        this.baseSymbols = ['bomb', 'card', 'barrel', 'goldPot', 'frog', 'cat'];
    }

    getRandomSymbol(includeWild = false) {
        const availableSymbols = includeWild ? this.symbolKeys : this.baseSymbols;
        const randomIndex = Math.floor(Math.random() * availableSymbols.length);
        return availableSymbols[randomIndex];
    }

    getMultipleRandomSymbols(count, includeWild = false) {
        const symbols = [];
        for (let i = 0; i < count; i++) {
            symbols.push(this.getRandomSymbol(includeWild));
        }
        return symbols;
    }

    generateBoard(includeWild = false) {
        const board = [];
        for (let i = 0; i < 9; i++) {
            board.push(this.getRandomSymbol(includeWild));
        }
        return board;
    }

    shuffleBoard(board, includeWild = false) {
        const newBoard = [];
        for (let i = 0; i < 9; i++) {
            if (Math.random() < 0.1 && includeWild) {
                newBoard.push('tiger');
            } else {
                newBoard.push(this.getRandomSymbol(false));
            }
        }
        return newBoard;
    }

    getSymbolInfo(symbolKey) {
        return this.symbols[symbolKey];
    }

    getSymbolEmoji(symbolKey) {
        return this.symbols[symbolKey]?.emoji || '❓';
    }

    getSymbolValue(symbolKey) {
        return this.symbols[symbolKey]?.value || 0;
    }

    getSymbolMultiplier(symbolKey) {
        return this.symbols[symbolKey]?.multiplier || 1;
    }

    isWild(symbolKey) {
        return this.symbols[symbolKey]?.isWild || false;
    }

    sortSymbolsByValue(symbols) {
        return symbols.sort((a, b) => this.getSymbolValue(b) - this.getSymbolValue(a));
    }

    getHighValueSymbols(minValue = 4) {
        return this.baseSymbols.filter(symbol => 
            this.getSymbolValue(symbol) >= minValue
        );
    }

    getBoardAnalysis(board) {
        const symbolCount = {};
        const symbolValues = [];
        
        board.forEach(symbol => {
            symbolCount[symbol] = (symbolCount[symbol] || 0) + 1;
            symbolValues.push(this.getSymbolValue(symbol));
        });

        const totalValue = symbolValues.reduce((sum, value) => sum + value, 0);
        const averageValue = totalValue / board.length;
        const maxValue = Math.max(...symbolValues);
        const minValue = Math.min(...symbolValues);

        return {
            symbolCount,
            totalValue,
            averageValue,
            maxValue,
            minValue,
            hasWild: board.some(symbol => this.isWild(symbol))
        };
    }
}