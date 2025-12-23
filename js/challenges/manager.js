import { challengesConfig } from './config.js';
import { launchModal, showCelebration } from '../engine/ui.js';
import { speakText } from '../engine/audio.js';
import { gameState } from '../engine/state.js';

const STORAGE_KEY = 'toddler_game_challenges_v1';

let challengeState = {
    currentDay: 1,
    progress: {}, // { type: count }
    completedDays: [], // [1, 2, ...]
    lastPlayed: Date.now()
};

export function initChallenges() {
    loadState();
    updateChallengeUI();
}

export function isContentUnlocked() {
    return challengeState.completedDays && challengeState.completedDays.length > 0;
}

function loadState() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            challengeState = JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse challenge state", e);
        }
    }

    // Reset progress if new day?
    // For now, we keep progress persistent until day is complete.
    // Ensure structure integrity
    if (!challengeState.progress) challengeState.progress = {};
    if (!challengeState.completedDays) challengeState.completedDays = [];
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challengeState));
}

export function checkOverallProgress(gameType) {
    // 1. Existing streak logic
    gameState.consecutiveCompletions++;
    if (gameState.consecutiveCompletions % 3 === 0) {
        setTimeout(showCelebration, 500);
    }

    // 2. Challenge Logic
    updateChallengeProgress(gameType);
}

function updateChallengeProgress(type) {
    // If all 30 days complete, maybe reset or just congrats?
    if (challengeState.currentDay > 30) return;

    const todayConfig = challengesConfig.find(c => c.day === challengeState.currentDay);
    if (!todayConfig) return;

    // Check if this type is in today's tasks
    const task = todayConfig.tasks.find(t => t.type === type);
    if (!task) return;

    // Increment progress
    if (!challengeState.progress[type]) challengeState.progress[type] = 0;

    // Only increment if not already finished for that specific task
    if (challengeState.progress[type] < task.count) {
        challengeState.progress[type]++;
        saveState();

        // Notify user
        const left = task.count - challengeState.progress[type];
        if (left === 0) {
            speakText("Task complete!", "generic_good_job");
        } else {
            // Optional: Speak "1 more math game to go!"
        }

        checkDayCompletion(todayConfig);
        updateChallengeUI(); // Refresh UI if open
    }
}

function checkDayCompletion(config) {
    const allDone = config.tasks.every(t => {
        const current = challengeState.progress[t.type] || 0;
        return current >= t.count;
    });

    if (allDone) {
        challengeState.completedDays.push(challengeState.currentDay);
        challengeState.currentDay++;
        challengeState.progress = {}; // Reset for next day
        saveState();

        setTimeout(() => {
            launchModal("🏆", "🌟", "Day Complete!");
            speakText("Challenge Complete! You unlocked the next day!", "generic_amazing");
            showCelebration();
            updateChallengeUI();
        }, 1500);
    }
}

// UI Handling for Challenges
export function toggleChallengeMenu() {
    const overlay = document.getElementById('challenges-overlay');
    if (overlay) overlay.classList.toggle('hidden');
    updateChallengeUI();
}

function updateChallengeUI() {
    const list = document.getElementById('challenges-list');
    if (!list) return;
    list.innerHTML = '';

    challengesConfig.forEach(c => {
        const isLocked = c.day > challengeState.currentDay;
        const isCompleted = challengeState.completedDays.includes(c.day);
        const isCurrent = c.day === challengeState.currentDay;

        const el = document.createElement('div');
        el.className = `challenge-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`;

        let statusIcon = isLocked ? '🔒' : (isCompleted ? '✅' : '▶️');
        if (isCurrent) statusIcon = '🎯';

        let html = `
            <div class="day-num">Day ${c.day}</div>
            <div class="day-text">${c.text}</div>
            <div class="day-status">${statusIcon}</div>
        `;

        if (isCurrent) {
            // Show progress details
            html += `<div class="day-tasks">`;
            c.tasks.forEach(t => {
                const prog = challengeState.progress[t.type] || 0;
                const done = prog >= t.count;
                html += `<span>${done ? '✅' : '⬜'} ${t.type}: ${prog}/${t.count}</span>`;
            });
            html += `</div>`;
        }

        el.innerHTML = html;
        list.appendChild(el);
    });
}
export function resetChallengesIfNeeded() {
  // Logic for resetting challenges if needed
}
