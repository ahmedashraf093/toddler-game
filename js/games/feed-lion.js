import { gameState, incrementCorrect, updateScore, resetRoundState } from '../engine/state.js';
import { makeDraggable, makeDroppable, setDropCallback } from '../engine/input.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { updateScoreUI, showCelebration } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

// Extremely High-Fidelity SVG Lion
// Features: Animated mane, blinking eyes, bobbing head, open mouth logic
const LION_SVGS = {
    normal: `<svg viewBox="0 0 300 300" width="100%" height="100%" class="lion-svg-root">
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

            <style>
                .lion-head-group { animation: head-bob 4s ease-in-out infinite; transform-origin: center bottom; }
                .lion-mane { animation: mane-sway 5s ease-in-out infinite; transform-origin: center; }
                .lion-eye { animation: blink 4s infinite; transform-origin: center; }

                @keyframes head-bob {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px) rotate(1deg); }
                }
                @keyframes mane-sway {
                    0%, 100% { transform: rotate(-1deg) scale(1); }
                    50% { transform: rotate(1deg) scale(1.02); }
                }
                @keyframes blink {
                    0%, 96%, 100% { transform: scaleY(1); }
                    98% { transform: scaleY(0.1); }
                }
            </style>
        </defs>

        <g class="lion-head-group">
            <!-- Mane (Detailed Strands) -->
            <g class="lion-mane" filter="url(#shadow)">
                <path d="M150,20 Q180,20 200,50 Q230,40 250,70 Q270,90 260,120 Q290,140 280,170 Q290,210 260,240 Q240,270 200,280 Q180,300 150,280 Q120,300 100,280 Q60,270 40,240 Q10,210 20,170 Q10,140 40,120 Q30,90 50,70 Q70,40 100,50 Q120,20 150,20 Z"
                      fill="url(#maneGrad)" />

                <!-- Hair Strands -->
                <path d="M150,30 Q170,30 180,50 M200,60 Q220,70 230,90 M250,130 Q260,150 250,170 M240,220 Q220,240 190,250 M110,250 Q80,240 60,220 M50,170 Q40,150 50,130 M70,90 Q80,70 100,60 M120,50 Q130,30 150,30"
                      stroke="rgba(255,255,255,0.15)" stroke-width="2" fill="none" stroke-linecap="round" />
            </g>

            <!-- Ears -->
            <circle cx="80" cy="80" r="25" fill="#DAA520" />
            <circle cx="80" cy="80" r="15" fill="#6D4C41" />
            <circle cx="220" cy="80" r="25" fill="#DAA520" />
            <circle cx="220" cy="80" r="15" fill="#6D4C41" />

            <!-- Face Base -->
            <circle cx="150" cy="160" r="90" fill="url(#faceGrad)" />

            <!-- Muzzle -->
            <ellipse cx="150" cy="190" rx="45" ry="35" fill="#FFF8DC" />
            <path d="M105,190 Q150,175 195,190 Q150,235 105,190" fill="rgba(0,0,0,0.05)" />

            <!-- Eyes (Animated) -->
            <g id="eyes-normal">
                <g class="lion-eye">
                    <circle cx="115" cy="140" r="14" fill="white" stroke="#3E2723" stroke-width="2"/>
                    <circle cx="115" cy="140" r="7" fill="black" />
                    <circle cx="118" cy="137" r="3" fill="white" opacity="0.9" />
                </g>
                <path d="M100,130 Q115,120 130,130" stroke="#3E2723" stroke-width="3" fill="none" />

                <g class="lion-eye">
                    <circle cx="185" cy="140" r="14" fill="white" stroke="#3E2723" stroke-width="2"/>
                    <circle cx="185" cy="140" r="7" fill="black" />
                    <circle cx="188" cy="137" r="3" fill="white" opacity="0.9" />
                </g>
                <path d="M170,130 Q185,120 200,130" stroke="#3E2723" stroke-width="3" fill="none" />
            </g>

            <!-- Nose -->
            <path d="M135,175 Q150,165 165,175 L158,188 Q150,195 142,188 Z" fill="#3E2723" />
            <ellipse cx="150" cy="172" rx="10" ry="3" fill="rgba(255,255,255,0.2)" />

            <!-- Whiskers -->
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
        </g>
    </svg>`,

    open: `<svg viewBox="0 0 300 300" width="100%" height="100%" class="lion-svg-root">
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

            <style>
                .lion-head-group { animation: head-bob-fast 0.5s ease-in-out infinite; transform-origin: center bottom; }
                .lion-mane { animation: mane-sway 2s ease-in-out infinite; transform-origin: center; }
                .lion-eye { animation: blink-fast 1s infinite; transform-origin: center; }

                @keyframes head-bob-fast {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes mane-sway {
                    0%, 100% { transform: rotate(-1deg) scale(1); }
                    50% { transform: rotate(1deg) scale(1.02); }
                }
                @keyframes blink-fast {
                    0%, 90%, 100% { transform: scaleY(1); }
                    95% { transform: scaleY(0.1); }
                }
            </style>
        </defs>

        <g class="lion-head-group">
            <g class="lion-mane" filter="url(#shadow2)">
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
                <g class="lion-eye">
                    <circle cx="115" cy="140" r="15" fill="white" stroke="#3E2723" stroke-width="2"/>
                    <circle cx="115" cy="140" r="7" fill="black" />
                    <circle cx="118" cy="137" r="3" fill="white" opacity="0.9" />
                </g>

                <g class="lion-eye">
                    <circle cx="185" cy="140" r="15" fill="white" stroke="#3E2723" stroke-width="2"/>
                    <circle cx="185" cy="140" r="7" fill="black" />
                    <circle cx="188" cy="137" r="3" fill="white" opacity="0.9" />
                </g>
            </g>

            <path d="M135,175 Q150,165 165,175 L158,188 Q150,195 142,188 Z" fill="#3E2723" />

            <g stroke="#3E2723" stroke-width="2" opacity="0.4">
                 <path d="M90,185 Q70,182 50,175" fill="none" />
                 <path d="M210,185 Q230,182 250,175" fill="none" />
            </g>

            <!-- Mouth (Open Wide) -->
            <circle cx="150" cy="210" r="18" fill="#5D4037" />
            <path d="M140,218 Q150,225 160,218" stroke="#E57373" stroke-width="2" fill="none" />
        </g>
    </svg>`,

    happy: `<svg viewBox="0 0 300 300" width="100%" height="100%" class="lion-svg-root">
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

            <style>
                .lion-head-group { animation: head-bounce 0.6s ease-in-out infinite; transform-origin: center bottom; }
                .lion-mane { animation: mane-sway 2s ease-in-out infinite; transform-origin: center; }

                @keyframes head-bounce {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-5px) scale(1.02); }
                }
                @keyframes mane-sway {
                    0%, 100% { transform: rotate(-2deg) scale(1); }
                    50% { transform: rotate(2deg) scale(1.05); }
                }
            </style>
        </defs>

        <g class="lion-head-group">
            <g class="lion-mane" filter="url(#shadow3)">
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
        </g>
    </svg>`
};

