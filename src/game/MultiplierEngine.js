class MultiplierEngine {
    constructor() {
        this.possibleMultipliers = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
        this.currentMultiplier = 1;
        this.isRevealing = false;
        this.multiplierWeights = {
            5: 30,
            10: 25,
            15: 20,
            20: 15,
            25: 12,
            30: 10,
            40: 8,
            50: 6,
            75: 4,
            100: 2
        };
    }

    getRandomMultiplier() {
        const totalWeight = Object.values(this.multiplierWeights).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const [multiplier, weight] of Object.entries(this.multiplierWeights)) {
            random -= weight;
            if (random <= 0) {
                return parseInt(multiplier);
            }
        }
        
        return 5;
    }

    calculateProbability(targetMultiplier) {
        const totalWeight = Object.values(this.multiplierWeights).reduce((sum, weight) => sum + weight, 0);
        const targetWeight = this.multiplierWeights[targetMultiplier] || 0;
        return (targetWeight / totalWeight * 100).toFixed(1);
    }

    getMultiplierDistribution() {
        const distribution = {};
        Object.entries(this.multiplierWeights).forEach(([multiplier, weight]) => {
            distribution[multiplier] = this.calculateProbability(parseInt(multiplier));
        });
        return distribution;
    }

    async revealMultiplier(duration = 3000) {
        if (this.isRevealing) {
            return this.currentMultiplier;
        }
        
        this.isRevealing = true;
        const finalMultiplier = this.getRandomMultiplier();
        
        this.startMultiplierAnimation();
        
        await this.waitForDuration(duration);
        
        this.stopMultiplierAnimation();
        this.currentMultiplier = finalMultiplier;
        
        this.isRevealing = false;
        return finalMultiplier;
    }

    startMultiplierAnimation() {
        const multiplierDisplay = document.getElementById('multiplier');
        const multiplierValue = multiplierDisplay.querySelector('.multiplier-value');
        
        multiplierDisplay.style.display = 'block';
        
        let animationInterval = setInterval(() => {
            const randomMultiplier = this.possibleMultipliers[Math.floor(Math.random() * this.possibleMultipliers.length)];
            multiplierValue.textContent = `${randomMultiplier}x`;
            
            multiplierValue.style.color = this.getMultiplierColor(randomMultiplier);
        }, 100);
        
        multiplierDisplay.animationInterval = animationInterval;
    }

    stopMultiplierAnimation() {
        const multiplierDisplay = document.getElementById('multiplier');
        const multiplierValue = multiplierDisplay.querySelector('.multiplier-value');
        
        if (multiplierDisplay.animationInterval) {
            clearInterval(multiplierDisplay.animationInterval);
            multiplierDisplay.animationInterval = null;
        }
        
        multiplierValue.textContent = `${this.currentMultiplier}x`;
        multiplierValue.style.color = this.getMultiplierColor(this.currentMultiplier);
        
        setTimeout(() => {
            multiplierDisplay.style.display = 'none';
        }, 1500);
    }

    getMultiplierColor(multiplier) {
        if (multiplier >= 75) return '#ff1744';
        if (multiplier >= 50) return '#ff9800';
        if (multiplier >= 25) return '#ffeb3b';
        if (multiplier >= 15) return '#4caf50';
        return '#2196f3';
    }

    waitForDuration(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    applyMultiplier(baseAmount) {
        return Math.round(baseAmount * this.currentMultiplier);
    }

    resetMultiplier() {
        this.currentMultiplier = 1;
        this.isRevealing = false;
    }

    isHighMultiplier() {
        return this.currentMultiplier >= 50;
    }

    isMegaMultiplier() {
        return this.currentMultiplier >= 75;
    }

    getMultiplierTier() {
        if (this.currentMultiplier >= 75) return 'MEGA';
        if (this.currentMultiplier >= 50) return 'HIGH';
        if (this.currentMultiplier >= 25) return 'MEDIUM';
        if (this.currentMultiplier >= 15) return 'LOW';
        return 'MINIMAL';
    }

    getMultiplierBonus() {
        const tier = this.getMultiplierTier();
        switch (tier) {
            case 'MEGA': return 2.0;
            case 'HIGH': return 1.5;
            case 'MEDIUM': return 1.2;
            case 'LOW': return 1.1;
            default: return 1.0;
        }
    }

    calculateFinalWin(baseWin) {
        const multiplierWin = this.applyMultiplier(baseWin);
        const bonus = this.getMultiplierBonus();
        return Math.round(multiplierWin * bonus);
    }

    getMultiplierAnimationDuration() {
        if (this.currentMultiplier >= 75) return 4000;
        if (this.currentMultiplier >= 50) return 3500;
        if (this.currentMultiplier >= 25) return 3000;
        return 2500;
    }

    createMultiplierEffect(canvas, x, y) {
        const ctx = canvas.getContext('2d');
        let opacity = 1.0;
        let scale = 1.0;
        
        const animate = () => {
            if (opacity <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.font = `bold ${30 * scale}px Arial`;
            ctx.fillStyle = this.getMultiplierColor(this.currentMultiplier);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${this.currentMultiplier}x`, x, y);
            ctx.restore();
            
            opacity -= 0.02;
            scale += 0.01;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}