import { gameState, incrementCorrect, updateScore, resetRoundState } from '../engine/state.js';
import { makeDraggable, makeDroppable, setDropCallback } from '../engine/input.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { updateScoreUI, showCelebration } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

// High-Fidelity SVG Lion
// Features: Fluffy mane gradient, detailed ears, cute eyes, whiskers, animated mouth states
const LION_SVGS = {
    normal: `<svg viewBox="0 0 300 300" width="100%" height="100%">
        <defs>
            <linearGradient id="maneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#D2691E;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#8B4513;stop-opacity:1" />
            </linearGradient>
            <radialGradient id="faceGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" />
            </radialGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
            </filter>
        </defs>

        <!-- Mane (Fluffy) -->
        <g filter="url(#shadow)">
            <path d="M150,20 Q180,20 200,50 Q230,40 250,70 Q270,90 260,120 Q290,140 280,170 Q290,210 260,240 Q240,270 200,280 Q180,300 150,280 Q120,300 100,280 Q60,270 40,240 Q10,210 20,170 Q10,140 40,120 Q30,90 50,70 Q70,40 100,50 Q120,20 150,20 Z"
                  fill="url(#maneGrad)" />
        </g>

        <!-- Ears -->
        <circle cx="80" cy="80" r="25" fill="#DAA520" />
        <circle cx="80" cy="80" r="15" fill="#8B4513" />
        <circle cx="220" cy="80" r="25" fill="#DAA520" />
        <circle cx="220" cy="80" r="15" fill="#8B4513" />

        <!-- Face Base -->
        <circle cx="150" cy="160" r="90" fill="url(#faceGrad)" />

        <!-- Muzzle -->
        <ellipse cx="150" cy="190" rx="45" ry="35" fill="#FFF8DC" />

        <!-- Eyes (Normal) -->
        <g id="eyes-normal">
            <circle cx="115" cy="140" r="12" fill="white" />
            <circle cx="115" cy="140" r="6" fill="black" />
            <circle cx="118" cy="137" r="2" fill="white" /> <!-- Highlight -->

            <circle cx="185" cy="140" r="12" fill="white" />
            <circle cx="185" cy="140" r="6" fill="black" />
            <circle cx="188" cy="137" r="2" fill="white" />
        </g>

        <!-- Nose -->
        <path d="M135,175 Q150,165 165,175 L150,195 Z" fill="#3E2723" />

        <!-- Whiskers -->
        <g stroke="#3E2723" stroke-width="2" opacity="0.6">
            <line x1="80" y1="180" x2="110" y2="185" />
            <line x1="80" y1="190" x2="110" y2="190" />
            <line x1="80" y1="200" x2="110" y2="195" />

            <line x1="220" y1="180" x2="190" y2="185" />
            <line x1="220" y1="190" x2="190" y2="190" />
            <line x1="220" y1="200" x2="190" y2="195" />
        </g>

        <!-- Mouth (Normal) -->
        <path d="M150,195 L150,205 M135,205 Q150,215 165,205" stroke="#3E2723" stroke-width="3" fill="none" />
    </svg>`,

    open: `<svg viewBox="0 0 300 300" width="100%" height="100%">
        <defs>
            <linearGradient id="maneGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#D2691E;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#8B4513;stop-opacity:1" />
            </linearGradient>
            <radialGradient id="faceGrad2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" />
            </radialGradient>
            <filter id="shadow2" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
            </filter>
        </defs>

        <g filter="url(#shadow2)">
            <path d="M150,20 Q180,20 200,50 Q230,40 250,70 Q270,90 260,120 Q290,140 280,170 Q290,210 260,240 Q240,270 200,280 Q180,300 150,280 Q120,300 100,280 Q60,270 40,240 Q10,210 20,170 Q10,140 40,120 Q30,90 50,70 Q70,40 100,50 Q120,20 150,20 Z"
                  fill="url(#maneGrad2)" />
        </g>

        <circle cx="80" cy="80" r="25" fill="#DAA520" />
        <circle cx="80" cy="80" r="15" fill="#8B4513" />
        <circle cx="220" cy="80" r="25" fill="#DAA520" />
        <circle cx="220" cy="80" r="15" fill="#8B4513" />

        <circle cx="150" cy="160" r="90" fill="url(#faceGrad2)" />
        <ellipse cx="150" cy="190" rx="45" ry="35" fill="#FFF8DC" />

        <g id="eyes-open">
             <!-- Slightly wider eyes for excitement -->
            <circle cx="115" cy="140" r="13" fill="white" />
            <circle cx="115" cy="140" r="7" fill="black" />
            <circle cx="118" cy="137" r="2" fill="white" />

            <circle cx="185" cy="140" r="13" fill="white" />
            <circle cx="185" cy="140" r="7" fill="black" />
            <circle cx="188" cy="137" r="2" fill="white" />
        </g>

        <path d="M135,175 Q150,165 165,175 L150,195 Z" fill="#3E2723" />

        <g stroke="#3E2723" stroke-width="2" opacity="0.6">
            <line x1="80" y1="180" x2="110" y2="185" />
            <line x1="80" y1="190" x2="110" y2="190" />
            <line x1="80" y1="200" x2="110" y2="195" />

            <line x1="220" y1="180" x2="190" y2="185" />
            <line x1="220" y1="190" x2="190" y2="190" />
            <line x1="220" y1="200" x2="190" y2="195" />
        </g>

        <!-- Mouth (Open Wide) -->
        <circle cx="150" cy="210" r="15" fill="#5D4037" />
        <path d="M140,218 Q150,225 160,218" stroke="#E57373" stroke-width="2" fill="none" /> <!-- Tongue hint -->
    </svg>`,

    happy: `<svg viewBox="0 0 300 300" width="100%" height="100%">
        <defs>
            <linearGradient id="maneGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#D2691E;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#8B4513;stop-opacity:1" />
            </linearGradient>
            <radialGradient id="faceGrad3" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" />
            </radialGradient>
            <filter id="shadow3" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
            </filter>
        </defs>

        <g filter="url(#shadow3)">
            <path d="M150,20 Q180,20 200,50 Q230,40 250,70 Q270,90 260,120 Q290,140 280,170 Q290,210 260,240 Q240,270 200,280 Q180,300 150,280 Q120,300 100,280 Q60,270 40,240 Q10,210 20,170 Q10,140 40,120 Q30,90 50,70 Q70,40 100,50 Q120,20 150,20 Z"
                  fill="url(#maneGrad3)" />
        </g>

        <circle cx="80" cy="80" r="25" fill="#DAA520" />
        <circle cx="80" cy="80" r="15" fill="#8B4513" />
        <circle cx="220" cy="80" r="25" fill="#DAA520" />
        <circle cx="220" cy="80" r="15" fill="#8B4513" />

        <circle cx="150" cy="160" r="90" fill="url(#faceGrad3)" />
        <ellipse cx="150" cy="190" rx="45" ry="35" fill="#FFF8DC" />

        <!-- Happy Eyes (Closed Curves) -->
        <g stroke="#3E2723" stroke-width="4" fill="none" stroke-linecap="round">
            <path d="M100,140 Q115,130 130,140" />
            <path d="M170,140 Q185,130 200,140" />
        </g>

        <path d="M135,175 Q150,165 165,175 L150,195 Z" fill="#3E2723" />

        <g stroke="#3E2723" stroke-width="2" opacity="0.6">
            <line x1="80" y1="180" x2="110" y2="185" />
            <line x1="80" y1="190" x2="110" y2="190" />
            <line x1="80" y1="200" x2="110" y2="195" />

            <line x1="220" y1="180" x2="190" y2="185" />
            <line x1="220" y1="190" x2="190" y2="190" />
            <line x1="220" y1="200" x2="190" y2="195" />
        </g>

        <!-- Mouth (Big Smile) -->
        <path d="M130,205 Q150,225 170,205" stroke="#3E2723" stroke-width="3" fill="none" />

        <!-- Cheeks -->
        <circle cx="100" cy="170" r="10" fill="#FFAB91" opacity="0.6" />
        <circle cx="200" cy="170" r="10" fill="#FFAB91" opacity="0.6" />
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

    // Create Stage Structure
    const board = document.getElementById('game-board');
    if (!board) return;

    // Clear existing board content
    board.innerHTML = '';

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
