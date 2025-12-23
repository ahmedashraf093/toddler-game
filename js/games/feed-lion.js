import { gameState, incrementCorrect, updateScore, resetRoundState } from '../engine/state.js';
import { makeDraggable, makeDroppable, setDropCallback } from '../engine/input.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { updateScoreUI, showCelebration } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

// Extremely High-Fidelity SVG Lion
// Features: Multi-layered hair strands for mane, deep gradients, detailed eyes, 3D snout
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
            <filter id="fur" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" />
                <feColorMatrix type="saturate" values="0" />
                <feBlend mode="multiply" in2="SourceGraphic" />
            </filter>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
            </filter>
        </defs>

        <!-- Mane (Detailed Strands) -->
        <g filter="url(#shadow)">
            <!-- Base Mane -->
            <path d="M150,20 Q180,20 200,50 Q230,40 250,70 Q270,90 260,120 Q290,140 280,170 Q290,210 260,240 Q240,270 200,280 Q180,300 150,280 Q120,300 100,280 Q60,270 40,240 Q10,210 20,170 Q10,140 40,120 Q30,90 50,70 Q70,40 100,50 Q120,20 150,20 Z"
                  fill="url(#maneGrad)" />

            <!-- Hair Strands (Simulated with lighter paths) -->
            <path d="M150,30 Q170,30 180,50 M200,60 Q220,70 230,90 M250,130 Q260,150 250,170 M240,220 Q220,240 190,250 M110,250 Q80,240 60,220 M50,170 Q40,150 50,130 M70,90 Q80,70 100,60 M120,50 Q130,30 150,30"
                  stroke="rgba(255,255,255,0.15)" stroke-width="2" fill="none" stroke-linecap="round" />
            <path d="M160,25 Q180,25 190,45 M210,65 Q230,75 240,95 M260,135 Q270,155 260,175"
                  stroke="rgba(0,0,0,0.1)" stroke-width="2" fill="none" stroke-linecap="round" />
        </g>

        <!-- Ears -->
        <circle cx="80" cy="80" r="25" fill="#DAA520" />
        <circle cx="80" cy="80" r="15" fill="#6D4C41" /> <!-- Darker inner ear -->
        <circle cx="220" cy="80" r="25" fill="#DAA520" />
        <circle cx="220" cy="80" r="15" fill="#6D4C41" />

        <!-- Face Base -->
        <circle cx="150" cy="160" r="90" fill="url(#faceGrad)" />

        <!-- Muzzle (3D effect) -->
        <ellipse cx="150" cy="190" rx="45" ry="35" fill="#FFF8DC" />
        <path d="M105,190 Q150,175 195,190 Q150,235 105,190" fill="rgba(0,0,0,0.05)" /> <!-- Shadow -->

        <!-- Eyes (Detailed) -->
        <g id="eyes-normal">
            <circle cx="115" cy="140" r="14" fill="white" stroke="#3E2723" stroke-width="2"/>
            <circle cx="115" cy="140" r="7" fill="black" />
            <circle cx="118" cy="137" r="3" fill="white" opacity="0.9" /> <!-- Highlight -->
            <path d="M100,130 Q115,120 130,130" stroke="#3E2723" stroke-width="3" fill="none" /> <!-- Eyebrow -->

            <circle cx="185" cy="140" r="14" fill="white" stroke="#3E2723" stroke-width="2"/>
            <circle cx="185" cy="140" r="7" fill="black" />
            <circle cx="188" cy="137" r="3" fill="white" opacity="0.9" />
            <path d="M170,130 Q185,120 200,130" stroke="#3E2723" stroke-width="3" fill="none" />
        </g>

        <!-- Nose -->
        <path d="M135,175 Q150,165 165,175 L158,188 Q150,195 142,188 Z" fill="#3E2723" />
        <ellipse cx="150" cy="172" rx="10" ry="3" fill="rgba(255,255,255,0.2)" /> <!-- Highlight -->

        <!-- Whiskers (More prominent) -->
        <g stroke="#3E2723" stroke-width="2" opacity="0.4">
            <path d="M90,185 Q70,182 50,175" fill="none" />
            <path d="M90,195 Q70,195 50,195" fill="none" />
            <path d="M90,205 Q70,208 50,215" fill="none" />

            <path d="M210,185 Q230,182 250,175" fill="none" />
            <path d="M210,195 Q230,195 250,195" fill="none" />
            <path d="M210,205 Q230,208 250,215" fill="none" />
        </g>

        <!-- Mouth (Normal) -->
        <path d="M150,195 L150,205 M135,205 Q150,215 165,205" stroke="#3E2723" stroke-width="3" fill="none" stroke-linecap="round" />
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
             <path d="M150,30 Q170,30 180,50 M200,60 Q220,70 230,90 M250,130 Q260,150 250,170"
                  stroke="rgba(255,255,255,0.15)" stroke-width="2" fill="none" stroke-linecap="round" />
        </g>

        <circle cx="80" cy="80" r="25" fill="#DAA520" />
        <circle cx="80" cy="80" r="15" fill="#6D4C41" />
        <circle cx="220" cy="80" r="25" fill="#DAA520" />
        <circle cx="220" cy="80" r="15" fill="#6D4C41" />

        <circle cx="150" cy="160" r="90" fill="url(#faceGrad2)" />
        <ellipse cx="150" cy="190" rx="45" ry="35" fill="#FFF8DC" />

        <g id="eyes-open">
            <circle cx="115" cy="140" r="15" fill="white" stroke="#3E2723" stroke-width="2"/>
            <circle cx="115" cy="140" r="7" fill="black" />
            <circle cx="118" cy="137" r="3" fill="white" opacity="0.9" />

            <circle cx="185" cy="140" r="15" fill="white" stroke="#3E2723" stroke-width="2"/>
            <circle cx="185" cy="140" r="7" fill="black" />
            <circle cx="188" cy="137" r="3" fill="white" opacity="0.9" />
        </g>

        <path d="M135,175 Q150,165 165,175 L158,188 Q150,195 142,188 Z" fill="#3E2723" />

        <g stroke="#3E2723" stroke-width="2" opacity="0.4">
             <path d="M90,185 Q70,182 50,175" fill="none" />
             <path d="M210,185 Q230,182 250,175" fill="none" />
        </g>

        <!-- Mouth (Open Wide) -->
        <circle cx="150" cy="210" r="18" fill="#5D4037" />
        <path d="M140,218 Q150,225 160,218" stroke="#E57373" stroke-width="2" fill="none" />
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
            <path d="M150,30 Q170,30 180,50 M200,60 Q220,70 230,90"
                  stroke="rgba(255,255,255,0.15)" stroke-width="2" fill="none" stroke-linecap="round" />
        </g>

        <circle cx="80" cy="80" r="25" fill="#DAA520" />
        <circle cx="80" cy="80" r="15" fill="#6D4C41" />
        <circle cx="220" cy="80" r="25" fill="#DAA520" />
        <circle cx="220" cy="80" r="15" fill="#6D4C41" />

        <circle cx="150" cy="160" r="90" fill="url(#faceGrad3)" />
        <ellipse cx="150" cy="190" rx="45" ry="35" fill="#FFF8DC" />

        <!-- Happy Eyes (Closed Curves) -->
        <g stroke="#3E2723" stroke-width="4" fill="none" stroke-linecap="round">
            <path d="M100,145 Q115,135 130,145" />
            <path d="M170,145 Q185,135 200,145" />
        </g>

        <path d="M135,175 Q150,165 165,175 L158,188 Q150,195 142,188 Z" fill="#3E2723" />

        <g stroke="#3E2723" stroke-width="2" opacity="0.4">
            <path d="M90,185 Q70,182 50,175" fill="none" />
            <path d="M210,185 Q230,182 250,175" fill="none" />
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

    spawnFoods();
}

