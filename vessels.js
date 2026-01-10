// Brewing Vessel Data
const VESSELS = {
    basic_cup: {
        id: 'basic_cup',
        name: 'Simple Tea Cup',
        description: 'A humble ceramic cup for brewing tea. Gets the job done.',
        image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&q=80',
        cost: 0,
        qualityBonus: 0,
        timeBonus: 0, // Reduces ideal steep time variance tolerance
        unlocked: true,
        emoji: '☕'
    },
    ceramic_pot: {
        id: 'ceramic_pot',
        name: 'Ceramic Teapot',
        description: 'A classic ceramic teapot with good heat retention. Improves brewing consistency.',
        image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde0?w=400&q=80',
        cost: 150,
        qualityBonus: 5, // +5% quality tolerance
        timeBonus: 5,
        unlocked: false,
        emoji: '🫖'
    },
    glass_teapot: {
        id: 'glass_teapot',
        name: 'Glass Teapot',
        description: 'Elegant borosilicate glass allows you to watch the tea unfurl. Better temperature control.',
        image: 'https://images.unsplash.com/photo-1563822249366-7b0d82e93768?w=400&q=80',
        cost: 300,
        qualityBonus: 8,
        timeBonus: 8,
        unlocked: false,
        emoji: '🍵'
    },
    yixing_pot: {
        id: 'yixing_pot',
        name: 'Yixing Clay Pot',
        description: 'Traditional Chinese purple clay pot. Absorbs tea flavors and enhances aroma over time.',
        image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&q=80',
        cost: 500,
        qualityBonus: 12,
        timeBonus: 10,
        unlocked: false,
        emoji: '🏺'
    },
    gaiwan: {
        id: 'gaiwan',
        name: 'Gaiwan',
        description: 'Traditional Chinese lidded bowl. Perfect for gongfu tea ceremony. Maximum control.',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80',
        cost: 400,
        qualityBonus: 10,
        timeBonus: 12,
        unlocked: false,
        emoji: '🥣'
    },
    kyusu: {
        id: 'kyusu',
        name: 'Japanese Kyusu',
        description: 'Side-handled Japanese teapot with built-in strainer. Ideal for green teas.',
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
        cost: 600,
        qualityBonus: 15,
        timeBonus: 15,
        unlocked: false,
        emoji: '🍶'
    },
    silver_pot: {
        id: 'silver_pot',
        name: 'Silver Tea Service',
        description: 'Luxurious sterling silver tea set. Impresses customers and ensures perfect brewing.',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80',
        cost: 1000,
        qualityBonus: 20,
        timeBonus: 20,
        unlocked: false,
        emoji: '✨'
    }
};

class VesselManager {
    constructor(gameState) {
        this.state = gameState;
        this.vessels = { ...VESSELS };
        this.currentVessel = this.vessels.basic_cup;

        // Load from localStorage if available
        this.loadVesselData();
    }

    loadVesselData() {
        const saved = localStorage.getItem('teaGame_vessels');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentVessel = this.vessels[data.currentVessel] || this.vessels.basic_cup;

                // Restore unlocked status
                Object.keys(data.unlocked || {}).forEach(vesselId => {
                    if (this.vessels[vesselId]) {
                        this.vessels[vesselId].unlocked = data.unlocked[vesselId];
                    }
                });
            } catch (e) {
                console.error('Error loading vessel data:', e);
            }
        }
    }

    saveVesselData() {
        const data = {
            currentVessel: this.currentVessel.id,
            unlocked: {}
        };

        Object.values(this.vessels).forEach(vessel => {
            data.unlocked[vessel.id] = vessel.unlocked;
        });

        localStorage.setItem('teaGame_vessels', JSON.stringify(data));
    }

    canPurchase(vesselId) {
        const vessel = this.vessels[vesselId];
        return vessel && !vessel.unlocked && this.state.money >= vessel.cost;
    }

    purchaseVessel(vesselId) {
        if (!this.canPurchase(vesselId)) {
            return { success: false, message: 'Cannot purchase this vessel.' };
        }

        const vessel = this.vessels[vesselId];
        this.state.money -= vessel.cost;
        vessel.unlocked = true;
        this.currentVessel = vessel;

        this.saveVesselData();

        return {
            success: true,
            message: `Purchased ${vessel.name}!`,
            vessel: vessel
        };
    }

    equipVessel(vesselId) {
        const vessel = this.vessels[vesselId];
        if (!vessel || !vessel.unlocked) {
            return { success: false, message: 'Cannot equip this vessel.' };
        }

        this.currentVessel = vessel;
        this.saveVesselData();

        return {
            success: true,
            message: `Now using ${vessel.name}!`,
            vessel: vessel
        };
    }

    getUnlockedVessels() {
        return Object.values(this.vessels).filter(v => v.unlocked);
    }

    getLockedVessels() {
        return Object.values(this.vessels).filter(v => !v.unlocked);
    }

    getCurrentVessel() {
        return this.currentVessel;
    }

    // Apply vessel bonuses to brewing evaluation
    applyVesselBonus(tempDiff, timeDiff) {
        const bonus = this.currentVessel.qualityBonus || 0;

        // Vessel bonus increases tolerance for perfect/good ratings
        return {
            tempTolerance: bonus,
            timeTolerance: bonus
        };
    }
}
