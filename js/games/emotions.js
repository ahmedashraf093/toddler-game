
import { gameState, incrementCorrect, updateScore, resetRoundState } from '../engine/state.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { launchModal, updateScoreUI, showCelebration } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

// Configuration
const EMOTIONS = {
    happy: { name: 'Happy', emoji: '😊' },
    sad: { name: 'Sad', emoji: '😢' },
    angry: { name: 'Angry', emoji: '😠' },
    surprised: { name: 'Surprised', emoji: '😲' }
};

const PARTS = {
    eyes: [
        { id: 'eyes_happy', icon: '👀', type: 'eyes', emotion: 'happy', style: 'transform: rotate(0deg);' }, // Generic eyes can be happy? Or use simple shapes. Let's use emoji parts.
        // Actually, pure emojis for parts are tricky because "eye" emoji is just eye. 
        // Let's use specific chars or SVGs if possible. 
        // For simplicity: unique emojis or manipulated text.
        // Happy Eyes: ^ ^ (text) or '😊' cropped? 
        // Let's use specific emojis that look like parts:
        { id: 'eyes_happy', icon: '😊', type: 'eyes', emotion: 'happy' }, // We will mask or just use the whole face as icon but conceptually it's "Happy Eyes"
        { id: 'eyes_sad', icon: '😢', type: 'eyes', emotion: 'sad' },
        { id: 'eyes_angry', icon: '😠', type: 'eyes', emotion: 'angry' },
        { id: 'eyes_surprised', icon: '😲', type: 'eyes', emotion: 'surprised' },
    ],
    mouth: [
        { id: 'mouth_happy', icon: '👄', type: 'mouth', emotion: 'happy' }, // Placeholder icons, we might need better assets later.
        // Wait, using full face emojis as "parts" is confusing. 
        // Let's use Text based Kaomoji parts or simple SVG strings?
        // OR: Just use the same emoji and say "Put the Happy face pieces".
        // Better: Use `initStickers` style svgs? No time for assets.
        // Let's use Text Content for parts.
    ]
};

