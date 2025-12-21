import { speakText, resumeAudioContext } from './audio.js';

let activeTouchEl = null;
let draggedVal = null;
let draggedElId = null;
let hintTimer = null;

// Callbacks to be set by the active game
let onDropCallback = null;
let onDragStartCallback = null;

export function setDropCallback(callback) {
    onDropCallback = callback;
}

export function setDragStartCallback(callback) {
    onDragStartCallback = callback;
}

export function makeDraggable(el, val, id) {
    el.draggable = true;
    el.dataset.val = val;
    // If id is not provided, we rely on el.id, but it's better to be explicit if unique ID logic differs
    if (id) el.id = id;

    el.addEventListener('dragstart', dragStart);
    el.addEventListener('dragend', dragEnd);
    el.addEventListener('touchstart', touchStart, { passive: false });
    el.addEventListener('touchmove', touchMove, { passive: false });
    el.addEventListener('touchend', touchEnd);
}

export function makeDroppable(el, matchVal) {
    el.classList.add('droppable');
    if (matchVal) el.dataset.match = matchVal;

    el.addEventListener('dragover', e => e.preventDefault());
    el.addEventListener('drop', drop);
}

function startHintTimer(val) {
    clearHint();
    hintTimer = setTimeout(() => { showHint(val); }, 5000);
}

function showHint(val) {
    const targets = document.querySelectorAll('.droppable');
    targets.forEach(t => {
        // Generic hint logic: look for data-match attribute
        if (t.dataset.match === val && !t.classList.contains('matched')) {
            t.classList.add('hint-active');
        }
    });
}

function clearHint() {
    if (hintTimer) clearTimeout(hintTimer);
    document.querySelectorAll('.hint-active').forEach(el => el.classList.remove('hint-active'));
}

function toggleOtherDraggables(activeId, disable) {
    const draggables = document.querySelectorAll('.draggable, .puzzle-piece');
    draggables.forEach(el => {
        if (activeId && el.id === activeId) {
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
        } else {
            if (disable) {
                el.style.pointerEvents = 'none';
                el.style.opacity = '0.5';
            } else {
                el.style.pointerEvents = '';
                el.style.opacity = '';
            }
        }
    });
}

// --- Drag Events ---
function dragStart(e) {
    draggedVal = e.target.dataset.val;
    draggedElId = e.target.id;
    if (e.dataTransfer) {
        e.dataTransfer.setData("text", e.target.id);
        // Center drag image
        e.dataTransfer.setDragImage(e.target, e.target.offsetWidth / 2, e.target.offsetHeight / 2);
    }

    if (e.target.dataset.label) speakText(e.target.dataset.label, true);

    toggleOtherDraggables(e.target.id, true);
    if(draggedVal) startHintTimer(draggedVal);

    if (onDragStartCallback) onDragStartCallback(e.target);
}

function dragEnd(e) {
    clearHint();
    toggleOtherDraggables(null, false);
}

function drop(e) {
    e.preventDefault();
    clearHint();
    toggleOtherDraggables(null, false);

    // Find closest droppable because the drop target might be a child
    const targetBox = e.target.closest('.droppable');

    if (onDropCallback) {
        onDropCallback(targetBox, draggedVal, draggedElId, e);
    }
}

// --- Touch Events ---
function touchStart(e) {
    e.preventDefault();
    const actualItem = e.target.closest('.draggable') || e.target.closest('.puzzle-piece');
    if (!actualItem) return;

    activeTouchEl = actualItem;
    draggedVal = activeTouchEl.dataset.val;
    draggedElId = activeTouchEl.id;

    if (activeTouchEl.dataset.label) speakText(activeTouchEl.dataset.label, true);

    toggleOtherDraggables(activeTouchEl.id, true);
    if(draggedVal) startHintTimer(draggedVal);

    // Create spacer to prevent layout shift
    const spacer = document.createElement('div');
    spacer.id = 'drag-spacer';
    spacer.style.width = activeTouchEl.offsetWidth + 'px';
    spacer.style.height = activeTouchEl.offsetHeight + 'px';
    spacer.style.display = 'block';
    activeTouchEl.parentNode.insertBefore(spacer, activeTouchEl);

    const t = e.touches[0];
    activeTouchEl.style.position = 'fixed';
    activeTouchEl.style.zIndex = '1000';
    activeTouchEl.style.width = spacer.style.width;

    const halfWidth = activeTouchEl.offsetWidth / 2;
    const halfHeight = activeTouchEl.offsetHeight / 2;

    activeTouchEl.style.left = (t.clientX - halfWidth) + 'px';
    activeTouchEl.style.top = (t.clientY - halfHeight) + 'px';

    resumeAudioContext();

    if (onDragStartCallback) onDragStartCallback(activeTouchEl);
}

function touchMove(e) {
    e.preventDefault();
    if (!activeTouchEl) return;
    const t = e.touches[0];

    const halfWidth = activeTouchEl.offsetWidth / 2;
    const halfHeight = activeTouchEl.offsetHeight / 2;

    activeTouchEl.style.left = (t.clientX - halfWidth) + 'px';
    activeTouchEl.style.top = (t.clientY - halfHeight) + 'px';
}

function touchEnd(e) {
    if (!activeTouchEl) return;
    clearHint();

    const spacer = document.getElementById('drag-spacer');
    if (spacer) spacer.remove();

    // Restore original
    activeTouchEl.style.top = '';
    activeTouchEl.style.left = '';
    activeTouchEl.style.zIndex = '';
    activeTouchEl.style.transform = '';

    toggleOtherDraggables(null, false);

    const t = e.changedTouches[0];

    // Temporarily hide element to find what's underneath
    const display = activeTouchEl.style.display;
    activeTouchEl.style.display = 'none';
    const below = document.elementFromPoint(t.clientX, t.clientY);
    activeTouchEl.style.display = display;

    // Reset specific styles added during drag
    activeTouchEl.style.position = '';
    activeTouchEl.style.zIndex = '';
    activeTouchEl.style.width = '';

    if (onDropCallback) {
        const targetBox = below ? below.closest('.droppable') : null;
        // Pass activeTouchEl as the dragged element (3rd arg was ID, passing element reference is also useful or use ID)
        onDropCallback(targetBox, draggedVal, draggedElId, e, activeTouchEl);
    }

    activeTouchEl = null;
}
