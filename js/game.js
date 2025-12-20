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
    nature: { primary: '#00b894', bg: '#e6fffa', dots: '#b3f5e1' },
    habitat: { primary: '#fdcb6e', bg: '#fff7d1', dots: '#ffeaa7' },
    puzzle: { primary: '#ff7675', bg: '#fff5f5', dots: '#ffe3e3' }
};

const shadowLibrary = [
    { e: '🐶', n: 'Dog' }, { e: '🐱', n: 'Cat' }, { e: '🦁', n: 'Lion' }, { e: '🐮', n: 'Cow' },
    { e: '🐸', n: 'Frog' }, { e: '🐵', n: 'Monkey' }, { e: '🐧', n: 'Penguin' }, { e: '🐘', n: 'Elephant' },
    { e: '🦒', n: 'Giraffe' }, { e: '🦓', n: 'Zebra' }, { e: '🦋', n: 'Butterfly' }, { e: '🚗', n: 'Car' },
    { e: '🚌', n: 'Bus' }, { e: '🚑', n: 'Ambulance' }, { e: '🚒', n: 'Fire Truck' }, { e: '🚓', n: 'Police Car' },
    { e: '🚜', n: 'Tractor' }, { e: '🚂', n: 'Train' }, { e: '✈️', n: 'Airplane' }, { e: '🚀', n: 'Rocket' },
    { e: '🚁', n: 'Helicopter' }, { e: '🍎', n: 'Apple' }, { e: '🍌', n: 'Banana' }, { e: '🍇', n: 'Grapes' },
    { e: '🍓', n: 'Strawberry' }, { e: '🍦', n: 'Ice Cream' }, { e: '🍪', n: 'Cookie' }, { e: '🍕', n: 'Pizza' },
    { e: '⚽', n: 'Ball' }, { e: '🧸', n: 'Teddy Bear' }, { e: '🎈', n: 'Balloon' }, { e: '🖍️', n: 'Crayon' }
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
    { id: 'square', shape: '🟧', obj: '🎁', shapeName: 'Square', objName: 'Gift' },
    { id: 'rectangle', shape: '📟', obj: '🚪', shapeName: 'Rectangle', objName: 'Door' },

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

const habitatLibrary = [
    // Farm Animals
    { id: 'cow', animal: '🐄', home: '🏡', animalName: 'Cow', homeName: 'Farm' },
    { id: 'rooster', animal: '🐓', home: '🏡', animalName: 'Rooster', homeName: 'Farm' },
    { id: 'chicken', animal: '🐔', home: '🏡', animalName: 'Chicken', homeName: 'Farm' },
    { id: 'dog', animal: '🐶', home: '🏡', animalName: 'Dog', homeName: 'Farm' },
    { id: 'cat', animal: '🐱', home: '🏡', animalName: 'Cat', homeName: 'Farm' },
    { id: 'mouse', animal: '🐭', home: '🏡', animalName: 'Mouse', homeName: 'Farm' },

    // Jungle/Wild Animals
    { id: 'lion', animal: '🦁', home: '🌴', animalName: 'Lion', homeName: 'Jungle' },
    { id: 'tiger', animal: '🐯', home: '🌴', animalName: 'Tiger', homeName: 'Jungle' },
    { id: 'zebra', animal: '🦓', home: '🌴', animalName: 'Zebra', homeName: 'Jungle' },
    { id: 'giraffe', animal: '🦒', home: '🌴', animalName: 'Giraffe', homeName: 'Jungle' },
    { id: 'monkey', animal: '🐒', home: '🌴', animalName: 'Monkey', homeName: 'Jungle' },
    { id: 'gorilla', animal: '🦍', home: '🌴', animalName: 'Gorilla', homeName: 'Jungle' },
    { id: 'wolf', animal: '🐺', home: '🌴', animalName: 'Wolf', homeName: 'Jungle' },
    { id: 'buffalo', animal: '🐃', home: '🌴', animalName: 'Buffalo', homeName: 'Jungle' },
    { id: 'deer', animal: '🦌', home: '🌴', animalName: 'Deer', homeName: 'Jungle' },

    // Sea Animals
    { id: 'octopus', animal: '🐙', home: '🌊', animalName: 'Octopus', homeName: 'Sea' },
    { id: 'whale', animal: '🐋', home: '🌊', animalName: 'Whale', homeName: 'Sea' },
    { id: 'fish', animal: '🐟', home: '🌊', animalName: 'Fish', homeName: 'Sea' },
    { id: 'turtle', animal: '🐢', home: '🌊', animalName: 'Turtle', homeName: 'Sea' }
];

const puzzleImages = [
    { id: 'lion', src: puzzleImageData.lion, name: 'Lion' },
    { id: 'car', src: puzzleImageData.car, name: 'Car' },
    { id: 'butterfly', src: puzzleImageData.butterfly, name: 'Butterfly' },
    { id: 'apple', src: puzzleImageData.apple, name: 'Apple' }
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
let currentPuzzle = null;
let puzzlePiecesPlaced = 0;
let consecutiveCompletions = 0;

const history = { shadow: [], letter: [], job: [], number: [], feed: [], shape: [], weather: [], nature: [], habitat: [], puzzle: [] };

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

    document.body.className = `${currentMode}-mode`;

    const diffBar = document.getElementById('difficulty-bar');
    const standardBoard = document.getElementById('game-board');
    const mathStage = document.getElementById('math-stage');
    const puzzleStage = document.getElementById('puzzle-stage');

    // Reset visibility for all stages
    standardBoard.style.display = 'none';
    mathStage.classList.remove('active');
    puzzleStage.classList.add('hidden');
    diffBar.style.display = 'none'; // Hide difficulty bar by default

    if (mode === 'math') {
        mathStage.classList.add('active');
        diffBar.style.display = 'flex'; // Show difficulty bar for math
    } else if (mode === 'puzzle') {
        puzzleStage.classList.remove('hidden');
    } else { // Standard modes (shadow, letter, job, number, feed, shape, weather, nature, habitat)
        standardBoard.style.display = 'flex';
        standardBoard.className = 'game-board ' + mode + '-mode';
    }

    const theme = themes[mode];
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--bg-color', theme.bg);
    root.style.setProperty('--dot-color', theme.dots);

    initRound();
}

function smartSelect(fullArray, modeKey) {
    const lastItems = history[modeKey] || [];
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
    else if (currentMode === 'puzzle') initPuzzleGame();
    else initStandardGame();
}

function initStandardGame() {
    const sourceCol = document.getElementById('source-col');
    const targetCol = document.getElementById('target-col');
    sourceCol.innerHTML = ''; targetCol.innerHTML = '';

    let roundItems = [];

    if (currentMode === 'shadow') {
        const selected = smartSelect([...shadowLibrary], 'shadow');
        roundItems = selected.map(i => ({ id: i.e, src: i.e, tgt: i.e, type: 'simple', srcLabel: i.n, tgtLabel: i.n }));
    }
    else if (currentMode === 'letter') {
        const allKeys = Object.keys(letterExamples);
        const selectedKeys = smartSelect(allKeys, 'letter');
        roundItems = selectedKeys.map(k => ({ id: k, src: k, tgt: k.toLowerCase(), type: 'simple', srcLabel: k, tgtLabel: letterExamples[k].w }));
    }
    else if (currentMode === 'job') {
        const selected = smartSelect([...jobLibrary], 'job');
        roundItems = selected.map(j => ({ id: j.id, src: j.person, tgt: j.tool, type: 'simple', srcLabel: j.name, tgtLabel: j.toolName }));
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
            return { id: nStr, src: gridHtml, tgt: nStr, type: 'html', emoji: randomObj.e, name: randomObj.n, srcLabel: randomObj.n, tgtLabel: nStr };
        });
    }
    else if (currentMode === 'feed') {
        const selected = smartSelect([...feedLibrary], 'feed');
        roundItems = selected.map(f => ({ id: f.id, src: f.food, tgt: f.animal, type: 'simple', srcLabel: f.foodName, tgtLabel: f.animalName }));
    }
    else if (currentMode === 'shape') {
        const selected = smartSelect([...shapeLibrary], 'shape');
        roundItems = selected.map(s => ({ id: s.id, src: s.shape, tgt: s.obj, type: 'simple', srcLabel: s.shapeName, tgtLabel: s.objName }));
    }
    else if (currentMode === 'weather') {
        const selected = smartSelect([...weatherLibrary], 'weather');
        roundItems = selected.map(w => ({ id: w.id, src: w.weather, tgt: w.obj, type: 'simple', srcLabel: w.weatherName, tgtLabel: w.objName, text: w.text }));
    }
    else if (currentMode === 'nature') {
        const selected = smartSelect([...natureLibrary], 'nature');
        roundItems = selected.map(n => ({ id: n.id, src: n.nature, tgt: n.obj, type: 'simple', srcLabel: n.natureName, tgtLabel: n.objName, text: n.text }));
    }
    else if (currentMode === 'habitat') {
        const selected = smartSelect([...habitatLibrary], 'habitat');
        roundItems = selected.map(h => ({ id: h.id, src: h.animal, tgt: h.home, type: 'simple', srcLabel: h.animalName, tgtLabel: h.homeName }));
    }

    const draggables = shuffle([...roundItems]);
    const targets = shuffle([...roundItems]);
    draggables.forEach(obj => createStandardItem(obj.src, obj.id, sourceCol, true, obj.type, obj));
    targets.forEach(obj => createStandardItem(obj.tgt, obj.id, targetCol, false, obj.type, obj));
}

