import { gameState, incrementCorrect, updateScore, resetRoundState } from '../engine/state.js';
import { feedLibrary, jobLibrary, objectPool } from '../data/content.js';
import { shuffle } from '../engine/utils.js';
import { makeDraggable, makeDroppable, setDropCallback } from '../engine/input.js';
import { speakText } from '../engine/audio.js';
import { launchModal, updateScoreUI } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

const roundSize = 3;

export function initSortingGame() {
    resetRoundState();
    const sourceCol = document.getElementById('source-col');
    const targetCol = document.getElementById('target-col');
    if (!sourceCol || !targetCol) return;

    sourceCol.innerHTML = '';
    targetCol.innerHTML = '';

    setDropCallback(handleDrop);

    // Categories:
    // 1. Animals (🦁) - from objectPool or feedLibrary
    // 2. Food (🍎) - from objectPool
    // 3. Vehicles/Objects? (No specific list, but shapes?)

    // Let's manually define 3 categories with available safe assets
    const categories = [
        {
            id: 'animal',
            icon: '🦁',
            name: 'Animals',
            items: [
                { e: '🐶', n: 'Dog' }, { e: '🦁', n: 'Lion' }, { e: '🐵', n: 'Monkey' },
                { e: '🐮', n: 'Cow' }, { e: '🐟', n: 'Fish' }, { e: '🐝', n: 'Bee' }
            ]
        },
        {
            id: 'food',
            icon: '🍎',
            name: 'Food',
            items: [
                { e: '🍎', n: 'Apple' }, { e: '🍌', n: 'Banana' }, { e: '🍇', n: 'Grapes' },
                { e: '🍦', n: 'Ice Cream' }, { e: '🍕', n: 'Pizza' }
            ]
        },
        {
            id: 'sky',
            icon: '☁️',
            name: 'Sky',
            items: [
                { e: '☀️', n: 'Sun' }, { e: '🌙', n: 'Moon' }, { e: '☁️', n: 'Cloud' },
                { e: '🚀', n: 'Rocket' }, { e: '✈️', n: 'Airplane' }, { e: '🦋', n: 'Butterfly' }
            ]
        }
    ];

    // Select 1 item from each category for the round
    let roundItems = [];

    categories.forEach(cat => {
        // Create Bin in Target
        const bin = document.createElement('div');
        bin.className = 'item droppable sorting-bin';
        bin.innerHTML = `<span style="font-size: 40px; display: block;">${cat.icon}</span><span style="font-size: 16px;">${cat.name}</span>`;
        bin.dataset.match = cat.id; // Match by Category ID

        makeDroppable(bin, cat.id);
        targetCol.appendChild(bin);

        // Pick random item for Source
        const validItems = cat.items.filter(i => {
            // Ensure audio exists? relying on objectPool/content mostly
            return true;
        });
        const item = validItems[Math.floor(Math.random() * validItems.length)];

        roundItems.push({
            ...item,
            matchId: cat.id
        });
    });

    // Shuffle and Create Source Items
    shuffle(roundItems).forEach(item => {
        const el = document.createElement('div');
        el.className = 'item draggable';
        el.textContent = item.e;
        el.dataset.label = item.n;

        const dragId = `drag-sort-${item.n}-${Math.random().toString(36).substr(2, 5)}`;

        el.onclick = () => {
             const nounKey = 'noun_' + item.n.toLowerCase().replace(' ', '_');
             speakText(item.n, nounKey);
        };

        makeDraggable(el, item.matchId, dragId);
        sourceCol.appendChild(el);
    });
}

function handleDrop(targetBox, draggedVal, draggedElId) {
    if (!targetBox || targetBox.classList.contains('matched-bin')) return; // Bins don't lock, but let's check correct match

    if (targetBox.dataset.match !== draggedVal) return; // Wrong bin

    // Correct match
    const source = document.getElementById(draggedElId);
    if (source) source.style.visibility = 'hidden';

    // Animation on Bin
    targetBox.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.2)' },
        { transform: 'scale(1)' }
    ], {
        duration: 300
    });

    updateScore(10);
    updateScoreUI();

    // Speak "Category Name" or "Correct"
    // Maybe speak item name + category? "Apple... Food"
    // For now, simple "Correct"
    speakText("Match!", "generic_match");

    const currentCorrect = incrementCorrect();
    if (currentCorrect === roundSize) {
        document.getElementById('reset-btn').style.display = 'inline-block';
        setTimeout(() => speakText("Good Job!", "generic_good_job"), 1000);
        checkOverallProgress('sorting');
    }
}
