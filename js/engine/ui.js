import { gameState } from './state.js';
import { themes } from '../data/themes.js';
import { speakText, playVictoryMusic } from './audio.js';
import { isContentUnlocked } from '../challenges/manager.js';

let modalTimeout = null;

const CELEB_CHARACTERS = {
    sun: {
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:#FFF7AD" />
                        <stop offset="100%" style="stop-color:#FFD700" />
                    </radialGradient>
                    <filter id="sunShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                        <feOffset dx="2" dy="2" />
                        <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
                        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                </defs>
                <g transform="translate(50,50)">
                    ${Array.from({ length: 12 }).map((_, i) => `
                        <path d="M -6 -35 L 0 -55 L 6 -35 Z" fill="#FF8C00" transform="rotate(${i * 30})">
                            <animateTransform attributeName="transform" type="scale" values="1;1.2;1" dur="1.5s" delay="${i * 0.1}s" repeatCount="indefinite" additive="sum" />
                        </path>
                    `).join('')}
                </g>
                <circle cx="50" cy="50" r="32" fill="url(#sunGrad)" filter="url(#sunShadow)" />
                <circle cx="35" cy="55" r="5" fill="#FFB6C1" opacity="0.6" />
                <circle cx="65" cy="55" r="5" fill="#FFB6C1" opacity="0.6" />
                <circle cx="40" cy="45" r="4" fill="#333">
                    <animate attributeName="r" values="4;3;4" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="60" cy="45" r="4" fill="#333">
                    <animate attributeName="r" values="4;3;4" dur="2s" repeatCount="indefinite" />
                </circle>
                <path d="M 38 62 Q 50 75 62 62" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
              </svg>`,
        color: '#FFD700',
        subText: 'Sunny Day!'
    },
    lion: {
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="lionFace" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:#FFCC33" />
                        <stop offset="100%" style="stop-color:#FFAC33" />
                    </radialGradient>
                    <linearGradient id="maneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#E67E22" />
                        <stop offset="100%" style="stop-color:#A04000" />
                    </linearGradient>
                </defs>
                <g transform="translate(50,50)">
                    ${Array.from({ length: 18 }).map((_, i) => `
                        <circle cx="34" cy="0" r="11" fill="url(#maneGrad)" transform="rotate(${i * 20})">
                            <animate attributeName="r" values="11;13;11" dur="1.5s" delay="${i * 0.08}s" repeatCount="indefinite" />
                        </circle>
                    `).join('')}
                </g>
                <circle cx="30" cy="35" r="9" fill="#E67E22" />
                <circle cx="70" cy="35" r="9" fill="#E67E22" />
                <circle cx="30" cy="35" r="5" fill="#FFCC33" />
                <circle cx="70" cy="35" r="5" fill="#FFCC33" />
                <circle cx="50" cy="55" r="34" fill="url(#lionFace)" stroke="#D35400" stroke-width="2" />
                <circle cx="40" cy="48" r="4" fill="#333" />
                <circle cx="60" cy="48" r="4" fill="#333" />
                <circle cx="35" cy="62" r="4" fill="#FFB6C1" opacity="0.4" />
                <circle cx="65" cy="62" r="4" fill="#FFB6C1" opacity="0.4" />
                <path d="M 46 60 L 54 60 L 50 66 Z" fill="#E74C3C" />
                <path d="M 45 70 Q 50 75 55 70" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" />
                <g>
                    <circle cx="82" cy="78" r="14" fill="#E67E22" stroke="#A04000" stroke-width="1.5" />
                    <circle cx="82" cy="78" r="10" fill="#FFCC33" opacity="0.3" />
                    <animateTransform attributeName="transform" type="rotate" from="-10 82 78" to="10 82 78" dur="0.5s" repeatCount="indefinite" />
                </g>
              </svg>`,
        color: '#FFA500',
        subText: 'Roar-some!'
    },
    star: {
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="starGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:#FFFFFF" />
                        <stop offset="30%" style="stop-color:#FFF176" />
                        <stop offset="100%" style="stop-color:#FBC02D" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                </defs>
                <path d="M50 8 L62 36 L92 36 L68 54 L77 82 L50 67 L23 82 L32 54 L8 36 L38 36 Z" fill="#FFEE58" opacity="0.4" filter="url(#glow)">
                    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="1.5s" repeatCount="indefinite" />
                </path>
                <path d="M50 12 L60 38 L88 38 L66 54 L74 80 L50 66 L26 80 L34 54 L12 38 L40 38 Z" fill="url(#starGrad)" stroke="#F9A825" stroke-width="3" stroke-linejoin="round">
                    <animateTransform attributeName="transform" type="scale" values="1;1.08;1" dur="2s" repeatCount="indefinite" transform-origin="center" />
                </path>
                <circle cx="42" cy="50" r="3.5" fill="#333" />
                <circle cx="58" cy="50" r="3.5" fill="#333" />
                <path d="M 40 62 Q 50 72 60 62" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round" />
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
    const standardStage = document.getElementById('standard-stage');
    const sentencesStage = document.getElementById('sentences-stage');
    const feedLionStage = document.getElementById('feed-lion-stage');
    const listeningStage = document.getElementById('listening-stage');
    const mathStage = document.getElementById('math-stage');
    const puzzleStage = document.getElementById('puzzle-stage');
    const memoryStage = document.getElementById('memory-stage');
    const oddOneStage = document.getElementById('odd-one-stage');

    // Reset visibility
    if (standardStage) standardStage.classList.add('hidden');
    if (sentencesStage) sentencesStage.classList.add('hidden');
    if (feedLionStage) feedLionStage.classList.add('hidden');
    if (listeningStage) listeningStage.classList.add('hidden');
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
    } else if (mode === 'sentences') {
        if (sentencesStage) sentencesStage.classList.remove('hidden');
    } else if (mode === 'feedlion') {
        if (feedLionStage) feedLionStage.classList.remove('hidden');
    } else if (mode === 'listening') {
        if (listeningStage) listeningStage.classList.remove('hidden');
    } else {
        if (standardStage) {
            standardStage.classList.remove('hidden');
            standardStage.className = 'game-board ' + mode + '-mode';
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
