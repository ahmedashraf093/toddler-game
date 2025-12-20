// --- Start Game Logic ---
function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    speakText("Welcome! Let's play!");
}

// --- Configuration & Data ---
const themes = {
    shadow: { primary: '#4facfe', bg: '#e6f7ff', dots: '#d0efff' },
    letter: { primary: '#ff9a9e', bg: '#fff0f0', dots: '#ffe0e0' },
    job: { primary: '#f6d365', bg: '#fffbe6', dots: '#fff0b3' },
    number: { primary: '#c084fc', bg: '#f3e8ff', dots: '#e9d5ff' },
    math: { primary: '#84fab0', bg: '#f0fff4', dots: '#d1fae5' },
    feed: { primary: '#ffc107', bg: '#fffde7', dots: '#fff9c4' },
    shape: { primary: '#6c5ce7', bg: '#a29bfe', dots: '#dfe6e9' },
    weather: { primary: '#00cec9', bg: '#e0fbfb', dots: '#b2ebf2' },
    nature: { primary: '#00b894', bg: '#e6fffa', dots: '#b3f5e1' }
};

const shadowLibrary = [
    '🐶', '🐱', '🦁', '🐮', '🐸', '🐵', '🐧', '🐘', '🦒', '🦓', '🦋',
    '🚗', '🚌', '🚑', '🚒', '🚓', '🚜', '🚂', '✈️', '🚀', '🚁',
    '🍎', '🍌', '🍇', '🍓', '🍦', '🍪', '🍕', '⚽', '🧸', '🎈', '🖍️'
];

const letterExamples = {
    'A': { w: 'Apple', e: '🍎' }, 'B': { w: 'Ball', e: '⚽' }, 'C': { w: 'Cat', e: '🐱' },
    'D': { w: 'Dog', e: '🐶' }, 'E': { w: 'Elephant', e: '🐘' }, 'F': { w: 'Fish', e: '🐟' },
    'G': { w: 'Grapes', e: '🍇' }, 'H': { w: 'House', e: '🏠' }, 'I': { w: 'Ice Cream', e: '🍦' },
    'J': { w: 'Juice', e: '🧃' }, 'K': { w: 'Kite', e: '🪁' }, 'L': { w: 'Lion', e: '🦁' },
    'M': { w: 'Monkey', e: '🐵' }, 'N': { w: 'Nose', e: '👃' }, 'O': { w: 'Orange', e: '🍊' },
    'P': { w: 'Pizza', e: '🍕' }, 'Q': { w: 'Queen', e: '👸' }, 'R': { w: 'Rocket', e: '🚀' },
    'S': { w: 'Sun', e: '☀️' }, 'T': { w: 'Tree', e: '🌲' }, 'U': { w: 'Umbrella', e: '☂️' },
    'V': { w: 'Violin', e: '🎻' }, 'W': { w: 'Water', e: '💧' }, 'X': { w: 'Xylophone', e: '🎼' },
    'Y': { w: 'Yellow', e: '💛' }, 'Z': { w: 'Zebra', e: '🦓' }
};

const jobLibrary = [
    { id: 'police', person: '👮', tool: '🚓', name: 'Police', toolName: 'Police Car' },
    { id: 'fire', person: '👨‍🚒', tool: '🚒', name: 'Fireman', toolName: 'Fire Truck' },
    { id: 'doctor', person: '👨‍⚕️', tool: '🚑', name: 'Doctor', toolName: 'Ambulance' },
    { id: 'astronaut', person: '👨‍🚀', tool: '🚀', name: 'Astronaut', toolName: 'Rocket' },
    { id: 'chef', person: '👨‍🍳', tool: '🍳', name: 'Chef', toolName: 'Pan' },
    { id: 'farmer', person: '👨‍🌾', tool: '🚜', name: 'Farmer', toolName: 'Tractor' },
    { id: 'artist', person: '👨‍🎨', tool: '🎨', name: 'Artist', toolName: 'Paint' },
    { id: 'mechanic', person: '👨‍🔧', tool: '🔧', name: 'Mechanic', toolName: 'Wrench' },
    { id: 'teacher', person: '👩‍🏫', tool: '📚', name: 'Teacher', toolName: 'Books' },
    { id: 'pilot', person: '👨‍✈️', tool: '✈️', name: 'Pilot', toolName: 'Airplane' },
    { id: 'builder', person: '👷', tool: '🔨', name: 'Builder', toolName: 'Hammer' },
    { id: 'scientist', person: '👨‍🔬', tool: '🔬', name: 'Scientist', toolName: 'Microscope' }
];

