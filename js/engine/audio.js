let selectedVoice = null;
let lastSpokenText = '';
let lastSpokenTime = 0;
let audioCtx = null;
// Removed Oscillator BGM variables
let bgmAudio = new Audio('background_happy.mp3');
bgmAudio.loop = true;
bgmAudio.volume = 0.2; // Keep it background level

let isMuted = false;
let isBgmPlaying = false;

// Audio Sprites
let spriteBuffer = null;
let spriteMap = null;

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
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
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
    console.log(`speakText called: text="${text}", key="${key}"`);
    // Legacy support for single key (though we now prefer sequences)
    if (key) {
        speakSequence([key], text);
    } else {
        console.log("speakText: No key provided, skipping TTS (Disabled).");
        // fallbackTTS(text, throttle);
    }
}

export function speakSequence(keys, fallbackText) {
    if (isMuted) {
        console.log("speakSequence: Muted.");
        return;
    }

    console.log(`speakSequence called. Keys: ${JSON.stringify(keys)}`);
    console.log(`AudioContext: ${audioCtx ? audioCtx.state : 'null'}`);
    console.log(`SpriteBuffer: ${spriteBuffer ? 'Loaded' : 'Null'}`);
    console.log(`SpriteMap: ${spriteMap ? 'Loaded' : 'Null'}`);

    // Check if we have sprite support
    if (audioCtx && spriteBuffer && spriteMap) {
        let validKeys = keys.filter(k => {
            const hasKey = !!spriteMap[k];
            if (!hasKey) console.warn(`Missing key in spriteMap: ${k}`);
            return hasKey;
        });

        if (validKeys.length > 0) {
            console.log(`Playing sequence: ${JSON.stringify(validKeys)}`);
            playSpriteSequence(validKeys);
            return;
        } else {
            console.error("No valid keys found in sequence.");
        }
    } else if (window.rawSpriteBuffer && audioCtx) {
        console.log("Trying to decode sprites on-the-fly...");
        // Try to decode on the fly if not yet decoded
        decodeSprites().then(() => {
             speakSequence(keys, fallbackText);
        });
        return;
    } else {
        console.error("Audio system not ready (Ctx, Buffer, or Map missing).");
    }

    // Fallback if no valid keys or no audio support
    console.log("Fallback TTS triggered (but DISABLED).");
    // fallbackTTS(fallbackText);
}

function playSpriteSequence(keys) {
    if (!audioCtx) return;
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
    // DISABLED
    console.log("fallbackTTS: DISABLED");
    return;
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
    if (!window.rawSpriteBuffer) {
        console.log("No rawSpriteBuffer to decode.");
        return;
    }
    if (!audioCtx) {
        console.log("No AudioContext to decode with.");
        return;
    }
    try {
        console.log("Decoding audio data...");
        spriteBuffer = await audioCtx.decodeAudioData(window.rawSpriteBuffer);
        window.rawSpriteBuffer = null; // Free memory
        console.log("Audio Sprites Decoded Successfully!");
    } catch(e) {
        console.error("Sprite decode error", e);
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
