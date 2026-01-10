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
        this.notebookManager = new NotebookManager();
        this.vesselManager = new VesselManager(this.state);

        // Brewing state
        this.currentBrew = {
            tea: null,
            temperature: 75,
            steepTime: 0,
            steeping: false,
            steepInterval: null,
            speedMultiplier: 1 // 1x, 2x, or 3x speed
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

        // Speed controls
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update speed multiplier
                this.currentBrew.speedMultiplier = parseInt(e.target.dataset.speed);

                // Update active button
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
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

        // Notebook
        this.initializeNotebookUI();

        // Vessels
        this.initializeVesselUI();

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

        // Refresh notebook when switching to it
        if (panelId === 'notebook-panel') {
            this.updateNotebookUI();
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

        // Start timer (interval adjusted by speed multiplier)
        const intervalTime = 1000 / this.currentBrew.speedMultiplier;
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
        }, intervalTime);
    }

    serveTea() {
        if (!this.currentBrew.steeping) return;

        // Stop steeping
        clearInterval(this.currentBrew.steepInterval);
        this.currentBrew.steeping = false;

        // Get vessel bonuses
        const vessel = this.vesselManager.getCurrentVessel();

        // Evaluate the brew with vessel bonuses
        const feedback = this.customerManager.evaluateService(
            this.currentBrew.tea,
            this.currentBrew.temperature,
            this.currentBrew.steepTime,
            vessel
        );

        // Update game state
        this.state.money += feedback.payment;
        this.state.reputation += feedback.reputation;
        this.state.customersServed++;

        if (feedback.quality === 'perfect') {
            this.state.perfectBrews++;
        }

        // Record in notebook
        this.notebookManager.updateTeaStats(
            this.currentBrew.tea.id,
            this.currentBrew.tea.name,
            this.currentBrew.temperature,
            this.currentBrew.steepTime,
            feedback.quality
        );

        this.notebookManager.recordBrew(
            this.currentBrew.tea.name,
            this.currentBrew.temperature,
            this.currentBrew.steepTime,
            feedback.quality,
            feedback.customerName
        );

        this.notebookManager.addCustomerNote(
            feedback.customerName,
            this.customerManager.currentCustomer.type,
            this.currentBrew.tea.name,
            feedback.quality,
            feedback.customerResponse
        );

        // Show feedback
        this.displayFeedback(feedback);

        // Update stats
        this.updateAllUI();

        // Clean up
        this.customerManager.dismissCustomer();
        if (this.moodInterval) {
            clearInterval(this.moodInterval);
        }

        // Note: UI reset now controlled by user clicking "Continue" button
    }

    displayFeedback(feedback) {
        const feedbackEl = document.getElementById('brew-feedback');
        feedbackEl.className = 'show ' + feedback.quality;

        let qualityEmoji = '';
        let qualityText = '';
        switch(feedback.quality) {
            case 'perfect':
                qualityEmoji = '✨';
                qualityText = 'Perfect Brew!';
                break;
            case 'good':
                qualityEmoji = '👍';
                qualityText = 'Good Brew';
                break;
            case 'acceptable':
                qualityEmoji = '😐';
                qualityText = 'Acceptable';
                break;
            case 'poor':
                qualityEmoji = '😞';
                qualityText = 'Needs Improvement';
                break;
        }

        // Store current brew data for note-taking
        this.lastBrewData = {
            teaName: this.currentBrew.tea.name,
            temperature: this.currentBrew.temperature,
            steepTime: this.currentBrew.steepTime,
            quality: feedback.quality,
            customerName: feedback.customerName
        };

        feedbackEl.innerHTML = `
            <div class="feedback-header">
                <h3>${qualityEmoji} ${qualityText}</h3>
                <p class="feedback-message">${feedback.message}</p>
            </div>

            <div class="feedback-details">
                <div class="customer-response">
                    <strong>${feedback.customerName}:</strong>
                    <p>"${feedback.customerResponse}"</p>
                </div>

                <div class="brew-summary">
                    <div class="brew-stat">
                        <span class="stat-label">Tea:</span>
                        <span class="stat-value">${this.currentBrew.tea.name}</span>
                    </div>
                    <div class="brew-stat">
                        <span class="stat-label">Temperature:</span>
                        <span class="stat-value">${this.currentBrew.temperature}°C</span>
                    </div>
                    <div class="brew-stat">
                        <span class="stat-label">Steep Time:</span>
                        <span class="stat-value">${this.currentBrew.steepTime}s</span>
                    </div>
                </div>

                <div class="earnings-display">
                    <div class="earning-item">
                        <span class="earning-label">💰 Earned:</span>
                        <span class="earning-value">+${feedback.payment} coins</span>
                    </div>
                    <div class="earning-item">
                        <span class="earning-label">⭐ Reputation:</span>
                        <span class="earning-value ${feedback.reputation >= 0 ? 'positive' : 'negative'}">${feedback.reputation > 0 ? '+' : ''}${feedback.reputation}</span>
                    </div>
                </div>
            </div>

            <div class="feedback-actions">
                <button id="add-quick-note-btn" class="btn-secondary">📝 Add Note</button>
                <button id="view-stats-btn" class="btn-secondary">📊 View Stats</button>
                <button id="continue-btn" class="btn-primary">Continue ➜</button>
            </div>

            <div id="quick-note-area" class="quick-note-area hidden">
                <textarea id="quick-note-input" placeholder="Add a note about this brew..."></textarea>
                <div class="note-actions">
                    <button id="save-note-btn" class="btn-primary">Save Note</button>
                    <button id="cancel-note-btn" class="btn-secondary">Cancel</button>
                </div>
            </div>
        `;

        // Attach event listeners to the new buttons
        this.attachFeedbackListeners();
    }

    attachFeedbackListeners() {
        // Continue button - proceed to next customer
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.resetBrewingUI();
            });
        }

        // Add Note button - show note input area
        const addNoteBtn = document.getElementById('add-quick-note-btn');
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => {
                const noteArea = document.getElementById('quick-note-area');
                noteArea.classList.toggle('hidden');
                if (!noteArea.classList.contains('hidden')) {
                    document.getElementById('quick-note-input').focus();
                }
            });
        }

        // Save Note button
        const saveNoteBtn = document.getElementById('save-note-btn');
        if (saveNoteBtn) {
            saveNoteBtn.addEventListener('click', () => {
                const noteInput = document.getElementById('quick-note-input');
                const noteText = noteInput.value.trim();

                if (noteText) {
                    // Add note about this specific brew
                    const note = `${this.lastBrewData.teaName} for ${this.lastBrewData.customerName}: ${noteText}`;
                    this.notebookManager.addGeneralNote(note);

                    // Clear and hide the note area
                    noteInput.value = '';
                    document.getElementById('quick-note-area').classList.add('hidden');

                    // Show confirmation
                    alert('Note saved to your notebook!');
                }
            });
        }

        // Cancel Note button
        const cancelNoteBtn = document.getElementById('cancel-note-btn');
        if (cancelNoteBtn) {
            cancelNoteBtn.addEventListener('click', () => {
                document.getElementById('quick-note-input').value = '';
                document.getElementById('quick-note-area').classList.add('hidden');
            });
        }

        // View Stats button - switch to notebook stats tab
        const viewStatsBtn = document.getElementById('view-stats-btn');
        if (viewStatsBtn) {
            viewStatsBtn.addEventListener('click', () => {
                // Switch to notebook panel
                document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
                document.getElementById('notebook-panel').classList.add('active');

                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('[data-panel="notebook-panel"]').classList.add('active');

                // Switch to statistics section
                document.querySelectorAll('.notebook-section').forEach(s => s.classList.remove('active'));
                document.getElementById('statistics-section').classList.add('active');

                document.querySelectorAll('.notebook-tab').forEach(t => t.classList.remove('active'));
                document.querySelector('[data-section="statistics"]').classList.add('active');

                // Update notebook display
                this.notebookManager.updateNotebookDisplay();

                // Reset brewing UI
                this.resetBrewingUI();
            });
        }
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
            steepInterval: null,
            speedMultiplier: 1
        };

        // Reset speed buttons
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.speed === '1') {
                btn.classList.add('active');
            }
        });

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

    // Notebook UI Management
    initializeNotebookUI() {
        // Notebook tab switching
        document.querySelectorAll('.notebook-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetSection = e.target.dataset.section;
                this.switchNotebookSection(targetSection);
            });
        });

        // Add note button
        document.getElementById('add-note-btn').addEventListener('click', () => {
            const noteText = document.getElementById('new-note-input').value.trim();
            if (noteText) {
                this.notebookManager.addGeneralNote(noteText);
                document.getElementById('new-note-input').value = '';
                this.updateGeneralNotes();
            }
        });
    }

    switchNotebookSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.notebook-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionId + '-section').classList.add('active');

        // Update tab buttons
        document.querySelectorAll('.notebook-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.section === sectionId) {
                tab.classList.add('active');
            }
        });

        // Update the section content
        this.updateNotebookSection(sectionId);
    }

    updateNotebookUI() {
        // Update all sections
        this.updateTeaNotes();
        this.updateCustomerLog();
        this.updateBrewingHistory();
        this.updateGeneralNotes();
        this.updateStatistics();
    }

    updateNotebookSection(sectionId) {
        switch(sectionId) {
            case 'tea-notes':
                this.updateTeaNotes();
                break;
            case 'customer-log':
                this.updateCustomerLog();
                break;
            case 'brewing-history':
                this.updateBrewingHistory();
                break;
            case 'general-notes':
                this.updateGeneralNotes();
                break;
            case 'statistics':
                this.updateStatistics();
                break;
        }
    }

    updateTeaNotes() {
        const container = document.getElementById('tea-notes-list');
        const teaNotes = this.notebookManager.getAllTeaNotes();

        if (Object.keys(teaNotes).length === 0) {
            container.innerHTML = '<p style="color: var(--text-light); font-style: italic;">No tea notes yet. Start brewing to collect data!</p>';
            return;
        }

        container.innerHTML = '';

        Object.entries(teaNotes).forEach(([teaId, noteData]) => {
            const card = document.createElement('div');
            card.className = 'tea-note-card';

            const suggestion = this.notebookManager.getSuggestion(teaId);
            const tea = TEA_DATABASE[teaId];

            card.innerHTML = `
                <h4>${noteData.teaName}</h4>
                <div class="stats">
                    <span>Brews: ${noteData.totalBrews}</span>
                    <span>Success: ${noteData.successfulBrews}</span>
                    <span>Rate: ${noteData.totalBrews > 0 ? ((noteData.successfulBrews / noteData.totalBrews) * 100).toFixed(0) : 0}%</span>
                </div>
                ${suggestion ? `
                    <div class="suggestion">
                        💡 Best Results: ${suggestion.temperature}°C, ${suggestion.steepTime}s (${suggestion.successRate}% success)
                    </div>
                ` : ''}
                ${tea ? `
                    <div class="suggestion" style="background: #f0f8ff; border-left-color: var(--accent-primary);">
                        📖 Ideal: ${tea.idealTemp}°C, ${tea.idealSteep}s
                    </div>
                ` : ''}
                ${noteData.notes.length > 0 ? `
                    <div style="margin-top: 10px;">
                        <strong>Notes:</strong>
                        ${noteData.notes.map(note => `
                            <div class="note-entry">
                                <div>${note.text}</div>
                                <div class="note-date">${note.date}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            `;

            container.appendChild(card);
        });
    }

    updateCustomerLog() {
        const container = document.getElementById('customer-log-list');
        const customerNotes = this.notebookManager.getCustomerNotes();

        if (customerNotes.length === 0) {
            container.innerHTML = '<p style="color: var(--text-light); font-style: italic;">No customer interactions yet.</p>';
            return;
        }

        container.innerHTML = '';

        customerNotes.forEach(note => {
            const entry = document.createElement('div');
            entry.className = `customer-log-entry ${note.quality}`;

            entry.innerHTML = `
                <div class="log-header">
                    <span class="customer-name">${note.customerName} (${note.customerType})</span>
                    <span class="log-date">${note.date}</span>
                </div>
                <div class="log-details">
                    Served: ${note.teaServed} | Quality: ${note.quality}
                </div>
                ${note.note ? `<div style="margin-top: 5px; font-style: italic;">"${note.note}"</div>` : ''}
            `;

            container.appendChild(entry);
        });
    }

    updateBrewingHistory() {
        const container = document.getElementById('brewing-history-list');
        const history = this.notebookManager.getBrewingHistory(30);

        if (history.length === 0) {
            container.innerHTML = '<p style="color: var(--text-light); font-style: italic;">No brewing history yet.</p>';
            return;
        }

        container.innerHTML = '';

        history.forEach(brew => {
            const entry = document.createElement('div');
            entry.className = 'brew-history-entry';

            entry.innerHTML = `
                <div class="brew-info">
                    <div class="tea-name">${brew.teaName}</div>
                    <div class="brew-params">${brew.temperature}°C, ${brew.steepTime}s | ${brew.customerName}</div>
                    <div style="font-size: 0.8em; color: var(--text-light);">${brew.date}</div>
                </div>
                <div class="quality-badge ${brew.quality}">${brew.quality}</div>
            `;

            container.appendChild(entry);
        });
    }

    updateGeneralNotes() {
        const container = document.getElementById('general-notes-list');
        const notes = this.notebookManager.getGeneralNotes();

        if (notes.length === 0) {
            container.innerHTML = '<p style="color: var(--text-light); font-style: italic;">No notes yet. Add your observations above!</p>';
            return;
        }

        container.innerHTML = '';

        notes.forEach((note, index) => {
            const noteItem = document.createElement('div');
            noteItem.className = 'general-note-item';

            noteItem.innerHTML = `
                <div class="note-text">${note.text}</div>
                <div class="note-meta">
                    <span class="note-date">${note.date}</span>
                    <button class="delete-note-btn" data-index="${index}">Delete</button>
                </div>
            `;

            // Add delete handler
            noteItem.querySelector('.delete-note-btn').addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                this.notebookManager.deleteGeneralNote(idx);
                this.updateGeneralNotes();
            });

            container.appendChild(noteItem);
        });
    }

    updateStatistics() {
        const container = document.getElementById('statistics-display');
        const stats = this.notebookManager.getStatistics();

        container.innerHTML = `
            <div class="stat-card">
                <h4>Overall Performance</h4>
                <div class="stat-grid">
                    <div class="stat-item">
                        <span class="stat-value">${stats.totalBrews}</span>
                        <span class="stat-label">Total Brews</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.perfectBrews}</span>
                        <span class="stat-label">Perfect Brews</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.goodBrews}</span>
                        <span class="stat-label">Good Brews</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.successRate}%</span>
                        <span class="stat-label">Success Rate</span>
                    </div>
                </div>
            </div>

            ${stats.topTeas.length > 0 ? `
                <div class="stat-card">
                    <h4>Most Brewed Teas</h4>
                    ${stats.topTeas.map((tea, index) => `
                        <div class="top-tea-item">
                            <span class="tea-name">${index + 1}. ${tea.name}</span>
                            <span class="tea-stats">${tea.totalBrews} brews (${tea.successRate}% success)</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    // Vessel Management Methods
    initializeVesselUI() {
        // Update current vessel display
        this.updateVesselDisplay();

        // Change vessel button
        const changeVesselBtn = document.getElementById('change-vessel-btn');
        if (changeVesselBtn) {
            changeVesselBtn.addEventListener('click', () => {
                this.openVesselShop();
            });
        }

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });

        // Vessel tab switching
        document.querySelectorAll('.vessel-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;

                // Update active tab
                document.querySelectorAll('.vessel-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                // Show corresponding content
                document.querySelectorAll('.vessel-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabName}-vessels`).classList.add('active');
            });
        });
    }

    updateVesselDisplay() {
        const vessel = this.vesselManager.getCurrentVessel();
        const vesselImage = document.getElementById('vessel-image');
        const vesselName = document.getElementById('vessel-name');

        if (vesselImage) vesselImage.src = vessel.image;
        if (vesselName) vesselName.textContent = `${vessel.emoji} ${vessel.name}`;
    }

    openVesselShop() {
        const modal = document.getElementById('vessel-modal');
        modal.classList.remove('hidden');

        // Populate available vessels
        this.populateVesselShop();

        // Populate owned vessels
        this.populateOwnedVessels();
    }

    populateVesselShop() {
        const shopList = document.getElementById('vessel-shop-list');
        const locked = this.vesselManager.getLockedVessels();

        shopList.innerHTML = locked.map(vessel => `
            <div class="vessel-card ${this.state.money >= vessel.cost ? 'affordable' : 'locked'}">
                <div class="vessel-image-container">
                    <img src="${vessel.image}" alt="${vessel.name}" class="vessel-card-image">
                    <div class="vessel-emoji">${vessel.emoji}</div>
                </div>
                <div class="vessel-card-content">
                    <h4>${vessel.name}</h4>
                    <p class="vessel-description">${vessel.description}</p>
                    <div class="vessel-stats">
                        <div class="vessel-stat">
                            <span class="stat-icon">⭐</span>
                            <span>+${vessel.qualityBonus}% quality</span>
                        </div>
                        <div class="vessel-stat">
                            <span class="stat-icon">⏱️</span>
                            <span>+${vessel.timeBonus}s tolerance</span>
                        </div>
                    </div>
                    <div class="vessel-card-footer">
                        <span class="vessel-price">💰 ${vessel.cost} coins</span>
                        <button class="btn-primary btn-small purchase-vessel"
                                data-vessel="${vessel.id}"
                                ${this.state.money < vessel.cost ? 'disabled' : ''}>
                            ${this.state.money >= vessel.cost ? 'Purchase' : 'Too Expensive'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to purchase buttons
        shopList.querySelectorAll('.purchase-vessel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vesselId = e.target.dataset.vessel;
                this.purchaseVessel(vesselId);
            });
        });
    }

    populateOwnedVessels() {
        const ownedList = document.getElementById('owned-vessel-list');
        const owned = this.vesselManager.getUnlockedVessels();
        const current = this.vesselManager.getCurrentVessel();

        ownedList.innerHTML = owned.map(vessel => `
            <div class="vessel-card owned ${vessel.id === current.id ? 'equipped' : ''}">
                <div class="vessel-image-container">
                    <img src="${vessel.image}" alt="${vessel.name}" class="vessel-card-image">
                    <div class="vessel-emoji">${vessel.emoji}</div>
                    ${vessel.id === current.id ? '<div class="equipped-badge">✓ Equipped</div>' : ''}
                </div>
                <div class="vessel-card-content">
                    <h4>${vessel.name}</h4>
                    <p class="vessel-description">${vessel.description}</p>
                    <div class="vessel-stats">
                        <div class="vessel-stat">
                            <span class="stat-icon">⭐</span>
                            <span>+${vessel.qualityBonus}% quality</span>
                        </div>
                        <div class="vessel-stat">
                            <span class="stat-icon">⏱️</span>
                            <span>+${vessel.timeBonus}s tolerance</span>
                        </div>
                    </div>
                    ${vessel.id !== current.id ? `
                        <button class="btn-secondary btn-small equip-vessel" data-vessel="${vessel.id}">
                            Equip
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // Add event listeners to equip buttons
        ownedList.querySelectorAll('.equip-vessel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vesselId = e.target.dataset.vessel;
                this.equipVessel(vesselId);
            });
        });
    }

    purchaseVessel(vesselId) {
        const result = this.vesselManager.purchaseVessel(vesselId);

        if (result.success) {
            alert(`${result.message}\n\nQuality bonus: +${result.vessel.qualityBonus}%\nTime tolerance: +${result.vessel.timeBonus}s`);
            this.updateAllUI();
            this.updateVesselDisplay();
            this.populateVesselShop();
            this.populateOwnedVessels();
        } else {
            alert(result.message);
        }
    }

    equipVessel(vesselId) {
        const result = this.vesselManager.equipVessel(vesselId);

        if (result.success) {
            this.updateVesselDisplay();
            this.populateOwnedVessels();
        } else {
            alert(result.message);
        }
    }
}

// Start game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new TeaShopGame();
});
