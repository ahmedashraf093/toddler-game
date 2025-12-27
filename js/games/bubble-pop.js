
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
        popBubble(bubble, true);

        // Use Generated Sprites: "Pop!" + "One"
        speakSequence(['generic_pop', `num_${val}`]);

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
    // Freeze bubble at current visual position
    const rect = bubble.getBoundingClientRect();
    bubble.style.position = 'fixed';
    bubble.style.left = rect.left + 'px';
    bubble.style.top = rect.top + 'px';
    bubble.style.bottom = 'auto';
    bubble.style.transform = 'none';

    bubble.classList.add('popped');
    bubble.innerHTML = isCorrect ? "💥" : "💨";

    // Create particle spray effect
    if (isCorrect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Spawn 8 particles in a circle
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.fontSize = '2rem';
            particle.innerHTML = ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)];
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';

            const angle = (i / 8) * Math.PI * 2;
            const distance = 100;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            document.body.appendChild(particle);

            particle.animate([
                { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0.5) rotate(360deg)`, opacity: 0 }
            ], {
                duration: 600,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }).onfinish = () => particle.remove();
        }

        // Trigger confetti at the center
        triggerConfetti(centerX, centerY);
    }

    setTimeout(() => {
        if (bubble.parentNode) bubble.remove();
    }, 600);
}
