import { gameState } from '../engine/state.js';
import { puzzleConfig } from '../data/content.js';
import { makeDraggable, setDropCallback, setDragStartCallback } from '../engine/input.js';
import { speakText, speakSequence } from '../engine/audio.js';
import { launchModal, showLoader } from '../engine/ui.js';
import { smartSelect, shuffle } from '../engine/utils.js';
import { checkOverallProgress } from '../challenges/manager.js';

let puzzleImages = [];
let currentPuzzle = null;

export async function initPuzzleGame() {
    // Lazy load images if needed
    if (puzzleImages.length === 0) {
        showLoader(true, "Downloading Puzzle Pack...");
        try {
            const module = await import('../data/images.js');
            const puzzleImageData = module.puzzleImageData;

            puzzleImages = puzzleConfig.map(item => ({
                id: item.id,
                name: item.name,
                src: puzzleImageData[item.key]
            }));
            showLoader(false);
        } catch (e) {
            console.error("Failed to load puzzle images", e);
            showLoader(true, "Error loading puzzles!");
            return;
        }
    }

    const puzzle = smartSelect([...puzzleImages], 'puzzle', 1)[0];
    currentPuzzle = puzzle;

    // Speak "Let's build a..." if possible, or just the noun
    // Assuming we don't have "Let's build a" sprite, we might just skip or say the object name
    // e.g., "Lion"
    // speakText(puzzle.name, "noun_" + puzzle.name.toLowerCase());
    // Or check if we have "lets_build_a" key? No.
    // We can say "Find the [Name]" if we had "find_the". We do have "find_the".
    // speakSequence(['find_the', 'noun_' + puzzle.name.toLowerCase()]);

    // Using generic nature or just the noun for now to avoid silence error
    const nounKey = "noun_" + puzzle.name.toLowerCase();
    speakText(puzzle.name, nounKey);

    // Set preview
    const targetImg = document.getElementById('puzzle-target-img');
    if(targetImg) targetImg.src = puzzle.src;

    // Reset grid
    const slots = document.querySelectorAll('.puzzle-slot');
    slots.forEach(slot => {
        slot.innerHTML = '';
        slot.classList.remove('matched');
        // Puzzle slots are drop targets but with special logic (swap)
        // We'll treat them as general drop zones and handle logic in callback
        slot.classList.add('droppable');
        slot.ondragover = e => e.preventDefault();
        slot.ondrop = e => e.preventDefault(); // handled by input.js global listener but we need to prevent default
    });

    const pool = document.getElementById('puzzle-pieces-pool');
    pool.innerHTML = '';
    pool.classList.add('droppable');

    setDropCallback(handlePuzzleDrop);

    // 4 pieces: 0, 1, 2, 3
    const pieces = [0, 1, 2, 3];
    const shuffled = shuffle(pieces);

    shuffled.forEach(pos => {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece draggable';
        piece.id = `puzzle-piece-${pos}`;
        piece.dataset.pos = pos;
        piece.style.backgroundImage = `url('${puzzle.src}')`;

        const x = (pos % 2) * 100;
        const y = Math.floor(pos / 2) * 100;
        piece.style.backgroundPosition = `${x}% ${y}%`;

        // makeDraggable sets up events
        makeDraggable(piece, pos, piece.id);

        pool.appendChild(piece);
    });
}

function handlePuzzleDrop(target, draggedVal, draggedId, event, draggedElementRef) {
    // draggedElementRef is passed from touchEnd, or we find it by ID
    const piece = draggedElementRef || document.getElementById(draggedId);
    if (!piece || !piece.classList.contains('puzzle-piece')) return;

    // Determine drop target container
    // target might be a slot, pool, or a piece inside a slot/pool
    let container = target;

    // If we dropped ON another piece, the target is that piece. We want its parent.
    if (target && target.classList.contains('puzzle-piece')) {
        container = target.parentNode;
    }

    // Safety check: is the container valid?
    if (!container || (!container.classList.contains('puzzle-slot') && container.id !== 'puzzle-pieces-pool')) {
        // If dropped invalidly, input.js restores position. We do nothing.
        return;
    }

    const parentA = piece.parentNode;

    // 1. Drop to Pool
    if (container.id === 'puzzle-pieces-pool') {
        container.appendChild(piece);
        checkPuzzleCompletion();
        return;
    }

    // 2. Drop to Slot
    if (container.classList.contains('puzzle-slot')) {
        if (container.childElementCount === 0) {
            // Empty slot: just move
            container.appendChild(piece);
        } else if (container !== parentA) {
            // Occupied slot: SWAP
            const pieceB = container.firstElementChild;
            parentA.appendChild(pieceB);
            container.appendChild(piece);
        }
        checkPuzzleCompletion();
    }
}

function checkPuzzleCompletion() {
    const slots = document.querySelectorAll('.puzzle-slot');
    let correct = 0;

    slots.forEach(slot => {
        if (slot.childElementCount > 0) {
            const piece = slot.firstElementChild;
            const slotIndex = parseInt(slot.dataset.pos);
            const pieceIndex = parseInt(piece.dataset.pos);
            if (slotIndex === pieceIndex) correct++;
        }
    });

    if (correct === 4) {
        launchModal("🧩", "🌟", "Great Job!");
        const nounKey = "noun_" + currentPuzzle.name.toLowerCase();
        // speakText(`You built the ${currentPuzzle.name}!`);
        // Use sequence: "Good Job" + [Noun]
        speakSequence(['generic_good_job', nounKey]);

        checkOverallProgress('puzzle');
        setTimeout(() => {
            initPuzzleGame();
        }, 3000);
    }
}
