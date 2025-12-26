import { gameState, incrementCorrect, updateScore, resetRoundState } from '../engine/state.js';
import { makeDraggable, makeDroppable, setDropCallback, setDragStartCallback } from '../engine/input.js';
import { speakText, speakSequence, playCrunchSound } from '../engine/audio.js';
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

const FOOD_ITEMS = [
    { e: '🍎', n: 'Apple', k: 'noun_apple' },
    { e: '🍌', n: 'Banana', k: 'noun_banana' },
    { e: '🥩', n: 'Steak', k: 'noun_meat' },
    { e: '🍗', n: 'Chicken', k: 'noun_meat' },
    { e: '🐟', n: 'Fish', k: 'noun_fish' },
    { e: '🍪', n: 'Cookie', k: 'noun_cookie' }
];

function openMouth() {
    const lionDiv = document.querySelector('.lion-container');
    if (lionDiv && !lionDiv.classList.contains('chewing')) {
        lionDiv.innerHTML = LION_SVGS.open;
    }
}

function closeMouth() {
    const lionDiv = document.querySelector('.lion-container');
    if (lionDiv && !lionDiv.classList.contains('chewing')) {
        lionDiv.innerHTML = LION_SVGS.normal;
    }
}

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

    // Tray
    const tray = document.createElement('div');
    tray.className = 'feed-tray';
    tray.id = 'feed-tray';

    stage.appendChild(lionDiv);
    stage.appendChild(tray);
    board.appendChild(stage);

    setDropCallback(handleDrop);
    setDragStartCallback(openMouth);

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
        // Wrap emoji in span for independent animation
        el.innerHTML = `<span class="food-emoji food-wiggle">${item.e}</span>`;
        el.style.fontSize = '4.5rem'; // Make them big

        el.dataset.label = item.n;
        el.dataset.key = item.k; // Store key for specific audio
        el.dataset.audioKey = item.k; // Store for input.js input handling
        el.id = 'food-' + Date.now() + '-' + i;

        // Random slight rotation for "messy table" look
        el.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;

        makeDraggable(el, 'lion', el.id); // Matches 'lion' droppable

        // Ensure mouth closes if drag ends without drop
        el.addEventListener('dragend', () => closeMouth());
        el.addEventListener('touchend', () => setTimeout(closeMouth, 100));

        tray.appendChild(el);
    }

    speakText("Feed the Lion!", "sys_feed_the_lion");
}

function handleDrop(targetBox, draggedVal, draggedElId) {
    const lionDiv = document.querySelector('.lion-container');

    if (!targetBox || !targetBox.classList.contains('lion-container')) {
        // Drag failed / dropped elsewhere
        closeMouth();
        return;
    }

    const foodEl = document.getElementById(draggedElId);

    // Play simple feedback sound (User requested removing long sentences)
    // Play eating sound effect
    // speakText("Chomp chomp! Mmmm!", "feed_lion_eat");
    playCrunchSound();

    if (foodEl) foodEl.remove();

    // Chewing State
    lionDiv.classList.add('chewing');
    lionDiv.innerHTML = LION_SVGS.happy;

    // Check if table is empty
    const remaining = document.querySelectorAll('#feed-tray .food-item');

    updateScore(10);
    updateScoreUI();
    incrementCorrect();
    // Do NOT call checkOverallProgress here every time, only at end of round

    setTimeout(() => {
        lionDiv.classList.remove('chewing');
        lionDiv.innerHTML = LION_SVGS.normal;

        if (remaining.length === 0) {
            // End of round
            checkOverallProgress('feedlion'); // This triggers "Amazing" every 3 rounds

            // Standard praise if not a big celebration
            // checkOverallProgress handles celebration, but if it didn't fire, we might want a small one.
            // But we don't know easily if it fired.
            // Generally "Good Job" is safe.
            // speakText("Good job!", "generic_good_job"); // Optional, but speakSequence might be playing

            setTimeout(spawnFoods, 2000);
        }
    }, 2000);
}
