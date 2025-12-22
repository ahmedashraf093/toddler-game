import { gameState } from './state.js';
import { themes } from '../data/themes.js';
import { speakText, playVictoryMusic } from './audio.js';

let modalTimeout = null;

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
    overlay.classList.remove('hidden');
    playVictoryMusic();
    speakText("Amazing! Three in a row!", "generic_amazing");

    container.innerHTML = '';

    const types = ['confetti', 'balloons', 'stars', 'emojis', 'bubbles'];
    const type = types[Math.floor(Math.random() * types.length)];

    console.log("Celebration Type:", type);

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
        for (let i = 0; i < 60; i++) {
            const b = document.createElement('div');
            b.className = 'balloon';
            b.textContent = '🎈';
            b.style.left = Math.random() * 100 + 'vw';
            b.style.animationDuration = (Math.random() * 2 + 2) + 's';
            b.style.fontSize = (Math.random() * 40 + 40) + 'px';
            container.appendChild(b);
        }
    } else if (type === 'stars') {
        for (let i = 0; i < 100; i++) {
            const s = document.createElement('div');
            s.className = 'star-anim';
            s.textContent = Math.random() > 0.5 ? '⭐️' : '🌟';
            s.style.left = Math.random() * 100 + 'vw';
            s.style.top = Math.random() * 100 + 'vh';
            s.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
            s.style.animationDelay = (Math.random() * 1) + 's';
            container.appendChild(s);
        }
    } else if (type === 'emojis') {
        const partyEmojis = ['🥳', '😎', '🦁', '🐶', '🦄', '🌈', '🎉', '🔥', '💃', '🚀'];
        for (let i = 0; i < 80; i++) {
            const e = document.createElement('div');
            e.className = 'emoji-bounce';
            e.textContent = partyEmojis[Math.floor(Math.random() * partyEmojis.length)];
            e.style.left = Math.random() * 100 + 'vw';
            e.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
            e.style.animationDelay = (Math.random() * 0.5) + 's';
            container.appendChild(e);
        }
    } else if (type === 'bubbles') {
        for (let i = 0; i < 80; i++) {
            const b = document.createElement('div');
            b.className = 'bubble';
            b.style.left = Math.random() * 100 + 'vw';
            const size = Math.random() * 60 + 20;
            b.style.width = size + 'px';
            b.style.height = size + 'px';
            b.style.animationDuration = (Math.random() * 3 + 2) + 's';
            b.style.animationDelay = (Math.random() * 1) + 's';
            container.appendChild(b);
        }
    }

    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 4500);
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
    if(standardBoard) standardBoard.style.display = 'none';
    if(mathStage) mathStage.classList.remove('active');
    if(puzzleStage) puzzleStage.classList.add('hidden');
    if(memoryStage) memoryStage.classList.remove('active');
    if(oddOneStage) oddOneStage.classList.remove('active');
    if(diffBar) diffBar.style.display = 'none';

    if (mode === 'math') {
        if(mathStage) mathStage.classList.add('active');
        if(diffBar) diffBar.style.display = 'flex';
    } else if (mode === 'memory') {
        if(memoryStage) memoryStage.classList.add('active');
        if(diffBar) diffBar.style.display = 'flex';
    } else if (mode === 'puzzle') {
        if(puzzleStage) puzzleStage.classList.remove('hidden');
    } else if (mode === 'oddoneout') {
        if(oddOneStage) oddOneStage.classList.add('active');
    } else {
        if(standardBoard) {
            standardBoard.style.display = 'flex';
            standardBoard.className = 'game-board ' + mode + '-mode';
        }
    }
}

export function populateGamesMenu(gameModes, setModeCallback) {
    const grid = document.querySelector('.games-grid');
    if (!grid) return;
    grid.innerHTML = '';

    gameModes.forEach(game => {
        const card = document.createElement('div');
        card.className = `game-select-card ${game.id === gameState.currentMode ? 'active' : ''}`;
        card.onclick = () => setModeCallback(game.id);

        // 🎨 Palette: Accessibility improvements
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Play ${game.name}`);
        card.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setModeCallback(game.id);
            }
        };

        if (themes[game.id]) {
            card.style.backgroundColor = themes[game.id].bg;
            card.style.borderColor = themes[game.id].primary;
        }

        const icon = document.createElement('div');
        icon.className = 'game-icon';
        icon.textContent = game.icon;

        const name = document.createElement('div');
        name.className = 'game-name';
        name.textContent = game.name;

        const playIcon = document.createElement('div');
        playIcon.className = 'mini-play-icon';
        playIcon.textContent = '▶️';
        playIcon.style.fontSize = '20px';
        playIcon.style.marginTop = '5px';

        card.appendChild(icon);
        card.appendChild(name);
        card.appendChild(playIcon);
        grid.appendChild(card);
    });
}