const feedLibrary = [
    { id: 'rabbit', animal: '🐰', food: '🥕', foodName: 'Carrot', animalName: 'Rabbit' },
    { id: 'monkey', animal: '🐵', food: '🍌', foodName: 'Banana', animalName: 'Monkey' },
    { id: 'dog', animal: '🐶', food: '🦴', foodName: 'Bone', animalName: 'Dog' },
    { id: 'mouse', animal: '🐭', food: '🧀', foodName: 'Cheese', animalName: 'Mouse' },
    { id: 'cat', animal: '🐱', food: '🐟', foodName: 'Fish', animalName: 'Cat' },
    { id: 'lion', animal: '🦁', food: '🥩', foodName: 'Meat', animalName: 'Lion' },
    { id: 'frog', animal: '🐸', food: '🪰', foodName: 'Fly', animalName: 'Frog' },
    { id: 'squirrel', animal: '🐿️', food: '🌰', foodName: 'Nut', animalName: 'Squirrel' }
];

const shapeLibrary = [
    { id: 'triangle', shape: '🔺', obj: '🍕', shapeName: 'Triangle', objName: 'Pizza Slice' },
    { id: 'circle', shape: '🔴', obj: '⏰', shapeName: 'Circle', objName: 'Clock' },
    { id: 'square', shape: '🟦', obj: '🎁', shapeName: 'Square', objName: 'Gift' },
    { id: 'rectangle', shape: '🟩', obj: '🚪', shapeName: 'Rectangle', objName: 'Door' },

    { id: 'oval', shape: '🥚', obj: '🥑', shapeName: 'Oval', objName: 'Avocado' },
    { id: 'diamond', shape: '🔶', obj: '🪁', shapeName: 'Diamond', objName: 'Kite' }
];

const weatherLibrary = [
    { id: 'sun', weather: '☀️', obj: '😎', weatherName: 'Sunny', objName: 'Sunglasses', text: 'Wear your Sunglasses!' },
    { id: 'snow', weather: '❄️', obj: '🧣', weatherName: 'Snowy', objName: 'Scarf', text: 'Wear a Scarf!' },
    { id: 'rain', weather: '🌧️', obj: '☂️', weatherName: 'Rainy', objName: 'Umbrella', text: 'Use an Umbrella!' },
    { id: 'cold', weather: '🥶', obj: '🧤', weatherName: 'Cold', objName: 'Gloves', text: 'Wear Gloves!' }
];

const natureLibrary = [
    { id: 'moon', nature: '🌙', obj: '🦉', natureName: 'Night', objName: 'Owl', text: 'The Owl wakes up!' },
    { id: 'wind', nature: '🌬️', obj: '🍂', natureName: 'Windy', objName: 'Leaf', text: 'Leaves fall down!' },
    { id: 'ocean', nature: '🌊', obj: '🐟', natureName: 'Ocean', objName: 'Fish', text: 'Fish swim in water!' },
    { id: 'flower', nature: '🌱', obj: '🐝', natureName: 'Spring', objName: 'Bee', text: 'Bees love flowers!' },
    { id: 'caterpillar', nature: '🐛', obj: '🦋', natureName: 'Caterpillar', objName: 'Butterfly', text: 'It becomes a Butterfly!' }
];

const objectPool = [
    { e: '☀️', n: 'Suns' }, { e: '👟', n: 'Shoes' }, { e: '🍎', n: 'Apples' },
    { e: '🚗', n: 'Cars' }, { e: '⭐️', n: 'Stars' }, { e: '🦋', n: 'Butterflies' },
    { e: '🐞', n: 'Ladybugs' }, { e: '🍪', n: 'Cookies' }, { e: '🎈', n: 'Balloons' },
    { e: '⚽', n: 'Balls' }, { e: '🐶', n: 'Dogs' }, { e: '🍦', n: 'Ice Cream' }
];

