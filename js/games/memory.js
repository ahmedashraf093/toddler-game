import { gameState, updateScore } from '../engine/state.js';
import { objectPool } from '../data/content.js';
import { speakText } from '../engine/audio.js';
import { launchModal, updateScoreUI, triggerConfetti } from '../engine/ui.js';
import { shuffle } from '../engine/utils.js';
import { checkOverallProgress } from '../challenges/manager.js';

let flippedCards = [];
let matchedPairs = 0;
let lockBoard = false;
let previewTimeout = null;

export function initMemoryGame() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';

    if (previewTimeout) {
        clearTimeout(previewTimeout);
        previewTimeout = null;
    }

    flippedCards = [];
    matchedPairs = 0;
    lockBoard = false;

    // No drag and drop in Memory, so no callbacks needed for input.js

    let numPairs;
    grid.className = 'memory-grid';
    const diff = gameState.mathDifficulty; // Reuse math difficulty setting

    if (diff === 'easy') {
        numPairs = 3;
        grid.classList.add('easy');
    } else if (diff === 'medium') {
        numPairs = 6;
        grid.classList.add('medium');
    } else {
        numPairs = 8;
        grid.classList.add('hard');
    }

    const items = shuffle([...objectPool]).slice(0, numPairs);
    let deck = [...items, ...items];
    deck = shuffle(deck);

    const cardElements = [];
    deck.forEach(item => {
        const card = createMemoryCard(item);
        // Start flipped for preview
        card.classList.add('flipped');
        grid.appendChild(card);
        cardElements.push(card);
    });

    // Preview phase: show cards for 2 seconds then hide
    lockBoard = true;
    previewTimeout = setTimeout(() => {
        cardElements.forEach(card => {
            card.classList.remove('flipped');
            // Reset ARIA label to hidden after preview
            card.setAttribute('aria-label', 'Hidden card');
        });
        lockBoard = false;
        previewTimeout = null;
    }, 2000);

    // "Find the pairs!" - We don't have this sprite.
    // Use "Match!" instead or silence.
    // speakText("Match!", "generic_match");
}

function createMemoryCard(item) {
    const card = document.createElement('div');
    card.classList.add('memory-card');
    card.dataset.name = item.n;
    card.dataset.emoji = item.e;

    const front = document.createElement('div');
    front.classList.add('front');
    front.textContent = item.e;

    const back = document.createElement('div');
    back.classList.add('back');

    card.appendChild(front);
    card.appendChild(back);

    // 🎨 Palette: Accessibility
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Hidden card');

    card.addEventListener('click', handleCardClick);
    card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });

    return card;
}

function handleCardClick() {
    if (lockBoard) return;
    if (this === flippedCards[0]) return;

    this.classList.add('flipped');

    // 🎨 Palette: Update ARIA
    this.setAttribute('aria-label', this.dataset.name);

    // Speak item name using sprite key
    const nounKey = 'noun_' + this.dataset.name.toLowerCase().replace(' ', '_');
    speakText(this.dataset.name, nounKey, true);

    flippedCards.push(this);

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

function checkForMatch() {
    let card1 = flippedCards[0];
    let card2 = flippedCards[1];

    let isMatch = card1.dataset.name === card2.dataset.name;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    let card1 = flippedCards[0];
    let card2 = flippedCards[1];

    card1.removeEventListener('click', handleCardClick);
    card2.removeEventListener('click', handleCardClick);

    card1.classList.add('matched');
    card2.classList.add('matched');

    matchedPairs++;
    updateScore(10);
    updateScore(10);
    updateScoreUI();
    const rect1 = card1.getBoundingClientRect();
    const rect2 = card2.getBoundingClientRect();

    // Sparkle on both cards
    triggerConfetti(rect1.left + rect1.width / 2, rect1.top + rect1.height / 2);
    setTimeout(() => {
        triggerConfetti(rect2.left + rect2.width / 2, rect2.top + rect2.height / 2);
    }, 200);

    const nounKey = 'noun_' + card1.dataset.name.toLowerCase().replace(' ', '_');
    // "Match! [Item]"
    // We can try speakSequence(["generic_match", nounKey])?
    // speakText("Match! " + card1.dataset.name);
    // But speakText doesn't support sequence arg in signature, only single key.
    // speakText(text, key) calls speakSequence([key]).

    // To play sequence "Match! Lion":
    // Import speakSequence? It's exported from audio.js.
    // I need to import it.

    // For now, simple "Correct!" or "Match!"
    speakText("Match!", "generic_match");

    flippedCards = [];

    const grid = document.getElementById('memory-grid');
    const totalPairs = grid.childElementCount / 2;

    if (matchedPairs === totalPairs) {
        setTimeout(() => {
            launchModal("🧠", "🌟", "Memory Master!");
            // "You found all the pairs!" -> Missing.
            // Use "Good Job!"
            speakText("Good Job!", "generic_good_job");
            document.getElementById('reset-btn').style.display = 'inline-block';
            checkOverallProgress('memory');
        }, 500);
    }
}

function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        flippedCards[0].classList.remove('flipped');
        flippedCards[1].classList.remove('flipped');

        // 🎨 Palette: Reset ARIA
        flippedCards[0].setAttribute('aria-label', 'Hidden card');
        flippedCards[1].setAttribute('aria-label', 'Hidden card');

        flippedCards = [];
        lockBoard = false;
    }, 1000);
}
