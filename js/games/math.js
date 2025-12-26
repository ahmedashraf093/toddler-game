import { gameState, updateScore } from '../engine/state.js';
import { objectPool } from '../data/content.js';
import { makeDraggable, makeDroppable, setDropCallback } from '../engine/input.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { launchModal, updateScoreUI } from '../engine/ui.js';
import { shuffle } from '../engine/utils.js';
import { checkOverallProgress } from '../challenges/manager.js';

let mathQuestions = [];
let currentMathIndex = 0;
const roundSize = 5;

export function initMathGame() {
    currentMathIndex = 0;
    mathQuestions = [];
    const diff = gameState.mathDifficulty;

    for (let i = 0; i < roundSize; i++) {
        let A, B, op, ans;
        if (diff === 'easy') {
            ans = Math.floor(Math.random() * 4) + 2; A = Math.floor(Math.random() * (ans - 1)) + 1; B = ans - A; op = '+';
        }
        else if (diff === 'medium') {
            ans = Math.floor(Math.random() * 8) + 2; A = Math.floor(Math.random() * (ans - 1)) + 1; B = ans - A; op = '+';
        }
        else {
            if (Math.random() > 0.5) {
                ans = Math.floor(Math.random() * 8) + 2; A = Math.floor(Math.random() * (ans - 1)) + 1; B = ans - A; op = '+';
            } else {
                ans = Math.floor(Math.random() * 9) + 1; A = Math.floor(Math.random() * (9 - ans)) + ans;
                if (A === ans) A = ans + 1; if (A > 10) A = 10; B = A - ans; op = '-';
            }
        }
        mathQuestions.push({ A, B, op, ans });
    }

    setDropCallback(dropMath);
    loadMathQuestion();
}

function loadMathQuestion() {
    if (currentMathIndex >= mathQuestions.length) {
        document.getElementById('reset-btn').style.display = 'inline-block';
        speakText("All done! Good job!", "good_job");
        return;
    }
    const q = mathQuestions[currentMathIndex];
    const container = document.getElementById('math-eq-container');
    const target = document.getElementById('math-target-zone');
    const optionsRow = document.getElementById('math-options-row');

    // Clear previous
    container.innerHTML = '';
    optionsRow.innerHTML = '';

    const randomObj = objectPool[Math.floor(Math.random() * objectPool.length)];
    const emoji = randomObj.e;

    const buildGroup = (n) => {
        let s = '<div class="emoji-group">';
        for (let i = 0; i < n; i++) s += `<span class="math-emoji">${emoji}</span>`;
        s += '</div>';
        return s;
    };

    container.innerHTML = `${buildGroup(q.A)}<div class="math-operator">${q.op === '+' ? '➕' : '➖'}</div>${buildGroup(q.B)}`;

    target.textContent = '?';
    // Reset classes (keep math-target, remove matched)
    target.className = 'math-target';
    makeDroppable(target, q.ans.toString());

    const opWord = q.op === '+' ? 'conn_plus' : 'conn_minus';
    const numA = `num_${q.A}`;
    const numB = `num_${q.B}`;
    const numAns = `num_${q.ans}`;

    target.dataset.tts = `${q.A} ${q.op === '+' ? 'plus' : 'minus'} ${q.B} equals ${q.ans}`;

    // Store keys sequence for TTS (Correct prefixes)
    const keys = [numA, opWord, numB, 'conn_equals', numAns];
    target.dataset.keys = JSON.stringify(keys);

    target.dataset.emoji = emoji;

    let opts = [q.ans];
    while (opts.length < 3) { let r = Math.floor(Math.random() * 9) + 1; if (!opts.includes(r)) opts.push(r); }
    shuffle(opts);

    opts.forEach(val => {
        const el = document.createElement('div');
        el.className = 'item math-option draggable';
        el.textContent = val;
        el.id = 'math-opt-' + val;
        el.dataset.label = val.toString();
        el.dataset.audioKey = 'num_' + val;
        makeDraggable(el, val, el.id);
        optionsRow.appendChild(el);
    });
}

function dropMath(targetBox, draggedVal) {
    // Only check if target is the math zone and matches
    if (targetBox && targetBox.id === 'math-target-zone' && targetBox.dataset.match === draggedVal) {
        targetBox.classList.add('matched');
        targetBox.textContent = draggedVal;

        updateScore(10);
        updateScoreUI();

        if (targetBox.dataset.keys) {
            try {
                const keys = JSON.parse(targetBox.dataset.keys);
                speakSequence(['generic_correct', ...keys]);
            } catch (e) {
                console.warn("Error parsing TTS keys", e);
                speakText("Correct!", "generic_correct");
            }
        } else {
            speakText("Correct!", "generic_correct");
        }

        launchModal(draggedVal, targetBox.dataset.emoji, "Correct!");

        // Notify challenge manager
        // We'll do this in checkOverallProgress implicitly or explicitly
        // Ideally, we pass "math" type to checkOverallProgress

        setTimeout(() => {
            currentMathIndex++;
            if (currentMathIndex >= mathQuestions.length) checkOverallProgress('math');
            loadMathQuestion();
        }, 2500);
    }
}