let currentMode = 'shadow';
let mathDifficulty = 'easy';
let correctCount = 0;
let totalScore = 0;
const roundSize = 5;
let hintTimer = null;

let mathQuestions = [];
let currentMathIndex = 0;

const history = { shadow: [], letter: [], job: [], number: [], feed: [], shape: [], weather: [], nature: [] };

function setDifficulty(level, btn) {
    mathDifficulty = level;
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (currentMode === 'math') initRound();
}

function setMode(mode, btnEl) {
    currentMode = mode;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    const diffBar = document.getElementById('difficulty-bar');
    const standardBoard = document.getElementById('game-board');
    const mathStage = document.getElementById('math-stage');

    if (mode === 'math') {
        standardBoard.classList.add('hidden');
        mathStage.classList.add('active');
        diffBar.style.display = 'flex';
    } else {
        mathStage.classList.remove('active');
        standardBoard.classList.remove('hidden');
        standardBoard.className = 'game-board ' + mode + '-mode';
        diffBar.style.display = 'none';
    }

    const theme = themes[mode];
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--bg-color', theme.bg);
    root.style.setProperty('--dot-color', theme.dots);

    initRound();
}

function smartSelect(fullArray, modeKey) {
    const lastItems = history[modeKey];
    let available = fullArray.filter(item => {
        const id = (typeof item === 'string') ? item : (item.id || Object.keys(item)[0]);
        return !lastItems.includes(id);
    });
    if (available.length < roundSize) available = [...fullArray];
    available.sort(() => Math.random() - 0.5);
    const selected = available.slice(0, roundSize);
    history[modeKey] = selected.map(item => (typeof item === 'string' ? item : item.id));
    return selected;
}

function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

function initRound() {
    document.getElementById('reset-btn').style.display = 'none';
    correctCount = 0;
    if (currentMode === 'math') initMathGame();
    else initStandardGame();
}

function initStandardGame() {
    const sourceCol = document.getElementById('source-col');
    const targetCol = document.getElementById('target-col');
    sourceCol.innerHTML = ''; targetCol.innerHTML = '';

    let roundItems = [];

    if (currentMode === 'shadow') {
        const selected = smartSelect([...shadowLibrary], 'shadow');
        roundItems = selected.map(i => ({ id: i, src: i, tgt: i, type: 'simple' }));
    }
    else if (currentMode === 'letter') {
        const allKeys = Object.keys(letterExamples);
        const selectedKeys = smartSelect(allKeys, 'letter');
        roundItems = selectedKeys.map(k => ({ id: k, src: k, tgt: k.toLowerCase(), type: 'simple' }));
    }
    else if (currentMode === 'job') {
        const selected = smartSelect([...jobLibrary], 'job');
        roundItems = selected.map(j => ({ id: j.id, src: j.person, tgt: j.tool, type: 'simple' }));
    }
    else if (currentMode === 'number') {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const selectedNums = smartSelect(nums.map(String), 'number');
        roundItems = selectedNums.map(nStr => {
            const count = parseInt(nStr);
            const randomObj = objectPool[Math.floor(Math.random() * objectPool.length)];
            let gridHtml = `<div class="number-grid">`;
            for (let i = 0; i < count; i++) gridHtml += `<span class="mini-emoji">${randomObj.e}</span>`;
            gridHtml += `</div>`;
            return { id: nStr, src: gridHtml, tgt: nStr, type: 'html', emoji: randomObj.e, name: randomObj.n };
        });
    }
    else if (currentMode === 'feed') {
        const selected = smartSelect([...feedLibrary], 'feed');
        roundItems = selected.map(f => ({ id: f.id, src: f.food, tgt: f.animal, type: 'simple', foodName: f.foodName, animalName: f.animalName }));
    }
    else if (currentMode === 'shape') {
        const selected = smartSelect([...shapeLibrary], 'shape');
        roundItems = selected.map(s => ({ id: s.id, src: s.shape, tgt: s.obj, type: 'simple', shapeName: s.shapeName, objName: s.objName }));
    }
    else if (currentMode === 'weather') {
        const selected = smartSelect([...weatherLibrary], 'weather');
        roundItems = selected.map(w => ({ id: w.id, src: w.weather, tgt: w.obj, type: 'simple', weatherName: w.weatherName, objName: w.objName, text: w.text }));
    }
    else if (currentMode === 'nature') {
        const selected = smartSelect([...natureLibrary], 'nature');
        roundItems = selected.map(n => ({ id: n.id, src: n.nature, tgt: n.obj, type: 'simple', natureName: n.natureName, objName: n.objName, text: n.text }));
    }

    const draggables = shuffle([...roundItems]);
    const targets = shuffle([...roundItems]);
    draggables.forEach(obj => createStandardItem(obj.src, obj.id, sourceCol, true, obj.type, obj));
    targets.forEach(obj => createStandardItem(obj.tgt, obj.id, targetCol, false, obj.type, obj));
}