// Refined Parts Library using text/unicode
// High Fidelity SVG Parts
const PART_LIB = [
    // Eyes
    {
        id: 'e_happy',
        type: 'eyes',
        emotion: 'happy',
        svg: `<svg viewBox="0 0 100 50" width="100%" height="100%"><path d="M10,30 Q25,10 40,30" stroke="#333" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M60,30 Q75,10 90,30" stroke="#333" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`
    },
    {
        id: 'e_sad',
        type: 'eyes',
        emotion: 'sad',
        svg: `<svg viewBox="0 0 100 50" width="100%" height="100%"><path d="M10,20 Q25,40 40,20" stroke="#333" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M60,20 Q75,40 90,20" stroke="#333" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="15" cy="35" r="3" fill="#3366cc" opacity="0.6"/><circle cx="85" cy="35" r="3" fill="#3366cc" opacity="0.6"/></svg>`
    },
    {
        id: 'e_angry',
        type: 'eyes',
        emotion: 'angry',
        svg: `<svg viewBox="0 0 100 50" width="100%" height="100%"><path d="M10,15 L40,25" stroke="#333" stroke-width="5" stroke-linecap="round"/><path d="M90,15 L60,25" stroke="#333" stroke-width="5" stroke-linecap="round"/><circle cx="25" cy="35" r="5" fill="#333"/><circle cx="75" cy="35" r="5" fill="#333"/></svg>`
    },
    {
        id: 'e_surprised',
        type: 'eyes',
        emotion: 'surprised',
        svg: `<svg viewBox="0 0 100 50" width="100%" height="100%"><circle cx="25" cy="25" r="15" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="25" cy="25" r="5" fill="#333"/><circle cx="75" cy="25" r="15" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="75" cy="25" r="5" fill="#333"/></svg>`
    },

    // Mouths
    {
        id: 'm_happy',
        type: 'mouth',
        emotion: 'happy',
        svg: `<svg viewBox="0 0 100 60" width="100%" height="100%">
            <!-- Wide Smile -->
            <path d="M10,10 Q50,80 90,10" fill="#b71c1c" stroke="#b71c1c" stroke-width="2" />
            <!-- Teeth -->
            <path d="M10,10 Q50,30 90,10" fill="#fff" />
            <!-- Tongue -->
            <path d="M30,45 Q50,60 70,45 Q60,35 50,40 Q40,35 30,45" fill="#f48fb1" />
        </svg>`
    },
    {
        id: 'm_sad',
        type: 'mouth',
        emotion: 'sad',
        svg: `<svg viewBox="0 0 100 60" width="100%" height="100%">
            <!-- Exaggerated Frown -->
            <path d="M15,50 Q50,0 85,50" stroke="#d32f2f" stroke-width="8" fill="none" stroke-linecap="round" />
            <!-- Corner Droops -->
            <path d="M15,50 L10,55" stroke="#d32f2f" stroke-width="6" stroke-linecap="round" />
            <path d="M85,50 L90,55" stroke="#d32f2f" stroke-width="6" stroke-linecap="round" />
        </svg>`
    },
    {
        id: 'm_angry',
        type: 'mouth',
        emotion: 'angry',
        svg: `<svg viewBox="0 0 100 60" width="100%" height="100%">
            <!-- Boxy Snarl -->
            <rect x="15" y="15" width="70" height="30" rx="5" fill="#5d4037" stroke="#3e2723" stroke-width="3" />
            <!-- Jagged Teeth -->
            <path d="M15,15 L25,30 L35,15 L45,30 L55,15 L65,30 L75,15 L85,30" fill="#fff" />
            <path d="M15,45 L25,30 L35,45 L45,30 L55,45 L65,30 L75,45 L85,30" fill="#fff" />
        </svg>`
    },
    {
        id: 'm_surprised',
        type: 'mouth',
        emotion: 'surprised',
        svg: `<svg viewBox="0 0 100 60" width="100%" height="100%">
            <!-- Tall O -->
            <ellipse cx="50" cy="30" rx="20" ry="28" fill="#3e2723" stroke="#d32f2f" stroke-width="5" />
            <ellipse cx="50" cy="35" rx="10" ry="15" fill="#b71c1c" />
        </svg>`
    }
];

let currentTarget = null;
let placedParts = { eyes: null, mouth: null };

export function initEmotionGame() {
    resetRoundState();

    // Safety: Clear other boards
    const stdBoard = document.getElementById('game-board');
    if (stdBoard) stdBoard.innerHTML = '';

    const stage = document.getElementById('emotions-stage');
    stage.innerHTML = '';

    // Pick target
    const keys = Object.keys(EMOTIONS);
    const key = keys[Math.floor(Math.random() * keys.length)];
    currentTarget = EMOTIONS[key];
    currentTarget.id = key;

    // Render Layout
    const instruction = document.createElement('div');
    instruction.className = 'emotion-instruction';
    instruction.innerHTML = `
        <div class="target-emoji">${currentTarget.emoji}</div>
        <div>Make a <b>${currentTarget.name}</b> face!</div>
    `;
    stage.appendChild(instruction);

    speakText(`Make a ${currentTarget.name} face`, `emo_${key}`); // fallback TTS likely

    // Face Container
    const faceCont = document.createElement('div');
    faceCont.className = 'face-container';
    faceCont.id = 'face-cont';

    // Zones
    const eyeZone = document.createElement('div');
    eyeZone.className = 'drop-zone zone-eyes';
    eyeZone.dataset.type = 'eyes';
    faceCont.appendChild(eyeZone);

    const mouthZone = document.createElement('div');
    mouthZone.className = 'drop-zone zone-mouth';
    mouthZone.dataset.type = 'mouth';
    faceCont.appendChild(mouthZone);

    stage.appendChild(faceCont);

    // Palette
    const palette = document.createElement('div');
    palette.className = 'parts-palette';

    // Shuffle parts
    const pool = [...PART_LIB].sort(() => Math.random() - 0.5);

    pool.forEach(part => {
        const item = document.createElement('div');
        item.className = 'part-item';
        item.innerHTML = part.svg; // Use SVG content
        item.dataset.id = part.id;
        item.dataset.type = part.type;
        item.draggable = true;

        // Touch/Mouse Events
        item.ondragstart = (e) => handleDragStart(e, part);
        item.ontouchstart = (e) => handleTouchStart(e, part, item);

        palette.appendChild(item);
    });

    stage.appendChild(palette);

    // Drop handlers
    faceCont.ondragover = (e) => e.preventDefault();
    faceCont.ondrop = (e) => handleDrop(e);

    placedParts = { eyes: null, mouth: null };
}