function spawnFoods() {
    const tray = document.getElementById('feed-tray');
    if (!tray) return;
    tray.innerHTML = '';

    // Spawn 4 random items
    for (let i = 0; i < 4; i++) {
        const item = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];

        const el = document.createElement('div');
        el.className = 'food-item draggable';
        el.textContent = item.e;
        el.dataset.label = item.n;
        el.dataset.key = item.k; // Store key for specific audio
        el.id = 'food-' + Date.now() + '-' + i;

        // Random slight rotation for "messy table" look
        el.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;

        makeDraggable(el, 'lion', el.id); // Matches 'lion' droppable
        tray.appendChild(el);
    }

    speakText("Feed the Lion!", "noun_lion");
}

function handleDrop(targetBox, draggedVal, draggedElId) {
    if (!targetBox || !targetBox.classList.contains('lion-container')) return;

    const lionDiv = targetBox;
    const foodEl = document.getElementById(draggedElId);

    // Play specific item sound if available
    if (foodEl && foodEl.dataset.key) {
        speakSequence(['noun_lion', 'conn_eats_the', foodEl.dataset.key]);
    }

    if (foodEl) foodEl.remove();

    // Chewing State
    lionDiv.classList.add('chewing');
    lionDiv.innerHTML = LION_SVGS.happy;

    // Check if table is empty
    const remaining = document.querySelectorAll('#feed-tray .food-item');

    updateScore(10);
    updateScoreUI();
    incrementCorrect();
    checkOverallProgress('feedlion');

    setTimeout(() => {
        lionDiv.classList.remove('chewing');
        lionDiv.innerHTML = LION_SVGS.normal;

        if (remaining.length === 0) {
            showCelebration();
            setTimeout(spawnFoods, 2000);
        }
    }, 2000);
}
