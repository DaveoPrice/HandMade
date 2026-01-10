// Customer management system
class CustomerManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentCustomer = null;
        this.customerQueue = [];
        this.servedToday = 0;
    }

    generateCustomer() {
        // Choose random customer type
        const types = Object.keys(CUSTOMER_TYPES);
        const randomType = types[Math.floor(Math.random() * types.length)];
        const customerData = CUSTOMER_TYPES[randomType];

        // Pick random name from pool
        const name = customerData.name_pool[Math.floor(Math.random() * customerData.name_pool.length)];

        // Pick random greeting
        const greeting = customerData.dialogue.greeting[Math.floor(Math.random() * customerData.dialogue.greeting.length)];

        // Determine what tea they want (must be unlocked)
        const availableTeas = Object.values(TEA_DATABASE).filter(tea => {
            if (!tea.unlocked) return false;

            // Check if tea type matches preferences
            if (customerData.preferences.types.includes(tea.type)) {
                return tea.price >= customerData.preferences.price_range[0] &&
                       tea.price <= customerData.preferences.price_range[1];
            }
            return false;
        });

        // If no teas available, they want a starter tea
        let requestedTea;
        if (availableTeas.length === 0) {
            requestedTea = TEA_DATABASE.sencha;
        } else {
            requestedTea = availableTeas[Math.floor(Math.random() * availableTeas.length)];
        }

        this.currentCustomer = {
            name: name,
            type: randomType,
            greeting: greeting,
            requestedTea: requestedTea,
            preferences: customerData.preferences,
            dialogue: customerData.dialogue,
            patience: this.calculatePatience(customerData.preferences.patience),
            arrivalTime: Date.now()
        };

        return this.currentCustomer;
    }

    calculatePatience(patienceLevel) {
        const basePatienceTime = {
            low: 120,    // 2 minutes
            medium: 180, // 3 minutes
            high: 300    // 5 minutes
        };
        return basePatienceTime[patienceLevel] || 180;
    }

    evaluateService(brewedTea, temperature, steepTime, vessel = null) {
        if (!this.currentCustomer) return null;

        const requested = this.currentCustomer.requestedTea;
        const timeTaken = (Date.now() - this.currentCustomer.arrivalTime) / 1000;

        // Check if correct tea was served
        if (brewedTea.id !== requested.id) {
            return this.createFeedback('wrong_tea', 0, 0);
        }

        // Evaluate temperature
        const tempDiff = Math.abs(temperature - requested.idealTemp);

        // Evaluate steep time (convert to seconds if needed)
        const steepDiff = Math.abs(steepTime - requested.idealSteep);

        // Apply vessel bonuses (if equipped)
        const vesselBonus = vessel ? vessel.qualityBonus || 0 : 0;
        const vesselTimeBonus = vessel ? vessel.timeBonus || 0 : 0;

        // Determine quality with vessel bonuses applied
        let quality = 'poor';
        const perfectTempTolerance = BREW_QUALITY.perfect.tempTolerance + vesselBonus;
        const perfectSteepTolerance = BREW_QUALITY.perfect.steepTolerance + vesselTimeBonus;
        const goodTempTolerance = BREW_QUALITY.good.tempTolerance + vesselBonus;
        const goodSteepTolerance = BREW_QUALITY.good.steepTolerance + vesselTimeBonus;
        const acceptableTempTolerance = BREW_QUALITY.acceptable.tempTolerance + vesselBonus;
        const acceptableSteepTolerance = BREW_QUALITY.acceptable.steepTolerance + vesselTimeBonus;

        if (tempDiff <= perfectTempTolerance && steepDiff <= perfectSteepTolerance) {
            quality = 'perfect';
        } else if (tempDiff <= goodTempTolerance && steepDiff <= goodSteepTolerance) {
            quality = 'good';
        } else if (tempDiff <= acceptableTempTolerance && steepDiff <= acceptableSteepTolerance) {
            quality = 'acceptable';
        }

        // Check if they ran out of patience
        if (timeTaken > this.currentCustomer.patience) {
            quality = 'poor';
        }

        return this.createFeedback(quality, tempDiff, steepDiff);
    }

    createFeedback(quality, tempDiff, steepDiff) {
        const customer = this.currentCustomer;
        const basePrice = customer.requestedTea.price;

        let payment, reputation, message, customerResponse;

        if (quality === 'wrong_tea') {
            payment = 0;
            reputation = -2;
            message = 'Wrong tea served!';
            customerResponse = 'This isn\'t what I ordered...';
        } else {
            const qualityData = BREW_QUALITY[quality];
            payment = Math.floor(basePrice * qualityData.payment);
            reputation = qualityData.reputationGain;

            // Get customer response based on quality
            if (quality === 'perfect' || quality === 'good') {
                customerResponse = customer.dialogue.satisfied[Math.floor(Math.random() * customer.dialogue.satisfied.length)];
            } else {
                customerResponse = customer.dialogue.dissatisfied[Math.floor(Math.random() * customer.dialogue.dissatisfied.length)];
            }

            // Generate detailed message
            const messages = {
                perfect: '✨ Perfect brew! Temperature and steeping were spot on!',
                good: '👍 Good job! The tea was brewed well.',
                acceptable: '😐 Acceptable. The brew could be better.',
                poor: '😞 Poor quality. The temperature or steeping was way off.'
            };
            message = messages[quality];
        }

        return {
            quality,
            payment,
            reputation,
            message,
            customerResponse,
            tempDiff,
            steepDiff,
            customerName: customer.name
        };
    }

    dismissCustomer() {
        this.servedToday++;
        this.currentCustomer = null;
    }

    getCustomerMood() {
        if (!this.currentCustomer) return 'waiting';

        const timePassed = (Date.now() - this.currentCustomer.arrivalTime) / 1000;
        const patience = this.currentCustomer.patience;

        if (timePassed < patience * 0.3) return '😊 Patient';
        if (timePassed < patience * 0.6) return '🤔 Waiting...';
        if (timePassed < patience * 0.9) return '😟 Getting impatient';
        return '😠 Very impatient!';
    }
}