function createStandardItem(content, id, container, isDrag, type, dataObj) {
    const el = document.createElement('div');
    el.className = `item ${isDrag ? 'draggable' : 'droppable'}`;
    if (isDrag) {
        if (type === 'html') el.innerHTML = content; else el.textContent = content;
        el.draggable = true;
        el.id = 'drag-' + id + '-' + Math.random().toString(36).substr(2, 5);
        el.dataset.val = id;
        addDragEvents(el);
    } else {
        el.dataset.match = id;
        const c = document.createElement('div');
        c.className = 'content';
        if (type === 'html') c.innerHTML = content; else c.textContent = content;
        el.appendChild(c);
        el.addEventListener('dragover', e => e.preventDefault());
        el.addEventListener('drop', drop);
        if (dataObj) { el.dataset.emoji = dataObj.emoji; el.dataset.name = dataObj.name; }
    }
    container.appendChild(el);
}

function initMathGame() {
    currentMathIndex = 0;
    mathQuestions = [];
    for (let i = 0; i < roundSize; i++) {
        let A, B, op, ans;
        if (mathDifficulty === 'easy') {
            ans = Math.floor(Math.random() * 4) + 2; A = Math.floor(Math.random() * (ans - 1)) + 1; B = ans - A; op = '+';
        }
        else if (mathDifficulty === 'medium') {
            ans = Math.floor(Math.random() * 8) + 2; A = Math.floor(Math.random() * (ans - 1)) + 1; B = ans - A; op = '+';
        }
        else {
            if (Math.random() > 0.5) {
                ans = Math.floor(Math.random() * 8) + 2; A = Math.floor(Math.random() * (ans - 1)) + 1; B = ans - A; op = '+';
            } else {
                ans = Math.floor(Math.random() * 9) + 1; A = Math.floor(Math.random() * (9 - ans)) + ans;
                if (A === ans) A = ans + 1; if (A > 9) A = 9; B = A - ans; op = '-';
            }
        }
        mathQuestions.push({ A, B, op, ans });
    }
    loadMathQuestion();
}

function loadMathQuestion() {
    if (currentMathIndex >= mathQuestions.length) {
        document.getElementById('reset-btn').style.display = 'inline-block';
        speakText("All done! Good job!");
        return;
    }
    const q = mathQuestions[currentMathIndex];
    const container = document.getElementById('math-eq-container');
    const target = document.getElementById('math-target-zone');
    const optionsRow = document.getElementById('math-options-row');
    const randomObj = objectPool[Math.floor(Math.random() * objectPool.length)];
    const emoji = randomObj.e;
    const buildGroup = (n) => {
        let s = '<div class="emoji-group">';
        for (let i = 0; i < n; i++) s += `<span class="math-emoji">${emoji}</span>`;
        s += '</div>';
        return s;
    };
    container.innerHTML = `${buildGroup(q.A)}<div class="math-operator">${q.op === '+' ? '➕' : '➖'}</div>${buildGroup(q.B)}`;
    target.textContent = '?';
    target.className = 'math-target droppable';
    target.dataset.match = q.ans.toString();
    const opWord = q.op === '+' ? 'plus' : 'minus';
    target.dataset.tts = `${q.A} ${opWord} ${q.B} equals ${q.ans}`;
    target.dataset.emoji = emoji;
    target.addEventListener('dragover', e => e.preventDefault());
    target.addEventListener('drop', dropMath);
    optionsRow.innerHTML = '';
    let opts = [q.ans];
    while (opts.length < 3) { let r = Math.floor(Math.random() * 9) + 1; if (!opts.includes(r)) opts.push(r); }
    shuffle(opts);
    opts.forEach(val => {
        const el = document.createElement('div');
        el.className = 'item math-option draggable';
        el.textContent = val;
        el.draggable = true;
        el.id = 'math-opt-' + val;
        el.dataset.val = val;
        addDragEvents(el);
        optionsRow.appendChild(el);
    });
}

