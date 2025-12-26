import { gameState, incrementCorrect, updateScore, resetRoundState } from '../engine/state.js';
import {
    shadowLibrary, letterExamples, jobLibrary, feedLibrary,
    shapeLibrary, weatherLibrary, natureLibrary, habitatLibrary, objectPool
} from '../data/content.js';
import { smartSelect, shuffle } from '../engine/utils.js';
import { makeDraggable, makeDroppable, setDropCallback } from '../engine/input.js';
import { speakText, speakSequence } from '../engine/audio.js'; // Imported speakSequence
import { launchModal, updateScoreUI, showLoader } from '../engine/ui.js';
import { checkOverallProgress } from '../challenges/manager.js';

const roundSize = 5;

export function initStandardGame() {
    resetRoundState();
    resetRoundState();
    let sourceCol = document.getElementById('source-col');
    let targetCol = document.getElementById('target-col');

    // If columns are missing (e.g. wiped by Feed Lion), restore them
    if (!sourceCol || !targetCol) {
        const board = document.getElementById('game-board');
        if (board) {
            board.innerHTML = ''; // Clear potentially conflicting content like feed-lion-stage
            sourceCol = document.createElement('div');
            sourceCol.className = 'column';
            sourceCol.id = 'source-col';
            targetCol = document.createElement('div');
            targetCol.className = 'column';
            targetCol.id = 'target-col';
            board.appendChild(sourceCol);
            board.appendChild(targetCol);
        } else {
            return; // Critical error if board itself is missing
        }
    }

    sourceCol.innerHTML = '';
    targetCol.innerHTML = '';

    setDropCallback(handleDrop);

    let roundItems = [];
    const mode = gameState.currentMode;

    if (mode === 'shadow') {
        const selected = smartSelect([...shadowLibrary], 'shadow', roundSize);
        roundItems = selected.map(i => ({ id: i.e, src: i.e, tgt: i.e, type: 'simple', srcLabel: i.n, tgtLabel: i.n, audioId: i.n }));
    }
    else if (mode === 'letter') {
        const allKeys = Object.keys(letterExamples);
        const selectedKeys = smartSelect(allKeys, 'letter', roundSize);
        roundItems = selectedKeys.map(k => ({ id: k, src: k, tgt: k.toLowerCase(), type: 'simple', srcLabel: k, tgtLabel: letterExamples[k].w, audioId: k.toLowerCase() }));
    }
    else if (mode === 'job') {
        const selected = smartSelect([...jobLibrary], 'job', roundSize);
        roundItems = selected.map(j => ({ id: j.id, src: j.person, tgt: j.tool, type: 'simple', srcLabel: j.name, tgtLabel: j.toolName, audioId: j.id }));
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
            return { id: nStr, src: gridHtml, tgt: nStr, type: 'html', emoji: randomObj.e, name: randomObj.n, srcLabel: randomObj.n, tgtLabel: nStr, audioId: nStr };
        });
    }
    else if (mode === 'feed') {
        const selected = smartSelect([...feedLibrary], 'feed', roundSize);
        roundItems = selected.map(f => ({ id: f.id, src: f.food, tgt: f.animal, type: 'simple', srcLabel: f.foodName, tgtLabel: f.animalName, audioId: f.id }));
    }
    else if (mode === 'shape') {
        const selected = smartSelect([...shapeLibrary], 'shape', roundSize);
        roundItems = selected.map(s => ({ id: s.id, src: s.shape, tgt: s.obj, type: 'html', srcLabel: s.shapeName, tgtLabel: s.objName, audioId: s.id }));
    }
    else if (mode === 'weather') {
        const selected = smartSelect([...weatherLibrary], 'weather', roundSize);
        roundItems = selected.map(w => ({ id: w.id, src: w.weather, tgt: w.obj, type: 'simple', srcLabel: w.weatherName, tgtLabel: w.objName, text: w.text, audioId: w.id }));
    }
    else if (mode === 'nature') {
        const selected = smartSelect([...natureLibrary], 'nature', roundSize);
        roundItems = selected.map(n => ({ id: n.id, src: n.nature, tgt: n.obj, type: 'simple', srcLabel: n.natureName, tgtLabel: n.objName, text: n.text, audioId: n.id }));
    }
    else if (mode === 'habitat') {
        const selected = smartSelect([...habitatLibrary], 'habitat', roundSize);
        roundItems = selected.map(h => ({ id: h.id, matchId: h.homeName, src: h.animal, tgt: h.home, type: 'simple', srcLabel: h.animalName, tgtLabel: h.homeName, audioId: h.id }));
    }

    const draggables = shuffle([...roundItems]);
    const targets = shuffle([...roundItems]);
    // Use matchId if available (for habitat grouping), otherwise unique id
    draggables.forEach(obj => createStandardItem(obj.src, obj.matchId || obj.id, sourceCol, true, obj.type, obj));
    targets.forEach(obj => createStandardItem(obj.tgt, obj.matchId || obj.id, targetCol, false, obj.type, obj));
}

