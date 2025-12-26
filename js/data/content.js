export const shadowLibrary = [
    { e: '🐶', n: 'Dog' },
    { e: '🦁', n: 'Lion' }, { e: '🐮', n: 'Cow' },
    { e: '🐵', n: 'Monkey' },
    { e: '🦒', n: 'Giraffe' }, { e: '🦓', n: 'Zebra' }, { e: '🦋', n: 'Butterfly' },
    { e: '🚑', n: 'Ambulance' }, { e: '🚒', n: 'Fire Truck' }, { e: '🚓', n: 'Police Car' },
    { e: '🚜', n: 'Tractor' },
    { e: '✈️', n: 'Airplane' }, { e: '🚀', n: 'Rocket' },
    { e: '🍎', n: 'Apple' }, { e: '🍌', n: 'Banana' }, { e: '🍇', n: 'Grapes' },
    { e: '🍦', n: 'Ice Cream' }, { e: '🍕', n: 'Pizza' },
    { e: '⚽', n: 'Ball' },
    // New items to reach 30
    { e: '🐱', n: 'Cat' }, { e: '🐭', n: 'Mouse' }, { e: '🐰', n: 'Rabbit' }, { e: '🐸', n: 'Frog' }, { e: '🦆', n: 'Duck' },
    { e: '🌲', n: 'Tree' }, { e: '☀️', n: 'Sun' }, { e: '⭐', n: 'Star' },
    { e: '🚌', n: 'Bus' }, { e: '🚂', n: 'Train' }, { e: '🍪', n: 'Cookie' }
];

export const letterExamples = {
    'A': { w: 'Apple', e: '🍎' }, 'B': { w: 'Ball', e: '⚽' }, 'C': { w: 'Cow', e: '🐮' },
    'D': { w: 'Dog', e: '🐶' }, 'F': { w: 'Fish', e: '🐟' },
    'G': { w: 'Grapes', e: '🍇' }, 'H': { w: 'House', e: '🏠' }, 'I': { w: 'Ice Cream', e: '🍦' },
    'J': { w: 'Juice', e: '🧃' }, 'K': { w: 'Kite', e: '🪁' }, 'L': { w: 'Lion', e: '🦁' },
    'M': { w: 'Monkey', e: '🐵' }, 'N': { w: 'Nose', e: '👃' }, 'O': { w: 'Orange', e: '🍊' },
    'P': { w: 'Pizza', e: '🍕' }, 'Q': { w: 'Queen', e: '👸' }, 'R': { w: 'Rocket', e: '🚀' },
    'S': { w: 'Sun', e: '☀️' }, 'T': { w: 'Tree', e: '🌲' }, 'U': { w: 'Umbrella', e: '☂️' },
    'V': { w: 'Violin', e: '🎻' }, 'W': { w: 'Water', e: '💧' }, 'X': { w: 'Xylophone', e: '🎼' },
    'Y': { w: 'Yellow', e: '💛' }, 'Z': { w: 'Zebra', e: '🦓' }
};

export const jobLibrary = [
    { id: 'police', person: '👮', tool: '🚓', name: 'Police', toolName: 'Police Car' },
    { id: 'fireman', person: '👨‍🚒', tool: '🚒', name: 'Fireman', toolName: 'Fire Truck' },
    { id: 'doctor', person: '👨‍⚕️', tool: '🚑', name: 'Doctor', toolName: 'Ambulance' },
    { id: 'astronaut', person: '👨‍🚀', tool: '🚀', name: 'Astronaut', toolName: 'Rocket' },
    { id: 'chef', person: '👨‍🍳', tool: '🍳', name: 'Chef', toolName: 'Pan' },
    { id: 'farmer', person: '👨‍🌾', tool: '🚜', name: 'Farmer', toolName: 'Tractor' },
    { id: 'artist', person: '👩‍🎨', tool: '🖌️', name: 'Artist', toolName: 'Paint' },
    { id: 'mechanic', person: '👨‍🔧', tool: '🔧', name: 'Mechanic', toolName: 'Wrench' },
    { id: 'teacher', person: '🧑‍🏫', tool: '📚', name: 'Teacher', toolName: 'Books' },
    { id: 'pilot', person: '👨‍✈️', tool: '✈️', name: 'Pilot', toolName: 'Airplane' },
    { id: 'builder', person: '👷', tool: '🔨', name: 'Builder', toolName: 'Hammer' },
    { id: 'scientist', person: '👩‍🔬', tool: '🔬', name: 'Scientist', toolName: 'Microscope' }
];

