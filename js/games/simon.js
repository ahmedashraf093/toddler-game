import { resetRoundState } from '../engine/state.js';
import { resumeAudioContext, audioCtx, speakText } from '../engine/audio.js';
import { updateScore } from '../engine/state.js';
import { triggerConfetti, updateScoreUI, showNextRoundButton } from '../engine/ui.js';

const buttons = [
    { id: 0, color: '#FF5252', freq: 261.63, emoji: '🔴', label: 'Red' }, // C
    { id: 1, color: '#4CAF50', freq: 329.63, emoji: '🟢', label: 'Green' }, // E
    { id: 2, color: '#2196F3', freq: 392.00, emoji: '🔵', label: 'Blue' }, // G
    { id: 3, color: '#FFEB3B', freq: 523.25, emoji: '🟡', label: 'Yellow' } // High C
];

let sequence = [];
let playerStep = 0;
let isCPUPlaying = false;
let gameActive = false;

export function initSimonGame() {
    resetRoundState();
    const stage = document.getElementById('simon-stage');
    if (!stage) return;

    stage.innerHTML = '';
    sequence = [];
    playerStep = 0;
    isCPUPlaying = false;
    gameActive = false;

    // Resume Audio Context
    resumeAudioContext();

    // Instruction
    const instruction = document.createElement('div');
    instruction.className = 'simon-instruction';
    instruction.id = 'simon-instruction';
    instruction.textContent = 'Watch and Repeat! 🧠';
    stage.appendChild(instruction);

    // Game Grid
    const grid = document.createElement('div');
    grid.className = 'simon-grid';

    buttons.forEach(btn => {
        const el = document.createElement('div');
        el.className = 'simon-btn disabled';
        el.id = `simon-btn-${btn.id}`;
        el.dataset.id = btn.id;
        el.style.backgroundColor = btn.color;
        el.textContent = btn.emoji;

        // Accessibility
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', btn.label);
        el.setAttribute('tabindex', '0');

        // Input Handlers
        const handleInput = (e) => {
            if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
            if (e.type !== 'keydown') e.preventDefault();
            if (!gameActive || isCPUPlaying) return;

            handlePlayerInput(btn.id);
        };

        el.addEventListener('mousedown', handleInput);
        el.addEventListener('touchstart', handleInput, { passive: false });
        el.addEventListener('keydown', handleInput);

        grid.appendChild(el);
    });

    stage.appendChild(grid);

    // Start Button
    const startBtn = document.createElement('button');
    startBtn.id = 'simon-start-btn';
    startBtn.textContent = '▶️ Start!';
    startBtn.onclick = () => {
        startBtn.style.display = 'none';
        gameActive = true;

        // Enable buttons
        document.querySelectorAll('.simon-btn').forEach(b => b.classList.remove('disabled'));

        speakText("Watch closely!", "generic_watch", true);
        startNextRound();
    };
    stage.appendChild(startBtn);
}

function startNextRound() {
    // Add random step
    const nextId = Math.floor(Math.random() * buttons.length);
    sequence.push(nextId);
    playerStep = 0;

    // Update instruction
    const instr = document.getElementById('simon-instruction');
    if (instr) {
        instr.textContent = `Round ${sequence.length} 🌟`;
        instr.style.color = '';
    }

    setTimeout(() => playSequence(), 800);
}

function playSequence() {
    isCPUPlaying = true;
    let i = 0;

    const interval = setInterval(() => {
        if (i >= sequence.length) {
            clearInterval(interval);
            isCPUPlaying = false;
            // Optional: Speak "Your turn!" after a long sequence?
            if (sequence.length > 2) {
                speakText("Your turn!", "generic_your_turn", true);
            }
            return;
        }

        const btnId = sequence[i];
        activateButton(btnId);
        i++;
    }, 800);
}

function activateButton(id) {
    const btn = document.getElementById(`simon-btn-${id}`);
    if (!btn) return;

    // Visual feedback
    btn.classList.add('active');

    // Audio feedback
    const btnData = buttons.find(b => b.id === id);
    if (btnData) playTone(btnData.freq);

    setTimeout(() => {
        btn.classList.remove('active');
    }, 400);
}

function handlePlayerInput(id) {
    if (isCPUPlaying || !gameActive) return;

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

            // Confetti burst
            const btnEl = document.getElementById(`simon-btn-${id}`);
            if (btnEl) {
                const rect = btnEl.getBoundingClientRect();
                triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }

            if (sequence.length % 3 === 0) {
                speakText("Amazing!", "generic_amazing", true);
            }

            setTimeout(() => {
                startNextRound();
            }, 1000);
        }
    } else {
        // Wrong
        isCPUPlaying = true;
        const instr = document.getElementById('simon-instruction');
        if (instr) {
            instr.textContent = 'Oops! Try again. 🔄';
            instr.style.color = '#FF5252';
            instr.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(0)' }
            ], { duration: 300 });
        }

        playErrorTone();
        speakText("Oops! Let's try again.", "generic_try_again", true);

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
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
}

function playErrorTone() {
    let ctx = audioCtx;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
}
