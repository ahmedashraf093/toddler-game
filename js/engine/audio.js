let selectedVoice = null;
let lastSpokenText = '';
let lastSpokenTime = 0;
let audioCtx = null;
// Removed Oscillator BGM variables
let bgmAudio = new Audio('background_happy.mp3');
bgmAudio.loop = true;
bgmAudio.volume = 0.1; // Keep it background level

let isMuted = false;
let isBgmPlaying = false;

// Audio Sprites
let spriteBuffer = null;
let spriteMap = null;
let decodingPromise = null;
let activeSources = [];

export function initAudio() {
    isMuted = localStorage.getItem('isMuted') === 'true';

    // Disable TTS init for debugging
    // if ('speechSynthesis' in window) {
    //     window.speechSynthesis.onvoiceschanged = loadVoices;
    //     loadVoices();
    // }

    // Load Sprites
    loadSprites();
}

async function loadSprites() {
    try {
        console.log("Loading sprites...");
        const mapResp = await fetch('assets/audio/sprites.json');
        spriteMap = await mapResp.json();
        console.log("Sprite Map Loaded. Keys:", Object.keys(spriteMap).length);

        const audioResp = await fetch('assets/audio/sprites.mp3');
        const arrayBuffer = await audioResp.arrayBuffer();
        console.log("Sprite MP3 Loaded. Size:", arrayBuffer.byteLength);

        // Decode logic requires AudioContext.
        // We defer decoding until audioCtx is initialized (first user click)
        window.rawSpriteBuffer = arrayBuffer;

    } catch (e) {
        console.warn("Failed to load audio sprites:", e);
    }
}

function loadVoices() {
    // Disabled for debugging
    return;
}

export function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('isMuted', isMuted);

    if (isMuted) {
        stopBackgroundMusic();
        // Do NOT cancel speech - User wants SFX active
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
    if (key && spriteMap && spriteMap[key]) {
        speakSequence([key], text);
    } else {
        fallbackTTS(text, throttle);
    }
}

export function speakSequence(keys, fallbackText) {
    // SFX/Voice should play regardless of Music Mute
    // if (isMuted) return; // REMOVED per user request

    // NEW: Stop previous audio to prevent overlaps
    stopAllAudio();

    console.log(`speakSequence called. Keys: ${JSON.stringify(keys)}`);
    // ... rest of the same logic
    if (audioCtx && spriteBuffer && spriteMap) {
        let validKeys = keys.filter(k => {
            const hasKey = !!spriteMap[k];
            if (!hasKey) console.warn(`Missing key in spriteMap: ${k}`);
            return hasKey;
        });

        if (validKeys.length > 0) {
            playSpriteSequence(validKeys);
            return;
        }
    } else if (window.rawSpriteBuffer && audioCtx) {
        decodeSprites().then(() => {
            speakSequence(keys, fallbackText);
        });
        return;
    }
}

function playSpriteSequence(keys) {
    if (!audioCtx) return;
    let now = audioCtx.currentTime;
    let startTime = now; // Immediate start

    keys.forEach(key => {
        const data = spriteMap[key];
        if (!data) return;

        const source = audioCtx.createBufferSource();
        source.buffer = spriteBuffer;
        source.connect(audioCtx.destination);

        source.start(startTime, data.start, data.duration);
        activeSources.push(source);

        // Cleanup when finished
        source.onended = () => {
            activeSources = activeSources.filter(s => s !== source);
        };

        // Aggressively overlap to remove edge-tts silence
        // Most clips have ~0.5s silence at start/end
        startTime += data.duration - 0.75;
    });
}

export function stopAllAudio() {
    // 1. Stop Speech Synthesis
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    // 2. Stop Web Audio Sprites
    activeSources.forEach(s => {
        try {
            s.stop();
        } catch (e) { }
    });
    activeSources = [];
}

function fallbackTTS(text, throttle = false) {
    if (!('speechSynthesis' in window)) return;
    // Removed isMuted check

    if (throttle) {
        const now = Date.now();
        if (text === lastSpokenText && (now - lastSpokenTime) < 3000) return;
        lastSpokenText = text;
        lastSpokenTime = now;
    }

    stopAllAudio(); // Stop sprites and previous TTS
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
}

// --- Audio Context ---

export function resumeAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioCtx) {
        console.log("Creating new AudioContext...");
        audioCtx = new AudioContext();
    }

    // Try to play BGM on interaction if not playing
    if (!isMuted && bgmAudio.paused) {
        bgmAudio.play().catch(e => console.log("BGM play failed", e));
        isBgmPlaying = true;
    }

    if (audioCtx.state === 'suspended') {
        console.log("Resuming AudioContext...");
        audioCtx.resume().then(() => {
            console.log("AudioContext Resumed.");
            decodeSprites();
        });
    } else {
        decodeSprites();
    }
}

async function decodeSprites() {
    if (spriteBuffer) {
        console.log("Sprites already decoded.");
        return;
    }
    if (!window.rawSpriteBuffer || window.rawSpriteBuffer.byteLength === 0) {
        console.log("No rawSpriteBuffer to decode (or detached).");
        return;
    }
    if (!audioCtx) {
        console.log("No AudioContext to decode with.");
        return;
    }
    if (decodingPromise) {
        console.log("Decoding already in progress...");
        return decodingPromise;
    }

    try {
        console.log("Decoding audio data...");
        decodingPromise = audioCtx.decodeAudioData(window.rawSpriteBuffer);
        spriteBuffer = await decodingPromise;
        window.rawSpriteBuffer = null; // Free memory
        decodingPromise = null;
        console.log("Audio Sprites Decoded Successfully!");
    } catch (e) {
        console.error("Sprite decode error", e);
        decodingPromise = null;
    }
}

// --- Music ---

export function playBackgroundMusic() {
    if (isMuted) return;

    // Using HTML5 Audio for new mp3 file
    bgmAudio.play().then(() => {
        isBgmPlaying = true;
    }).catch(e => {
        console.warn("BGM Auto-play blocked, waiting for interaction", e);
    });
}

export function stopBackgroundMusic() {
    bgmAudio.pause();
    isBgmPlaying = false;
}

export function playVictoryMusic() {
    // This is SFX/Fanfare, keep it playing? Or treat as music? 
    // Usually fanfare is SFX. Let's keep it.
    // if (isMuted) return; 
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

export function playCrunchSound() {
    // Crunch is SFX, keep playing
    // if (isMuted) return; 
    resumeAudioContext();
    if (!audioCtx) return;

    // Create a burst of white noise
    const bufferSize = audioCtx.sampleRate * 0.5; // 0.5 seconds buffer
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    // Play 2-3 rapid bursts to simulate "Crunch Crunch"
    const playBurst = (delay) => {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;

        // Bandpass Filter to remove harsh highs and muddy lows
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        // Gain Envelope for a short, crisp decay
        const gain = audioCtx.createGain();
        const t = audioCtx.currentTime + delay;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.8, t + 0.01); // Attack
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15); // Decay - crisp bite

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        source.start(t);
        source.stop(t + 0.2);
    };

    playBurst(0);
    playBurst(0.15);
    // Optional third bite for variation
    if (Math.random() > 0.5) playBurst(0.3);
}