const FOOD_SVGS = {
    apple: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M50,25 Q70,5 85,25 Q95,45 80,75 Q65,95 50,90 Q35,95 20,75 Q5,45 15,25 Q30,5 50,25 Z" fill="#FF5252" stroke="#B71C1C" stroke-width="3"/>
        <path d="M50,25 Q50,10 55,5" stroke="#5D4037" stroke-width="3" fill="none"/>
        <path d="M50,25 Q30,15 35,5 Q40,15 50,25" fill="#4CAF50"/>
    </svg>`,
    banana: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M20,80 Q50,95 80,40 Q85,30 80,25 Q75,20 70,30 Q50,70 25,65 Q15,60 10,70 Q5,80 20,80 Z" fill="#FFEB3B" stroke="#FBC02D" stroke-width="3"/>
        <path d="M20,80 Q50,95 80,40" stroke="rgba(0,0,0,0.1)" stroke-width="2" fill="none"/>
    </svg>`,
    meat: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M20,40 Q10,60 30,80 Q50,95 70,80 Q90,60 80,40 Q70,20 50,30 Q30,20 20,40 Z" fill="#E57373" stroke="#C62828" stroke-width="3"/>
        <path d="M40,50 Q50,60 60,50 M35,60 Q45,70 55,60" stroke="#FFCDD2" stroke-width="3" stroke-linecap="round"/>
        <circle cx="50" cy="40" r="8" fill="#FFF" opacity="0.8"/>
    </svg>`,
    drumstick: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M30,70 Q40,80 50,70 L70,50 Q85,35 75,25 Q65,15 50,30 L30,50 Q20,60 30,70" fill="#D84315" stroke="#BF360C" stroke-width="3"/>
        <path d="M20,80 Q10,90 20,95 Q30,100 40,90 L30,80 Z" fill="#FFF" stroke="#DDD" stroke-width="2"/>
    </svg>`,
    fish: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M80,50 Q70,30 50,30 Q30,30 10,50 Q30,70 50,70 Q70,70 80,50 L95,20 L95,80 L80,50 Z" fill="#29B6F6" stroke="#0277BD" stroke-width="3"/>
        <circle cx="30" cy="45" r="3" fill="black"/>
        <path d="M50,40 Q60,50 50,60" stroke="#0277BD" stroke-width="2" fill="none"/>
    </svg>`,
    cookie: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="35" fill="#D7CCC8" stroke="#8D6E63" stroke-width="3"/>
        <circle cx="40" cy="40" r="4" fill="#5D4037"/>
        <circle cx="60" cy="45" r="4" fill="#5D4037"/>
        <circle cx="50" cy="65" r="4" fill="#5D4037"/>
        <circle cx="35" cy="55" r="4" fill="#5D4037"/>
        <circle cx="65" cy="55" r="4" fill="#5D4037"/>
    </svg>`
};

const FOOD_ITEMS = [
    { svg: FOOD_SVGS.apple, n: 'Apple', k: 'noun_apple' },
    { svg: FOOD_SVGS.banana, n: 'Banana', k: 'noun_banana' },
    { svg: FOOD_SVGS.meat, n: 'Steak', k: 'noun_meat' },
    { svg: FOOD_SVGS.drumstick, n: 'Chicken', k: 'noun_meat' },
    { svg: FOOD_SVGS.fish, n: 'Fish', k: 'noun_fish' },
    { svg: FOOD_SVGS.cookie, n: 'Cookie', k: 'noun_cookie' }
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
        // USE SVG CONTENT INSTEAD OF TEXT
        el.innerHTML = item.svg;

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