function createStandardItem(content, id, container, isDrag, type, dataObj) {
    const el = document.createElement('div');
    el.className = `item ${isDrag ? 'draggable' : 'droppable'}`;
    const ttsText = isDrag ? (dataObj.srcLabel || '') : (dataObj.tgtLabel || '');
    if (ttsText) el.dataset.label = ttsText;

    // Add click handler for TTS
    el.onclick = () => {
        if (ttsText) speakText(ttsText);
        // Visual effect
        el.style.transform = "scale(1.2)";
        setTimeout(() => { el.style.transform = "scale(1)"; }, 200);
    };

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

function dragStart(e) {
    draggedVal = e.target.dataset.val;
    draggedElId = e.target.id;
    if (e.dataTransfer) e.dataTransfer.setData("text", e.target.id);

    // Voice effect on drag start
    if (e.target.dataset.label) speakText(e.target.dataset.label, true); // true = throttle

    startHintTimer(draggedVal);
}
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

    // Voice effect on touch start
    if (activeTouchEl.dataset.label) speakText(activeTouchEl.dataset.label, true);

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
                setTimeout(() => {
                    currentMathIndex++;
                    if (currentMathIndex >= mathQuestions.length) checkOverallProgress();
                    loadMathQuestion();
                }, 2500);
            }
        } else if (currentMode === 'puzzle') {
            handlePuzzleTouchDrop(box, activeTouchEl);
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
    else if (currentMode === 'habitat') showHabitatReward(val);
    else if (currentMode === 'number') { launchModal(val, targetBox.dataset.emoji, targetBox.dataset.name); speakText(`${val}... ${targetBox.dataset.name}`); }
    else speakText("Yeah!");
    correctCount++;
    if (correctCount === roundSize) {
        document.getElementById('reset-btn').style.display = 'inline-block';
        setTimeout(() => speakText("Good Job!"), 1000);
        checkOverallProgress();
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

function showHabitatReward(habId) {
    const hData = habitatLibrary.find(h => h.id === habId);
    launchModal(hData.animal, hData.home, "Home!");
    speakText(`The ${hData.animalName} lives in the ${hData.homeName}!`);
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

let lastSpokenText = '';
let lastSpokenTime = 0;

function speakText(text, throttle = false) {
    if (!('speechSynthesis' in window)) return;

    const now = Date.now();
    // If throttled, don't repeat the same text within 1.5 seconds
    if (throttle && text === lastSpokenText && (now - lastSpokenTime) < 1500) {
        return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    if (selectedVoice) utterance.voice = selectedVoice;

    lastSpokenText = text;
    lastSpokenTime = now;

    window.speechSynthesis.speak(utterance);
}


function initPuzzleGame() {
    // Select puzzle
    const puzzle = smartSelect([...puzzleImages], 'puzzle')[0];
    currentPuzzle = puzzle;
    puzzlePiecesPlaced = 0;

    speakText(`Let's build a ${puzzle.name}!`);

    // Set preview
    document.getElementById('puzzle-target-img').src = puzzle.src;

    // Reset grid
    const slots = document.querySelectorAll('.puzzle-slot');
    slots.forEach(slot => {
        slot.innerHTML = '';
        slot.classList.remove('matched');
        slot.classList.add('droppable'); // Ensure it can be dropped upon
        // Handle drops for puzzle
        slot.ondragover = e => e.preventDefault();
        slot.ondrop = handlePuzzleDrop;
    });

    // Create pieces
    const pool = document.getElementById('puzzle-pieces-pool');
    pool.innerHTML = '';
    pool.className = 'droppable'; // Make pool a valid drop target
    pool.ondragover = e => e.preventDefault();
    pool.ondrop = handlePuzzleDrop;

    // 4 pieces: 0, 1, 2, 3
    const pieces = [0, 1, 2, 3];
    const shuffled = shuffle(pieces);

    shuffled.forEach(pos => {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece draggable';
        piece.draggable = true;
        piece.id = `puzzle-piece-${pos}`; // Give unique ID
        piece.dataset.pos = pos;
        piece.style.backgroundImage = `url('${puzzle.src}')`;

        const x = (pos % 2) * 100;
        const y = Math.floor(pos / 2) * 100;
        piece.style.backgroundPosition = `${x}% ${y}%`;

        addDragEvents(piece);

        pool.appendChild(piece);
    });

    console.log("Puzzle Game Initialized. Target:", puzzle.name);
    console.log("Image Data Length:", puzzle.src ? puzzle.src.length : "Missing");
}

function playVictoryMusic() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Simple melody: C5-E5-G5-C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    let time = ctx.currentTime;

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time + i * 0.15);

        gain.gain.setValueAtTime(0.2, time + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.15 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time + i * 0.15);
        osc.stop(time + i * 0.15 + 0.5);
    });
}

