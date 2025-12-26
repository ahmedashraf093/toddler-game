import { gameState } from './state.js';
import { themes } from '../data/themes.js';
import { speakText, playVictoryMusic } from './audio.js';
import { isContentUnlocked } from '../challenges/manager.js';

let modalTimeout = null;

const CELEB_CHARACTERS = {
    sun: {
        svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
                <circle cx="50" cy="50" r="30" fill="#FFD700">
                    <animate attributeName="r" values="30;32;30" dur="2s" repeatCount="indefinite" />
                </circle>
                <g transform="translate(50,50)">
                    ${Array.from({ length: 12 }).map((_, i) => `
                        <rect x="-2" y="-45" width="4" height="15" fill="#FFD700" transform="rotate(${i * 30})">
                            <animate attributeName="height" values="15;20;15" dur="1s" delay="${i * 0.1}s" repeatCount="indefinite" />
                        </rect>
                    `).join('')}
                </g>
                <circle cx="40" cy="45" r="3" fill="#333" />
                <circle cx="60" cy="45" r="3" fill="#333" />
                <path d="M 35 60 Q 50 75 65 60" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
              </svg>`,
        color: '#FFD700',
        subText: 'Sunny Day!'
    },
    lion: {
        svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
                <circle cx="50" cy="50" r="40" fill="#FFA500" stroke="#E67E22" stroke-width="2" />
                <circle cx="50" cy="50" r="30" fill="#FFCC33" />
                <circle cx="40" cy="45" r="3" fill="#333" />
                <circle cx="60" cy="45" r="3" fill="#333" />
                <path d="M 45 60 Q 50 65 55 60" fill="none" stroke="#333" stroke-width="2" />
                <g class="paw">
                    <circle cx="80" cy="70" r="10" fill="#FFA500" />
                    <animateTransform attributeName="transform" type="rotate" from="-10 80 70" to="10 80 70" dur="0.5s" repeatCount="indefinite" additive="sum" />
                </g>
              </svg>`,
        color: '#FFA500',
        subText: 'Roar-some!'
    },
    star: {
        svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
                <path d="M50 5 L63 35 L95 35 L70 55 L80 85 L50 70 L20 85 L30 55 L5 35 L37 35 Z" fill="#FFD700" stroke="#DAA520" stroke-width="2">
                    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="5s" repeatCount="indefinite" />
                    <animate attributeName="fill" values="#FFD700;#FFFACD;#FFD700" dur="2s" repeatCount="indefinite" />
                </path>
              </svg>`,
        color: '#FFD700',
        subText: 'Super Star!'
    }
};

const CELEB_MESSAGES = ["Amazing!", "Great Job!", "Fantastic!", "You Win!", "Awesome!", "Perfect!"];

export function showLoader(show = true, text = "Loading Fun...") {
    const loader = document.getElementById('loading-screen');
    if (!loader) return;
    if (show) {
        loader.classList.remove('hidden');
        const textEl = loader.querySelector('.loader-text');
        if (textEl) textEl.textContent = text;
    } else {
        loader.classList.add('hidden');
    }
}

export function updateScoreUI() {
    const scoreEl = document.getElementById('score-val');
    if (scoreEl) {
        scoreEl.textContent = gameState.totalScore;
        scoreEl.parentElement.style.transform = "scale(1.2)";
        setTimeout(() => { scoreEl.parentElement.style.transform = "scale(1)"; }, 200);
    }
}

export function launchModal(topText, emoji, word) {
    const modal = document.getElementById('reward-modal');
    if (!modal) return;

    document.getElementById('modal-top').textContent = topText;
    document.getElementById('modal-emoji').textContent = emoji;
    document.getElementById('modal-word').textContent = word;
    modal.classList.add('show');

    if (modalTimeout) clearTimeout(modalTimeout);
    modalTimeout = setTimeout(() => { modal.classList.remove('show'); }, 2500);

    modal.onclick = () => {
        if (modalTimeout) clearTimeout(modalTimeout);
        modal.classList.remove('show');
    };
}

export function showCelebration() {
    const overlay = document.getElementById('celebration-overlay');
    if (!overlay) return;
    const container = overlay.querySelector('.confetti-container');
    const charContainer = document.getElementById('celeb-character');
    const msgEl = document.getElementById('celeb-msg');
    const subMsgEl = document.getElementById('celeb-sub-msg');

    overlay.classList.remove('hidden');
    playVictoryMusic();

    const charKeys = Object.keys(CELEB_CHARACTERS);
    const randomCharKey = charKeys[Math.floor(Math.random() * charKeys.length)];
    const charData = CELEB_CHARACTERS[randomCharKey];

    const randomMsg = CELEB_MESSAGES[Math.floor(Math.random() * CELEB_MESSAGES.length)];

    if (charContainer) charContainer.innerHTML = charData.svg;
    if (msgEl) {
        msgEl.textContent = randomMsg;
        msgEl.style.color = charData.color;
    }
    if (subMsgEl) subMsgEl.textContent = charData.subText;

    speakText(`${randomMsg} ${charData.subText}`, "generic_amazing");

    container.innerHTML = '';
    const types = ['confetti', 'balloons', 'stars', 'emojis', 'bubbles'];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === 'confetti') {
        const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#FFA500', '#800080'];
        for (let i = 0; i < 150; i++) {
            const c = document.createElement('div');
            c.className = 'confetti';
            c.style.left = Math.random() * 100 + 'vw';
            c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            c.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
            c.style.animationDelay = (Math.random() * 0.5) + 's';
            container.appendChild(c);
        }
    } else if (type === 'balloons') {
        for (let i = 0; i < 40; i++) {
            const b = document.createElement('div');
            b.className = 'balloon';
            b.textContent = ['🎈', '🎊', '🎁', '🎈'][Math.floor(Math.random() * 4)];
            b.style.left = Math.random() * 100 + 'vw';
            b.style.animationDuration = (Math.random() * 2 + 3) + 's';
            b.style.fontSize = (Math.random() * 40 + 40) + 'px';
            container.appendChild(b);
        }
    } else if (type === 'stars') {
        for (let i = 0; i < 80; i++) {
            const s = document.createElement('div');
            s.className = 'star-anim';
            s.textContent = Math.random() > 0.5 ? '⭐️' : '🌟';
            s.style.left = Math.random() * 100 + 'vw';
            s.style.top = Math.random() * 100 + 'vh';
            s.style.animationDuration = (Math.random() * 1 + 1) + 's';
            s.style.animationDelay = (Math.random() * 1) + 's';
            container.appendChild(s);
        }
    } else if (type === 'emojis') {
        const partyEmojis = ['🥳', '😎', '🦁', '🐶', '🦄', '🌈', '🎉', '🔥', '💃', '🚀'];
        for (let i = 0; i < 60; i++) {
            const e = document.createElement('div');
            e.className = 'emoji-bounce';
            e.textContent = partyEmojis[Math.floor(Math.random() * partyEmojis.length)];
            e.style.left = Math.random() * 100 + 'vw';
            e.style.animationDuration = (Math.random() * 2 + 2) + 's';
            e.style.animationDelay = (Math.random() * 0.5) + 's';
            container.appendChild(e);
        }
    } else if (type === 'bubbles') {
        for (let i = 0; i < 60; i++) {
            const b = document.createElement('div');
            b.className = 'bubble';
            b.style.left = Math.random() * 100 + 'vw';
            const size = Math.random() * 60 + 20;
            b.style.width = size + 'px';
            b.style.height = size + 'px';
            b.style.animationDuration = (Math.random() * 3 + 3) + 's';
            b.style.animationDelay = (Math.random() * 1) + 's';
            container.appendChild(b);
        }
    }

    // Add a second layer of celebration (small confetti always)
    if (type !== 'confetti') {
        for (let i = 0; i < 50; i++) {
            const c = document.createElement('div');
            c.className = 'confetti';
            c.style.left = Math.random() * 100 + 'vw';
            c.style.backgroundColor = ['#fff', '#ffd700', '#ff5252'][Math.floor(Math.random() * 3)];
            c.style.width = '8px';
            c.style.height = '8px';
            c.style.animationDuration = (Math.random() * 1 + 2) + 's';
            container.appendChild(c);
        }
    }

    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 5000);
}

export function toggleMenu(forceHide = false) {
    const overlay = document.getElementById('games-menu-overlay');
    if (forceHide) {
        overlay.classList.add('hidden');
    } else {
        overlay.classList.toggle('hidden');
    }
}

export function setTheme(mode) {
    const theme = themes[mode];
    if (theme) {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--bg-color', theme.bg);
        root.style.setProperty('--dot-color', theme.dots);
    }

    document.body.className = `${mode}-mode`;

    // UI visibility management
    const diffBar = document.getElementById('difficulty-bar');
    const standardBoard = document.getElementById('game-board');
    const mathStage = document.getElementById('math-stage');
    const puzzleStage = document.getElementById('puzzle-stage');
    const memoryStage = document.getElementById('memory-stage');
    const oddOneStage = document.getElementById('odd-one-stage');

    // Reset visibility
    if (standardBoard) standardBoard.style.display = 'none';
    if (mathStage) mathStage.classList.remove('active');
    if (puzzleStage) puzzleStage.classList.add('hidden');
    if (memoryStage) memoryStage.classList.remove('active');
    if (oddOneStage) oddOneStage.classList.remove('active');
    if (diffBar) diffBar.style.display = 'none';

    if (mode === 'math') {
        if (mathStage) mathStage.classList.add('active');
        if (diffBar) diffBar.style.display = 'flex';
    } else if (mode === 'memory') {
        if (memoryStage) memoryStage.classList.add('active');
        if (diffBar) diffBar.style.display = 'flex';
    } else if (mode === 'puzzle') {
        if (puzzleStage) puzzleStage.classList.remove('hidden');
    } else if (mode === 'oddoneout') {
        if (oddOneStage) oddOneStage.classList.add('active');
    } else {
        if (standardBoard) {
            standardBoard.style.display = 'flex';
            standardBoard.className = 'game-board ' + mode + '-mode';
        }
    }
}

export function populateGamesMenu(gameModes, setModeCallback) {
    const grid = document.querySelector('.games-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const categoryNames = {
        'world': 'Earth & Nature 🌍',
        'basics': 'Basics 👶',
        'learning': 'Learning 📚',
        'logic': 'Logic & Puzzles 🧩'
    };

    let currentCategory = null;

    gameModes.forEach(game => {
        // Insert separator if category changes
        if (game.category !== currentCategory) {
            currentCategory = game.category;
            const sep = document.createElement('div');
            sep.className = 'game-category-separator';
            sep.textContent = categoryNames[currentCategory] || 'Games';
            sep.style.cssText = "width: 100%; font-size: 1.5rem; font-weight: bold; color: #555; margin: 20px 0 10px; text-align: left; padding-left: 10px; border-bottom: 2px dashed #ddd;";
            grid.appendChild(sep);
        }

        let isLocked = false;
        if (game.id === 'feedlion' && !isContentUnlocked()) {
            isLocked = true;
        }

        const card = document.createElement('div');
        card.className = `game-select-card ${game.id === gameState.currentMode ? 'active' : ''} ${isLocked ? 'locked' : ''}`;

        if (isLocked) {
            card.onclick = () => {
                launchModal("Locked!", "🔒", "Complete a Challenge!");
                speakText("Complete a daily challenge to unlock!", "generic_try_again");
            };
            card.setAttribute('aria-label', `Game Locked: ${game.name}`);

            // Add visible reward banner
            const banner = document.createElement('div');
            banner.textContent = 'Reward Game 🎁';
            banner.style.cssText = `
                position: absolute;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: #ff5252;
                color: white;
                font-size: 12px;
                padding: 4px 8px;
                border-radius: 10px;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                font-weight: bold;
            `;
            card.appendChild(banner);
        } else {
            card.onclick = () => setModeCallback(game.id);
            card.setAttribute('aria-label', `Play ${game.name}`);
        }

        // 🎨 Palette: Accessibility improvements
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (isLocked) {
                    launchModal("Locked!", "🔒", "Complete a Challenge!");
                    speakText("Complete a daily challenge to unlock!", "generic_try_again");
                } else {
                    setModeCallback(game.id);
                }
            }
        };

        if (themes[game.id]) {
            card.style.backgroundColor = themes[game.id].bg;
            card.style.borderColor = themes[game.id].primary;
        }

        const icon = document.createElement('div');
        icon.className = 'game-icon';
        icon.textContent = isLocked ? '🔒' : game.icon;

        const name = document.createElement('div');
        name.className = 'game-name';
        name.textContent = game.name;

        const playIcon = document.createElement('div');
        playIcon.className = 'mini-play-icon';
        playIcon.textContent = isLocked ? '🚫' : '▶️';
        playIcon.style.fontSize = '20px';
        playIcon.style.marginTop = '5px';

        card.appendChild(icon);
        card.appendChild(name);
        card.appendChild(playIcon);
        grid.appendChild(card);
    });
}
