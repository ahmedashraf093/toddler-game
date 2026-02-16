import { resetRoundState } from '../engine/state.js';
import { resumeAudioContext, audioCtx } from '../engine/audio.js';

const notes = [
    { note: 'C', freq: 261.63, color: '#FF5252', animal: '🐶' },
    { note: 'D', freq: 293.66, color: '#FF9800', animal: '🐱' },
    { note: 'E', freq: 329.63, color: '#FFEB3B', animal: '🐸' },
    { note: 'F', freq: 349.23, color: '#4CAF50', animal: '🐦' },
    { note: 'G', freq: 392.00, color: '#2196F3', animal: '🦁' },
    { note: 'A', freq: 440.00, color: '#3F51B5', animal: '🐮' },
    { note: 'B', freq: 493.88, color: '#9C27B0', animal: '🐻' },
    { note: 'C', freq: 523.25, color: '#E040FB', animal: '🐭' }
];

export function initMusicGame() {
    resetRoundState();
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;

    gameBoard.innerHTML = '';

    // Resume Audio Context on start to ensure we can play
    resumeAudioContext();

    const stage = document.createElement('div');
    stage.id = 'music-stage';
    stage.className = 'music-stage active';

    // Instruction Header
    const instruction = document.createElement('div');
    instruction.className = 'music-instruction';
    instruction.innerHTML = '🎵 Make some Music! 🎹';
    stage.appendChild(instruction);

    // Xylophone Container
    const xylophone = document.createElement('div');
    xylophone.className = 'xylophone-container';

    notes.forEach((n, index) => {
        const key = document.createElement('div');
        key.className = 'xylophone-key';
        key.style.backgroundColor = n.color;
        key.style.height = `${100 + (index * 10)}px`; // Staggered height visual

        // Content
        key.innerHTML = `
            <span class="key-animal">${n.animal}</span>
            <span class="key-note">${n.note}</span>
        `;

        // 🎨 Palette: Accessibility
        key.setAttribute('role', 'button');
        key.setAttribute('tabindex', '0');
        key.setAttribute('aria-label', `Play ${n.note} note`);

        // Interaction
        const playHandler = (e) => {
            if (e.cancelable) e.preventDefault(); // Prevent scroll/drag
            playTone(n.freq);
            animateKey(key);
        };

        // Touch and Mouse events
        key.addEventListener('mousedown', playHandler);
        key.addEventListener('touchstart', playHandler);

        // Keyboard event
        key.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playHandler(e);
            }
        });

        xylophone.appendChild(key);
    });

    stage.appendChild(xylophone);

    // Controls Container
    const controls = document.createElement('div');
    controls.className = 'music-controls';

    // Play Song Button
    const songBtn = document.createElement('button');
    songBtn.className = 'action-btn';
    songBtn.innerHTML = '✨ Play Song';
    songBtn.onclick = () => playTwinkleTwinkle();

    controls.appendChild(songBtn);
    stage.appendChild(controls);

    gameBoard.appendChild(stage);
}

function playTone(freq, type = 'sine', duration = 0.5) {
    // Ensure we have a context (from generic audio module)
    // If generic module ctx is null (shouldn't be if resume called), create temp one?
    // We try to use the exported audioCtx

    let ctx = audioCtx;
    if (!ctx) {
        // Fallback if not ready, though resumeAudioContext should fix this
        ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
}

function animateKey(element) {
    element.classList.remove('active');
    void element.offsetWidth; // Trigger reflow
    element.classList.add('active');

    // 🎨 Palette: Remove active state after animation for visual feedback
    setTimeout(() => {
        element.classList.remove('active');
    }, 200);
}

// Simple sequencer for Twinkle Twinkle
function playTwinkleTwinkle() {
    const melody = [
        { n: 0, d: 0.5 }, { n: 0, d: 0.5 }, { n: 4, d: 0.5 }, { n: 4, d: 0.5 },
        { n: 5, d: 0.5 }, { n: 5, d: 0.5 }, { n: 4, d: 1.0 },
        { n: 3, d: 0.5 }, { n: 3, d: 0.5 }, { n: 2, d: 0.5 }, { n: 2, d: 0.5 },
        { n: 1, d: 0.5 }, { n: 1, d: 0.5 }, { n: 0, d: 1.0 }
    ];

    let time = 0;
    melody.forEach(part => {
        setTimeout(() => {
            const noteObj = notes[part.n];
            playTone(noteObj.freq, 'sine', part.d);

            // Visual feedback
            const keys = document.querySelectorAll('.xylophone-key');
            if(keys[part.n]) animateKey(keys[part.n]);

        }, time * 1000);
        time += part.d; // Wait for duration
    });
}
