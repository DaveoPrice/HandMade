// Authentic tea data with proper brewing parameters
const TEA_DATABASE = {
    // Green Teas
    sencha: {
        id: 'sencha',
        name: 'Sencha',
        type: 'Green',
        description: 'A refreshing Japanese green tea with a grassy, slightly sweet flavor.',
        idealTemp: 75,
        tempRange: [70, 80],
        idealSteep: 90,
        steepRange: [60, 120],
        rarity: 'common',
        price: 15,
        unlocked: true,
        discovery: 'starter'
    },
    dragonwell: {
        id: 'dragonwell',
        name: 'Longjing (Dragon Well)',
        type: 'Green',
        description: 'A premium Chinese green tea with a distinctive flat shape and sweet, nutty flavor.',
        idealTemp: 75,
        tempRange: [70, 80],
        idealSteep: 120,
        steepRange: [90, 180],
        rarity: 'rare',
        price: 35,
        unlocked: false,
        discovery: 'mountain'
    },
    gyokuro: {
        id: 'gyokuro',
        name: 'Gyokuro',
        type: 'Green',
        description: 'The highest grade of Japanese green tea, shade-grown for a rich umami taste.',
        idealTemp: 60,
        tempRange: [55, 65],
        idealSteep: 120,
        steepRange: [90, 150],
        rarity: 'legendary',
        price: 60,
        unlocked: false,
        discovery: 'hidden_grove'
    },

    // White Teas
    silver_needle: {
        id: 'silver_needle',
        name: 'Silver Needle',
        type: 'White',
        description: 'The most delicate white tea, made from unopened buds with a subtle sweetness.',
        idealTemp: 80,
        tempRange: [75, 85],
        idealSteep: 180,
        steepRange: [120, 240],
        rarity: 'rare',
        price: 40,
        unlocked: false,
        discovery: 'valley'
    },
    white_peony: {
        id: 'white_peony',
        name: 'White Peony',
        type: 'White',
        description: 'A gentle white tea with a fuller flavor than Silver Needle.',
        idealTemp: 80,
        tempRange: [75, 85],
        idealSteep: 150,
        steepRange: [120, 200],
        rarity: 'uncommon',
        price: 25,
        unlocked: false,
        discovery: 'valley'
    },

    // Oolong Teas
    tieguanyin: {
        id: 'tieguanyin',
        name: 'Tieguanyin (Iron Goddess)',
        type: 'Oolong',
        description: 'A classic Chinese oolong with a complex floral and creamy character.',
        idealTemp: 95,
        tempRange: [90, 100],
        idealSteep: 150,
        steepRange: [120, 180],
        rarity: 'uncommon',
        price: 30,
        unlocked: false,
        discovery: 'mountain'
    },
    da_hong_pao: {
        id: 'da_hong_pao',
        name: 'Da Hong Pao',
        type: 'Oolong',
        description: 'A legendary rock oolong with a rich, roasted flavor and mineral notes.',
        idealTemp: 95,
        tempRange: [90, 100],
        idealSteep: 120,
        steepRange: [90, 180],
        rarity: 'legendary',
        price: 70,
        unlocked: false,
        discovery: 'mountain'
    },
    oriental_beauty: {
        id: 'oriental_beauty',
        name: 'Oriental Beauty',
        type: 'Oolong',
        description: 'A honey-sweet oolong from Taiwan with unique fruit and flower notes.',
        idealTemp: 90,
        tempRange: [85, 95],
        idealSteep: 120,
        steepRange: [90, 150],
        rarity: 'rare',
        price: 45,
        unlocked: false,
        discovery: 'forest'
    },

    // Black Teas
    english_breakfast: {
        id: 'english_breakfast',
        name: 'English Breakfast',
        type: 'Black',
        description: 'A robust, full-bodied blend perfect for morning energy.',
        idealTemp: 100,
        tempRange: [95, 100],
        idealSteep: 180,
        steepRange: [120, 240],
        rarity: 'common',
        price: 12,
        unlocked: true,
        discovery: 'starter'
    },
    earl_grey: {
        id: 'earl_grey',
        name: 'Earl Grey',
        type: 'Black',
        description: 'A classic black tea infused with bergamot oil for a citrusy aroma.',
        idealTemp: 100,
        tempRange: [95, 100],
        idealSteep: 180,
        steepRange: [150, 240],
        rarity: 'common',
        price: 15,
        unlocked: true,
        discovery: 'starter'
    },
    golden_yunnan: {
        id: 'golden_yunnan',
        name: 'Golden Yunnan',
        type: 'Black',
        description: 'A Chinese black tea with golden tips and a sweet, peppery flavor.',
        idealTemp: 95,
        tempRange: [90, 100],
        idealSteep: 180,
        steepRange: [150, 210],
        rarity: 'uncommon',
        price: 28,
        unlocked: false,
        discovery: 'forest'
    },
    lapsang_souchong: {
        id: 'lapsang_souchong',
        name: 'Lapsang Souchong',
        type: 'Black',
        description: 'A distinctive smoked black tea with bold, campfire-like notes.',
        idealTemp: 100,
        tempRange: [95, 100],
        idealSteep: 210,
        steepRange: [180, 240],
        rarity: 'rare',
        price: 35,
        unlocked: false,
        discovery: 'mountain'
    },

    // Pu-erh Teas
    aged_puerh: {
        id: 'aged_puerh',
        name: 'Aged Pu-erh',
        type: 'Pu-erh',
        description: 'A fermented tea that improves with age, earthy and deeply complex.',
        idealTemp: 100,
        tempRange: [95, 100],
        idealSteep: 240,
        steepRange: [180, 300],
        rarity: 'legendary',
        price: 80,
        unlocked: false,
        discovery: 'hidden_grove'
    },

    // Herbal/Specialty
    jasmine_pearls: {
        id: 'jasmine_pearls',
        name: 'Jasmine Pearls',
        type: 'Scented Green',
        description: 'Hand-rolled green tea pearls scented with fresh jasmine blossoms.',
        idealTemp: 80,
        tempRange: [75, 85],
        idealSteep: 150,
        steepRange: [120, 180],
        rarity: 'uncommon',
        price: 32,
        unlocked: false,
        discovery: 'valley'
    }
};

