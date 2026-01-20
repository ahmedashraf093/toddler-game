## 2024-05-22 - Missing Journal
**Learning:** The journal was missing, but memory indicates critical learnings exist.
**Action:** Recreated journal to track future insights.

## 2025-12-25 - Checking Pre-existing Improvements
**Learning:** I initially planned to add accessibility attributes to the Game Selection Menu, but discovered `js/engine/ui.js` already implemented them (`role="button"`, `tabindex="0"`, keydown). This highlights the importance of verifying the current code state (especially if it differs from initial assumptions or outdated memory) before implementing changes.
**Action:** Always verify the specific implementation details of a feature in the latest code before committing to a plan. If a feature seems "missing" based on UI inspection (or lack of obvious indicators), deep-dive into the code responsible for generating that UI first.

## 2025-05-23 - Interactive Collections
**Learning:** Users (especially children) expect collected items to be interactive. Turning static "trophy" lists (like the Sticker Book) into interactive elements with sound and animation adds significant delight and accessibility value without complex logic.
**Action:** When auditing "collection" or "inventory" UIs, ensure items are focusable (`tabindex="0"`) and provide feedback (`click` handlers with audio/visual cues) to validate the user's progress.
