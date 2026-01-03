
import { speakText, speakSequence } from '../engine/audio.js';
import { showCelebration } from '../engine/ui.js';
import { gameState } from '../engine/state.js';
import { checkOverallProgress } from '../challenges/manager.js';

const levels = [
    {
        id: 'triangle',
        name: 'Triangle',
        points: [
            { x: 50, y: 25 }, // Top (shifted down)
            { x: 80, y: 85 }, // Right Bottom
            { x: 20, y: 85 }, // Left Bottom
            { x: 50, y: 25 }  // Top
        ],
        rewardEmoji: '🔺',
        rewardSound: 'noun_triangle'
    },
    {
        id: 'square',
        name: 'Square',
        points: [
            { x: 20, y: 25 }, // TL (shifted down)
            { x: 80, y: 25 }, // TR
            { x: 80, y: 85 }, // BR
            { x: 20, y: 85 }, // BL
            { x: 20, y: 25 }  // TL
        ],
        rewardEmoji: '🟩',
        rewardSound: 'noun_square'
    },
    {
        id: 'star',
        name: 'Star',
        points: [
            { x: 50, y: 25 }, // Top (shifted from 10)
            { x: 65, y: 45 }, // Arms (shifted from 40)
            { x: 95, y: 45 },
            { x: 70, y: 65 }, // Inner (shifted from 60)
            { x: 80, y: 90 }, // Legs (shifted from 95)
            { x: 50, y: 75 }, // Bottom mid (kept same)
            { x: 20, y: 90 }, // Left leg
            { x: 30, y: 65 },
            { x: 5,  y: 45 }, // Left arm
            { x: 35, y: 45 },
            { x: 50, y: 25 }  // Top
        ],
        rewardEmoji: '⭐',
        rewardSound: 'noun_star'
    },
    {
        id: 'house',
        name: 'House',
        points: [
            { x: 20, y: 45 }, // Walls Top (shifted from 40)
            { x: 50, y: 25 }, // Roof Top (shifted from 10)
            { x: 80, y: 45 },
            { x: 80, y: 90 }, // Floor (kept 90)
            { x: 20, y: 90 },
            { x: 20, y: 45 }
        ],
        rewardEmoji: '🏠',
        rewardSound: 'noun_house'
    }
];

let currentLevelIndex = 0;
let currentDotIndex = 0; // The dot we are starting FROM (0-based index of points array)
let isDragging = false;
let dragCurrentPoint = { x: 0, y: 0 };
let canvas, ctx;
let container;
let currentPoints = [];

export function initConnectDotsGame() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    gameBoard.style.overflow = 'hidden'; // Lock scroll

    container = document.createElement('div');
    container.id = 'connect-dots-stage';
    container.className = 'active';

    // Instruction
    const instr = document.createElement('div');
    instr.id = 'dots-instruction';
    instr.textContent = 'Connect the Dots!';
    container.appendChild(instr);

    // Canvas
    canvas = document.createElement('canvas');
    canvas.id = 'dots-canvas';
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Dots Container (for HTML elements)
    const dotsDiv = document.createElement('div');
    dotsDiv.id = 'dots-container';
    container.appendChild(dotsDiv);

    gameBoard.appendChild(container);

    // Resize Handler
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Input Listeners
    bindInputEvents();

    // Load Level
    currentLevelIndex = 0;
    loadLevel(currentLevelIndex);
}

function resizeCanvas() {
    if (!container || !canvas) return;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    if (currentPoints.length > 0) draw();
}

function loadLevel(idx) {
    if (idx >= levels.length) idx = 0;
    currentLevelIndex = idx;
    const level = levels[idx];
    currentPoints = level.points; // normalized 0-100
    currentDotIndex = 0;
    isDragging = false;

    // Reset UI
    const dotsDiv = document.getElementById('dots-container');
    dotsDiv.innerHTML = '';

    // Create Dots
    currentPoints.forEach((pt, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.textContent = (i + 1).toString();
        dot.dataset.index = i;
        dot.style.left = `${pt.x}%`;
        dot.style.top = `${pt.y}%`;

        // Accessibility
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', `Dot ${i + 1}`);

        // Hide future dots? No, usually all visible.
        // Maybe hide dots that are not "next"?
        // Standard connect dots: All visible, numbers visible.

        dotsDiv.appendChild(dot);
    });

    // Highlight first dot
    updateDotsState();

    // Speak
    speakText("Connect the dots!", "generic_go");
    draw();
}

