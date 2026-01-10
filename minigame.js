// Tea Leaf Catching Mini-Game
class TeaLeafGame {
    constructor() {
        this.active = false;
        this.leavesCaught = 0;
        this.bonusCoins = 0;
        this.spawnInterval = null;
        this.gameArea = null;
        this.activeLeaves = [];
    }

    start() {
        this.active = true;
        this.leavesCaught = 0;
        this.bonusCoins = 0;
        this.activeLeaves = [];

        // Show game area
        const gameContainer = document.getElementById('tea-leaf-game');
        gameContainer.classList.remove('hidden');

        this.gameArea = document.getElementById('game-area');
        this.updateStats();

        // Start spawning tea leaves
        this.spawnLeaf(); // Spawn first one immediately
        this.spawnInterval = setInterval(() => {
            this.spawnLeaf();
        }, 2000); // Spawn every 2 seconds
    }

    stop() {
        this.active = false;

        // Clear interval
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }

        // Remove all active leaves
        this.activeLeaves.forEach(leaf => {
            if (leaf.element && leaf.element.parentNode) {
                leaf.element.remove();
            }
            if (leaf.timeout) {
                clearTimeout(leaf.timeout);
            }
        });
        this.activeLeaves = [];

        // Hide game area
        const gameContainer = document.getElementById('tea-leaf-game');
        gameContainer.classList.add('hidden');

        return {
            leavesCaught: this.leavesCaught,
            bonusCoins: this.bonusCoins
        };
    }

    spawnLeaf() {
        if (!this.active) return;

        const leaf = document.createElement('div');
        leaf.className = 'tea-leaf';

        // Random emoji from tea-related options
        const leafEmojis = ['🍃', '🌿', '🍂', '🌱'];
        leaf.textContent = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];

        // Random horizontal position (avoid edges)
        const leftPos = 10 + Math.random() * 80; // 10% to 90%
        leaf.style.left = leftPos + '%';

        // Random animation duration (slower = easier)
        const duration = 3 + Math.random() * 2; // 3-5 seconds
        leaf.style.animationDuration = duration + 's';

        // Add random horizontal drift
        const drift = -20 + Math.random() * 40; // -20px to +20px
        leaf.style.setProperty('--drift', drift + 'px');

        // Track this leaf
        const leafData = {
            element: leaf,
            timeout: null
        };

        // Add click handler
        leaf.addEventListener('click', () => {
            this.catchLeaf(leafData);
        });

        // Auto-remove after animation completes
        leafData.timeout = setTimeout(() => {
            this.removeLeaf(leafData);
        }, duration * 1000);

        this.activeLeaves.push(leafData);
        this.gameArea.appendChild(leaf);
    }

    catchLeaf(leafData) {
        if (!leafData.element) return;

        // Award points
        this.leavesCaught++;
        this.bonusCoins += 2; // 2 coins per leaf

        // Visual feedback
        leafData.element.classList.add('caught');
        leafData.element.textContent = '+2';

        // Play catch animation
        setTimeout(() => {
            this.removeLeaf(leafData);
        }, 300);

        this.updateStats();
    }

    removeLeaf(leafData) {
        const index = this.activeLeaves.indexOf(leafData);
        if (index > -1) {
            this.activeLeaves.splice(index, 1);
        }

        if (leafData.timeout) {
            clearTimeout(leafData.timeout);
        }

        if (leafData.element && leafData.element.parentNode) {
            leafData.element.remove();
        }
    }

    updateStats() {
        document.getElementById('leaves-caught').textContent = this.leavesCaught;
        document.getElementById('bonus-coins').textContent = this.bonusCoins;
    }

    getResults() {
        return {
            leavesCaught: this.leavesCaught,
            bonusCoins: this.bonusCoins
        };
    }
}

// Perfect Pour Mini-Game
class PerfectPourGame {
    constructor(callback) {
        this.callback = callback;
        this.active = false;
        this.indicator = null;
        this.targetZone = null;
        this.animationFrame = null;
        this.position = 0;
        this.direction = 1;
        this.speed = 2;
    }

    start() {
        return new Promise((resolve) => {
            this.active = true;
            this.position = 0;
            this.direction = 1;

            // Create modal overlay
            const modal = document.createElement('div');
            modal.className = 'pour-game-modal';
            modal.innerHTML = `
                <div class="pour-game-container">
                    <h3>Perfect Pour!</h3>
                    <p>Click when the indicator is in the green zone!</p>
                    <div class="pour-meter">
                        <div class="pour-zone perfect"></div>
                        <div class="pour-indicator" id="pour-indicator"></div>
                    </div>
                    <p class="pour-hint">Tip: Better timing = Quality bonus!</p>
                </div>
            `;

            document.body.appendChild(modal);

            this.indicator = document.getElementById('pour-indicator');
            this.targetZone = modal.querySelector('.pour-zone');

            // Click handler
            const clickHandler = () => {
                const result = this.checkAccuracy();
                this.stop();
                modal.remove();
                resolve(result);
            };

            modal.addEventListener('click', clickHandler);

            // Start animation
            this.animate();

            // Auto-resolve after 8 seconds if no click
            setTimeout(() => {
                if (this.active) {
                    modal.removeEventListener('click', clickHandler);
                    this.stop();
                    modal.remove();
                    resolve({ success: false, bonus: 0, message: 'Too slow!' });
                }
            }, 8000);
        });
    }

    animate() {
        if (!this.active) return;

        // Update position
        this.position += this.speed * this.direction;

        // Bounce at edges
        if (this.position >= 100) {
            this.position = 100;
            this.direction = -1;
        } else if (this.position <= 0) {
            this.position = 0;
            this.direction = 1;
        }

        // Update indicator position
        if (this.indicator) {
            this.indicator.style.left = this.position + '%';
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    checkAccuracy() {
        // Perfect zone is 40-60%
        const perfectStart = 40;
        const perfectEnd = 60;

        // Good zone is 30-70%
        const goodStart = 30;
        const goodEnd = 70;

        if (this.position >= perfectStart && this.position <= perfectEnd) {
            return {
                success: true,
                quality: 'perfect',
                bonus: 10,
                message: '✨ Perfect Pour! +10 coins'
            };
        } else if (this.position >= goodStart && this.position <= goodEnd) {
            return {
                success: true,
                quality: 'good',
                bonus: 5,
                message: '👍 Good Pour! +5 coins'
            };
        } else {
            return {
                success: false,
                quality: 'poor',
                bonus: 0,
                message: '😕 Missed! No bonus'
            };
        }
    }

    stop() {
        this.active = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}
