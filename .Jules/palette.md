## 2024-05-22 - Missing Journal
**Learning:** The journal was missing, but memory indicates critical learnings exist.
**Action:** Recreated journal to track future insights.

## 2025-12-25 - Checking Pre-existing Improvements
**Learning:** I initially planned to add accessibility attributes to the Game Selection Menu, but discovered `js/engine/ui.js` already implemented them (`role="button"`, `tabindex="0"`, keydown). This highlights the importance of verifying the current code state (especially if it differs from initial assumptions or outdated memory) before implementing changes.
**Action:** Always verify the specific implementation details of a feature in the latest code before committing to a plan. If a feature seems "missing" based on UI inspection (or lack of obvious indicators), deep-dive into the code responsible for generating that UI first.

## 2025-12-25 - Generic Event Listeners Bypassing Logic
**Learning:** Generic event listeners (like `close-menu-btn` handlers in `js/main.js`) can bypass specific module logic (like `toggleMenu`'s focus restoration). This creates accessibility gaps where features like focus management work when triggered programmatically but fail when triggered by the UI.
**Action:** When implementing global UI patterns, ensure the generic handler delegates to the specific module function (e.g., `toggleMenu(true)`) instead of manipulating the DOM directly, or ensure the specific function is the *only* way to change state.

## 2025-12-25 - Duplicate Method Definitions in Object Literals
**Learning:** Duplicate method definitions in object literals (like `toggle` in `ParentalGate`) silently overwrite previous ones in JavaScript. This can lead to confusing bugs where the "logic looks right" at the top of the file, but the behavior is different because of a redefined method at the bottom.
**Action:** When debugging unexpected behavior in large object literals, always check the *entire* file for redefinitions, especially at the end.

## 2025-12-25 - Dynamic UI Elements and Keyboard Accessibility
**Learning:** In mini-games with dynamically generated interactive elements (like the 'Listening Game' cards and instruction area), native keyboard accessibility attributes (`tabindex="0"`, `role="button"`) and explicit `keydown` listeners for 'Enter' and 'Space' keys are often omitted because standard mouse events (`onclick`) are easier to implement initially.
**Action:** Always verify keyboard accessibility of dynamically injected HTML structures and DOM elements created via `document.createElement`, ensuring proper tab order, role assignment, and keydown handlers are added alongside mouse events.
