let selectedVoice = null;
let lastSpokenText = '';
let lastSpokenTime = 0;
let audioCtxUnlocked = false;

export function initAudio() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }
}

function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const voiceList = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));

    // Smart Select: Prioritize UK English
    selectedVoice = voiceList.find(v => v.name.includes('Great Britain') || v.name.includes('UK') || v.name.includes('United Kingdom'))
        || voiceList.find(v => v.name.includes('Google UK English'))
        || voiceList.find(v => v.name.includes('Female'))
        || voiceList[0];
}

export function speakText(text, throttle = false) {
    if (!('speechSynthesis' in window)) return;

    const now = Date.now();
    // If throttled, don't repeat the same text within 1.5 seconds
    if (throttle && text === lastSpokenText && (now - lastSpokenTime) < 1500) {
        return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    if (selectedVoice) utterance.voice = selectedVoice;

    lastSpokenText = text;
    lastSpokenTime = now;

    window.speechSynthesis.speak(utterance);
}

export function resumeAudioContext() {
    if (audioCtxUnlocked) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const ctx = new AudioContext(); // Just creating it or accessing global
        if (ctx.state === 'suspended') {
            ctx.resume().then(() => {
                console.log("Audio Context Resumed");
                audioCtxUnlocked = true;
            });
        } else {
            audioCtxUnlocked = true;
        }
    }
}

export function playVictoryMusic() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Fanfare Melody: C5, E5, G5, C6 (staccato) ... then C6 Major Chord held
    const sequence = [
        { f: 523.25, t: 0, d: 0.1 },    // C5
        { f: 659.25, t: 0.1, d: 0.1 },  // E5
        { f: 783.99, t: 0.2, d: 0.1 },  // G5
        { f: 1046.50, t: 0.3, d: 0.4 }, // C6 (Longer)
    ];

    // Final Chord (C6 Major) at t=0.3
    const chord = [
        { f: 523.25, t: 0.3, d: 0.6 },  // C5 (Low root)
        { f: 1046.50, t: 0.3, d: 0.6 }, // C6
        { f: 1318.51, t: 0.3, d: 0.6 }, // E6
        { f: 1567.98, t: 0.3, d: 0.6 }  // G6
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.3; // Global Volume
    masterGain.connect(ctx.destination);

    [...sequence, ...chord].forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // Brighter sound
        osc.frequency.setValueAtTime(note.f, ctx.currentTime + note.t);

        gain.gain.setValueAtTime(0, ctx.currentTime + note.t);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + note.t + 0.05); // Attack
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.t + note.d); // Decay

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(ctx.currentTime + note.t);
        osc.stop(ctx.currentTime + note.t + note.d + 0.1);
    });
}
