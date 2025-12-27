export const gameState = {
    currentMode: 'shadow',
    mathDifficulty: 'easy',
    correctCount: 0,
    totalScore: 0,
    consecutiveCompletions: 0,
    history: {
        shadow: [], letter: [], job: [], number: [], feed: [],
        shape: [], weather: [], nature: [], habitat: [],
        puzzle: [], memory: []
    }
};

export function resetRoundState() {
    gameState.correctCount = 0;
}

import { addStickerProgress } from './stickers.js';

export function updateScore(points) {
    gameState.totalScore += points;
    // 10 points = 5% progress? 
    // Let's say 200 points for a sticker -> 10 points = 5%
    addStickerProgress(points / 2);
    return gameState.totalScore;
}

export function incrementCorrect() {
    gameState.correctCount++;
    return gameState.correctCount;
}
