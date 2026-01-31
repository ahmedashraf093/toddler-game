## 2024-05-22 - Missing Journal
**Learning:** The journal was missing, but memory indicates critical learnings exist.
**Action:** Recreated journal to track future insights.

## 2025-12-25 - Checking Pre-existing Improvements
**Learning:** I initially planned to add accessibility attributes to the Game Selection Menu, but discovered `js/engine/ui.js` already implemented them (`role="button"`, `tabindex="0"`, keydown). This highlights the importance of verifying the current code state (especially if it differs from initial assumptions or outdated memory) before implementing changes.
**Action:** Always verify the specific implementation details of a feature in the latest code before committing to a plan. If a feature seems "missing" based on UI inspection (or lack of obvious indicators), deep-dive into the code responsible for generating that UI first.

## 2025-12-25 - Generic Event Listeners Bypassing Logic
**Learning:** Generic event listeners (like `close-menu-btn` handlers in `js/main.js`) can bypass specific module logic (like `toggleMenu`'s focus restoration). This creates accessibility gaps where features like focus management work when triggered programmatically but fail when triggered by the UI.
**Action:** When implementing global UI patterns, ensure the generic handler delegates to the specific module function (e.g., `toggleMenu(true)`) instead of manipulating the DOM directly, or ensure the specific function is the *only* way to change state.

## 2025-12-25 - Dynamic Game Elements Accessibility Gap
**Learning:** Dynamically created game elements in `js/games/*.js` (like Xylophone keys) often lack `role`, `tabindex`, and `keydown` handlers, making them inaccessible to keyboard users, unlike the main UI components in `js/engine/ui.js` which are better accessible.
**Action:** systematically audit `js/games/*.js` modules for `document.createElement` usage and ensure all interactive elements receive accessibility attributes and keyboard event listeners (Enter/Space) to match the visual interaction.
