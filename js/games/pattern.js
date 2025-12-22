import { gameState, incrementCorrect, updateScore, resetRoundState } from '../engine/state.js';
import { objectPool } from '../data/content.js';
import { shuffle } from '../engine/utils.js';
import { makeDraggable, makeDroppable, setDropCallback } from '../engine/input.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { launchModal, updateScoreUI } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

const roundSize = 3;

export function initPatternGame() {
    resetRoundState();
    const sourceCol = document.getElementById('source-col');
    const targetCol = document.getElementById('target-col');
    if (!sourceCol || !targetCol) return;

    sourceCol.innerHTML = '';
    targetCol.innerHTML = '';

    setDropCallback(handleDrop);

    // Inject styles for mobile layout
    if (!document.getElementById('pattern-styles')) {
        const style = document.createElement('style');
        style.id = 'pattern-styles';
        style.innerHTML = `
            .pattern-row {
                flex-wrap: wrap; /* Allow wrapping if absolutely needed, but prefer scaling */
                gap: 5px;
            }
            .pattern-row .item {
                width: 80px;
                height: 80px;
                font-size: 40px;
                margin: 2px !important;
            }
            @media (max-width: 600px) {
                .pattern-row .item {
                    width: 55px !important;
                    height: 55px !important;
                    font-size: 28px !important;
                    border-width: 2px !important;
                }
                .pattern-row {
                    padding: 5px !important;
                    margin-bottom: 10px !important;
                    width: 100%;
                    box-sizing: border-box;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Generate 3 patterns
    for (let i = 0; i < roundSize; i++) {
        createPatternRow(targetCol, sourceCol, i);
    }
}

function createPatternRow(targetContainer, sourceContainer, index) {
    // 1. Select items for the pattern
    // We need 2 distinct items: A and B.
    const items = shuffle([...objectPool]).slice(0, 2);
    const A = items[0];
    const B = items[1];

    // 2. Choose a pattern type
    // Types: ABAB, AABA, ABCA (need 3 items), AABB
    // Let's stick to A and B for simplicity:
    // 0: A B A ? (Answer A)
    // 1: A A B ? (Answer B)
    // 2: A B A B ? (Answer A) - Length 5?

    // Let's make sequences of length 4, with the 4th hidden.
    const patterns = [
        { seq: [A, B, A, B], answer: B }, // A B A ? -> B
        { seq: [A, A, B, B], answer: B }, // A A B ? -> B
        { seq: [A, B, B, A], answer: A }  // A B B ? -> A (Symmetric? Maybe too hard?)
        // Let's do simple ones:
        // A B A ? -> B
        // A A B ? -> B
    ];

    // Randomly pick a pattern type
    // Or just strictly A B A [B] and A A B [B]
    const pType = Math.random() < 0.5 ? 0 : 1;

    let sequenceObjs = [];
    let answerObj = null;

    if (pType === 0) {
        // A B A [B]
        sequenceObjs = [A, B, A];
        answerObj = B;
    } else {
        // A A B [B]
        sequenceObjs = [A, A, B];
        answerObj = B;
    }

    // 3. Create the Row UI
    const rowEl = document.createElement('div');
    rowEl.className = 'pattern-row';
    rowEl.style.display = 'flex';
    rowEl.style.alignItems = 'center';
    rowEl.style.justifyContent = 'center';
    rowEl.style.marginBottom = '20px';
    rowEl.style.background = 'rgba(255,255,255,0.5)';
    rowEl.style.padding = '10px';
    rowEl.style.borderRadius = '15px';

    // Render sequence
    sequenceObjs.forEach(obj => {
        const el = document.createElement('div');
        el.className = 'item static';
        el.textContent = obj.e; // Emoji
        el.style.margin = '0 5px';
        // Add click for TTS
        el.onclick = () => {
             const nounKey = 'noun_' + obj.n.toLowerCase().replace(' ', '_');
             speakText(obj.n, nounKey);
        };
        rowEl.appendChild(el);
    });

    // Render Drop Zone (The "Question Mark")
    const dropZone = document.createElement('div');
    dropZone.className = 'item droppable';
    dropZone.textContent = '❓';
    dropZone.dataset.match = answerObj.n; // Match by Name
    dropZone.dataset.emoji = answerObj.e; // Store emoji for completion
    dropZone.id = `drop-${index}`;

    makeDroppable(dropZone, answerObj.n);
    rowEl.appendChild(dropZone);

    targetContainer.appendChild(rowEl);

    // 4. Create Source Item (The Answer)
    // We need to mix it with distractors?
    // The plan said "Render the 3 missing items ... in #source-col".
    // So for 3 rows, we have 3 answers. We can just put all 3 answers in the source col.
    // That gives 3 options for 3 slots. This works like the other games.

    createSourceItem(sourceContainer, answerObj, index);
}

function createSourceItem(container, obj, index) {
    const el = document.createElement('div');
    el.className = 'item draggable';
    el.textContent = obj.e;
    el.dataset.label = obj.n;

    // Unique ID for drag
    const dragId = `drag-pattern-${index}-${Math.random().toString(36).substr(2, 5)}`;

    el.onclick = () => {
         const nounKey = 'noun_' + obj.n.toLowerCase().replace(' ', '_');
         speakText(obj.n, nounKey);
    };

    // makeDraggable(element, matchValue, uniqueId)
    makeDraggable(el, obj.n, dragId);
    container.appendChild(el);
}

function handleDrop(targetBox, draggedVal, draggedElId) {
    if (!targetBox || targetBox.classList.contains('matched') || targetBox.dataset.match !== draggedVal) return;

    // 1. Visual Update
    targetBox.classList.add('matched');
    targetBox.textContent = targetBox.dataset.emoji; // Reveal answer
    targetBox.style.backgroundColor = '#84fab0'; // Light green success
    targetBox.style.border = '3px solid #fff';

    // 2. Hide Source
    const source = document.getElementById(draggedElId);
    if (source) {
        // Sliding Transition Effect?
        // To do a slide, we'd need to calculate positions.
        // For now, let's just fade out source and animate target.
        source.style.visibility = 'hidden';
    }

    // 3. Animation on Target
    // "Sliding transition for sequence completion" requested.
    // A simple scale up/down or slide-in effect on the target box.
    targetBox.animate([
        { transform: 'translateX(-50px)', opacity: 0.5 },
        { transform: 'translateX(0)', opacity: 1 }
    ], {
        duration: 500,
        easing: 'ease-out'
    });

    // 4. Score & Sound
    updateScore(10);
    updateScoreUI();

    const nounKey = 'noun_' + draggedVal.toLowerCase().replace(' ', '_');
    // "Correct! [Item]"
    speakText(draggedVal, nounKey);

    // 5. Check Progress
    const currentCorrect = incrementCorrect();
    if (currentCorrect === roundSize) {
        document.getElementById('reset-btn').style.display = 'inline-block';
        setTimeout(() => speakText("Good Job!", "generic_good_job"), 1000);
        checkOverallProgress('pattern');
    }
}
