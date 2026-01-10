import { gameState, updateScore, incrementCorrect } from '../engine/state.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { triggerConfetti, showLoader } from '../engine/ui.js';
import { objectPool, shadowLibrary } from '../data/content.js';
import { shuffle } from '../engine/utils.js';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export function initHideSeekGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    // Create Stage
    const stage = document.createElement('div');
    stage.id = 'hide-seek-stage';
    stage.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        position: relative;
    `;
    board.appendChild(stage);

    // Instruction Banner
    const banner = document.createElement('div');
    banner.className = 'instruction-banner';
    banner.textContent = 'Find the Animal!';
    banner.onclick = () => speakText('Find the animal!', 'sys_find_the');
    stage.appendChild(banner);

    // Hiding Spots Container
    const spotsContainer = document.createElement('div');
    spotsContainer.style.cssText = `
        display: flex;
        justify-content: space-around;
        align-items: flex-end;
        width: 90%;
        height: 60%;
        margin-top: 20px;
    `;
    stage.appendChild(spotsContainer);

    // Define Spots
    const spots = [
        { id: 'bush', emoji: '🌳', name: 'Bush', audio: 'noun_bush' },
        { id: 'box', emoji: '📦', name: 'Box', audio: 'noun_box' },
        { id: 'house', emoji: '🏠', name: 'House', audio: 'noun_house' }
    ];

    // Create Spot Elements
    const spotElements = [];
    spots.forEach((spotData, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'hiding-spot-wrapper';
        wrapper.style.cssText = `
            position: relative;
            width: 30%;
            height: 100%;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            cursor: pointer;
            order: ${i};
        `;

        const spotEl = document.createElement('div');
        spotEl.className = 'hiding-spot';
        spotEl.textContent = spotData.emoji;
        spotEl.style.cssText = `
            font-size: 8rem;
            transition: transform 0.3s ease;
            z-index: 2;
        `;
        // Accessibility
        spotEl.setAttribute('role', 'button');
        spotEl.setAttribute('aria-label', spotData.name);
        spotEl.tabIndex = 0;

        wrapper.appendChild(spotEl);
        spotsContainer.appendChild(wrapper);

        spotElements.push({ wrapper, el: spotEl, data: spotData });
    });

    startRound(spotElements, banner);
}

async function startRound(spotElements, banner) {
    // 1. Pick an animal
    const animalData = shadowLibrary[Math.floor(Math.random() * shadowLibrary.length)];
    const animalEmoji = animalData.e; 
    const animalName = animalData.n;  
    const animalKey = `noun_${animalName.toLowerCase().replace(' ', '_')}`;

    // 2. Create Animal Element (Hidden initially)
    const animalEl = document.createElement('div');
    animalEl.textContent = animalEmoji;
    animalEl.style.cssText = `
        position: absolute;
        font-size: 6rem;
        z-index: 10;
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: all 1s ease-in-out;
    `;
    document.getElementById('hide-seek-stage').appendChild(animalEl);

    // 3. Intro Sequence
    speakText(animalName, animalKey);
    await wait(2000);

    // 4. Hiding Animation
    // Pick a random spot
    const targetIndex = Math.floor(Math.random() * spotElements.length);
    const targetSpot = spotElements[targetIndex];

    // Calculate target position relative to stage
    const stage = document.getElementById('hide-seek-stage');
    const targetRect = targetSpot.wrapper.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    const moveX = (targetRect.left + targetRect.width / 2) - (stageRect.left + stageRect.width / 2);
    const moveY = (targetRect.top + targetRect.height / 2) - (stageRect.top + stageRect.height * 0.2);

    animalEl.style.transform = `translate(${moveX}px, ${moveY}px) scale(0.5)`;
    
    await wait(1000);

    // Hide animal behind the spot
    animalEl.style.zIndex = 1;
    animalEl.style.opacity = 0;

    // 5. SHUFFLE PHASE
    await wait(500);
    
    await shuffleSpots(spotElements);

    // 6. Enable Interaction
    // We need to find where the targetSpot ended up
    const newTargetIndex = spotElements.indexOf(targetSpot);
    
    enableInteraction(spotElements, newTargetIndex, animalEl, animalName, animalKey, banner);
}

async function shuffleSpots(spotElements) {
    const moves = 5;
    const speed = 400; // ms per swap

    for (let i = 0; i < moves; i++) {
        // Pick two distinct indices
        const idx1 = Math.floor(Math.random() * spotElements.length);
        let idx2 = Math.floor(Math.random() * spotElements.length);
        while (idx1 === idx2) idx2 = Math.floor(Math.random() * spotElements.length);

        const el1 = spotElements[idx1].wrapper;
        const el2 = spotElements[idx2].wrapper;

        // FLIP Animation
        // First
        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();

        // Swap logical order in array (to keep track)
        [spotElements[idx1], spotElements[idx2]] = [spotElements[idx2], spotElements[idx1]];

        // Swap DOM order using 'order' style
        const order1 = el1.style.order;
        const order2 = el2.style.order;
        el1.style.order = order2;
        el2.style.order = order1;

        // Last (Wait for layout update? No, order change forces layout)
        // Invert
        const newRect1 = el1.getBoundingClientRect();
        const newRect2 = el2.getBoundingClientRect();

        const x1 = rect1.left - newRect1.left;
        const x2 = rect2.left - newRect2.left;

        // Apply transforms to make them appear at old positions
        el1.style.transition = 'none';
        el2.style.transition = 'none';
        el1.style.transform = `translateX(${x1}px)`;
        el2.style.transform = `translateX(${x2}px)`;

        // Force reflow
        el1.offsetHeight;

        // Play
        el1.style.transition = `transform ${speed}ms ease-in-out`;
        el2.style.transition = `transform ${speed}ms ease-in-out`;
        el1.style.transform = '';
        el2.style.transform = '';
        
        // Audio
        speakText('Pop', 'generic_pop');

        await wait(speed + 100);
    }
}

function enableInteraction(spotElements, correctIndex, animalEl, animalName, animalKey, banner) {
    let revealed = false;

    spotElements.forEach((item, index) => {
        // Clear previous
        item.el.onclick = null;
        item.el.onkeydown = null;

        const clickHandler = () => {
            if (revealed) return; // Game over for this round
            if (item.el.classList.contains('revealed')) return;

            // Animate Spot lifting/moving
            item.el.style.transform = "translateY(-50px) scale(1.1)";

            if (index === correctIndex) {
                revealed = true;
                // Correct!
                banner.textContent = `Found: ${animalName}!`;

                // RE-CALCULATE POSITION for Animal Reveal
                 const rect = item.wrapper.getBoundingClientRect();
                 const stageRect = document.getElementById('hide-seek-stage').getBoundingClientRect();
                 const newX = (rect.left + rect.width / 2) - (stageRect.left + stageRect.width / 2);
                 const newY = (rect.top + rect.height / 2) - (stageRect.top + stageRect.height * 0.2);

                 animalEl.style.transition = 'none';
                 animalEl.style.transform = `translate(${newX}px, ${newY}px) scale(0.5)`;
                 animalEl.offsetHeight; // reflow
                 
                 animalEl.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                 animalEl.style.opacity = 1;
                 animalEl.style.zIndex = 10;
                 animalEl.style.transform = `translate(${newX}px, ${newY}px) scale(2)`;

                // Audio
                speakSequence(['sys_peek_a_boo', 'sys_you_found_me', animalKey], `Peek-a-boo! It's a ${animalName}!`);

                triggerConfetti();
                updateScore(10);
                incrementCorrect();

                // Reset for next round after delay
                setTimeout(() => {
                    initHideSeekGame(); // New Round
                }, 4000);

            } else {
                // Incorrect
                speakText("Try Again", "generic_try_again");

                // Shake animation
                item.el.animate([
                    { transform: 'translateY(-50px) rotate(0deg)' },
                    { transform: 'translateY(-50px) rotate(-10deg)' },
                    { transform: 'translateY(-50px) rotate(10deg)' },
                    { transform: 'translateY(-50px) rotate(0deg)' }
                ], { duration: 400 });

                setTimeout(() => {
                    item.el.style.transform = "translateY(0)"; // Return to normal
                }, 1000);
            }
        };

        item.el.onclick = clickHandler;
        // Keyboard support
        item.el.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                clickHandler();
            }
        }
    });
}