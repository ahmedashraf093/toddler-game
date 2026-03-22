
import { gameState } from './state.js';
import { speakText, playVictoryMusic } from './audio.js';
import { launchModal, showCelebration } from './ui.js';

const STICKER_KEY = 'toddler_game_stickers_v1';

// Library of available stickers (Emojis for now)
const STICKER_LIBRARY = [
    // Animals
    { id: 'lion', icon: '🦁', name: 'Lion' },
    { id: 'tiger', icon: '🐯', name: 'Tiger' },
    { id: 'bear', icon: '🐻', name: 'Bear' },
    { id: 'panda', icon: '🐼', name: 'Panda' },
    { id: 'dog', icon: '🐶', name: 'Dog' },
    { id: 'cat', icon: '🐱', name: 'Cat' },
    { id: 'rabbit', icon: '🐰', name: 'Rabbit' },
    { id: 'fox', icon: '🦊', name: 'Fox' },

    // Space & Magic
    { id: 'rocket', icon: '🚀', name: 'Rocket' },
    { id: 'star', icon: '⭐', name: 'Star' },
    { id: 'unicorn', icon: '🦄', name: 'Unicorn' },
    { id: 'rainbow', icon: '🌈', name: 'Rainbow' },

    // Nature
    { id: 'flower', icon: '🌸', name: 'Flower' },
    { id: 'sun', icon: '☀️', name: 'Sun' },
    { id: 'tree', icon: '🌳', name: 'Tree' },
    { id: 'butterfly', icon: '🦋', name: 'Butterfly' },

    // Toys
    { id: 'ball', icon: '⚽', name: 'Ball' },
    { id: 'bear_toy', icon: '🧸', name: 'Teddy' },
    { id: 'car', icon: '🚗', name: 'Car' },
    { id: 'train', icon: '🚂', name: 'Train' }
];

let stickerState = {
    progress: 0, // 0 to 100
    collection: [] // Array of {id, icon, name, date}
};

export function initStickers() {
    loadStickers();
    updateStickerUI();
}

export function loadStickers() {
    const saved = localStorage.getItem(STICKER_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            stickerState.collection = parsed.collection || [];
            stickerState.progress = parsed.progress || 0;
        } catch (e) {
            console.error("Failed to load stickers", e);
        }
    }
}

export function saveStickers() {
    localStorage.setItem(STICKER_KEY, JSON.stringify(stickerState));
}

// Returns true if a sticker was unlocked
export function addStickerProgress(amount) {
    if (stickerState.progress >= 100) return false; // Already full waiting for claim? Or auto claim?

    stickerState.progress += amount;
    if (stickerState.progress >= 100) {
        stickerState.progress = 100;
        awardNewSticker();
        return true;
    }

    saveStickers();
    updateStickerUI();
    return false;
}

function awardNewSticker() {
    // Pick a random sticker they might not have (or duplicates are okay? Let's try to give new ones)
    const ownedIds = new Set(stickerState.collection.map(s => s.id));
    const available = STICKER_LIBRARY.filter(s => !ownedIds.has(s.id));

    let newSticker = null;
    if (available.length > 0) {
        newSticker = available[Math.floor(Math.random() * available.length)];
    } else {
        // Fallback to random if all collected
        newSticker = STICKER_LIBRARY[Math.floor(Math.random() * STICKER_LIBRARY.length)];
    }

    // Add to collection
    stickerState.collection.unshift({ ...newSticker, date: Date.now() }); // Add to top
    stickerState.progress = 0; // Reset progress
    saveStickers();
    updateStickerUI();

    // Show Reward
    setTimeout(() => {
        showCelebration();
        speakText(`You got a new sticker! It's a ${newSticker.name}!`, "generic_amazing");
        showStickerUnlockModal(newSticker);
    }, 500);
}

function showStickerUnlockModal(sticker) {
    // Custom modal content for sticker
    const modal = document.getElementById('reward-modal');
    if (!modal) return;

    const topEl = document.getElementById('modal-top');
    const emojiEl = document.getElementById('modal-emoji');
    const wordEl = document.getElementById('modal-word');

    topEl.textContent = "NEW STICKER!";
    emojiEl.textContent = sticker.icon;
    wordEl.textContent = sticker.name;

    // Add a pulsing glow
    emojiEl.style.textShadow = "0 0 30px gold";

    modal.classList.add('show');

    // Auto hide after longer duration or click
    const hide = () => {
        modal.classList.remove('show');
        emojiEl.style.textShadow = "none";
        // Maybe open sticker book automatically?
        // toggleStickerBook(true);
    };

    setTimeout(hide, 4000);
    modal.onclick = hide;
}

export function updateStickerUI() {
    // Update progress bar
    const bar = document.getElementById('sticker-progress-fill');
    if (bar) {
        bar.style.width = `${stickerState.progress}%`;
    }

    // Update Sticker Book Grid if open
    const grid = document.getElementById('sticker-grid');
    if (grid) {
        grid.innerHTML = '';
        if (stickerState.collection.length === 0) {
            grid.innerHTML = '<div class="empty-state">No stickers yet! Play games to earn them!</div>';
        } else {
            stickerState.collection.forEach(s => {
                const el = document.createElement('div');
                el.className = 'sticker-item';
                el.innerHTML = `
                    <div class="sticker-icon">${s.icon}</div>
                    <div class="sticker-name">${s.name}</div>
                `;
                grid.appendChild(el);
            });
        }
    }
}

export function toggleStickerBook(show) {
    const overlay = document.getElementById('sticker-book-overlay');
    if (overlay) {
        if (show === undefined) overlay.classList.toggle('hidden');
        else if (show) overlay.classList.remove('hidden');
        else overlay.classList.add('hidden');

        const btn = document.getElementById('sticker-book-btn');
        if (btn) btn.setAttribute('aria-expanded', overlay.classList.contains('hidden') ? 'false' : 'true');

        if (!overlay.classList.contains('hidden')) {
            updateStickerUI(); // Refresh content
        }
    }
}