function createStandardItem(content, id, container, isDrag, type, dataObj) {
    const el = document.createElement('div');
    el.className = `item ${isDrag ? 'draggable' : 'droppable'}`;
    const ttsText = isDrag ? (dataObj.srcLabel || '') : (dataObj.tgtLabel || '');
    if (ttsText) el.dataset.label = ttsText;

    // Pre-calculate audio key
    let audioKey = null;
    if (dataObj && dataObj.audioId) {
        // Use the label relevant for this item type (src or tgt)
        // Actually, just use audioId as base, but we need the type prefix logic
        // The original logic used srcLabel or tgtLabel. Let's stick to that for consistency but use the correct one based on isDrag?
        // Actually, for shadow mode, src/tgt labels are same.
        // For job: src=Police, tgt=Police Car.
        // audioId=police.
        // Wait, the logic used label...
        // Let's preserve the exact logic but run it now.
        const label = (isDrag ? (dataObj.srcLabel || '') : (dataObj.tgtLabel || '')).toLowerCase().replace(' ', '_');

        // However, looking at the previous code:
        // const label = (dataObj.srcLabel || dataObj.tgtLabel || '')...
        // It preferred srcLabel. If srcLabel missing, tgtLabel.
        // But ttsText is strictly `isDrag ? src : tgt`.
        // We should match ttsText for the label part if we want the audio to match the text.

        // Refined logic: use ttsText as the base for the key generation if audioId is present
        // NO, audioId is the 'id' (e.g. 'police'). label might be 'police_car'.
        // The previous logic was: if (dataObj.audioId) { check label... }

        // Let's reproduce the heuristic but strictly use ttsText as the source for the key name if possible,
        // OR just use the heuristic on the label that corresponds to the text.

        const keyLabel = ttsText.toLowerCase().replace(' ', '_');

        if (type === 'simple' && keyLabel.length === 1 && keyLabel >= 'a' && keyLabel <= 'z') {
            audioKey = 'alpha_' + keyLabel;
        } else if (!isNaN(keyLabel)) {
            audioKey = 'num_' + keyLabel;
        } else {
            audioKey = 'noun_' + keyLabel;
        }
    }

    if (audioKey) el.dataset.audioKey = audioKey;

    // Store specific ID for reward lookups (overriding the generic match ID)
    if (dataObj && dataObj.id) {
        el.dataset.specificId = dataObj.id;
    }

    // Add click handler for TTS (Mouse/Non-drag click)
    el.onclick = () => {
        speakText(ttsText, el.dataset.audioKey || null);

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
    else if (mode === 'nature') showNatureReward(draggedVal);
    else if (mode === 'habitat') {
        // Retrieve specific animal ID from dragged element to show correct reward
        const source = document.getElementById(draggedElId);
        const specificId = source && source.dataset.specificId ? source.dataset.specificId : draggedVal;
        showHabitatReward(specificId);
    }
    else if (mode === 'number') {
        launchModal(draggedVal, targetBox.dataset.emoji, targetBox.dataset.name);
        const numKey = `num_${draggedVal}`;
        const nounKey = `noun_${targetBox.dataset.name.toLowerCase().replace(' ', '_')}`;
        speakSequence([numKey, nounKey], `${draggedVal}... ${targetBox.dataset.name}`);
    }
    else {
        // Generic match
        speakText("Match!", "generic_match");
    }

    const currentCorrect = incrementCorrect();
    if (currentCorrect === roundSize) {
        document.getElementById('reset-btn').style.display = 'inline-block';
        setTimeout(() => speakText("Good Job!", "generic_good_job"), 1000);
        checkOverallProgress(mode);
    }
}

// Reward Helpers - Now using speakSequence!
function showLetterReward(letter) {
    const data = letterExamples[letter];
    launchModal(`${letter}${letter.toLowerCase()}`, data.e, data.w);
    // "A... Apple"
    const letterKey = `alpha_${letter.toLowerCase()}`;
    const wordKey = `noun_${data.w.toLowerCase().replace(' ', '_')}`;
    speakSequence([letterKey, wordKey], `${letter}... ${data.w}`);
}

function showJobReward(jobId) {
    const jobData = jobLibrary.find(j => j.id === jobId);
    launchModal(jobData.person, jobData.tool, jobData.name);
    // "Fireman... uses... Fire Truck"
    const pKey = `noun_${jobData.name.toLowerCase().replace(' ', '_')}`;
    const tKey = `noun_${jobData.toolName.toLowerCase().replace(' ', '_')}`;
    speakSequence([pKey, 'conn_uses', tKey], `${jobData.name}... uses... ${jobData.toolName}`);
}

function showFeedReward(feedId) {
    const feedData = feedLibrary.find(f => f.id === feedId);
    launchModal(feedData.animal, feedData.food, "Yummy!");
    // "The Rabbit eats the Carrot"
    const aKey = `noun_${feedData.animalName.toLowerCase().replace(' ', '_')}`;
    const fKey = `noun_${feedData.foodName.toLowerCase().replace(' ', '_')}`;
    speakSequence(['conn_the', aKey, 'conn_eats_the', fKey], `The ${feedData.animalName} eats the ${feedData.foodName}!`);
}

function showShapeReward(shapeId) {
    const shapeData = shapeLibrary.find(s => s.id === shapeId);
    launchModal(shapeData.shape, shapeData.obj, "Match!");
    // "A Pizza Slice looks like a Triangle"
    const oKey = `noun_${shapeData.objName.toLowerCase().replace(' ', '_')}`;
    const sKey = `noun_${shapeData.shapeName.toLowerCase().replace(' ', '_')}`;

    // Improved A/An logic
    const startsWithVowel = /^[aeiou]/i.test(shapeData.objName);

    // For the start "A Pizza...", we need "A" or "An".
    const article = startsWithVowel ? 'conn_an' : 'conn_a';

    // "looks like a/an" depends on the *shape* name
    const shapeStartsWithVowel = /^[aeiou]/i.test(shapeData.shapeName);
    const looksLikeConn = shapeStartsWithVowel ? 'conn_looks_like_an' : 'conn_looks_like_a';

    speakSequence([article, oKey, looksLikeConn, sKey], `A ${shapeData.objName} looks like a ${shapeData.shapeName}!`);
}

function showWeatherReward(weatherId) {
    const wData = weatherLibrary.find(w => w.id === weatherId);
    launchModal(wData.weather, wData.obj, "Correct!");
    // "Sunny... Wear your Sunglasses"
    const wKey = `noun_${wData.weatherName.toLowerCase().replace(' ', '_')}`;
    const oKey = `noun_${wData.objName.toLowerCase().replace(' ', '_')}`;

    // sprites.json checks:
    // conn_wear_your exists? Yes.
    // conn_wear_a exists? Yes.
    // conn_use_an exists? Yes.

    if (weatherId === 'rain') {
        // Use an Umbrella
        speakSequence([wKey, 'conn_use_an', oKey], `${wData.weatherName}... ${wData.text}`);
    } else if (weatherId === 'snow') {
        // Wear a Scarf
        speakSequence([wKey, 'conn_wear_a', oKey], `${wData.weatherName}... ${wData.text}`);
    } else if (weatherId === 'cold') {
        // Wear Gloves (No 'your', no 'a'?)
        // text is "Wear Gloves!". Sprite has "conn_wear"? Yes.
        speakSequence([wKey, 'conn_wear', oKey], `${wData.weatherName}... ${wData.text}`);
    } else {
        // Sunny... Wear your Sunglasses
        speakSequence([wKey, 'conn_wear_your', oKey], `${wData.weatherName}... ${wData.text}`);
    }
}

function showNatureReward(natureId) {
    const nData = natureLibrary.find(n => n.id === natureId);
    launchModal(nData.nature, nData.obj, "Nature!");
    // "Night... The Owl wakes up" -> "Night... Owl... wakes up" (Simplified for fragments)
    const nKey = `noun_${nData.natureName.toLowerCase().replace(' ', '_')}`;
    const oKey = `noun_${nData.objName.toLowerCase().replace(' ', '_')}`;

    // Mapping specific phrases based on ID
    if (natureId === 'moon') speakSequence([nKey, 'conn_the', oKey, 'conn_wakes_up'], nData.text);
    else if (natureId === 'wind') speakSequence([nKey, 'noun_leaf', 'conn_fall_down'], nData.text); // noun_leaf is singular, text says Leaves. Close enough.
    else if (natureId === 'ocean') speakSequence([nKey, 'noun_fish', 'conn_swim_in_water'], nData.text);
    else if (natureId === 'flower') speakSequence([nKey, 'noun_bee', 'conn_love_flowers'], nData.text);
    else if (natureId === 'caterpillar') speakSequence([nKey, 'conn_becomes_a', 'noun_butterfly'], nData.text);
    else speakText(nData.text);
}

function showHabitatReward(habId) {
    const hData = habitatLibrary.find(h => h.id === habId);
    launchModal(hData.animal, hData.home, "Home!");
    // "The Lion lives in the Jungle"
    const aKey = `noun_${hData.animalName.toLowerCase().replace(' ', '_')}`;
    const hKey = `noun_${hData.homeName.toLowerCase().replace(' ', '_')}`;
    speakSequence(['conn_the', aKey, 'conn_lives_in_the', hKey], `The ${hData.animalName} lives in the ${hData.homeName}!`);
}
