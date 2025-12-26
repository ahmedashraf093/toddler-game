import { initAudio, resumeAudioContext, toggleMute, getMuteState } from './engine/audio.js';
import { gameState } from './engine/state.js';
import { showLoader, toggleMenu, setTheme, populateGamesMenu } from './engine/ui.js';
import { initStandardGame } from './games/standard.js';
import { initMathGame } from './games/math.js';
import { initPuzzleGame } from './games/puzzle.js';
import { initMemoryGame } from './games/memory.js';
import { initPatternGame } from './games/pattern.js';
import { initSortingGame } from './games/sorting.js';
import { initOddOneOutGame } from './games/odd-one-out.js';
import { initFeedLionGame } from './games/feed-lion.js';
import { initSentenceGame } from './games/sentences.js';
import { initListeningGame } from './games/listening.js';
import { initChallenges, toggleChallengeMenu, isContentUnlocked } from './challenges/manager.js';
import { ParentalGate } from './engine/parental-gate.js';

const GAME_VERSION = 'v2.0';

// Configuration for Game Modes
const gameModes = [
    // World
    { id: 'feedlion', name: 'Feed Lion', icon: 'assets/images/game_icons/icon_feed.png', category: 'world' },
    { id: 'weather', name: 'Weather', icon: 'assets/images/game_icons/icon_weather.png', category: 'world' },
    { id: 'nature', name: 'Nature', icon: 'assets/images/game_icons/icon_nature.png', category: 'world' },
    { id: 'habitat', name: 'Homes', icon: 'assets/images/game_icons/icon_homes.png', category: 'world' },

    // Basics
    { id: 'shadow', name: 'Shadows', icon: 'assets/images/game_icons/icon_shadows.png', category: 'basics' },
    { id: 'shape', name: 'Shapes', icon: 'assets/images/game_icons/icon_shapes.png', category: 'basics' },
    { id: 'sorting', name: 'Sorting', icon: 'assets/images/game_icons/icon_sorting.png', category: 'basics' },

    // Learning
    { id: 'letter', name: 'Letters', icon: 'assets/images/game_icons/icon_letters.png', category: 'learning' },
    { id: 'number', name: 'Numbers', icon: 'assets/images/game_icons/icon_numbers.png', category: 'learning' },
    { id: 'math', name: 'Math', icon: 'assets/images/game_icons/icon_math.png', category: 'learning' },
    { id: 'sentences', name: 'Story', icon: 'assets/images/game_icons/icon_story.png', category: 'learning' },
    { id: 'job', name: 'Jobs', icon: 'assets/images/game_icons/icon_jobs.png', category: 'learning' },
    { id: 'listening', name: 'Listening', icon: 'assets/images/game_icons/icon_listening.png', category: 'learning' },

    // Logic
    { id: 'pattern', name: 'Pattern', icon: 'assets/images/game_icons/icon_pattern.png', category: 'logic' },
    { id: 'puzzle', name: 'Puzzle', icon: 'assets/images/game_icons/icon_puzzle.png', category: 'logic' },
    { id: 'memory', name: 'Memory', icon: 'assets/images/game_icons/icon_memory.png', category: 'logic' },
    { id: 'oddoneout', name: 'Odd One', icon: 'assets/images/game_icons/icon_oddoneout.png', category: 'logic' }
];

window.addEventListener('load', () => {
    console.log("Toddler Game Version:", GAME_VERSION);
    showLoader(false);

    const verDisplay = document.getElementById('version-display');
    if (verDisplay) verDisplay.textContent = GAME_VERSION;

    initAudio();
    initChallenges(setMode);

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
    if (resetBtn) resetBtn.onclick = initRound;

    // Populate Menu
    populateGamesMenu(gameModes, setMode);

    // Hint for locked game
    if (!isContentUnlocked()) {
        const startScreen = document.getElementById('start-screen');
        const startBtn = document.getElementById('start-btn');
        if (startScreen && startBtn) {
            const hint = document.createElement('div');
            hint.className = 'locked-game-hint';
            hint.innerHTML = '✨ Complete Daily Challenges<br>to unlock a <b>Bonus Game!</b> 🦁';
            hint.style.cssText = "margin-top: 20px; font-size: 1.1rem; color: #d35400; background: #fff3cd; padding: 10px 20px; border-radius: 15px; border: 2px solid #ffeeba; box-shadow: 0 4px 0 rgba(0,0,0,0.1); animation: pulse 2s infinite; text-align: center; max-width: 80%;";
            startBtn.parentNode.insertBefore(hint, startBtn.nextSibling);
        }
    }

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
    console.log("setMode called with:", mode);
    gameState.currentMode = mode;
    toggleMenu(true); // Close menu
    setTheme(mode);
    initRound();
}

// Global initRound to dispatch to specific games
function initRound() {
    console.log("initRound called. Mode:", gameState.currentMode);
    document.getElementById('reset-btn').style.display = 'none';

    // Visual transition handled in UI or CSS, here we just init logic
    const mode = gameState.currentMode;

    // Identify which init function to call
    if (mode === 'math') initMathGame();
    else if (mode === 'puzzle') initPuzzleGame();
    else if (mode === 'memory') initMemoryGame();
    else if (mode === 'pattern') initPatternGame();
    else if (mode === 'sorting') initSortingGame();
    else if (mode === 'oddoneout') initOddOneOutGame();
    else if (mode === 'feedlion') initFeedLionGame();
    else if (mode === 'sentences') initSentenceGame();
    else if (mode === 'listening') initListeningGame();
    else initStandardGame();
}

// Expose some globals for debugging if needed, but try to avoid it
window.gameState = gameState;
