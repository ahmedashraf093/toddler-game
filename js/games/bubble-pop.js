
import { gameState, incrementCorrect, updateScore, resetRoundState } from '../engine/state.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { launchModal, updateScoreUI, showLoader, triggerConfetti } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

let bubbleInterval = null;
const roundSize = 5;

export function initBubblePopGame() {
    resetRoundState();
    const board = document.getElementById('game-board');
    board.innerHTML = ''; // Clear board

    // Create stage if not exists (though we plan to put it in index.html, we can just inject into board for consistency with other games like standard/math that use specific stages or board directly? 
    // Standard game uses source-col/target-col. Math uses math-stage. 
    // Let's use a dedicated container injected into game-board to keep it clean.

    const stage = document.createElement('div');
    stage.id = 'bubble-stage';
    stage.className = 'bubble-stage';
    board.appendChild(stage);

    // Pick a target number (1-9)
    const targetNum = Math.floor(Math.random() * 9) + 1;

    // Show instruction
    const instruction = document.createElement('div');
    instruction.className = 'bubble-instruction';
    instruction.innerHTML = `Pop the number <b>${targetNum}</b>!`;
    stage.appendChild(instruction);

    speakText(`Pop the number ${targetNum}`, `num_${targetNum}`);

    // Spawn bubbles
    startBubbleSpawner(stage, targetNum);
}

function startBubbleSpawner(stage, targetNum) {
    if (bubbleInterval) clearInterval(bubbleInterval);

    // Spawn every 1.5 seconds reduced by difficulty?
    let spawnRate = 1200;
    if (gameState.mathDifficulty === 'medium') spawnRate = 1000;
    if (gameState.mathDifficulty === 'hard') spawnRate = 800;

    bubbleInterval = setInterval(() => {
        if (!document.getElementById('bubble-stage')) {
            clearInterval(bubbleInterval); // Safety check if stage removed
            return;
        }
        createBubble(stage, targetNum);
    }, spawnRate);
}

function createBubble(stage, targetNum) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    // Determine content: 40% chance of being the target
    const isTarget = Math.random() < 0.4;
    const val = isTarget ? targetNum : (Math.floor(Math.random() * 9) + 1);

    // Avoid accidental matches if we wanted non-target (random logic ensures val is just a number, might coincidentally be target if we don't exclude it, which is fine, just more lucky hits)

    bubble.textContent = val;
    bubble.dataset.value = val;

    // Random Position
    const left = Math.random() * 80 + 10; // 10% to 90%
    bubble.style.left = `${left}%`;

    // Random Size (UPDATED: Bigger!)
    const size = Math.random() * 40 + 100; // 100-140px
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    // Random Color/Gradient handled in CSS or via inline var? Let's use a class
    const colors = ['bub-red', 'bub-blue', 'bub-green', 'bub-purple', 'bub-orange'];
    bubble.classList.add(colors[Math.floor(Math.random() * colors.length)]);

    // Speed varies slightly
    const duration = Math.random() * 2 + 3; // 3-5s
    bubble.style.animationDuration = `${duration}s`;

    bubble.onclick = (e) => handleBubbleClick(e, val, targetNum, bubble);

    // Auto-remove after animation
    bubble.addEventListener('animationend', () => {
        if (bubble.parentNode) bubble.remove();
    });

    stage.appendChild(bubble);
}

function handleBubbleClick(e, val, targetNum, bubble) {
    e.stopPropagation();

    if (String(val) === String(targetNum)) {
        // Correct
        popBubble(bubble, true);
        const seq = ['generic_pop', `num_${val}`];
        speakSequence(seq); // "Pop! Five!"

        updateScore(10);
        updateScoreUI();

        const currentCorrect = incrementCorrect();
        if (currentCorrect >= roundSize) { // Win round
            clearInterval(bubbleInterval);
            // Remove all remaining bubbles gracefully?
            document.querySelectorAll('.bubble').forEach(b => popBubble(b, false)); // just clear them

            setTimeout(() => {
                speakText("Good Job!", "generic_good_job");
                document.getElementById('reset-btn').style.display = 'inline-block';
                checkOverallProgress('bubblepop');
                launchModal(targetNum, "🎈", "Great Pop!");
            }, 1000);
        }
    } else {
        // Wrong
        speakText("Oops", "generic_try_again");
        bubble.classList.add('shake');
        setTimeout(() => bubble.classList.remove('shake'), 500);
    }
}

function popBubble(bubble, isCorrect) {
    bubble.style.transform = "scale(1.2)";
    bubble.innerHTML = isCorrect ? "🌟" : "💨";
    bubble.classList.add('popped');

    // Trigger confetti at position if correct
    if (isCorrect) {
        const rect = bubble.getBoundingClientRect();
        // Trigger confetti at the bottom of the balloon as requested
        triggerConfetti(rect.left + rect.width / 2, rect.bottom - 20);
    }

    setTimeout(() => {
        if (bubble.parentNode) bubble.remove();
    }, 200);
}
