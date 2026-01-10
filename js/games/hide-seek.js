
import { gameState, updateScore, incrementCorrect } from '../engine/state.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { triggerConfetti, showLoader } from '../engine/ui.js';
import { objectPool, shadowLibrary } from '../data/content.js';
import { shuffle } from '../engine/utils.js';

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
    spots.forEach(spotData => {
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

function startRound(spotElements, banner) {
    // 1. Pick an animal
    // Use shadowLibrary as it has animals with good audio keys
    const animalData = shadowLibrary[Math.floor(Math.random() * shadowLibrary.length)];
    const animalEmoji = animalData.e; // e.g. 🦁
    const animalName = animalData.n;  // e.g. Lion
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
    // "Look! A Lion!"
    speakSequence(['conn_looks_like_a', animalKey], `Look! A ${animalName}!`); // Using "looks like a" as "look!" substitute or just say name
    // Actually, let's just say the name clearly first.
    speakText(animalName, animalKey);

    setTimeout(() => {
        // 4. Hiding Animation
        // Pick a random spot
        const targetIndex = Math.floor(Math.random() * spotElements.length);
        const target = spotElements[targetIndex]; // Target Object

        // Calculate target position relative to stage
        const targetRect = target.wrapper.getBoundingClientRect();
        const stageRect = document.getElementById('hide-seek-stage').getBoundingClientRect();

        // Move animal to the spot (behind it)
        // We need to move it to the center of the target wrapper
        const moveX = (targetRect.left + targetRect.width / 2) - (stageRect.left + stageRect.width / 2);
        const moveY = (targetRect.top + targetRect.height / 2) - (stageRect.top + stageRect.height * 0.2); // 0.2 is the initial top: 20%

        animalEl.style.transform = `translate(${moveX}px, ${moveY}px) scale(0.5)`;

        setTimeout(() => {
            // Hide animal behind the spot (z-index)
            animalEl.style.zIndex = 1;
            animalEl.style.opacity = 0; // Fade out slightly or fully?

            // 5. Shuffle Animation
            shuffleAnimation(spotElements, target.wrapper, animalEl, () => {
                 enableInteraction(spotElements, target.wrapper, animalEl, animalName, animalKey, banner);
            });

        }, 1000);

    }, 2000);
}

function shuffleAnimation(spotElements, targetWrapper, animalEl, onComplete) {
    const container = spotElements[0].wrapper.parentNode;

    // 1. Record First positions
    const firstRects = new Map();
    spotElements.forEach(item => {
        firstRects.set(item.wrapper, item.wrapper.getBoundingClientRect());
    });

    // 2. Shuffle Array and Update DOM (Last)
    // Create a shuffled copy to avoid messing up original references if needed, but we want to reorder DOM
    // Actually, shuffle modifies in place.
    shuffle(spotElements);

    // Re-append in new order
    spotElements.forEach(item => {
        container.appendChild(item.wrapper);
    });

    // 3. Invert
    spotElements.forEach(item => {
        const first = firstRects.get(item.wrapper);
        const last = item.wrapper.getBoundingClientRect();

        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top; // Should be 0 if horizontal only

        // Apply transform to put it back at First
        item.wrapper.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        item.wrapper.style.transition = 'transform 0s';
    });

    // Force Layout
    void container.offsetHeight;

    // 4. Play
    requestAnimationFrame(() => {
        spotElements.forEach(item => {
            item.wrapper.style.transform = '';
            item.wrapper.style.transition = 'transform 1s ease-in-out';
        });
    });

    // 5. On Finish
    setTimeout(() => {
        // Snap animal to new target position
        const targetRect = targetWrapper.getBoundingClientRect();
        const stageRect = document.getElementById('hide-seek-stage').getBoundingClientRect();

        const moveX = (targetRect.left + targetRect.width / 2) - (stageRect.left + stageRect.width / 2);
        const moveY = (targetRect.top + targetRect.height / 2) - (stageRect.top + stageRect.height * 0.2);

        animalEl.style.transition = 'none'; // Instant snap
        animalEl.style.transform = `translate(${moveX}px, ${moveY}px) scale(0.5)`;

        onComplete();
    }, 1000);
}

function enableInteraction(spotElements, targetWrapper, animalEl, animalName, animalKey, banner) {
    spotElements.forEach((item) => {
        const clickHandler = () => {
            if (item.el.classList.contains('revealed')) return; // Already clicked

            // Animate Spot lifting/moving
            item.el.style.transform = "translateY(-50px) scale(1.1)";

            if (item.wrapper === targetWrapper) {
                // Correct!
                banner.textContent = `Found: ${animalName}!`;

                // Show animal
                animalEl.style.opacity = 1;
                animalEl.style.zIndex = 10;
                animalEl.style.transform += " scale(2)"; // Pop out

                // Audio
                // "Peek-a-boo! You found me!" + Animal Name
                speakSequence(['sys_peek_a_boo', 'sys_you_found_me', animalKey], `Peek-a-boo! It's a ${animalName}!`);

                triggerConfetti();
                updateScore(10);
                incrementCorrect(); // Might trigger round end if we used standard logic, but here we run endless or custom

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
