
import { speakSequence, speakText, stopAllAudio } from '../engine/audio.js';
import { gameState } from '../engine/state.js';
import { showCelebration, updateScoreUI } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

// Sentence Data: [Subject, Connector, Object]
// Each part is a key from sprites.json + Emoji for visual
const sentenceData = [
    // Animals & Diet
    { subject: 'noun_monkey', subjectEmoji: '🐵', conn: 'conn_eats_the', object: 'noun_banana', objectEmoji: '🍌', label: 'Banana' },
    { subject: 'noun_rabbit', subjectEmoji: '🐰', conn: 'conn_eats_the', object: 'noun_carrot', objectEmoji: '🥕', label: 'Carrot' },
    { subject: 'noun_dog', subjectEmoji: '🐶', conn: 'conn_eats_the', object: 'noun_bone', objectEmoji: '🦴', label: 'Bone' },
    { subject: 'noun_mouse', subjectEmoji: '🐭', conn: 'conn_eats_the', object: 'noun_cheese', objectEmoji: '🧀', label: 'Cheese' },

    // Animals & Habitat
    { subject: 'noun_lion', subjectEmoji: '🦁', conn: 'conn_lives_in_the', object: 'noun_jungle', objectEmoji: '🌴', label: 'Jungle' },
    { subject: 'noun_cow', subjectEmoji: '🐄', conn: 'conn_lives_in_the', object: 'noun_farm', objectEmoji: '🏡', label: 'Farm' },
    { subject: 'noun_whale', subjectEmoji: '🐋', conn: 'conn_lives_in_the', object: 'noun_ocean', objectEmoji: '🌊', label: 'Ocean' },

    // Nature Transitions
    { subject: 'noun_caterpillar', subjectEmoji: '🐛', conn: 'conn_becomes_a', object: 'noun_butterfly', objectEmoji: '🦋', label: 'Butterfly' },

    // Professions & Tools/Vehicles
    { subject: 'noun_fireman', subjectEmoji: '👨‍🚒', conn: 'conn_uses', object: 'noun_fire_truck', objectEmoji: '🚒', label: 'Fire Truck' },
    { subject: 'noun_doctor', subjectEmoji: '👨‍⚕️', conn: 'conn_uses', object: 'noun_ambulance', objectEmoji: '🚑', label: 'Ambulance' },
    { subject: 'noun_astronaut', subjectEmoji: '👨‍🚀', conn: 'conn_uses', object: 'noun_rocket', objectEmoji: '🚀', label: 'Rocket' },
    { subject: 'noun_mechanic', subjectEmoji: '👨‍🔧', conn: 'conn_uses', object: 'noun_wrench', objectEmoji: '🔧', label: 'Wrench' },
    { subject: 'noun_artist', subjectEmoji: '👩‍🎨', conn: 'conn_uses', object: 'noun_paint', objectEmoji: '🖌️', label: 'Paint' },
    { subject: 'noun_farmer', subjectEmoji: '👨‍🌾', conn: 'conn_uses', object: 'noun_tractor', objectEmoji: '🚜', label: 'Tractor' },

    // Shapes & Objects
    { subject: 'noun_sun', subjectEmoji: '☀️', conn: 'conn_looks_like_a', object: 'noun_circle', objectEmoji: '🔴', label: 'Circle' },
    { subject: 'noun_kite', subjectEmoji: '🪁', conn: 'conn_looks_like_a', object: 'noun_diamond', objectEmoji: '🔶', label: 'Diamond' },
    { subject: 'noun_pizza_slice', subjectEmoji: '🍕', conn: 'conn_looks_like_a', object: 'noun_triangle', objectEmoji: '🔺', label: 'Triangle' },
    { subject: 'noun_door', subjectEmoji: '🚪', conn: 'conn_looks_like_a', object: 'noun_rectangle', objectEmoji: '📟', label: 'Rectangle' },
    { subject: 'noun_ball', subjectEmoji: '⚽', conn: 'conn_looks_like_a', object: 'noun_circle', objectEmoji: '🔴', label: 'Circle' }
];

let currentSentence = null;
let isLocked = false;
let introTimer = null;