function handleDragStart(e, part) {
    e.dataTransfer.setData('text/plain', JSON.stringify(part));
    e.dataTransfer.effectAllowed = 'copy';
}

// Global touch tracking for drag
let activeDrag = null;
let touchClone = null;

function handleTouchStart(e, part, el) {
    e.preventDefault();
    const touch = e.touches[0];

    activeDrag = { part, el };

    // Create clone
    touchClone = el.cloneNode(true);
    touchClone.style.position = 'fixed';
    touchClone.style.zIndex = 1000;
    touchClone.style.opacity = 0.8;
    touchClone.style.pointerEvents = 'none';
    touchClone.style.width = el.offsetWidth + 'px';
    touchClone.style.height = el.offsetHeight + 'px';

    updateTouchPos(touch);
    document.body.appendChild(touchClone);

    document.ontouchmove = handleTouchMove;
    document.ontouchend = handleTouchEnd;
}

function updateTouchPos(touch) {
    if (touchClone) {
        touchClone.style.left = (touch.clientX - touchClone.offsetWidth / 2) + 'px';
        touchClone.style.top = (touch.clientY - touchClone.offsetHeight / 2) + 'px';
    }
}

function handleTouchMove(e) {
    e.preventDefault(); // Prevent scroll
    updateTouchPos(e.touches[0]);
}

function handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (target && target.closest('.face-container')) {
        placePart(activeDrag.part);
    }

    if (touchClone) touchClone.remove();
    activeDrag = null;
    touchClone = null;
    document.ontouchmove = null;
    document.ontouchend = null;
}

function handleDrop(e) {
    e.preventDefault();
    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        placePart(data);
    } catch (err) {
        console.error("Drop error", err);
    }
}

function placePart(part) {
    placedParts[part.type] = part;

    // Visual update
    const cont = document.getElementById('face-cont');

    // Remove existing of same type
    const existing = cont.querySelector(`.placed-part[data-type="${part.type}"]`);
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'placed-part';
    el.innerHTML = part.svg; // Use SVG
    el.dataset.type = part.type;

    // Position based on type
    if (part.type === 'eyes') {
        el.style.top = '35%';
        el.style.left = '50%';
        el.style.width = '140px'; // Wider for eyes on face
        el.style.height = '70px';
    } else {
        el.style.top = '75%'; // Mouth lower
        el.style.left = '50%';
        el.style.width = '100px';
        el.style.height = '60px';
    }

    cont.appendChild(el);
    speakText(part.type, "generic_click");

    checkCompletion();
}

function checkCompletion() {
    if (placedParts.eyes && placedParts.mouth) {
        // Check correctness
        const eyesCorrect = placedParts.eyes.emotion === currentTarget.id;
        const mouthCorrect = placedParts.mouth.emotion === currentTarget.id;

        if (eyesCorrect && mouthCorrect) {
            // Win
            setTimeout(() => {
                showCelebration();
                // Speak the specific praise using generated sprite
                speakText(`You did it! ${currentTarget.name} Face!`, `generic_emo_${currentTarget.id}_win`);
                document.getElementById('face-cont').classList.add('correct-pulse');

                updateScore(10);
                updateScoreUI();

                // Wait then new round
                setTimeout(() => {
                    initEmotionGame();
                }, 2000);
            }, 500);
        } else {
            // Check mismatch feedback?
            // "That looks silly!" or "Try again for Happy"
            // For now, let them experiment. Maybe a button to "Check"? 
            // Or auto-reset if wrong? 
            // Let's autospeak "Silly face!" if mixed, but not reset, let them fix it.
            speakText("Funny face!", "generic_click");
        }
    }
}