function updateDotsState() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(d => {
        const i = parseInt(d.dataset.index);
        d.classList.remove('active', 'completed', 'next');

        if (i < currentDotIndex) {
            d.classList.add('completed');
        } else if (i === currentDotIndex) {
            d.classList.add('active'); // The one to drag FROM
        } else if (i === currentDotIndex + 1) {
            d.classList.add('next'); // The target
        }
    });
}

function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function bindInputEvents() {
    // We bind to container to catch all drags
    container.addEventListener('mousedown', onPointerDown);
    container.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp); // Global up

    container.addEventListener('touchstart', onPointerDown, { passive: false });
    container.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp);
}

function onPointerDown(e) {
    // Check if we clicked ON the active dot
    const target = document.elementFromPoint(
        e.touches ? e.touches[0].clientX : e.clientX,
        e.touches ? e.touches[0].clientY : e.clientY
    );

    if (target && target.classList.contains('dot')) {
        const idx = parseInt(target.dataset.index);
        if (idx === currentDotIndex) {
            isDragging = true;
            dragCurrentPoint = getCanvasCoordinates(e);
            e.preventDefault(); // Prevent scroll
            draw();

            // Speak number
            const num = idx + 1;
            speakText(`${num}`, `num_${num}`);
        }
    }
}

function onPointerMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    dragCurrentPoint = getCanvasCoordinates(e);

    // Hit Test for Next Dot
    const nextDotIndex = currentDotIndex + 1;
    if (nextDotIndex < currentPoints.length) {
        const nextDotEl = document.querySelector(`.dot[data-index="${nextDotIndex}"]`);
        if (nextDotEl) {
            const rect = nextDotEl.getBoundingClientRect();
            // Check if pointer is inside the dot rect
            const ptrX = e.touches ? e.touches[0].clientX : e.clientX;
            const ptrY = e.touches ? e.touches[0].clientY : e.clientY;

            // Simple expansion of hit area
            if (ptrX >= rect.left - 10 && ptrX <= rect.right + 10 &&
                ptrY >= rect.top - 10 && ptrY <= rect.bottom + 10) {
                // Connected!
                completeConnection();
            }
        }
    }

    draw();
}

function onPointerUp(e) {
    if (isDragging) {
        isDragging = false;
        draw(); // Clear the drag line
    }
}

function completeConnection() {
    isDragging = false;
    currentDotIndex++;

    // Speak next number
    const num = currentDotIndex + 1;
    speakText(`${num}`, `num_${num}`); // "Two!"

    updateDotsState();

    // Check Level Complete
    if (currentDotIndex >= currentPoints.length - 1) {
        levelComplete();
    } else {
        // Continue... user needs to click next dot to start next line?
        // Or should we auto-start dragging if they are still holding?
        // For simplicity, let's require a new click/drag or valid chaining.
        // But chaining is hard to implement robustly. Let's reset drag.
        draw();
    }
}

function levelComplete() {
    draw(); // Draw final full shape

    const level = levels[currentLevelIndex];

    setTimeout(() => {
        showCelebration(level.rewardEmoji, level.name);
        speakText(level.name, level.rewardSound);
        checkOverallProgress('connectdots');

        setTimeout(() => {
            currentLevelIndex++;
            loadLevel(currentLevelIndex);
        }, 3000);
    }, 500);
}

function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw Completed Lines
    // Connect 0->1, 1->2 ... until currentDotIndex
    // currentDotIndex is the "start" of the *next* line.
    // So we have lines up to currentDotIndex.

    if (currentDotIndex > 0) {
        ctx.beginPath();
        ctx.strokeStyle = '#4facfe'; // Primary Color

        const p0 = getAbsPoint(currentPoints[0]);
        ctx.moveTo(p0.x, p0.y);

        for (let i = 1; i <= currentDotIndex; i++) {
            const p = getAbsPoint(currentPoints[i]);
            ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
    }

    // Draw Current Drag Line
    if (isDragging) {
        ctx.beginPath();
        ctx.strokeStyle = '#ff9800'; // Orange for active drag
        ctx.lineWidth = 6;
        ctx.setLineDash([10, 10]); // Dashed for "in progress"

        const start = getAbsPoint(currentPoints[currentDotIndex]);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(dragCurrentPoint.x, dragCurrentPoint.y);

        ctx.stroke();
        ctx.setLineDash([]); // Reset
    }
}

function getAbsPoint(pt) {
    return {
        x: (pt.x / 100) * canvas.width,
        y: (pt.y / 100) * canvas.height
    };
}