// Customer preferences and personalities
const CUSTOMER_TYPES = {
    student: {
        name_pool: ['Aki', 'Chen', 'Yuki', 'Min', 'Hana'],
        preferences: {
            types: ['Green', 'White'],
            price_range: [10, 30],
            patience: 'medium'
        },
        dialogue: {
            greeting: ['I have exams coming up...', 'Need something to help me focus.', 'Something light and refreshing?'],
            satisfied: ['This is perfect for studying!', 'Exactly what I needed!', 'I feel more focused already.'],
            dissatisfied: ['This is too strong...', 'Not quite what I wanted.', 'Maybe something lighter next time?']
        }
    },
    elder: {
        name_pool: ['Master Wu', 'Mrs. Chen', 'Elder Tanaka', 'Grandmother Li'],
        preferences: {
            types: ['Oolong', 'Pu-erh', 'Black'],
            price_range: [25, 80],
            patience: 'high',
            quality_focused: true
        },
        dialogue: {
            greeting: ['The old ways are the best ways.', 'I seek a tea with depth.', 'Do you have anything aged?'],
            satisfied: ['Exquisite. You understand tea.', 'Reminds me of home.', 'You have a gift, young one.'],
            dissatisfied: ['This lacks refinement.', 'The temperature was off.', 'More practice is needed.']
        }
    },
    artist: {
        name_pool: ['Luna', 'Sage', 'River', 'Indigo', 'Willow'],
        preferences: {
            types: ['White', 'Oolong', 'Scented Green'],
            price_range: [20, 50],
            patience: 'low',
            aesthetic_focused: true
        },
        dialogue: {
            greeting: ['I need inspiration...', 'Something beautiful and complex?', 'Looking for new experiences.'],
            satisfied: ['The aroma alone is inspiring!', 'This speaks to my soul.', 'Pure artistry in a cup!'],
            dissatisfied: ['Meh. Too ordinary.', 'Expected more nuance.', 'Where is the creativity?']
        }
    },
    merchant: {
        name_pool: ['Malik', 'Wei', 'Sato', 'Jin'],
        preferences: {
            types: ['Black', 'Oolong'],
            price_range: [15, 40],
            patience: 'low',
            practical: true
        },
        dialogue: {
            greeting: ['Make it quick, I have business.', 'Something strong and efficient.', 'No time for ceremony.'],
            satisfied: ['Good. Fast and reliable.', 'This will do nicely.', 'Efficient service!'],
            dissatisfied: ['I don\'t have time for this.', 'Too slow.', 'This isn\'t worth the wait.']
        }
    },
    enthusiast: {
        name_pool: ['Emma', 'Oliver', 'Sophie', 'Liam'],
        preferences: {
            types: ['Green', 'White', 'Oolong', 'Black'],
            price_range: [20, 60],
            patience: 'high',
            variety_seeking: true
        },
        dialogue: {
            greeting: ['What\'s rare today?', 'I want to try something new!', 'Tell me about your special teas!'],
            satisfied: ['Fascinating! Tell me more about this!', 'I must have more of this!', 'This is incredible!'],
            dissatisfied: ['Not quite perfect...', 'I expected better quality.', 'The brewing was slightly off.']
        }
    }
};

// Quality thresholds for brewing
const BREW_QUALITY = {
    perfect: { tempTolerance: 2, steepTolerance: 15, payment: 1.5, reputationGain: 3 },
    good: { tempTolerance: 5, steepTolerance: 30, payment: 1.2, reputationGain: 2 },
    acceptable: { tempTolerance: 10, steepTolerance: 45, payment: 1.0, reputationGain: 1 },
    poor: { tempTolerance: Infinity, steepTolerance: Infinity, payment: 0.7, reputationGain: -1 }
};
