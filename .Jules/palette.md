## 2024-05-22 - Missing Journal
**Learning:** The journal was missing, but memory indicates critical learnings exist.
**Action:** Recreated journal to track future insights.

## 2025-12-25 - Checking Pre-existing Improvements
**Learning:** I initially planned to add accessibility attributes to the Game Selection Menu, but discovered `js/engine/ui.js` already implemented them (`role="button"`, `tabindex="0"`, keydown). This highlights the importance of verifying the current code state (especially if it differs from initial assumptions or outdated memory) before implementing changes.
**Action:** Always verify the specific implementation details of a feature in the latest code before committing to a plan. If a feature seems "missing" based on UI inspection (or lack of obvious indicators), deep-dive into the code responsible for generating that UI first.

## 2024-05-23 - Reduced Motion Support
**Learning:** Adding `prefers-reduced-motion` is a high-impact, low-effort accessibility win for apps with heavy animations (like this one with confetti, floating clouds, etc.). It can be implemented entirely in CSS without touching JS logic (JS-triggered CSS animations respect the CSS overrides).
**Action:** For "delightful" interfaces with lots of movement, always check for reduced motion support as a standard "Palette" improvement.
