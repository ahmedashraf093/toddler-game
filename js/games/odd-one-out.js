import { gameState, updateScore, incrementCorrect, resetRoundState } from '../engine/state.js';
import { shuffle } from '../engine/utils.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { updateScoreUI, showCelebration } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

// Categories curated from assets
const categories = {
    animal: [
        { e: '🐶', n: 'Dog', k: 'noun_dog' }, { e: '🦁', n: 'Lion', k: 'noun_lion' },
        { e: '🐮', n: 'Cow', k: 'noun_cow' }, { e: '🐵', n: 'Monkey', k: 'noun_monkey' },
        { e: '🦒', n: 'Giraffe', k: 'noun_giraffe' }, { e: '🦓', n: 'Zebra', k: 'noun_zebra' },
        { e: '🐟', n: 'Fish', k: 'noun_fish' }, { e: '🐢', n: 'Turtle', k: 'noun_turtle' },
        { e: '🐯', n: 'Tiger', k: 'noun_tiger' }, { e: '🐘', n: 'Elephant', k: null } // Elephant missing audio?
    ],
    food: [
        { e: '🍎', n: 'Apple', k: 'noun_apple' }, { e: '🍌', n: 'Banana', k: 'noun_banana' },
        { e: '🍇', n: 'Grapes', k: 'noun_grapes' }, { e: '🍦', n: 'Ice Cream', k: 'noun_ice_cream' },
        { e: '🍕', n: 'Pizza', k: 'noun_pizza' }, { e: '🍊', n: 'Orange', k: 'noun_orange' },
        { e: '🍪', n: 'Cookie', k: 'noun_cookie' }
    ],
    vehicle: [
        { e: '🚑', n: 'Ambulance', k: 'noun_ambulance' }, { e: '🚒', n: 'Fire Truck', k: 'noun_fire_truck' },
        { e: '🚓', n: 'Police Car', k: 'noun_police_car' }, { e: '🚜', n: 'Tractor', k: 'noun_tractor' },
        { e: '✈️', n: 'Airplane', k: 'noun_airplane' }, { e: '🚀', n: 'Rocket', k: 'noun_rocket' }
    ],
    shape: [
        { e: '🔺', n: 'Triangle', k: 'noun_triangle' }, { e: '🔴', n: 'Circle', k: 'noun_circle' },
        { e: '🟧', n: 'Square', k: 'noun_square' }, { e: '🔷', n: 'Diamond', k: 'noun_diamond' },
        { e: '🥚', n: 'Oval', k: 'noun_oval' }
    ]
};

// Filter out items without audio keys just in case, though I manually checked most
Object.keys(categories).forEach(k => {
    categories[k] = categories[k].filter(item => item.k && item.k !== 'null');
});

let streakCount = 0;

export function initOddOneOutGame() {
    streakCount = 0;
    resetRoundState();
    startRound();
}

function startRound() {
    const grid = document.getElementById('odd-one-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // 1. Pick two categories
    const catKeys = Object.keys(categories);
    shuffle(catKeys);

    const majorityCat = catKeys[0]; // 3 items
    const minorityCat = catKeys[1]; // 1 item (the odd one)

    // 2. Select items
    const majorityItems = [...categories[majorityCat]];
    shuffle(majorityItems);
    const selectedMajority = majorityItems.slice(0, 3);

    const minorityItems = [...categories[minorityCat]];
    shuffle(minorityItems);
    const selectedMinority = minorityItems[0];

    // 3. Prepare game data
    const gameItems = selectedMajority.map(item => ({ ...item, isOdd: false }));
    gameItems.push({ ...selectedMinority, isOdd: true });
    shuffle(gameItems);

    // 4. Render
    gameItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'odd-one-card';
        card.textContent = item.e;
        card.dataset.name = item.n;

        // 🎨 Palette: Accessibility
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', item.n); // "Dog", "Apple"

        card.onclick = () => handleCardClick(card, item);
        card.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(card, item);
            }
        };

        grid.appendChild(card);
    });

    // Reset next button state
    document.getElementById('reset-btn').style.display = 'none';
}

function handleCardClick(card, item) {
    if (card.classList.contains('solved')) return;

    if (item.isOdd) {
        // Correct!
        card.classList.add('solved');
        card.style.borderColor = '#44cc44';
        card.style.backgroundColor = '#dfffd6';

        streakCount++;
        updateScore(10);
        updateScoreUI();
        incrementCorrect(); // Tracks progress if needed, but here we just do rounds

        let delay = 2000;

        // Feedback
        if (item.k) {
            speakSequence([item.k, 'generic_correct'], `${item.n}! Correct!`);
        } else {
            speakText("Correct!");
        }

        // Auto advance after delay
        setTimeout(() => {
            // Check overall progress (handles celebration every 3 rounds)
            checkOverallProgress('oddoneout');
            startRound();
        }, delay);

    } else {
        // Incorrect
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 500);

        // Negative feedback (Silent or generic)
        speakText(item.n); // Just say what it is "Dog"
    }
}
