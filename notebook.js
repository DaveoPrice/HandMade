// Notebook Manager for tracking tea notes and customer preferences
class NotebookManager {
    constructor() {
        // Load existing notes from localStorage or initialize empty
        this.notes = this.loadNotes();

        // Initialize structures if they don't exist
        if (!this.notes.teaNotes) this.notes.teaNotes = {};
        if (!this.notes.customerNotes) this.notes.customerNotes = [];
        if (!this.notes.generalNotes) this.notes.generalNotes = [];
        if (!this.notes.brewingHistory) this.notes.brewingHistory = [];
    }

    loadNotes() {
        const saved = localStorage.getItem('teaShopNotebook');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            teaNotes: {},
            customerNotes: [],
            generalNotes: [],
            brewingHistory: []
        };
    }

    saveNotes() {
        localStorage.setItem('teaShopNotebook', JSON.stringify(this.notes));
    }

    // Tea Notes Management
    addTeaNote(teaId, teaName, noteText) {
        if (!this.notes.teaNotes[teaId]) {
            this.notes.teaNotes[teaId] = {
                teaName: teaName,
                notes: [],
                bestTemp: null,
                bestSteep: null,
                successfulBrews: 0,
                totalBrews: 0
            };
        }

        this.notes.teaNotes[teaId].notes.push({
            text: noteText,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        });

        this.saveNotes();
    }

    updateTeaStats(teaId, teaName, temperature, steepTime, quality) {
        if (!this.notes.teaNotes[teaId]) {
            this.notes.teaNotes[teaId] = {
                teaName: teaName,
                notes: [],
                bestTemp: null,
                bestSteep: null,
                successfulBrews: 0,
                totalBrews: 0
            };
        }

        const teaNote = this.notes.teaNotes[teaId];
        teaNote.totalBrews++;

        if (quality === 'perfect' || quality === 'good') {
            teaNote.successfulBrews++;
            teaNote.bestTemp = temperature;
            teaNote.bestSteep = steepTime;
        }

        this.saveNotes();
    }

    getTeaNotes(teaId) {
        return this.notes.teaNotes[teaId] || null;
    }

    getAllTeaNotes() {
        return this.notes.teaNotes;
    }

    // Customer Notes Management
    addCustomerNote(customerName, customerType, teaServed, quality, noteText = '') {
        const customerNote = {
            customerName: customerName,
            customerType: customerType,
            teaServed: teaServed,
            quality: quality,
            note: noteText,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };

        this.notes.customerNotes.unshift(customerNote); // Add to beginning

        // Keep only last 50 customer notes
        if (this.notes.customerNotes.length > 50) {
            this.notes.customerNotes = this.notes.customerNotes.slice(0, 50);
        }

        this.saveNotes();
    }

    getCustomerNotes() {
        return this.notes.customerNotes;
    }

    // General Notes Management
    addGeneralNote(noteText, category = 'general') {
        const note = {
            text: noteText,
            category: category,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };

        this.notes.generalNotes.unshift(note);

        // Keep only last 100 general notes
        if (this.notes.generalNotes.length > 100) {
            this.notes.generalNotes = this.notes.generalNotes.slice(0, 100);
        }

        this.saveNotes();
    }

    getGeneralNotes() {
        return this.notes.generalNotes;
    }

    deleteGeneralNote(index) {
        if (index >= 0 && index < this.notes.generalNotes.length) {
            this.notes.generalNotes.splice(index, 1);
            this.saveNotes();
        }
    }

    // Brewing History
    recordBrew(teaName, temperature, steepTime, quality, customerName) {
        const brewRecord = {
            teaName: teaName,
            temperature: temperature,
            steepTime: steepTime,
            quality: quality,
            customerName: customerName,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };

        this.notes.brewingHistory.unshift(brewRecord);

        // Keep only last 100 brewing records
        if (this.notes.brewingHistory.length > 100) {
            this.notes.brewingHistory = this.notes.brewingHistory.slice(0, 100);
        }

        this.saveNotes();
    }

    getBrewingHistory(limit = 20) {
        return this.notes.brewingHistory.slice(0, limit);
    }

    // Statistics
    getStatistics() {
        const totalBrews = this.notes.brewingHistory.length;
        const perfectBrews = this.notes.brewingHistory.filter(b => b.quality === 'perfect').length;
        const goodBrews = this.notes.brewingHistory.filter(b => b.quality === 'good').length;

        const teaStats = Object.values(this.notes.teaNotes).map(tea => ({
            name: tea.teaName,
            totalBrews: tea.totalBrews,
            successRate: tea.totalBrews > 0 ? (tea.successfulBrews / tea.totalBrews * 100).toFixed(1) : 0
        })).sort((a, b) => b.totalBrews - a.totalBrews);

        return {
            totalBrews,
            perfectBrews,
            goodBrews,
            successRate: totalBrews > 0 ? ((perfectBrews + goodBrews) / totalBrews * 100).toFixed(1) : 0,
            topTeas: teaStats.slice(0, 5)
        };
    }

    // Generate automatic suggestions based on history
    getSuggestion(teaId) {
        const teaNote = this.notes.teaNotes[teaId];
        if (!teaNote || teaNote.totalBrews === 0) {
            return null;
        }

        if (teaNote.bestTemp && teaNote.bestSteep) {
            return {
                temperature: teaNote.bestTemp,
                steepTime: teaNote.bestSteep,
                successRate: (teaNote.successfulBrews / teaNote.totalBrews * 100).toFixed(0)
            };
        }

        return null;
    }

    // Clear all notes (for testing or reset)
    clearAllNotes() {
        this.notes = {
            teaNotes: {},
            customerNotes: [],
            generalNotes: [],
            brewingHistory: []
        };
        this.saveNotes();
    }
}