export const feedLibrary = [
    // Removed items with missing audio: Rabbit, Mouse, Cat, Frog, Squirrel
    { id: 'monkey', animal: '🐵', food: '🍌', foodName: 'Banana', animalName: 'Monkey' },
    { id: 'dog', animal: '🐶', food: '🦴', foodName: 'Bone', animalName: 'Dog' },
    { id: 'lion', animal: '🦁', food: '🥩', foodName: 'Meat', animalName: 'Lion' },
];

export const shapeLibrary = [
    {
        id: 'triangle',
        shape: `<svg viewBox="0 0 100 100" class="shape-svg"><polygon points="50,15 90,85 10,85" fill="#FF5722" stroke="#3E2723" stroke-width="3"/></svg>`,
        obj: '🍕',
        shapeName: 'Triangle',
        objName: 'Pizza Slice'
    },
    {
        id: 'circle',
        shape: `<svg viewBox="0 0 100 100" class="shape-svg"><circle cx="50" cy="50" r="40" fill="#F44336" stroke="#3E2723" stroke-width="3"/></svg>`,
        obj: '⏰',
        shapeName: 'Circle',
        objName: 'Clock'
    },
    {
        id: 'square',
        shape: `<svg viewBox="0 0 100 100" class="shape-svg"><rect x="15" y="15" width="70" height="70" fill="#2196F3" stroke="#3E2723" stroke-width="3"/></svg>`,
        obj: '🎁',
        shapeName: 'Square',
        objName: 'Gift'
    },
    {
        id: 'rectangle',
        shape: `<svg viewBox="0 0 100 100" class="shape-svg"><rect x="10" y="25" width="80" height="50" fill="#4CAF50" stroke="#3E2723" stroke-width="3"/></svg>`,
        obj: '🚪',
        shapeName: 'Rectangle',
        objName: 'Door'
    },
    {
        id: 'oval',
        shape: `<svg viewBox="0 0 100 100" class="shape-svg"><ellipse cx="50" cy="50" rx="40" ry="25" fill="#9C27B0" stroke="#3E2723" stroke-width="3"/></svg>`,
        obj: '🥑',
        shapeName: 'Oval',
        objName: 'Avocado'
    },
    {
        id: 'diamond',
        shape: `<svg viewBox="0 0 100 100" class="shape-svg"><polygon points="50,10 90,50 50,90 10,50" fill="#FFC107" stroke="#3E2723" stroke-width="3"/></svg>`,
        obj: '🪁',
        shapeName: 'Diamond',
        objName: 'Kite'
    }
];

export const weatherLibrary = [
    { id: 'sun', weather: '☀️', obj: '😎', weatherName: 'Sunny', objName: 'Sunglasses', text: 'Wear your Sunglasses!' },
    { id: 'snow', weather: '❄️', obj: '🧣', weatherName: 'Snowy', objName: 'Scarf', text: 'Wear a Scarf!' },
    { id: 'rain', weather: '🌧️', obj: '☂️', weatherName: 'Rainy', objName: 'Umbrella', text: 'Use an Umbrella!' },
    { id: 'cold', weather: '🥶', obj: '🧤', weatherName: 'Cold', objName: 'Gloves', text: 'Wear Gloves!' }
];

export const natureLibrary = [
    { id: 'moon', nature: '🌙', obj: '🦉', natureName: 'Night', objName: 'Owl', text: 'The Owl wakes up!' },
    { id: 'wind', nature: '🌬️', obj: '🍂', natureName: 'Windy', objName: 'Leaf', text: 'Leaves fall down!' },
    { id: 'ocean', nature: '🌊', obj: '🐟', natureName: 'Ocean', objName: 'Fish', text: 'Fish swim in water!' },
    { id: 'flower', nature: '🌱', obj: '🐝', natureName: 'Spring', objName: 'Bee', text: 'Bees love flowers!' },
    { id: 'caterpillar', nature: '🐛', obj: '🦋', natureName: 'Caterpillar', objName: 'Butterfly', text: 'It becomes a Butterfly!' }

];

