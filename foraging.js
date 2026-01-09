// Foraging and tea sourcing system
const FORAGING_LOCATIONS = {
    valley: {
        id: 'valley',
        name: '🌸 Misty Valley',
        description: 'A serene valley where white tea bushes thrive in the morning mist.',
        cost: 10,
        timeRequired: 3,
        unlocked: true,
        possibleFinds: [
            { item: 'white_peony', chance: 0.4 },
            { item: 'silver_needle', chance: 0.15 },
            { item: 'jasmine_pearls', chance: 0.2 },
            { reward: 'coins', amount: 15, chance: 0.25 }
        ]
    },
    forest: {
        id: 'forest',
        name: '🌲 Ancient Forest',
        description: 'Dense woods where rare oolong and black teas can be discovered.',
        cost: 15,
        timeRequired: 4,
        unlocked: true,
        possibleFinds: [
            { item: 'golden_yunnan', chance: 0.35 },
            { item: 'oriental_beauty', chance: 0.2 },
            { item: 'lapsang_souchong', chance: 0.15 },
            { reward: 'coins', amount: 25, chance: 0.3 }
        ]
    },
    mountain: {
        id: 'mountain',
        name: '⛰️ Dragon Mountain',
        description: 'High altitude peaks where legendary teas grow in rocky terrain.',
        cost: 25,
        timeRequired: 6,
        unlocked: false,
        unlockRequirement: { reputation: 20 },
        possibleFinds: [
            { item: 'dragonwell', chance: 0.3 },
            { item: 'tieguanyin', chance: 0.25 },
            { item: 'da_hong_pao', chance: 0.1 },
            { item: 'lapsang_souchong', chance: 0.2 },
            { reward: 'coins', amount: 40, chance: 0.15 }
        ]
    },
    hidden_grove: {
        id: 'hidden_grove',
        name: '✨ Hidden Grove',
        description: 'A mystical place whispered about by tea masters. Only the most reputable can find it.',
        cost: 50,
        timeRequired: 8,
        unlocked: false,
        unlockRequirement: { reputation: 50 },
        possibleFinds: [
            { item: 'gyokuro', chance: 0.25 },
            { item: 'aged_puerh', chance: 0.15 },
            { item: 'da_hong_pao', chance: 0.2 },
            { reward: 'coins', amount: 80, chance: 0.1 },
            { reward: 'reputation', amount: 5, chance: 0.3 }
        ]
    }
};

class ForagingManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentExpedition = null;
    }

    canAccessLocation(locationId) {
        const location = FORAGING_LOCATIONS[locationId];
        if (!location) return false;

        // Check if unlocked
        if (!location.unlocked) {
            if (location.unlockRequirement) {
                if (location.unlockRequirement.reputation > this.gameState.reputation) {
                    return false;
                }
            }
        }

        // Check if player has enough money
        if (this.gameState.money < location.cost) {
            return false;
        }

        return true;
    }

    startForaging(locationId) {
        const location = FORAGING_LOCATIONS[locationId];
        if (!this.canAccessLocation(locationId)) {
            return { success: false, message: 'Cannot access this location.' };
        }

        // Deduct cost
        this.gameState.money -= location.cost;

        // Simulate foraging
        const results = this.performForaging(location);

        this.currentExpedition = {
            location: location,
            results: results,
            timestamp: Date.now()
        };

        return {
            success: true,
            results: results,
            location: location
        };
    }

    performForaging(location) {
        const findings = [];

        // Roll for each possible find
        for (const possibility of location.possibleFinds) {
            const roll = Math.random();

            if (roll < possibility.chance) {
                if (possibility.item) {
                    // Found a tea
                    const tea = TEA_DATABASE[possibility.item];
                    if (tea) {
                        const wasLocked = !tea.unlocked;
                        tea.unlocked = true;

                        findings.push({
                            type: 'tea',
                            item: tea,
                            isNew: wasLocked,
                            message: wasLocked ?
                                `✨ Discovered new tea: ${tea.name}!` :
                                `Found ${tea.name}`
                        });
                    }
                } else if (possibility.reward === 'coins') {
                    // Found coins
                    this.gameState.money += possibility.amount;
                    findings.push({
                        type: 'coins',
                        amount: possibility.amount,
                        message: `💰 Found ${possibility.amount} coins!`
                    });
                } else if (possibility.reward === 'reputation') {
                    // Found reputation (maybe met a tea master)
                    this.gameState.reputation += possibility.amount;
                    findings.push({
                        type: 'reputation',
                        amount: possibility.amount,
                        message: `⭐ Met a tea master! Gained ${possibility.amount} reputation!`
                    });
                }
            }
        }

        // Always find something small if nothing was found
        if (findings.length === 0) {
            const coinBonus = Math.floor(Math.random() * 10) + 5;
            this.gameState.money += coinBonus;
            findings.push({
                type: 'coins',
                amount: coinBonus,
                message: `Found ${coinBonus} coins.`
            });
        }

        return findings;
    }

    getUnlockedLocations() {
        return Object.values(FORAGING_LOCATIONS).filter(loc => {
            if (loc.unlocked) return true;

            if (loc.unlockRequirement) {
                return this.gameState.reputation >= loc.unlockRequirement.reputation;
            }

            return false;
        });
    }

    getLocationStatus(locationId) {
        const location = FORAGING_LOCATIONS[locationId];
        if (!location) return 'unknown';

        if (location.unlocked ||
            (location.unlockRequirement && this.gameState.reputation >= location.unlockRequirement.reputation)) {
            if (this.gameState.money >= location.cost) {
                return 'available';
            } else {
                return 'too_expensive';
            }
        }

        return 'locked';
    }
}
