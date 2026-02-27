import { resetRoundState, gameState } from '../engine/state.js';
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

// 🎨 Palette: Accessibility - Keyboard Support
document.addEventListener('keydown', (e) => {
    if (gameState.currentMode !== 'music') return;

    // Keys 1-8
    const num = parseInt(e.key);
    if (!isNaN(num) && num >= 1 && num <= 8) {
        const index = num - 1;
        const note = notes[index];
        if (note) {
            playTone(note.freq);
            const keys = document.querySelectorAll('.xylophone-key');
            if (keys[index]) animateKey(keys[index]);
        }
    }
});

export function initMusicGame() {
    resetRoundState();
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;

    gameBoard.innerHTML = '';

    // Resume Audio Context on start to ensure we can play
    resumeAudioContext();

    const stage = document.createElement('div');
    stage.id = 'music-stage';
    stage.className = 'music-stage active'; // Matches CSS

    // Instruction Header
    const instruction = document.createElement('div');
    instruction.className = 'music-instruction';
    instruction.innerHTML = '🎵 Make some Music! 🎹';
    stage.appendChild(instruction);

    // Xylophone Container
    const xylophone = document.createElement('div');
    xylophone.className = 'xylophone-container';
    // Accessibility for the container
    xylophone.setAttribute('role', 'region');
    xylophone.setAttribute('aria-label', 'Xylophone Instrument');

    notes.forEach((n, index) => {
        const key = document.createElement('div');
        key.className = 'xylophone-key';
        key.style.backgroundColor = n.color;

        // 🎨 Palette: Visual Logic Fix - Lower notes (index 0) should be longer/taller
        // Total notes = 8. Longest (C) at index 0, Shortest (High C) at index 7.
        // Base height 200px, decrease by 12px per step
        const height = 200 - (index * 12);
        key.style.height = `${height}px`;

        // 🎨 Palette: Accessibility Attributes
        key.setAttribute('role', 'button');
        key.setAttribute('tabindex', '0');
        key.setAttribute('aria-label', `Play Note ${n.note}`);

        // Content
        key.innerHTML = `
            <span class="key-animal">${n.animal}</span>
            <span class="key-note">${n.note}</span>
        `;

        // Interaction
        const playHandler = (e) => {
            // Prevent default only for touch to avoid scrolling,
            // but allow click focus for keyboard accessibility
            if (e.type === 'touchstart') e.preventDefault();

            playTone(n.freq);
            animateKey(key);
            key.focus(); // Ensure focus moves to clicked key
        };

        // Touch and Mouse events
        key.addEventListener('mousedown', playHandler);
        key.addEventListener('touchstart', playHandler, { passive: false });

        // 🎨 Palette: Keyboard Accessibility (Enter/Space)
        key.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playTone(n.freq);
                animateKey(key);
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
    songBtn.innerHTML = '✨ Play Twinkle Twinkle';
    songBtn.setAttribute('aria-label', 'Play demo song Twinkle Twinkle Little Star');
    songBtn.onclick = () => playTwinkleTwinkle();

    controls.appendChild(songBtn);
    stage.appendChild(controls);

    gameBoard.appendChild(stage);
}

function playTone(freq, type = 'sine', duration = 0.5) {
    let ctx = audioCtx;
    if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') ctx.resume();

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

    // Auto remove active class for visual cleanup
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