export const habitatLibrary = [
    // Removed: Cow/Rooster/Chicken/Dog (Farm is noun_farm), Lion/Tiger/Zebra/Giraffe/Monkey/Gorilla/Wolf/Buffalo/Deer (Jungle is noun_jungle)
    // Wait, check nouns. noun_cow, noun_farm exist.
    // Logic was: noun_cow, conn_lives_in_the, noun_farm.
    // Check missing items: Cat, Mouse, Whale.

    // Farm Animals (Safe: Cow, Rooster, Chicken, Dog)
    { id: 'cow', animal: '🐄', home: '🏡', animalName: 'Cow', homeName: 'Farm' },
    { id: 'rooster', animal: '🐓', home: '🏡', animalName: 'Rooster', homeName: 'Farm' },
    { id: 'chicken', animal: '🐔', home: '🏡', animalName: 'Chicken', homeName: 'Farm' },
    { id: 'dog', animal: '🐶', home: '🏡', animalName: 'Dog', homeName: 'Farm' },
    // { id: 'cat', animal: '🐱', home: '🏡', animalName: 'Cat', homeName: 'Farm' }, // Missing Cat
    // { id: 'mouse', animal: '🐭', home: '🏡', animalName: 'Mouse', homeName: 'Farm' }, // Missing Mouse

    // Jungle/Wild Animals (Safe: Lion, Tiger, Zebra, Giraffe, Monkey, Gorilla, Wolf, Buffalo, Deer)
    { id: 'lion', animal: '🦁', home: '🌴', animalName: 'Lion', homeName: 'Jungle' },
    { id: 'tiger', animal: '🐯', home: '🌴', animalName: 'Tiger', homeName: 'Jungle' },
    { id: 'zebra', animal: '🦓', home: '🌴', animalName: 'Zebra', homeName: 'Jungle' },
    { id: 'giraffe', animal: '🦒', home: '🌴', animalName: 'Giraffe', homeName: 'Jungle' },
    { id: 'monkey', animal: '🐒', home: '🌴', animalName: 'Monkey', homeName: 'Jungle' },
    { id: 'gorilla', animal: '🦍', home: '🌴', animalName: 'Gorilla', homeName: 'Jungle' },
    { id: 'wolf', animal: '🐺', home: '🌴', animalName: 'Wolf', homeName: 'Jungle' },
    { id: 'buffalo', animal: '🐃', home: '🌴', animalName: 'Buffalo', homeName: 'Jungle' },
    { id: 'deer', animal: '🦌', home: '🌴', animalName: 'Deer', homeName: 'Jungle' },

    // Sea Animals (Safe: Octopus, Fish, Turtle. Missing: Whale)
    { id: 'octopus', animal: '🐙', home: '🌊', animalName: 'Octopus', homeName: 'Sea' },
    // { id: 'whale', animal: '🐋', home: '🌊', animalName: 'Whale', homeName: 'Sea' }, // Missing Whale
    { id: 'fish', animal: '🐟', home: '🌊', animalName: 'Fish', homeName: 'Sea' },
    { id: 'turtle', animal: '🐢', home: '🌊', animalName: 'Turtle', homeName: 'Sea' }
];

export const puzzleConfig = [
    { id: 'lion', key: 'lion', name: 'Lion' },
    // { id: 'car', key: 'car', name: 'Car' }, // Missing
    { id: 'butterfly', key: 'butterfly', name: 'Butterfly' },
    { id: 'apple', key: 'apple', name: 'Apple' },
    // { id: 'train', key: 'train', name: 'Train' }, // Missing
    // { id: 'duck', key: 'duck', name: 'Duck' }, // Missing Duck?
    { id: 'ball', key: 'ball', name: 'Ball' },
    { id: 'house', key: 'house', name: 'House' },
    { id: 'flower', key: 'flower', name: 'Flower' }
];

export const objectPool = [
    { e: '☀️', n: 'Sun' }, { e: '🍎', n: 'Apple' },
    { e: '🦋', n: 'Butterfly' }, { e: '⚽', n: 'Ball' },
    { e: '🐶', n: 'Dog' }, { e: '🍦', n: 'Ice Cream' },
    { e: '🐝', n: 'Bee' }, { e: '🐟', n: 'Fish' },
    { e: '🦁', n: 'Lion' }, { e: '🐵', n: 'Monkey' },
    { e: '🐮', n: 'Cow' }, { e: '🍕', n: 'Pizza' }
];
