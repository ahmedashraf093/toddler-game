import { gameState } from './state.js';
import { themes } from '../data/themes.js';
import { speakText, playVictoryMusic } from './audio.js';
import { isContentUnlocked } from '../challenges/manager.js';

let modalTimeout = null;

const CELEB_CHARACTERS = {
    sun: {
        svg: `<svg viewBox="0 0 300 300" width="100%" height="100%">
                <defs>
                    <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                        <stop offset="80%" style="stop-color:#FFA500;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#FF8C00;stop-opacity:1" />
                    </radialGradient>
                    <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <style>
                        .sun-rays { animation: spin 10s linear infinite; transform-origin: center; }
                        .sun-face { animation: bob 2s ease-in-out infinite; transform-origin: center; }
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
                    </style>
                </defs>
                <g class="sun-rays">
                    ${Array.from({ length: 12 }).map((_, i) => `
                        <path d="M150,50 L165,100 L135,100 Z" fill="#FF8C00" transform="rotate(${i * 30}, 150, 150)" />
                    `).join('')}
                </g>
                <circle cx="150" cy="150" r="70" fill="url(#sunGrad)" filter="url(#sunGlow)" />
                <g class="sun-face">
                    <!-- Eyes with Sunglasses -->
                    <path d="M110,140 Q150,130 190,140 L185,160 Q150,170 115,160 Z" fill="#333" />
                    <line x1="110" y1="140" x2="190" y2="140" stroke="#333" stroke-width="2" />
                    <!-- Smile -->
                    <path d="M130,170 Q150,190 170,170" fill="none" stroke="#8B4513" stroke-width="4" stroke-linecap="round" />
                    <!-- Cheeks -->
                    <circle cx="110" cy="165" r="8" fill="#FF6347" opacity="0.4" />
                    <circle cx="190" cy="165" r="8" fill="#FF6347" opacity="0.4" />
                </g>
              </svg>`,
        color: '#FFD700',
        subText: 'Sunny Day!'
    },
    lion: {
        svg: `<svg viewBox="0 0 300 300" width="100%" height="100%" class="lion-svg-root">
        <defs>
            <linearGradient id="maneGradCeleb" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#D2691E;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#8B4513;stop-opacity:1" />
            </linearGradient>
            <radialGradient id="faceGradCeleb" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" />
            </radialGradient>
            <filter id="shadowCeleb" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
            </filter>
            <style>
                .celeb-head { animation: head-bounce 0.6s ease-in-out infinite; transform-origin: center bottom; }
                .celeb-mane { animation: mane-sway 2s ease-in-out infinite; transform-origin: center; }
                @keyframes head-bounce { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-5px) scale(1.02); } }
                @keyframes mane-sway { 0%, 100% { transform: rotate(-2deg) scale(1); } 50% { transform: rotate(2deg) scale(1.05); } }
            </style>
        </defs>
        <g class="celeb-head">
            <g class="celeb-mane" filter="url(#shadowCeleb)">
                <path d="M150,20 Q180,20 200,50 Q230,40 250,70 Q270,90 260,120 Q290,140 280,170 Q290,210 260,240 Q240,270 200,280 Q180,300 150,280 Q120,300 100,280 Q60,270 40,240 Q10,210 20,170 Q10,140 40,120 Q30,90 50,70 Q70,40 100,50 Q120,20 150,20 Z" fill="url(#maneGradCeleb)" />
            </g>
            <circle cx="80" cy="80" r="25" fill="#DAA520" />
            <circle cx="80" cy="80" r="15" fill="#6D4C41" />
            <circle cx="220" cy="80" r="25" fill="#DAA520" />
            <circle cx="220" cy="80" r="15" fill="#6D4C41" />
            <circle cx="150" cy="160" r="90" fill="url(#faceGradCeleb)" />
            <ellipse cx="150" cy="190" rx="45" ry="35" fill="#FFF8DC" />
            <!-- Happy Eyes -->
            <g stroke="#3E2723" stroke-width="4" fill="none" stroke-linecap="round">
                <path d="M100,145 Q115,135 130,145" />
                <path d="M170,145 Q185,135 200,145" />
            </g>
            <path d="M135,175 Q150,165 165,175 L158,188 Q150,195 142,188 Z" fill="#3E2723" />
            <g stroke="#3E2723" stroke-width="2" opacity="0.4">
                <path d="M90,185 Q70,182 50,175" fill="none" />
                <path d="M210,185 Q230,182 250,175" fill="none" />
            </g>
            <path d="M130,205 Q150,225 170,205" stroke="#3E2723" stroke-width="3" fill="none" />
            <circle cx="100" cy="170" r="10" fill="#FFAB91" opacity="0.6" />
            <circle cx="200" cy="170" r="10" fill="#FFAB91" opacity="0.6" />
        </g>
    </svg>`,
        color: '#FFA500',
        subText: 'Roar-some!'
    },
    star: {
        svg: `<svg viewBox="0 0 300 300" width="100%" height="100%">
                <defs>
                    <linearGradient id="starGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" />
                    </linearGradient>
                    <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                        <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#FFD700" flood-opacity="0.6" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <style>
                        .star-body { animation: pulse-rotate 3s ease-in-out infinite; transform-origin: center; }
                        @keyframes pulse-rotate { 
                            0% { transform: scale(1) rotate(0deg); } 
                            50% { transform: scale(1.1) rotate(5deg); } 
                            100% { transform: scale(1) rotate(0deg); } 
                        }
                    </style>
                </defs>
                <g class="star-body" filter="url(#starGlow)">
                    <path d="M150,20 L185,110 L280,110 L205,170 L230,260 L150,210 L70,260 L95,170 L20,110 L115,110 Z" fill="url(#starGrad)" stroke="#DAA520" stroke-width="3" stroke-linejoin="round" />
                    <!-- Face -->
                    <g transform="translate(150, 160)">
                        <circle cx="-35" cy="-10" r="8" fill="#333" />
                        <circle cx="35" cy="-10" r="8" fill="#333" />
                        <circle cx="-33" cy="-12" r="3" fill="#fff" />
                        <circle cx="37" cy="-12" r="3" fill="#fff" />
                        <path d="M-20,15 Q0,30 20,15" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
                        <!-- Cheeks -->
                        <circle cx="-45" cy="5" r="8" fill="#FF6347" opacity="0.4" />
                        <circle cx="45" cy="5" r="8" fill="#FF6347" opacity="0.4" />
                    </g>
                </g>
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

    const topEl = document.getElementById('modal-top');
    if (topText && typeof topText === 'string' && topText.trim().startsWith('<svg')) {
        topEl.innerHTML = topText;
    } else {
        topEl.textContent = topText;
    }

    const emojiEl = document.getElementById('modal-emoji');
    if (emoji && emoji.trim().startsWith('<svg')) {
        emojiEl.innerHTML = emoji;
    } else {
        emojiEl.textContent = emoji;
    }
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
            card.style.backgroundColor = '#ffffff'; // Force white background
            card.style.borderColor = themes[game.id].primary; // Keep theme border
            // Optional: Add a subtle shadow or specific styling if white is too plain,
            // but user asked for "white background".
        }

        const icon = document.createElement('div');
        icon.className = 'game-icon';

        if (!isLocked && game.icon.includes('.')) {
            // It's an image path (e.g. .png)
            icon.innerHTML = `<img src="${game.icon}" alt="${game.name}" class="game-icon-img" style="width: 100%; height: 100%; object-fit: contain; border-radius: 10px;">`;
            // Remove default font-size padding if needed via CSS, but inline style helps
        } else {
            icon.textContent = isLocked ? '🔒' : game.icon;
        }

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
