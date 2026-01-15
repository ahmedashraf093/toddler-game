import { resetRoundState } from '../engine/state.js';
import { speakText, speakSequence } from '../engine/audio.js';

let spawnerInterval = null;
let isGreen = false; // Start Red
const vehicles = ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜'];

export function initTrafficLightGame() {
    resetRoundState();
    const board = document.getElementById('game-board');
    if (!board) return;

    board.innerHTML = '';

    // Create Stage
    const stage = document.createElement('div');
    stage.className = 'traffic-stage';
    stage.id = 'traffic-stage';

    // Traffic Light
    const lightContainer = document.createElement('div');
    lightContainer.className = 'traffic-light-container';

    const pole = document.createElement('div');
    pole.className = 'traffic-pole';

    const lightBox = document.createElement('div');
    lightBox.className = 'traffic-light-box';
    lightBox.setAttribute('role', 'button');
    lightBox.setAttribute('aria-label', 'Traffic Light: Red. Tap to change.');

    const redLight = document.createElement('div');
    redLight.className = 'light-circle light-red active'; // Start Red
    redLight.id = 'light-red';

    const greenLight = document.createElement('div');
    greenLight.className = 'light-circle light-green';
    greenLight.id = 'light-green';

    lightBox.appendChild(redLight);
    lightBox.appendChild(greenLight);

    lightContainer.appendChild(pole);
    lightContainer.appendChild(lightBox);
    stage.appendChild(lightContainer);

    // Hint
    const hint = document.createElement('div');
    hint.className = 'traffic-hint';
    hint.textContent = 'Tap the Light!';
    stage.appendChild(hint);

    // Road
    const road = document.createElement('div');
    road.className = 'road';
    const lines = document.createElement('div');
    lines.className = 'road-lines';
    road.appendChild(lines);
    stage.appendChild(road);

    board.appendChild(stage);

    // Initial State
    isGreen = false;
    speakText("Red Light... Stop!", "color_red");

    // Event Listener
    lightBox.onclick = toggleLight;

    // Keyboard support
    lightBox.tabIndex = 0;
    lightBox.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleLight();
        }
    };

    // Start Spawner
    startSpawner();
}

function toggleLight() {
    isGreen = !isGreen;
    updateLightVisuals();
}

function updateLightVisuals() {
    const red = document.getElementById('light-red');
    const green = document.getElementById('light-green');
    const lightBox = document.querySelector('.traffic-light-box');

    if (!red || !green) return;

    if (isGreen) {
        red.classList.remove('active');
        green.classList.add('active');
        if (lightBox) lightBox.setAttribute('aria-label', 'Traffic Light: Green. Cars are moving.');

        speakText("Green Light... Go!", "color_green");

        // Resume all vehicles
        document.querySelectorAll('.vehicle').forEach(v => {
            v.classList.remove('stopped');
        });
    } else {
        green.classList.remove('active');
        red.classList.add('active');
        if (lightBox) lightBox.setAttribute('aria-label', 'Traffic Light: Red. Cars stopped.');

        speakText("Red Light... Stop!", "color_red");

        // Stop all vehicles
        document.querySelectorAll('.vehicle').forEach(v => {
            v.classList.add('stopped');
        });
    }
}

function startSpawner() {
    if (spawnerInterval) clearInterval(spawnerInterval);

    // Spawn immediately one car
    spawnVehicle();

    spawnerInterval = setInterval(() => {
        // Check if game is still active
        if (!document.getElementById('traffic-stage')) {
            clearInterval(spawnerInterval);
            return;
        }

        spawnVehicle();
    }, 2500); // New car every 2.5s
}

function spawnVehicle() {
    const stage = document.getElementById('traffic-stage');
    if (!stage) return;

    const v = document.createElement('div');
    v.className = 'vehicle';
    if (!isGreen) v.classList.add('stopped');

    const emoji = vehicles[Math.floor(Math.random() * vehicles.length)];
    v.textContent = emoji;
    v.setAttribute('aria-hidden', 'true'); // Decorative moving element

    // Randomize speed slightly
    const duration = 4 + Math.random() * 2; // 4-6s
    v.style.animationDuration = `${duration}s`;

    // Remove when done
    v.addEventListener('animationend', () => {
        if (v.parentNode) v.parentNode.removeChild(v);
    });

    stage.appendChild(v);
}