function addDragEvents(el) {
    el.addEventListener('dragstart', dragStart);
    el.addEventListener('dragend', dragEnd);
    el.addEventListener('touchstart', touchStart, { passive: false });
    el.addEventListener('touchmove', touchMove, { passive: false });
    el.addEventListener('touchend', touchEnd);
}

let draggedVal = null, draggedElId = null, activeTouchEl = null;

function startHintTimer(val) {
    clearHint(); hintTimer = setTimeout(() => { showHint(val); }, 5000);
}

function showHint(val) {
    const targets = document.querySelectorAll('.droppable');
    targets.forEach(t => {
        if (currentMode === 'math') { if (t.id === 'math-target-zone' && t.dataset.match === val) t.classList.add('hint-active'); }
        else { if (t.dataset.match === val && !t.classList.contains('matched')) t.classList.add('hint-active'); }
    });
}
function clearHint() {
    if (hintTimer) clearTimeout(hintTimer);
    document.querySelectorAll('.hint-active').forEach(el => el.classList.remove('hint-active'));
}

function dragStart(e) { draggedVal = e.target.dataset.val; draggedElId = e.target.id; startHintTimer(draggedVal); }
function dragEnd(e) { clearHint(); }
function drop(e) { e.preventDefault(); clearHint(); const box = e.target.closest('.droppable'); if (box && currentMode !== 'math') checkStandardMatch(box, draggedVal, draggedElId); }

function dropMath(e) {
    e.preventDefault(); clearHint();
    const box = e.target.closest('.droppable');
    if (box && box.dataset.match === draggedVal) {
        box.classList.add('matched'); box.textContent = draggedVal;
        totalScore += 10; updateScoreUI();
        speakText("Correct! " + box.dataset.tts);
        launchModal(draggedVal, box.dataset.emoji, "Correct!");
        setTimeout(() => { currentMathIndex++; loadMathQuestion(); }, 2500);
    }
}

function touchStart(e) {
    e.preventDefault(); const actualItem = e.target.closest('.draggable'); if (!actualItem) return;
    activeTouchEl = actualItem; draggedVal = activeTouchEl.dataset.val; draggedElId = activeTouchEl.id;
    startHintTimer(draggedVal);
    const spacer = document.createElement('div');
    spacer.id = 'drag-spacer';
    spacer.style.width = activeTouchEl.offsetWidth + 'px';
    spacer.style.height = activeTouchEl.offsetHeight + 'px';
    spacer.style.display = 'block';
    activeTouchEl.parentNode.insertBefore(spacer, activeTouchEl);
    const t = e.touches[0]; activeTouchEl.style.position = 'fixed'; activeTouchEl.style.zIndex = '1000';
    activeTouchEl.style.width = spacer.style.width; activeTouchEl.style.left = (t.clientX - 50) + 'px'; activeTouchEl.style.top = (t.clientY - 50) + 'px';
}

function touchMove(e) { e.preventDefault(); if (!activeTouchEl) return; const t = e.touches[0]; activeTouchEl.style.left = (t.clientX - 50) + 'px'; activeTouchEl.style.top = (t.clientY - 50) + 'px'; }

function touchEnd(e) {
    if (!activeTouchEl) return; clearHint();
    const spacer = document.getElementById('drag-spacer'); if (spacer) spacer.remove();
    const t = e.changedTouches[0]; activeTouchEl.style.display = 'none';
    const below = document.elementFromPoint(t.clientX, t.clientY); activeTouchEl.style.display = 'flex';
    activeTouchEl.style.position = 'static'; activeTouchEl.style.zIndex = ''; activeTouchEl.style.width = '';
    const box = below ? below.closest('.droppable') : null;
    if (box) {
        if (currentMode === 'math') {
            if (box.id === 'math-target-zone' && box.dataset.match === draggedVal) {
                box.classList.add('matched'); box.textContent = draggedVal;
                totalScore += 10; updateScoreUI();
                speakText("Correct! " + box.dataset.tts);
                launchModal(draggedVal, box.dataset.emoji, "Correct!");
                setTimeout(() => { currentMathIndex++; loadMathQuestion(); }, 2500);
            }
        } else { checkStandardMatch(box, draggedVal, draggedElId); }
    }
    activeTouchEl = null;
}

