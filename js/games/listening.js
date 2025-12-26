import { gameState, incrementCorrect, updateScore, resetRoundState } from '../engine/state.js';
import { shadowLibrary } from '../data/content.js';
import { smartSelect, shuffle } from '../engine/utils.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { launchModal, updateScoreUI } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

const roundSize = 5;

// Reuse shadowLibrary as it contains simple nouns with emojis
// Filter for items likely to have audio (simple single words)
const listeningItems = shadowLibrary;

export function initListeningGame() {
    resetRoundState();
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;

    gameBoard.innerHTML = `
        <div id="listening-stage" class="game-stage active" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <div id="instruction-area" style="margin-bottom: 20px; font-size: 2rem; cursor: pointer;">
                🔊 <span id="instruction-text">Listen...</span>
            </div>
            <div id="listening-grid" style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;"></div>
        </div>
    `;

    startListeningRound();
}

function startListeningRound() {
    const grid = document.getElementById('listening-grid');
    const instructionText = document.getElementById('instruction-text');
    if (!grid) return;

    grid.innerHTML = '';
    instructionText.textContent = "Listen...";

    // Pick 1 target and 2 distractors
    const selection = smartSelect([...listeningItems], 'listening', 3);
    const target = selection[0]; // First one is target for simplicity in logic, but we shuffle display
    const options = shuffle([...selection]);

    // Play Audio
    setTimeout(() => {
        playPrompt(target);
    }, 500);

    // Setup Replay Button
    document.getElementById('instruction-area').onclick = () => playPrompt(target);

    options.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item droppable'; // Reuse styling
        card.style.cursor = 'pointer';
        card.innerHTML = `<div class="content" style="font-size: 4rem;">${item.e}</div>`;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', item.n);

        card.onclick = () => handleChoice(card, item, target);

        grid.appendChild(card);
    });
}

function playPrompt(target) {
    const nounKey = 'noun_' + target.n.toLowerCase().replace(' ', '_');
    // "Find the... [Item]"
    // If we don't have "Find the", just say the item name clearly.
    // Based on sprites.json check, we have 'conn_the'.
    // We don't have 'conn_find'.
    // So: "The... [Item]" or just "[Item]".
    // Let's try: "The... [Item]?"
    speakSequence(['conn_the', nounKey]);

    // Animate instruction
    const instr = document.getElementById('instruction-area');
    if(instr) {
        instr.style.transform = "scale(1.1)";
        setTimeout(() => instr.style.transform = "scale(1)", 200);
    }
}

function handleChoice(card, item, target) {
    if (item.n === target.n) {
        // Correct
        card.classList.add('matched');
        updateScore(10);
        updateScoreUI();

        speakText("Correct!", "generic_correct");
        launchModal(item.n, item.e, "Good Job!");

        const currentCorrect = incrementCorrect();
        if (currentCorrect >= roundSize) {
            document.getElementById('reset-btn').style.display = 'inline-block';
            setTimeout(() => speakText("Good Job!", "generic_good_job"), 1000);
            checkOverallProgress('listening');
        } else {
            setTimeout(startListeningRound, 2000);
        }
    } else {
        // Incorrect
        card.style.opacity = '0.5';
        card.style.transform = 'shake'; // CSS animation if exists, or just visual feedback

        // Speak what they clicked: "That is a [Item]"
        // We have 'conn_a' / 'conn_an'.
        const nounKey = 'noun_' + item.n.toLowerCase().replace(' ', '_');
        const startsWithVowel = /^[aeiou]/i.test(item.n);
        const article = startsWithVowel ? 'conn_an' : 'conn_a';

        speakSequence([article, nounKey]);
    }
}
