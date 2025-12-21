import { initAudio, resumeAudioContext, toggleMute, getMuteState } from './engine/audio.js';
import { gameState } from './engine/state.js';
import { showLoader, toggleMenu, setTheme, populateGamesMenu } from './engine/ui.js';
import { initStandardGame } from './games/standard.js';
import { initMathGame } from './games/math.js';
import { initPuzzleGame } from './games/puzzle.js';
import { initMemoryGame } from './games/memory.js';
import { initChallenges, toggleChallengeMenu } from './challenges/manager.js';
import { ParentalGate } from './engine/parental-gate.js';

const GAME_VERSION = 'v2.0';

// Configuration for Game Modes
const gameModes = [
    { id: 'shadow', name: 'Shadows', icon: '🐶' },
    { id: 'letter', name: 'Letters', icon: '🅰️' },
    { id: 'job', name: 'Jobs', icon: '👮' },
    { id: 'feed', name: 'Feed', icon: '🥕' },
    { id: 'number', name: 'Numbers', icon: '1️⃣' },
    { id: 'shape', name: 'Shapes', icon: '🔷' },
    { id: 'weather', name: 'Weather', icon: '🌤️' },
    { id: 'nature', name: 'Nature', icon: '🍃' },
    { id: 'habitat', name: 'Homes', icon: '🏠' },
    { id: 'puzzle', name: 'Puzzle', icon: '🧩' },
    { id: 'memory', name: 'Memory', icon: '🧠' },
    { id: 'math', name: 'Math', icon: '➕' }
];

window.addEventListener('load', () => {
    console.log("Toddler Game Version:", GAME_VERSION);
    showLoader(false);

    const verDisplay = document.getElementById('version-display');
    if (verDisplay) verDisplay.textContent = GAME_VERSION;

    initAudio();
    initChallenges();

    // Bind global buttons
    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.onclick = startGame;

    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.onclick = () => {
            const muted = toggleMute();
            muteBtn.textContent = muted ? '🔇' : '🔊';
        };
        // Set initial state
        if (getMuteState()) muteBtn.textContent = '🔇';
    }

    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) menuBtn.onclick = () => toggleMenu();

    const challengeBtn = document.getElementById('challenges-btn');
    if (challengeBtn) challengeBtn.onclick = toggleChallengeMenu;

    // Close menu buttons
    document.querySelectorAll('.close-menu-btn').forEach(btn => {
        btn.onclick = (e) => {
            const overlay = e.target.closest('.overlay-full');
            if (overlay) overlay.classList.add('hidden');
        };
    });

    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.onclick = (e) => {
            const level = e.target.classList.contains('diff-easy') ? 'easy' :
                          e.target.classList.contains('diff-med') ? 'medium' : 'hard';
            setDifficulty(level, e.target);
        };
    });

    // Reset/Next Round button
    const resetBtn = document.getElementById('reset-btn');
    if(resetBtn) resetBtn.onclick = initRound;

    // Populate Menu
    populateGamesMenu(gameModes, setMode);

    // Init Parental Gate (binds events)
    ParentalGate.init();

    // Default Mode
    // setMode('shadow'); // Wait for start game
});

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    resumeAudioContext(); // Ensure audio context is ready

    // Start/Resume Parental Session
    ParentalGate.startSession();

    setMode('shadow');
}

function setDifficulty(level, btn) {
    gameState.mathDifficulty = level;
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Restart round if applicable
    if (gameState.currentMode === 'math' || gameState.currentMode === 'memory') {
        initRound();
    }
}

function setMode(mode) {
    gameState.currentMode = mode;
    toggleMenu(true); // Close menu
    setTheme(mode);
    initRound();
}

// Global initRound to dispatch to specific games
function initRound() {
    document.getElementById('reset-btn').style.display = 'none';

    // Visual transition handled in UI or CSS, here we just init logic
    const mode = gameState.currentMode;

    // Identify which init function to call
    if (mode === 'math') initMathGame();
    else if (mode === 'puzzle') initPuzzleGame();
    else if (mode === 'memory') initMemoryGame();
    else initStandardGame();
}

// Expose some globals for debugging if needed, but try to avoid it
window.gameState = gameState;