function showCelebration() {
    const overlay = document.getElementById('celebration-overlay');
    const container = overlay.querySelector('.confetti-container');
    overlay.classList.remove('hidden');
    playVictoryMusic();
    speakText("Amazing! Three in a row!");

    container.innerHTML = '';

    // Pick a random animation type
    const types = ['confetti', 'balloons', 'stars', 'emojis', 'bubbles'];
    const type = types[Math.floor(Math.random() * types.length)];

    console.log("Celebration Type:", type);

    if (type === 'confetti') {
        const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'];
        for (let i = 0; i < 50; i++) {
            const c = document.createElement('div');
            c.className = 'confetti';
            c.style.left = Math.random() * 100 + 'vw';
            c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            c.style.animationDuration = (Math.random() * 2 + 2) + 's';
            c.style.animationDelay = (Math.random() * 1) + 's';
            container.appendChild(c);
        }
    } else if (type === 'balloons') {
        for (let i = 0; i < 30; i++) {
            const b = document.createElement('div');
            b.className = 'balloon';
            b.textContent = '🎈';
            b.style.left = Math.random() * 100 + 'vw';
            b.style.animationDuration = (Math.random() * 3 + 3) + 's';
            b.style.fontSize = (Math.random() * 30 + 40) + 'px';
            container.appendChild(b);
        }
    } else if (type === 'stars') {
        for (let i = 0; i < 40; i++) {
            const s = document.createElement('div');
            s.className = 'star-anim';
            s.textContent = Math.random() > 0.5 ? '⭐️' : '🌟';
            s.style.left = Math.random() * 100 + 'vw';
            s.style.top = Math.random() * 100 + 'vh';
            s.style.animationDuration = (Math.random() * 1 + 1) + 's';
            s.style.animationDelay = (Math.random() * 2) + 's';
            container.appendChild(s);
        }
    } else if (type === 'emojis') {
        const partyEmojis = ['🥳', '😎', '🦁', '🐶', '🦄', '🌈', '🎉'];
        for (let i = 0; i < 40; i++) {
            const e = document.createElement('div');
            e.className = 'emoji-bounce';
            e.textContent = partyEmojis[Math.floor(Math.random() * partyEmojis.length)];
            e.style.left = Math.random() * 100 + 'vw';
            e.style.animationDuration = (Math.random() * 2 + 2) + 's';
            e.style.animationDelay = (Math.random() * 1) + 's';
            container.appendChild(e);
        }
    } else if (type === 'bubbles') {
        for (let i = 0; i < 40; i++) {
            const b = document.createElement('div');
            b.className = 'bubble';
            b.style.left = Math.random() * 100 + 'vw';
            const size = Math.random() * 40 + 10;
            b.style.width = size + 'px';
            b.style.height = size + 'px';
            b.style.animationDuration = (Math.random() * 4 + 3) + 's';
            b.style.animationDelay = (Math.random() * 2) + 's';
            container.appendChild(b);
        }
    }

    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 4500);
}

