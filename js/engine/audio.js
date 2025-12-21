let selectedVoice = null;
let lastSpokenText = '';
let lastSpokenTime = 0;
let audioCtx = null;
let bgmOscillators = [];
let isMuted = false;
let isBgmPlaying = false;

// Audio Sprites
let spriteBuffer = null;
let spriteMap = null;

export function initAudio() {
    isMuted = localStorage.getItem('isMuted') === 'true';

    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }

    // Load Sprites
    loadSprites();
}

async function loadSprites() {
    try {
        const mapResp = await fetch('assets/audio/sprites.json');
        spriteMap = await mapResp.json();

        const audioResp = await fetch('assets/audio/sprites.mp3');
        const arrayBuffer = await audioResp.arrayBuffer();

        // Decode logic requires AudioContext.
        // We defer decoding until audioCtx is initialized (first user click)
        // OR we try to init a dummy context now if allowed?
        // Browsers block AudioContext until interaction.
        // We will store the ArrayBuffer and decode later.
        window.rawSpriteBuffer = arrayBuffer;

    } catch (e) {
        console.warn("Failed to load audio sprites:", e);
    }
}

function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const voiceList = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
    selectedVoice = voiceList.find(v => v.name.includes('Great Britain') || v.name.includes('UK') || v.name.includes('United Kingdom'))
        || voiceList.find(v => v.name.includes('Google UK English'))
        || voiceList.find(v => v.name.includes('Female'))
        || voiceList[0];
}

export function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('isMuted', isMuted);

    if (isMuted) {
        stopBackgroundMusic();
        window.speechSynthesis.cancel();
    } else {
        playBackgroundMusic();
    }
    return isMuted;
}

export function getMuteState() {
    return isMuted;
}

// --- Speaking Logic ---

export function speakText(text, key = null, throttle = false) {
    // Legacy support for single key (though we now prefer sequences)
    if (key) {
        speakSequence([key], text);
    } else {
        fallbackTTS(text, throttle);
    }
}

export function speakSequence(keys, fallbackText) {
    if (isMuted) return;

    // Check if we have sprite support
    if (audioCtx && spriteBuffer && spriteMap) {
        // Only play if ALL keys are present to avoid broken sentences
        // If a word is missing, fallback to TTS for the whole sentence.
        const allKeysExist = keys.every(k => spriteMap[k]);

        if (allKeysExist) {
            playSpriteSequence(keys);
            return;
        } else {
            console.warn("Missing audio keys for:", keys.filter(k => !spriteMap[k]), "Falling back to TTS.");
        }
    } else if (window.rawSpriteBuffer && audioCtx) {
        // Try to decode on the fly if not yet decoded
        decodeSprites().then(() => {
             speakSequence(keys, fallbackText);
        });
        return;
    }

    // Fallback if no valid keys or no audio support
    fallbackTTS(fallbackText);
}

function playSpriteSequence(keys) {
    let now = audioCtx.currentTime;
    // Add a small delay to start
    let startTime = now + 0.1;

    keys.forEach(key => {
        const data = spriteMap[key];
        if (!data) return;

        const source = audioCtx.createBufferSource();
        source.buffer = spriteBuffer;
        source.connect(audioCtx.destination);

        // Start playing segment
        source.start(startTime, data.start, data.duration);

        // Schedule next
        startTime += data.duration + 0.05; // 50ms pause between words for natural flow
    });
}

function fallbackTTS(text, throttle = false) {
    if (isMuted || !('speechSynthesis' in window)) return;

    const now = Date.now();
    if (throttle && text === lastSpokenText && (now - lastSpokenTime) < 1500) {
        return;
    }

    lastSpokenText = text;
    lastSpokenTime = now;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Joyful tweaks
    utterance.rate = 1.1;
    utterance.pitch = 1.2;
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
}

// --- Audio Context ---

export function resumeAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioCtx) {
        audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            if (!isMuted) playBackgroundMusic();
            decodeSprites();
        });
    } else {
        decodeSprites();
        if (!isMuted && !isBgmPlaying) playBackgroundMusic();
    }
}

async function decodeSprites() {
    if (spriteBuffer || !window.rawSpriteBuffer || !audioCtx) return;
    try {
        spriteBuffer = await audioCtx.decodeAudioData(window.rawSpriteBuffer);
        window.rawSpriteBuffer = null; // Free memory
        console.log("Audio Sprites Decoded!");
    } catch(e) {
        console.error("Sprite decode error", e);
    }
}

// --- Music ---

export function playBackgroundMusic() {
    if (isMuted || isBgmPlaying || !audioCtx) return;

    // Playful Loop (Simple)
    // We will schedule a simple loop using Oscillator
    scheduleMusicLoop();
}

function scheduleMusicLoop() {
    if (isMuted || !audioCtx) return;
    isBgmPlaying = true;

    // Simple Playful Tune (Lullaby-ish / Chiptune)
    // C Major: C4 - E4 - G4 - E4
    const notes = [
        { f: 261.63, d: 0.4 }, // C4
        { f: 329.63, d: 0.4 }, // E4
        { f: 392.00, d: 0.4 }, // G4
        { f: 329.63, d: 0.4 }  // E4
    ];

    let noteIndex = 0;

    // Recursive loop function
    function playNextNote() {
        if (!isBgmPlaying || isMuted) return;

        const note = notes[noteIndex];
        noteIndex = (noteIndex + 1) % notes.length;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle'; // Soft chiptune sound
        osc.frequency.value = note.f;

        // Envelope ADSR
        const now = audioCtx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.03, now + 0.05); // Attack (Soft volume)
        gain.gain.linearRampToValueAtTime(0.01, now + note.d - 0.05); // Sustain
        gain.gain.linearRampToValueAtTime(0, now + note.d); // Release

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + note.d + 0.1);

        // Schedule next note
        // Store timeout ID to clear later if needed (though isBgmPlaying flag handles it mostly)
        // We can attach it to bgmOscillators for cleanup if we want, or just rely on state.
        // For simplicity with closure:
        setTimeout(playNextNote, note.d * 1000);
    }

    playNextNote();

    // We can't push individual oscillators to bgmOscillators array in this recursive setup efficiently for stop(),
    // but the `if (!isBgmPlaying) return` check in the loop handles "stopping" effectively.
    // The only lingering sound is the <0.4s tail of the current note, which is acceptable.
}

export function stopBackgroundMusic() {
    isBgmPlaying = false;
    bgmOscillators.forEach(o => { try{o.stop()}catch(e){} });
    bgmOscillators = [];
}

export function playVictoryMusic() {
    if (isMuted) return;
    resumeAudioContext();
    if (!audioCtx) return;

    // Amazing Fanfare!
    const now = audioCtx.currentTime;

    // High Energy Arpeggio
    const notes = [
        523.25, 659.25, 783.99, 1046.50, // C E G C
        523.25, 659.25, 783.99, 1046.50,
        1318.51, 1567.98, 2093.00
    ];

    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        const t = now + (i * 0.08);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(t);
        osc.stop(t + 0.4);
    });
}
