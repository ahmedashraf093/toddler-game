## 2024-05-22 - Missing Journal
**Learning:** The journal was missing, but memory indicates critical learnings exist.
**Action:** Recreated journal to track future insights.

## 2025-12-25 - Checking Pre-existing Improvements
**Learning:** I initially planned to add accessibility attributes to the Game Selection Menu, but discovered `js/engine/ui.js` already implemented them (`role="button"`, `tabindex="0"`, keydown). This highlights the importance of verifying the current code state (especially if it differs from initial assumptions or outdated memory) before implementing changes.
**Action:** Always verify the specific implementation details of a feature in the latest code before committing to a plan. If a feature seems "missing" based on UI inspection (or lack of obvious indicators), deep-dive into the code responsible for generating that UI first.

## 2026-01-17 - Inconsistent Accessibility Patterns
**Learning:** While `Odd One Out` and `Game Menu` correctly implemented keyboard accessibility (tabindex/keydown), the `Listening` game—which relies on the same "click to select" mechanic—completely missed it, making it inaccessible to keyboard users. Accessibility patterns must be applied consistently across all similar interactive components, not just some.
**Action:** When auditing accessibility, checking one component type (e.g., "game cards") in one module is not enough. You must verify that the pattern is replicated in *every* instance where that pattern is used (e.g., check `listening.js`, `memory.js`, etc.).