function checkOverallProgress() {
    consecutiveCompletions++;
    console.log("Streak:", consecutiveCompletions);
    if (consecutiveCompletions % 3 === 0) {
        setTimeout(showCelebration, 500);
    }
}

function handlePuzzleDrop(e) {
    e.preventDefault();
    const data = e.dataTransfer ? e.dataTransfer.getData("text") : draggedElId;
    const piece = document.getElementById(data);
    if (!piece || !piece.classList.contains('puzzle-piece')) return;

    let target = e.target;
    // If dropped on a piece, find the parent slot/pool
    if (target.classList.contains('puzzle-piece')) target = target.parentNode;

    const parentA = piece.parentNode;

    // 1. Drop to Pool
    if (target.id === 'puzzle-pieces-pool') {
        target.appendChild(piece);
        checkPuzzleCompletion();
        return;
    }

    // 2. Drop to Slot
    if (target.classList.contains('puzzle-slot')) {
        if (target.childElementCount === 0) {
            // Empty slot: just move
            target.appendChild(piece);
        } else if (target !== parentA) {
            // Occupied slot: SWAP
            const pieceB = target.firstElementChild;
            // Move B to A's old home
            parentA.appendChild(pieceB);
            // Move A to new home
            target.appendChild(piece);
        }
        checkPuzzleCompletion();
    }
}

