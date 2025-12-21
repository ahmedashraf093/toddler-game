import { gameState, updateScore } from '../engine/state.js';
import { objectPool } from '../data/content.js';
import { speakText } from '../engine/audio.js';
import { launchModal, updateScoreUI } from '../engine/ui.js';
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
        grid.appendChild(card);
        cardElements.push(card);
    });

    // Preview: Show cards for 3 seconds
    lockBoard = true;
    cardElements.forEach(card => card.classList.add('flipped'));

    previewTimeout = setTimeout(() => {
        cardElements.forEach(card => card.classList.remove('flipped'));
        lockBoard = false;
        previewTimeout = null;
    }, 3000);

    speakText(`Find the pairs!`);
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

    card.addEventListener('click', handleCardClick);

    return card;
}

function handleCardClick() {
    if (lockBoard) return;
    if (this === flippedCards[0]) return;

    this.classList.add('flipped');
    speakText(this.dataset.emoji, true);

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
    updateScoreUI();

    speakText("Match! " + card1.dataset.name);

    flippedCards = [];

    const grid = document.getElementById('memory-grid');
    const totalPairs = grid.childElementCount / 2;

    if (matchedPairs === totalPairs) {
        setTimeout(() => {
            launchModal("🧠", "🌟", "Memory Master!");
            speakText("You found all the pairs!");
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

        flippedCards = [];
        lockBoard = false;
    }, 1000);
}
