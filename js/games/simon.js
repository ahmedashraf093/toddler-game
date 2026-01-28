import { resetRoundState } from '../engine/state.js';
import { resumeAudioContext, audioCtx, speakText } from '../engine/audio.js';
import { updateScore } from '../engine/state.js';
import { triggerConfetti, updateScoreUI } from '../engine/ui.js';

const buttons = [
    { id: 0, color: '#FF5252', freq: 261.63, emoji: '🔴', label: 'Red' }, // C
    { id: 1, color: '#4CAF50', freq: 329.63, emoji: '🟢', label: 'Green' }, // E
    { id: 2, color: '#2196F3', freq: 392.00, emoji: '🔵', label: 'Blue' }, // G
    { id: 3, color: '#FFEB3B', freq: 523.25, emoji: '🟡', label: 'Yellow' } // High C
];

let sequence = [];
let playerStep = 0;
let isCPUPlaying = false;

export function initSimonGame() {
    resetRoundState();
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;

    gameBoard.innerHTML = '';
    sequence = [];
    playerStep = 0;
    isCPUPlaying = false;

    // Resume Audio Context
    resumeAudioContext();

    const stage = document.createElement('div');
    stage.id = 'simon-stage';
    stage.className = 'simon-stage';
    stage.style.display = 'flex';
    stage.style.flexDirection = 'column';
    stage.style.alignItems = 'center';
    stage.style.justifyContent = 'center';
    stage.style.height = '100%';
    stage.style.gap = '20px';

    // Instruction
    const instruction = document.createElement('div');
    instruction.className = 'game-instruction';
    instruction.id = 'simon-instruction';
    instruction.textContent = 'Watch and Repeat! 🧠';
    instruction.style.fontSize = '2rem';
    instruction.style.marginBottom = '10px';
    stage.appendChild(instruction);

    // Game Grid
    const grid = document.createElement('div');
    grid.className = 'simon-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '1fr 1fr';
    grid.style.gap = '20px';
    grid.style.maxWidth = '400px';
    grid.style.width = '90%';

    buttons.forEach(btn => {
        const el = document.createElement('div');
        el.className = 'simon-btn';
        el.id = `simon-btn-${btn.id}`;
        el.dataset.id = btn.id;
        el.style.backgroundColor = btn.color;
        el.style.borderRadius = '20px';
        el.style.aspectRatio = '1 / 1';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontSize = '3rem';
        el.style.boxShadow = '0 8px 0 rgba(0,0,0,0.2)';
        el.style.cursor = 'pointer';
        el.style.transition = 'transform 0.1s, opacity 0.2s';
        el.textContent = btn.emoji;

        // Accessibility
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', btn.label);
        el.setAttribute('tabindex', '0');

        // Input Handlers
        const handleInput = (e) => {
            if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
            if (e.type !== 'keydown') e.preventDefault(); // Prevent double firing on touch

            handlePlayerInput(btn.id);
        };

        el.addEventListener('mousedown', handleInput);
        el.addEventListener('touchstart', handleInput);
        el.addEventListener('keydown', handleInput);

        grid.appendChild(el);
    });

    stage.appendChild(grid);

    // Start Button (initially visible)
    const startBtn = document.createElement('button');
    startBtn.id = 'simon-start-btn';
    startBtn.className = 'action-btn';
    startBtn.textContent = '▶️ Start Game';
    startBtn.style.marginTop = '20px';
    startBtn.style.fontSize = '1.5rem';
    startBtn.style.padding = '10px 30px';
    startBtn.onclick = () => {
        startBtn.style.display = 'none';
        startNextRound();
    };
    stage.appendChild(startBtn);

    gameBoard.appendChild(stage);
}

function startNextRound() {
    // Add random step
    const nextId = Math.floor(Math.random() * 4);
    sequence.push(nextId);
    playerStep = 0;

    // Update instruction
    const instr = document.getElementById('simon-instruction');
    if (instr) instr.textContent = `Round ${sequence.length}`;

    setTimeout(() => playSequence(), 500);
}

function playSequence() {
    isCPUPlaying = true;
    let i = 0;

    const interval = setInterval(() => {
        if (i >= sequence.length) {
            clearInterval(interval);
            isCPUPlaying = false;
            return;
        }

        const btnId = sequence[i];
        activateButton(btnId);
        i++;
    }, 800); // Speed of sequence
}

function activateButton(id) {
    const btn = document.getElementById(`simon-btn-${id}`);
    if (!btn) return;

    // Visual
    btn.style.opacity = '0.5';
    btn.style.transform = 'scale(0.95)';

    // Audio
    const btnData = buttons.find(b => b.id === id);
    if (btnData) playTone(btnData.freq);

    setTimeout(() => {
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1)';
    }, 300);
}

function handlePlayerInput(id) {
    if (isCPUPlaying) return;

    // Feedback
    activateButton(id);

    // Check Logic
    if (id === sequence[playerStep]) {
        // Correct
        playerStep++;

        if (playerStep === sequence.length) {
            // Round Complete
            isCPUPlaying = true; // Block input during success delay

            // Success Effect
            updateScore(10);
            updateScoreUI();

            // Confetti center of screen
            triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);

            setTimeout(() => {
                speakText("Good Job!", "generic_good_job", true);
                startNextRound();
            }, 1000);
        }
    } else {
        // Wrong
        isCPUPlaying = true; // Block input
        const instr = document.getElementById('simon-instruction');
        if (instr) {
            instr.textContent = 'Oops! Try again.';
            instr.style.color = '#FF5252';
            instr.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(0)' }
            ], { duration: 300 });
        }

        playErrorTone();

        // Retry current sequence after delay
        setTimeout(() => {
            if (instr) {
                instr.textContent = `Round ${sequence.length}`;
                instr.style.color = '';
            }
            playerStep = 0;
            playSequence();
        }, 1500);
    }
}

function playTone(freq) {
    let ctx = audioCtx;
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
}

function playErrorTone() {
    let ctx = audioCtx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
}
