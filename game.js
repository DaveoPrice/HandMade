// Main game controller
class TeaShopGame {
    constructor() {
        // Game state
        this.state = {
            money: 100,
            reputation: 0,
            day: 1,
            customersServed: 0,
            perfectBrews: 0
        };

        // Managers
        this.customerManager = new CustomerManager(this.state);
        this.foragingManager = new ForagingManager(this.state);

        // Brewing state
        this.currentBrew = {
            tea: null,
            temperature: 75,
            steepTime: 0,
            steeping: false,
            steepInterval: null
        };

        // Initialize UI
        this.initializeUI();
        this.updateAllUI();
    }

    initializeUI() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetPanel = e.target.dataset.panel;
                this.switchPanel(targetPanel);
            });
        });

        // Customer management
        document.getElementById('next-customer-btn').addEventListener('click', () => {
            this.welcomeNextCustomer();
        });

        // Tea selection
        const teaSelect = document.getElementById('tea-select');
        teaSelect.addEventListener('change', (e) => {
            this.selectTea(e.target.value);
        });

        // Temperature control
        const tempSlider = document.getElementById('temp-slider');
        const tempDisplay = document.getElementById('temp-display');
        tempSlider.addEventListener('input', (e) => {
            this.currentBrew.temperature = parseInt(e.target.value);
            tempDisplay.textContent = this.currentBrew.temperature;
        });

        // Steeping controls
        document.getElementById('start-steep-btn').addEventListener('click', () => {
            this.startSteeping();
        });

        document.getElementById('stop-steep-btn').addEventListener('click', () => {
            this.serveTea();
        });

        // Foraging
        this.initializeForagingUI();

        // Populate tea select
        this.populateTeaSelect();
    }

    initializeForagingUI() {
        const locationsContainer = document.getElementById('locations');
        locationsContainer.innerHTML = '';

        const locations = this.foragingManager.getUnlockedLocations();

        locations.forEach(location => {
            const locationCard = document.createElement('div');
            locationCard.className = 'location-card';

            const status = this.foragingManager.getLocationStatus(location.id);
            const canAfford = this.state.money >= location.cost;

            locationCard.innerHTML = `
                <h4>${location.name}</h4>
                <p>${location.description}</p>
                <p><strong>Cost:</strong> ${location.cost} coins</p>
                <p><strong>Time:</strong> ${location.timeRequired} turns</p>
                ${!canAfford ? '<p style="color: var(--danger)">Not enough coins</p>' : ''}
            `;

            if (canAfford) {
                locationCard.addEventListener('click', () => {
                    this.startForagingExpedition(location.id);
                });
            } else {
                locationCard.style.opacity = '0.6';
                locationCard.style.cursor = 'not-allowed';
            }

            locationsContainer.appendChild(locationCard);
        });
    }

    switchPanel(panelId) {
        // Hide all panels
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('active');
        });

        // Show selected panel
        document.getElementById(panelId).classList.add('active');

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.panel === panelId) {
                btn.classList.add('active');
            }
        });

        // Refresh foraging UI when switching to it
        if (panelId === 'foraging-panel') {
            this.initializeForagingUI();
            this.updateTeaCollection();
        }
    }

    populateTeaSelect() {
        const select = document.getElementById('tea-select');
        select.innerHTML = '<option value="">-- Select a tea --</option>';

        Object.values(TEA_DATABASE).forEach(tea => {
            if (tea.unlocked) {
                const option = document.createElement('option');
                option.value = tea.id;
                option.textContent = `${tea.name} (${tea.type}) - ${tea.price} coins`;
                select.appendChild(option);
            }
        });
    }

    selectTea(teaId) {
        if (!teaId) {
            this.currentBrew.tea = null;
            return;
        }

        this.currentBrew.tea = TEA_DATABASE[teaId];

        // Reset brewing parameters
        this.currentBrew.steepTime = 0;
        document.getElementById('steep-progress').style.width = '0%';
        document.getElementById('steep-display').textContent = '0';

        // Suggest ideal temperature
        const idealTemp = this.currentBrew.tea.idealTemp;
        document.getElementById('temp-slider').value = idealTemp;
        this.currentBrew.temperature = idealTemp;
        document.getElementById('temp-display').textContent = idealTemp;
    }

    welcomeNextCustomer() {
        const customer = this.customerManager.generateCustomer();

        // Update UI
        document.getElementById('current-customer').classList.remove('hidden');
        document.getElementById('customer-name').textContent = customer.name;
        document.getElementById('customer-mood').textContent = this.customerManager.getCustomerMood();
        document.getElementById('customer-request').textContent = `"${customer.greeting}" - Requests: ${customer.requestedTea.name}`;

        // Show brewing area
        document.getElementById('brewing-area').classList.remove('hidden');

        // Hide next customer button
        document.getElementById('next-customer-btn').classList.add('hidden');

        // Auto-select the requested tea
        document.getElementById('tea-select').value = customer.requestedTea.id;
        this.selectTea(customer.requestedTea.id);

        // Start mood update interval
        this.moodInterval = setInterval(() => {
            document.getElementById('customer-mood').textContent = this.customerManager.getCustomerMood();
        }, 5000);
    }

    startSteeping() {
        if (!this.currentBrew.tea) {
            alert('Please select a tea first!');
            return;
        }

        this.currentBrew.steeping = true;
        this.currentBrew.steepTime = 0;

        // Update UI
        document.getElementById('start-steep-btn').classList.add('hidden');
        document.getElementById('stop-steep-btn').classList.remove('hidden');
        document.getElementById('tea-select').disabled = true;
        document.getElementById('temp-slider').disabled = true;

        // Hide previous feedback
        document.getElementById('brew-feedback').classList.remove('show');

        // Start timer
        this.currentBrew.steepInterval = setInterval(() => {
            this.currentBrew.steepTime += 1;
            document.getElementById('steep-display').textContent = this.currentBrew.steepTime;

            // Update progress bar (max out at ideal steep time * 2)
            const maxTime = this.currentBrew.tea.idealSteep * 2;
            const progress = Math.min((this.currentBrew.steepTime / maxTime) * 100, 100);
            document.getElementById('steep-progress').style.width = progress + '%';

            // Change color based on steeping quality
            const steepProgress = document.getElementById('steep-progress');
            const diff = Math.abs(this.currentBrew.steepTime - this.currentBrew.tea.idealSteep);

            if (diff <= 15) {
                steepProgress.style.background = 'linear-gradient(90deg, var(--success), var(--success))';
            } else if (diff <= 30) {
                steepProgress.style.background = 'linear-gradient(90deg, var(--warning), var(--warning))';
            } else {
                steepProgress.style.background = 'linear-gradient(90deg, var(--danger), var(--danger))';
            }
        }, 1000);
    }

    serveTea() {
        if (!this.currentBrew.steeping) return;

        // Stop steeping
        clearInterval(this.currentBrew.steepInterval);
        this.currentBrew.steeping = false;

        // Evaluate the brew
        const feedback = this.customerManager.evaluateService(
            this.currentBrew.tea,
            this.currentBrew.temperature,
            this.currentBrew.steepTime
        );

        // Update game state
        this.state.money += feedback.payment;
        this.state.reputation += feedback.reputation;
        this.state.customersServed++;

        if (feedback.quality === 'perfect') {
            this.state.perfectBrews++;
        }

        // Show feedback
        this.displayFeedback(feedback);

        // Update stats
        this.updateAllUI();

        // Clean up
        this.customerManager.dismissCustomer();
        if (this.moodInterval) {
            clearInterval(this.moodInterval);
        }

        // Reset UI after delay
        setTimeout(() => {
            this.resetBrewingUI();
        }, 3000);
    }

    displayFeedback(feedback) {
        const feedbackEl = document.getElementById('brew-feedback');
        feedbackEl.className = 'show ' + feedback.quality;

        let qualityEmoji = '';
        switch(feedback.quality) {
            case 'perfect': qualityEmoji = '✨'; break;
            case 'good': qualityEmoji = '👍'; break;
            case 'acceptable': qualityEmoji = '😐'; break;
            case 'poor': qualityEmoji = '😞'; break;
        }

        feedbackEl.innerHTML = `
            <h4>${qualityEmoji} ${feedback.message}</h4>
            <p><strong>${feedback.customerName}:</strong> "${feedback.customerResponse}"</p>
            <p>Earned: ${feedback.payment} coins | Reputation: ${feedback.reputation > 0 ? '+' : ''}${feedback.reputation}</p>
        `;
    }

    resetBrewingUI() {
        // Hide customer and brewing areas
        document.getElementById('current-customer').classList.add('hidden');
        document.getElementById('brewing-area').classList.add('hidden');

        // Show next customer button
        document.getElementById('next-customer-btn').classList.remove('hidden');

        // Reset brewing controls
        document.getElementById('start-steep-btn').classList.remove('hidden');
        document.getElementById('stop-steep-btn').classList.add('hidden');
        document.getElementById('tea-select').disabled = false;
        document.getElementById('temp-slider').disabled = false;
        document.getElementById('brew-feedback').classList.remove('show');

        // Reset brew state
        this.currentBrew = {
            tea: null,
            temperature: 75,
            steepTime: 0,
            steeping: false,
            steepInterval: null
        };

        document.getElementById('tea-select').value = '';
        document.getElementById('steep-progress').style.width = '0%';
        document.getElementById('steep-display').textContent = '0';
    }

    startForagingExpedition(locationId) {
        const result = this.foragingManager.startForaging(locationId);

        if (!result.success) {
            alert(result.message);
            return;
        }

        // Show results
        this.displayForagingResults(result);

        // Update UI
        this.updateAllUI();
        this.initializeForagingUI();
        this.populateTeaSelect();
        this.updateTeaCollection();
    }

    displayForagingResults(result) {
        const resultsContainer = document.getElementById('foraging-results');
        const foundItemsContainer = document.getElementById('found-items');

        foundItemsContainer.innerHTML = '';

        result.results.forEach((finding, index) => {
            setTimeout(() => {
                const itemEl = document.createElement('div');
                itemEl.className = 'found-item' + (finding.isNew ? ' new' : '');
                itemEl.innerHTML = `<h4>${finding.message}</h4>`;
                foundItemsContainer.appendChild(itemEl);
            }, index * 500);
        });

        // Hide location select, show results
        document.getElementById('location-select').classList.add('hidden');
        resultsContainer.classList.remove('hidden');

        // Return button
        document.getElementById('return-shop-btn').addEventListener('click', () => {
            resultsContainer.classList.add('hidden');
            document.getElementById('location-select').classList.remove('hidden');
            this.switchPanel('shop-panel');
        }, { once: true });
    }

    updateTeaCollection() {
        const container = document.getElementById('owned-teas');
        container.innerHTML = '';

        Object.values(TEA_DATABASE).forEach(tea => {
            const teaItem = document.createElement('div');
            teaItem.className = 'tea-item ' + (tea.unlocked ? 'unlocked' : 'locked');

            if (tea.unlocked) {
                teaItem.innerHTML = `
                    <h4>${tea.name}</h4>
                    <p>${tea.type}</p>
                    <p>${tea.rarity}</p>
                `;
            } else {
                teaItem.innerHTML = `
                    <h4>???</h4>
                    <p>Undiscovered</p>
                `;
            }

            container.appendChild(teaItem);
        });
    }

    updateAllUI() {
        document.querySelector('#money .value').textContent = this.state.money;
        document.querySelector('#reputation .value').textContent = this.state.reputation;
        document.querySelector('#day .value').textContent = this.state.day;
    }
}

// Start game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new TeaShopGame();
});
