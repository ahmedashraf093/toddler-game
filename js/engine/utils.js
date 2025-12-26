import { gameState } from './state.js';

export function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

export function smartSelect(fullArray, modeKey, roundSize = 5) {
    let history = gameState.history[modeKey] || [];

    // 1. Determine available items (Full - History)
    let available = fullArray.filter(item => {
        const id = (typeof item === 'string') ? item : (item.id || Object.keys(item)[0]);
        return !history.includes(id);
    });

    // 2. If not enough items, Reshuffle (Recycle History)
    // Keep the most recent items blocked to prevent immediate back-to-back repeats
    if (available.length < roundSize) {
        // Keep the last 'roundSize' number of items blocked if we have enough items in history
        const keepCount = Math.min(history.length, roundSize);
        const recentBlock = history.slice(-keepCount);

        // Re-calculate available excluding ONLY the recent block
        available = fullArray.filter(item => {
            const id = (typeof item === 'string') ? item : (item.id || Object.keys(item)[0]);
            return !recentBlock.includes(id);
        });

        // If even with relaxed constraints we can't fill the round (pool < roundSize), 
        // fallback to full reset
        if (available.length < roundSize) {
            available = [...fullArray];
            history = [];
        } else {
            // Partial reset: history becomes just the recent block
            history = recentBlock;
        }
    }

    // 3. Select Randomly from Available
    available.sort(() => Math.random() - 0.5);
    const selected = available.slice(0, roundSize);

    // 4. Update History (Append new selection)
    const selectedIds = selected.map(item => (typeof item === 'string' ? item : (item.id || Object.keys(item)[0])));
    gameState.history[modeKey] = [...history, ...selectedIds];

    return selected;
}
