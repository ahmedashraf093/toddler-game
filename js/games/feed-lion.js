import { gameState, incrementCorrect, updateScore, resetRoundState } from '../engine/state.js';
import { makeDraggable, makeDroppable, setDropCallback } from '../engine/input.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { updateScoreUI, showCelebration } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

const LION_SVGS = {
    normal: `<svg viewBox="0 0 200 200" width="200" height="200">
        <!-- Mane -->
        <circle cx="100" cy="100" r="90" fill="#8B4513" />
        <!-- Face -->
        <circle cx="100" cy="100" r="70" fill="#FFD700" />
        <!-- Eyes -->
        <circle cx="75" cy="85" r="8" fill="#000" />
        <circle cx="125" cy="85" r="8" fill="#000" />
        <!-- Nose -->
        <polygon points="90,110 110,110 100,125" fill="#000" />
        <!-- Mouth (Neutral) -->
        <path d="M 80 135 Q 100 145 120 135" stroke="#000" stroke-width="3" fill="none" />
    </svg>`,
    open: `<svg viewBox="0 0 200 200" width="200" height="200">
        <circle cx="100" cy="100" r="90" fill="#8B4513" />
        <circle cx="100" cy="100" r="70" fill="#FFD700" />
        <circle cx="75" cy="85" r="8" fill="#000" />
        <circle cx="125" cy="85" r="8" fill="#000" />
        <polygon points="90,110 110,110 100,125" fill="#000" />
        <!-- Mouth (Open) -->
        <circle cx="100" cy="145" r="20" fill="#521d1d" />
    </svg>`,
    happy: `<svg viewBox="0 0 200 200" width="200" height="200">
        <circle cx="100" cy="100" r="90" fill="#8B4513" />
        <circle cx="100" cy="100" r="70" fill="#FFD700" />
        <!-- Happy Eyes -->
        <path d="M 65 85 Q 75 75 85 85" stroke="#000" stroke-width="3" fill="none" />
        <path d="M 115 85 Q 125 75 135 85" stroke="#000" stroke-width="3" fill="none" />
        <polygon points="90,110 110,110 100,125" fill="#000" />
        <!-- Smile -->
        <path d="M 70 130 Q 100 160 130 130" stroke="#000" stroke-width="3" fill="none" />
    </svg>`
};

const FOOD_ITEMS = [
    { e: '🍎', n: 'Apple', k: 'noun_apple' },
    { e: '🍌', n: 'Banana', k: 'noun_banana' },
    { e: '🥩', n: 'Meat', k: 'noun_meat' },
    { e: '🍦', n: 'Ice Cream', k: 'noun_ice_cream' },
    { e: '🍪', n: 'Cookie', k: 'noun_cookie' },
    { e: '🍕', n: 'Pizza', k: 'noun_pizza' }
];

let currentFood = null;

export function initFeedLionGame() {
    resetRoundState();

    // Inject CSS for this game if not present
    if (!document.getElementById('feed-lion-style')) {
        const style = document.createElement('style');
        style.id = 'feed-lion-style';
        style.innerHTML = `
            #feed-lion-stage {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                height: 100%;
                padding: 20px;
            }
            .lion-container {
                width: 250px;
                height: 250px;
                margin-top: 20px;
                transition: transform 0.3s ease;
            }
            .feed-tray {
                width: 100%;
                height: 150px;
                display: flex;
                justify-content: center;
                align-items: center;
                background: rgba(255,255,255,0.2);
                border-radius: 20px;
                margin-bottom: 20px;
            }
            .food-item {
                font-size: 80px;
                cursor: grab;
                transition: transform 0.2s;
            }
            .food-item:active {
                cursor: grabbing;
                transform: scale(1.1);
            }
            .lion-container.droppable.drag-over {
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }

    // Create Stage Structure
    const board = document.getElementById('game-board');
    if (!board) return;

    // Clear existing
    const existingStage = document.getElementById('feed-lion-stage');
    if (existingStage) existingStage.remove();

    const stage = document.createElement('div');
    stage.id = 'feed-lion-stage';

    // Lion
    const lionDiv = document.createElement('div');
    lionDiv.className = 'lion-container droppable';
    lionDiv.innerHTML = LION_SVGS.normal;
    makeDroppable(lionDiv, 'lion');

    // Listen for drag over to open mouth
    lionDiv.addEventListener('dragenter', () => {
        if (!lionDiv.classList.contains('chewing')) {
            lionDiv.innerHTML = LION_SVGS.open;
        }
    });
    lionDiv.addEventListener('dragleave', () => {
        if (!lionDiv.classList.contains('chewing')) {
            lionDiv.innerHTML = LION_SVGS.normal;
        }
    });

    // Tray
    const tray = document.createElement('div');
    tray.className = 'feed-tray';
    tray.id = 'feed-tray';

    stage.appendChild(lionDiv);
    stage.appendChild(tray);
    board.appendChild(stage);

    setDropCallback(handleDrop);

    spawnFood();
}

function spawnFood() {
    const tray = document.getElementById('feed-tray');
    if (!tray) return;
    tray.innerHTML = '';

    const item = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
    currentFood = item;

    const el = document.createElement('div');
    el.className = 'food-item draggable';
    el.textContent = item.e;
    el.dataset.label = item.n;
    el.id = 'food-' + Date.now();

    // "Lion eats the [Food]"
    setTimeout(() => {
        speakSequence(['noun_lion', 'conn_eats_the', item.k]);
    }, 500);

    makeDraggable(el, 'lion', el.id); // Matches 'lion' droppable
    tray.appendChild(el);
}

function handleDrop(targetBox, draggedVal, draggedElId) {
    if (!targetBox || !targetBox.classList.contains('lion-container')) return;

    const lionDiv = targetBox;
    const foodEl = document.getElementById(draggedElId);
    if (foodEl) foodEl.remove();

    // Chewing State
    lionDiv.classList.add('chewing');
    lionDiv.innerHTML = LION_SVGS.happy;

    speakText("Yummy!", "generic_yummy");
    updateScore(10);
    updateScoreUI();

    // Check progress
    incrementCorrect();
    checkOverallProgress('feedlion');

    // Reset after delay
    setTimeout(() => {
        lionDiv.classList.remove('chewing');
        lionDiv.innerHTML = LION_SVGS.normal;
        spawnFood();
    }, 2000);
}
