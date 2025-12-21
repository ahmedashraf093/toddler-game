import { gameState, incrementCorrect, updateScore, resetRoundState } from '../engine/state.js';
import {
    shadowLibrary, letterExamples, jobLibrary, feedLibrary,
    shapeLibrary, weatherLibrary, natureLibrary, habitatLibrary, objectPool
} from '../data/content.js';
import { smartSelect, shuffle } from '../engine/utils.js';
import { makeDraggable, makeDroppable, setDropCallback } from '../engine/input.js';
import { speakText } from '../engine/audio.js';
import { launchModal, updateScoreUI, showLoader } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

const roundSize = 5;

export function initStandardGame() {
    resetRoundState();
    const sourceCol = document.getElementById('source-col');
    const targetCol = document.getElementById('target-col');
    if (!sourceCol || !targetCol) return;

    sourceCol.innerHTML = '';
    targetCol.innerHTML = '';

    setDropCallback(handleDrop);

    let roundItems = [];
    const mode = gameState.currentMode;

    if (mode === 'shadow') {
        const selected = smartSelect([...shadowLibrary], 'shadow', roundSize);
        roundItems = selected.map(i => ({ id: i.e, src: i.e, tgt: i.e, type: 'simple', srcLabel: i.n, tgtLabel: i.n }));
    }
    else if (mode === 'letter') {
        const allKeys = Object.keys(letterExamples);
        const selectedKeys = smartSelect(allKeys, 'letter', roundSize);
        roundItems = selectedKeys.map(k => ({ id: k, src: k, tgt: k.toLowerCase(), type: 'simple', srcLabel: k, tgtLabel: letterExamples[k].w }));
    }
    else if (mode === 'job') {
        const selected = smartSelect([...jobLibrary], 'job', roundSize);
        roundItems = selected.map(j => ({ id: j.id, src: j.person, tgt: j.tool, type: 'simple', srcLabel: j.name, tgtLabel: j.toolName }));
    }
    else if (mode === 'number') {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const selectedNums = smartSelect(nums.map(String), 'number', roundSize);
        roundItems = selectedNums.map(nStr => {
            const count = parseInt(nStr);
            const randomObj = objectPool[Math.floor(Math.random() * objectPool.length)];
            let gridHtml = `<div class="number-grid">`;
            for (let i = 0; i < count; i++) gridHtml += `<span class="mini-emoji">${randomObj.e}</span>`;
            gridHtml += `</div>`;
            return { id: nStr, src: gridHtml, tgt: nStr, type: 'html', emoji: randomObj.e, name: randomObj.n, srcLabel: randomObj.n, tgtLabel: nStr };
        });
    }
    else if (mode === 'feed') {
        const selected = smartSelect([...feedLibrary], 'feed', roundSize);
        roundItems = selected.map(f => ({ id: f.id, src: f.food, tgt: f.animal, type: 'simple', srcLabel: f.foodName, tgtLabel: f.animalName }));
    }
    else if (mode === 'shape') {
        const selected = smartSelect([...shapeLibrary], 'shape', roundSize);
        roundItems = selected.map(s => ({ id: s.id, src: s.shape, tgt: s.obj, type: 'simple', srcLabel: s.shapeName, tgtLabel: s.objName }));
    }
    else if (mode === 'weather') {
        const selected = smartSelect([...weatherLibrary], 'weather', roundSize);
        roundItems = selected.map(w => ({ id: w.id, src: w.weather, tgt: w.obj, type: 'simple', srcLabel: w.weatherName, tgtLabel: w.objName, text: w.text }));
    }
    else if (mode === 'nature') {
        const selected = smartSelect([...natureLibrary], 'nature', roundSize);
        roundItems = selected.map(n => ({ id: n.id, src: n.nature, tgt: n.obj, type: 'simple', srcLabel: n.natureName, tgtLabel: n.objName, text: n.text }));
    }
    else if (mode === 'habitat') {
        const selected = smartSelect([...habitatLibrary], 'habitat', roundSize);
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
        // makeDraggable handles setting draggable=true and events
        // Use a unique ID for dragging logic
        const uniqueId = 'drag-' + id + '-' + Math.random().toString(36).substr(2, 5);
        makeDraggable(el, id, uniqueId);
    } else {
        // makeDroppable adds class and generic events
        makeDroppable(el, id); // id is the matchVal

        const c = document.createElement('div');
        c.className = 'content';
        if (type === 'html') c.innerHTML = content; else c.textContent = content;
        el.appendChild(c);

        if (dataObj) { el.dataset.emoji = dataObj.emoji; el.dataset.name = dataObj.name; }
    }
    container.appendChild(el);
}

function handleDrop(targetBox, draggedVal, draggedElId) {
    if (!targetBox || targetBox.classList.contains('matched') || targetBox.dataset.match !== draggedVal) return;

    targetBox.classList.add('matched');
    const source = document.getElementById(draggedElId);
    if (source) source.style.visibility = 'hidden';

    updateScore(10);
    updateScoreUI();

    const mode = gameState.currentMode;
    // Reward logic
    if (mode === 'letter') showLetterReward(draggedVal);
    else if (mode === 'job') showJobReward(draggedVal);
    else if (mode === 'feed') showFeedReward(draggedVal);
    else if (mode === 'shape') showShapeReward(draggedVal);
    else if (mode === 'weather') showWeatherReward(draggedVal);
    else if (mode === 'nature') showNatureReward(draggedVal);
    else if (mode === 'habitat') showHabitatReward(draggedVal);
    else if (mode === 'number') {
        launchModal(draggedVal, targetBox.dataset.emoji, targetBox.dataset.name);
        speakText(`${draggedVal}... ${targetBox.dataset.name}`);
    }
    else {
        if (targetBox.dataset.label) speakText(targetBox.dataset.label);
    }

    const currentCorrect = incrementCorrect();
    if (currentCorrect === roundSize) {
        document.getElementById('reset-btn').style.display = 'inline-block';
        setTimeout(() => speakText("Good Job!"), 1000);
        checkOverallProgress(mode); // Delegate to manager/main to handle streak/celebration
    }
}

// Reward Helpers
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
