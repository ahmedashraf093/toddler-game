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

export function updateScore(points) {
    gameState.totalScore += points;
    return gameState.totalScore;
}

export function incrementCorrect() {
    gameState.correctCount++;
    return gameState.correctCount;
}
