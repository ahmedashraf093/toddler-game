import { speakText } from './audio.js';

export const ParentalGate = {
    checkInterval: null,
    storageKey: 'parentalGateStartTime',
    THRESHOLD_MS: 15 * 60 * 1000, // 15 minutes
    currentAnswer: 0,
    inputBuffer: '',

    init() {
        // Bind UI events once
        this.bindEvents();
    },

    startSession() {
        // Called when 'Play' is clicked.
        // If no start time exists, set it.
        // If one exists, we respect it (persistence).
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, Date.now());
        }

        // Start the checker loop if not running
        if (!this.checkInterval) {
            this.checkInterval = setInterval(() => this.check(), 1000);
        }
    },

    check() {
        const start = parseInt(localStorage.getItem(this.storageKey));
        if (!start) return; // Should not happen if startSession called

        const now = Date.now();
        if (now - start > this.THRESHOLD_MS) {
            this.show();
        }
    },

    show() {
        const overlay = document.getElementById('parental-gate-overlay');
        if (!overlay || !overlay.classList.contains('hidden')) return; // Already shown or missing

        try {
            speakText("Need parent help");
        } catch (e) {
            console.warn("ParentalGate: TTS failed", e);
        }

        // Generate Question
        // Requirements: "easier number no more than 5x5". Range 2-5 seems appropriate.
        const a = Math.floor(Math.random() * 4) + 2;
        const b = Math.floor(Math.random() * 4) + 2;
        this.currentAnswer = a * b;
        this.inputBuffer = '';

        // Update UI
        document.getElementById('pg-question').textContent = `${a} x ${b} = ?`;
        document.getElementById('pg-input').textContent = '_';
        document.getElementById('pg-message').textContent = 'Parental Check';
        document.getElementById('pg-message').className = ''; // reset classes

        // Show Overlay
        overlay.classList.remove('hidden');
    },

    handleInput(val) {
        if (val === 'clear') {
            this.inputBuffer = '';
        } else if (val === 'enter') {
            this.verify();
            return; // Verify handles the rest
        } else {
            // Number input
            if (this.inputBuffer.length < 3) { // limit length
                this.inputBuffer += val;
            }
        }
        this.updateInputDisplay();
    },

    updateInputDisplay() {
        const el = document.getElementById('pg-input');
        el.textContent = this.inputBuffer || '_';
        el.classList.remove('error');
    },

    verify() {
        const num = parseInt(this.inputBuffer);
        if (num === this.currentAnswer) {
            this.unlock();
        } else {
            this.shake();
            this.inputBuffer = '';
            this.updateInputDisplay();
            const msg = document.getElementById('pg-message');
            msg.textContent = 'Try Again';
            msg.classList.add('error-text');
        }
    },

    unlock() {
        // Reset timer
        localStorage.setItem(this.storageKey, Date.now());

        // Hide overlay
        document.getElementById('parental-gate-overlay').classList.add('hidden');
    },

    shake() {
        const input = document.getElementById('pg-input');
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
    },

    bindEvents() {
        // Bind keypad clicks
        document.querySelectorAll('.pg-key').forEach(btn => {
            btn.onclick = (e) => {
                const val = e.target.dataset.val;
                this.handleInput(val);
            };
        });
    }
};
