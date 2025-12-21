import { gameState } from './state.js';

export function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

export function smartSelect(fullArray, modeKey, roundSize = 5) {
    const lastItems = gameState.history[modeKey] || [];
    let available = fullArray.filter(item => {
        const id = (typeof item === 'string') ? item : (item.id || Object.keys(item)[0]);
        return !lastItems.includes(id);
    });

    if (available.length < roundSize) available = [...fullArray];

    // Sort random
    available.sort(() => Math.random() - 0.5);
    const selected = available.slice(0, roundSize);

    // Update history
    gameState.history[modeKey] = selected.map(item => (typeof item === 'string' ? item : (item.id || Object.keys(item)[0])));

    return selected;
}