// Touch support special for puzzle
function handlePuzzleTouchDrop(target, pieceEl) {
    if (!target || !pieceEl) return;

    // Find the actual container if dropped on a child element
    let container = target;
    if (container.classList.contains('puzzle-piece')) container = container.parentNode;

    const parentA = pieceEl.parentNode;

    // 1. Drop to Pool
    if (container.id === 'puzzle-pieces-pool') {
        container.appendChild(pieceEl);
        checkPuzzleCompletion();
        return;
    }

    // 2. Drop to Slot
    if (container.classList.contains('puzzle-slot')) {
        if (container.childElementCount === 0) {
            container.appendChild(pieceEl);
        } else if (container !== parentA) {
            // Swap
            const pieceB = container.firstElementChild;
            parentA.appendChild(pieceB);
            container.appendChild(pieceEl);
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
            const slotPos = parseInt(slot.dataset.pos);
            const piecePos = parseInt(piece.dataset.pos);
            if (slotPos === piecePos) correct++;
        }
    });

    if (correct === 4) {
        // Win!
        launchModal("🧩", "🌟", "Great Job!");
        speakText(`You built the ${currentPuzzle.name}!`);
        checkOverallProgress();
        setTimeout(() => {
            initPuzzleGame();
        }, 3000);
    }
}

setMode('shadow', document.querySelector('.nav-btn.active'));