export function initSentenceGame() {
    console.log("initSentenceGame: Starting...");
    const container = document.getElementById('game-board');
    if (!container) {
        console.error("initSentenceGame: #game-board not found!");
        return;
    }
    console.log("initSentenceGame: Container found.");
    container.innerHTML = '';
    container.className = 'sentence-game-container';
    isLocked = false;

    // Pick a random sentence
    currentSentence = sentenceData[Math.floor(Math.random() * sentenceData.length)];

    // 0. Instruction Header
    const instr = document.createElement('div');
    instr.className = 'sentence-instruction';
    instr.textContent = "Complete the Story!";
    instr.onclick = () => speakText("Complete the story!", "sys_complete_the_story");
    container.appendChild(instr);

    // 1. Create the Sentence Strip
    const strip = document.createElement('div');
    strip.className = 'sentence-strip';

    // Subject Part
    const subjectPart = createPart(currentSentence.subjectEmoji, false);
    subjectPart.onclick = () => speakSequence([currentSentence.subject]);

    // Connector Part (Text/Icon placeholder)
    const connPart = document.createElement('div');
    connPart.className = 'sentence-part connector-part';
    connPart.innerHTML = getConnectorSymbol(currentSentence.conn); // Helper to get a nice icon
    connPart.onclick = () => speakSequence([currentSentence.conn]);

    // Target Slot
    const slotPart = document.createElement('div');
    slotPart.className = 'sentence-part target-slot';
    slotPart.id = 'target-slot';
    slotPart.innerHTML = '?';

    strip.appendChild(subjectPart);
    strip.appendChild(connPart);
    strip.appendChild(slotPart);
    container.appendChild(strip);

    // 2. Options Rail
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'sentence-options';

    // Generate options: 1 correct + 2 distractors
    const options = generateOptions(currentSentence);

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'sentence-option';
        btn.dataset.key = opt.key;
        btn.onclick = () => handleOptionClick(opt.key, opt.emoji, btn);

        // Emoji Content
        btn.textContent = opt.emoji;

        optionsContainer.appendChild(btn);
    });

    container.appendChild(optionsContainer);

    // Stop anything playing before starting intro
    if (introTimer) clearTimeout(introTimer);
    stopAllAudio();

    // Use fallbackTTS for intro if key might be missing, or speakSequence if sure
    speakText("Complete the story!", "sys_complete_the_story", true);

    // Brief delay then read the partial sentence
    introTimer = setTimeout(() => {
        if (gameState.currentMode === 'sentences' && !isLocked) {
            speakSequence([currentSentence.subject, currentSentence.conn]);
        }
    }, 2000);
}

function createPart(emoji, isSlot) {
    const div = document.createElement('div');
    div.className = 'sentence-part';
    div.textContent = emoji;
    return div;
}

function getConnectorSymbol(connKey) {
    if (connKey.includes('eat')) return '🍽️';
    if (connKey.includes('lives')) return '🏠';
    if (connKey.includes('use')) return '🛠️';
    if (connKey.includes('look')) return '👀';
    if (connKey.includes('become')) return '✨';
    if (connKey.includes('love')) return '❤️';
    return '➡️';
}

function generateOptions(correct) {
    const opts = [{ key: correct.object, emoji: correct.objectEmoji, label: correct.label }];
    const used = new Set([correct.object]);

    while (opts.length < 3) {
        const random = sentenceData[Math.floor(Math.random() * sentenceData.length)];
        if (!used.has(random.object)) {
            used.add(random.object);
            opts.push({ key: random.object, emoji: random.objectEmoji, label: random.label });
        }
    }
    // Shuffle
    return opts.sort(() => Math.random() - 0.5);
}

function handleOptionClick(key, emoji, btnElement) {
    if (isLocked) return;

    speakSequence([key]);

    if (key === currentSentence.object) {
        // Correct
        isLocked = true;
        const slot = document.getElementById('target-slot');
        slot.innerHTML = '';
        slot.className = 'sentence-part filled';
        slot.textContent = emoji;

        btnElement.style.visibility = 'hidden';

        // Play full sentence
        setTimeout(() => {
            speakSequence([currentSentence.subject, currentSentence.conn, currentSentence.object]);

            // Track progress (handles celebration every 3 rounds)
            gameState.totalScore += 20;
            updateScoreUI();
            checkOverallProgress('sentences');

            // Add a next button for user-driven progression
            const nextBtn = document.createElement('button');
            nextBtn.className = 'next-round-btn';
            nextBtn.innerHTML = 'Next Story ➡️';
            nextBtn.onclick = () => {
                stopAllAudio();
                initSentenceGame();
            };
            const c = document.querySelector('.sentence-game-container');
            if (c) c.appendChild(nextBtn);
        }, 800);

    } else {
        // Incorrect
        btnElement.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], { duration: 300 });
        speakSequence(['generic_try_again']);
    }
}