function checkStandardMatch(targetBox, val, originalId) {
    if (targetBox.classList.contains('matched') || targetBox.dataset.match !== val) return;
    targetBox.classList.add('matched');
    const source = document.getElementById(originalId); if (source) source.style.visibility = 'hidden';
    totalScore += 10; updateScoreUI();
    if (currentMode === 'letter') showLetterReward(val);
    else if (currentMode === 'job') showJobReward(val);
    else if (currentMode === 'feed') showFeedReward(val);
    else if (currentMode === 'shape') showShapeReward(val);
    else if (currentMode === 'weather') showWeatherReward(val);
    else if (currentMode === 'nature') showNatureReward(val);
    else if (currentMode === 'number') { launchModal(val, targetBox.dataset.emoji, targetBox.dataset.name); speakText(`${val}... ${targetBox.dataset.name}`); }
    else speakText("Yeah!");
    correctCount++;
    if (correctCount === roundSize) {
        document.getElementById('reset-btn').style.display = 'inline-block';
        setTimeout(() => speakText("Good Job!"), 1000);
    }
}

function showFeedReward(feedId) {
    const feedData = feedLibrary.find(f => f.id === feedId);
    launchModal(feedData.animal, feedData.food, "Yummy!");
    speakText(`The ${feedData.animalName} eats the ${feedData.foodName}!`);
}

function showShapeReward(shapeId) {
    const shapeData = shapeLibrary.find(s => s.id === shapeId);
    launchModal(shapeData.shape, shapeData.obj, "Match!");
    speakText(`A ${shapeData.objName} looks like a ${shapeData.shapeName}!`);
}

function showWeatherReward(weatherId) {
    const wData = weatherLibrary.find(w => w.id === weatherId);
    launchModal(wData.weather, wData.obj, "Correct!");
    speakText(`${wData.weatherName}... ${wData.text}`);
}

function showNatureReward(natureId) {
    const nData = natureLibrary.find(n => n.id === natureId);
    launchModal(nData.nature, nData.obj, "Nature!");
    speakText(`${nData.natureName}... ${nData.text}`);
}

function updateScoreUI() {
    const scoreEl = document.getElementById('score-val');
    scoreEl.textContent = totalScore;
    scoreEl.parentElement.style.transform = "scale(1.2)";
    setTimeout(() => { scoreEl.parentElement.style.transform = "scale(1)"; }, 200);
}

function showLetterReward(letter) {
    const data = letterExamples[letter];
    launchModal(`${letter}${letter.toLowerCase()}`, data.e, data.w);
    speakText(`${letter}... ${data.w}`);
}
function showJobReward(jobId) {
    const jobData = jobLibrary.find(j => j.id === jobId);
    launchModal(jobData.person, jobData.tool, jobData.name);
    speakText(`${jobData.name}... uses... ${jobData.toolName}`);
}
function launchModal(topText, emoji, word) {
    const modal = document.getElementById('reward-modal');
    document.getElementById('modal-top').textContent = topText;
    document.getElementById('modal-emoji').textContent = emoji;
    document.getElementById('modal-word').textContent = word;
    modal.classList.add('show');
    setTimeout(() => { modal.classList.remove('show'); }, 2500);
}
let selectedVoice = null;

function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const voiceList = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));

    // Smart Select: Prioritize UK English
    selectedVoice = voiceList.find(v => v.name.includes('Great Britain') || v.name.includes('UK') || v.name.includes('United Kingdom'))
        || voiceList.find(v => v.name.includes('Google UK English'))
        || voiceList.find(v => v.name.includes('Female'))
        || voiceList[0];
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        if (selectedVoice) utterance.voice = selectedVoice;
        window.speechSynthesis.speak(utterance);
    }
}

setMode('shadow', document.querySelector('.nav-btn.active'));

