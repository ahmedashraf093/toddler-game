## 2024-05-22 - Missing Journal
**Learning:** The journal was missing, but memory indicates critical learnings exist.
**Action:** Recreated journal to track future insights.

## 2025-12-25 - Checking Pre-existing Improvements
**Learning:** I initially planned to add accessibility attributes to the Game Selection Menu, but discovered `js/engine/ui.js` already implemented them (`role="button"`, `tabindex="0"`, keydown). This highlights the importance of verifying the current code state (especially if it differs from initial assumptions or outdated memory) before implementing changes.
**Action:** Always verify the specific implementation details of a feature in the latest code before committing to a plan. If a feature seems "missing" based on UI inspection (or lack of obvious indicators), deep-dive into the code responsible for generating that UI first.

## 2026-01-19 - Keyboard Support for Custom Interactive Elements
**Learning:** Custom interactive elements like the Xylophone keys (created as `div`s) were completely inaccessible to keyboard users, despite being the core interaction of the game.
**Action:** Always ensure custom `div` buttons include `role="button"`, `tabindex="0"`, dynamic `aria-label`, and a `keydown` listener for 'Enter'/'Space'.
