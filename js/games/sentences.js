
import { speakSequence } from '../engine/audio.js';
import { gameState } from '../engine/state.js';
import { showCelebration } from '../engine/ui.js';

// Sentence Data: [Subject, Connector, Object]
// Each part is a key from sprites.json
const sentenceData = [
    // Animals & Diet
    { subject: 'noun_monkey', conn: 'conn_eats_the', object: 'noun_banana', label: 'Banana' },
    { subject: 'noun_rabbit', conn: 'conn_eats_the', object: 'noun_carrot', label: 'Carrot' },
    { subject: 'noun_dog', conn: 'conn_eats_the', object: 'noun_bone', label: 'Bone' },
    { subject: 'noun_mouse', conn: 'conn_eats_the', object: 'noun_cheese', label: 'Cheese' },

    // Animals & Habitat
    { subject: 'noun_lion', conn: 'conn_lives_in_the', object: 'noun_jungle', label: 'Jungle' },
    { subject: 'noun_cow', conn: 'conn_lives_in_the', object: 'noun_farm', label: 'Farm' },
    { subject: 'noun_whale', conn: 'conn_lives_in_the', object: 'noun_ocean', label: 'Ocean' },

    // Nature Transitions
    { subject: 'noun_caterpillar', conn: 'conn_becomes_a', object: 'noun_butterfly', label: 'Butterfly' },

    // Professions & Tools/Vehicles
    { subject: 'noun_fireman', conn: 'conn_uses', object: 'noun_fire_truck', label: 'Fire Truck' },
    { subject: 'noun_doctor', conn: 'conn_uses', object: 'noun_ambulance', label: 'Ambulance' },
    { subject: 'noun_astronaut', conn: 'conn_uses', object: 'noun_rocket', label: 'Rocket' },
    { subject: 'noun_mechanic', conn: 'conn_uses', object: 'noun_wrench', label: 'Wrench' },
    { subject: 'noun_artist', conn: 'conn_uses', object: 'noun_paint', label: 'Paint' },
    { subject: 'noun_farmer', conn: 'conn_uses', object: 'noun_tractor', label: 'Tractor' },

    // Shapes & Objects
    { subject: 'noun_sun', conn: 'conn_looks_like_a', object: 'noun_circle', label: 'Circle' },
    { subject: 'noun_kite', conn: 'conn_looks_like_a', object: 'noun_diamond', label: 'Diamond' },
    { subject: 'noun_pizza_slice', conn: 'conn_looks_like_a', object: 'noun_triangle', label: 'Triangle' },
    { subject: 'noun_door', conn: 'conn_looks_like_a', object: 'noun_rectangle', label: 'Rectangle' },
    { subject: 'noun_ball', conn: 'conn_looks_like_a', object: 'noun_circle', label: 'Circle' }
];

let currentSentence = null;
let isLocked = false;

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

    // 1. Create the Sentence Strip
    const strip = document.createElement('div');
    strip.className = 'sentence-strip';

    // Subject Part
    const subjectPart = createPart(currentSentence.subject, false);
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
        btn.onclick = () => handleOptionClick(opt.key, btn);

        // Image
        const img = document.createElement('img');
        // Simple image path assumption based on existing patterns
        img.src = `assets/images/${opt.key.replace('noun_', '')}.png`;

        img.onerror = () => { img.style.display='none'; btn.textContent = opt.label || '???'; };

        btn.appendChild(img);
        optionsContainer.appendChild(btn);
    });

    container.appendChild(optionsContainer);

    // Initial Speak (Subject + Connector)
    setTimeout(() => {
        speakSequence([currentSentence.subject, currentSentence.conn]);
    }, 500);
}

function createPart(key, isSlot) {
    const div = document.createElement('div');
    div.className = 'sentence-part';
    const img = document.createElement('img');
    img.src = `assets/images/${key.replace('noun_', '')}.png`;
    img.onerror = () => { img.style.display='none'; div.textContent = 'IMAGE'; };
    div.appendChild(img);
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
    const opts = [{ key: correct.object, label: correct.label }];
    const used = new Set([correct.object]);

    while (opts.length < 3) {
        const random = sentenceData[Math.floor(Math.random() * sentenceData.length)];
        if (!used.has(random.object)) {
            used.add(random.object);
            opts.push({ key: random.object, label: random.label });
        }
    }
    // Shuffle
    return opts.sort(() => Math.random() - 0.5);
}

function handleOptionClick(key, btnElement) {
    if (isLocked) return;

    speakSequence([key]);

    if (key === currentSentence.object) {
        // Correct
        isLocked = true;
        const slot = document.getElementById('target-slot');
        slot.innerHTML = '';
        slot.className = 'sentence-part filled';

        // Move image to slot (visual logic)
        const img = btnElement.querySelector('img').cloneNode(true);
        slot.appendChild(img);
        btnElement.style.visibility = 'hidden';

        // Play full sentence
        setTimeout(() => {
            speakSequence([currentSentence.subject, currentSentence.conn, currentSentence.object]);
            // Immediate feedback not needed if sentence plays, or use specific "correct" sound

            // Celebrate after speech
            setTimeout(() => {
                showCelebration();
                // Add a next button manually if showReward doesn't auto-handle it
                const nextBtn = document.createElement('button');
                nextBtn.className = 'next-round-btn';
                nextBtn.innerHTML = '➡️';
                nextBtn.onclick = initSentenceGame;
                // Ensure container still exists before appending
                const c = document.querySelector('.sentence-game-container');
                if(c) c.appendChild(nextBtn);
            }, 3000);
        }, 500);

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
