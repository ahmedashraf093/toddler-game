
import { gameState, incrementCorrect, updateScore, resetRoundState } from '../engine/state.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { launchModal, updateScoreUI, showLoader, triggerConfetti } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

let bubbleInterval = null;
const roundSize = 5;

export function initAlphabetPopGame() {
    resetRoundState();
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    const stage = document.createElement('div');
    stage.id = 'alphabet-stage';
    stage.className = 'bubble-stage'; // Reuse CSS
    board.appendChild(stage);

    // Pick a target letter (A-Z)
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const targetLetter = letters[Math.floor(Math.random() * letters.length)];

    const instruction = document.createElement('div');
    instruction.className = 'bubble-instruction';
    instruction.innerHTML = `Pop the letter <b>${targetLetter}</b>!`;
    stage.appendChild(instruction);

    speakText(`Pop the letter ${targetLetter}`, `alpha_${targetLetter.toLowerCase()}`);

    startBubbleSpawner(stage, targetLetter);
}

function startBubbleSpawner(stage, targetLetter) {
    if (bubbleInterval) clearInterval(bubbleInterval);

    let spawnRate = 1200;
    if (gameState.mathDifficulty === 'medium') spawnRate = 1000;
    if (gameState.mathDifficulty === 'hard') spawnRate = 800;

    bubbleInterval = setInterval(() => {
        if (!document.getElementById('alphabet-stage')) {
            clearInterval(bubbleInterval);
            return;
        }
        createBubble(stage, targetLetter);
    }, spawnRate);
}

function createBubble(stage, targetLetter) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const isTarget = Math.random() < 0.4;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const val = isTarget ? targetLetter : letters[Math.floor(Math.random() * letters.length)];

    bubble.textContent = val;
    bubble.dataset.value = val;

    const left = Math.random() * 80 + 10;
    bubble.style.left = `${left}%`;

    const size = Math.random() * 40 + 100;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    const colors = ['bub-red', 'bub-blue', 'bub-green', 'bub-purple', 'bub-orange'];
    bubble.classList.add(colors[Math.floor(Math.random() * colors.length)]);

    const duration = Math.random() * 2 + 3;
    bubble.style.animationDuration = `${duration}s`;

    bubble.setAttribute('role', 'button');
    bubble.setAttribute('tabindex', '0');
    bubble.setAttribute('aria-label', `Pop bubble with letter ${val}`);

    bubble.onclick = (e) => handleBubbleClick(e, val, targetLetter, bubble);
    bubble.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBubbleClick(e, val, targetLetter, bubble);
        }
    };

    bubble.addEventListener('animationend', () => {
        if (bubble.parentNode) bubble.remove();
    });

    stage.appendChild(bubble);
}

function handleBubbleClick(e, val, targetLetter, bubble) {
    e.stopPropagation();

    if (val === targetLetter) {
        popBubble(bubble, true);
        speakSequence(['generic_pop', `alpha_${val.toLowerCase()}`]);

        updateScore(10);
        updateScoreUI();

        const currentCorrect = incrementCorrect();
        if (currentCorrect >= roundSize) {
            clearInterval(bubbleInterval);
            document.querySelectorAll('.bubble').forEach(b => popBubble(b, false));

            setTimeout(() => {
                speakText("Good Job!", "generic_good_job");
                document.getElementById('reset-btn').style.display = 'inline-block';
                checkOverallProgress('alphabetpop');
                launchModal(targetLetter, "🎈", "Great Pop!");
            }, 1000);
        }
    } else {
        speakText("Oops", "generic_try_again");
        bubble.classList.add('shake');
        setTimeout(() => bubble.classList.remove('shake'), 500);
    }
}

function popBubble(bubble, isCorrect) {
    const rect = bubble.getBoundingClientRect();
    bubble.style.position = 'fixed';
    bubble.style.left = rect.left + 'px';
    bubble.style.top = rect.top + 'px';
    bubble.style.bottom = 'auto';
    bubble.style.transform = 'none';

    bubble.classList.add('popped');
    bubble.innerHTML = isCorrect ? "💥" : "💨";

    if (isCorrect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        triggerConfetti(centerX, centerY);
    }

    setTimeout(() => {
        if (bubble.parentNode) bubble.remove();
    }, 600);
}
