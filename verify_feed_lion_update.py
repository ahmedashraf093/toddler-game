from playwright.sync_api import sync_playwright
import time
import sys
import json

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(**p.devices['Pixel 5'])
        page = context.new_page()

        # Mock Audio only
        page.add_init_script("""
            window.AudioContext = class {
                createGain() { return { connect: () => {}, gain: { value: 1 } }; }
                createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
                decodeAudioData(a) { return Promise.resolve({}); }
                createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, buffer: {} }; }
            };
        """)

        print("Navigating...")
        page.goto("http://localhost:8085/index.html")

        # Unlock game manually
        page.evaluate("""
            localStorage.setItem('toddler_game_challenges_v1', JSON.stringify({
                completedDays: [1, 2, 3],
                lastPlayed: Date.now()
            }));
            location.reload();
        """)
        time.sleep(3) # Wait for reload

        # Skip start screen
        page.evaluate("document.getElementById('start-btn').click()")
        time.sleep(1)
        # Open Menu
        page.evaluate("document.getElementById('menu-btn').click()")
        time.sleep(1)

        # Click Feed Lion
        page.evaluate("""
            const cards = document.querySelectorAll('.game-select-card');
            for (const card of cards) {
                if (card.textContent.includes('Feed Lion')) {
                    card.click();
                    break;
                }
            }
        """)

        # Wait for stage
        try:
            page.wait_for_selector("#feed-lion-stage", timeout=5000)
            print("SUCCESS: Game stage loaded.")
        except:
            print("FAILURE: Stage timeout.")
            sys.exit(1)

        time.sleep(2)

        # Check Food Items are Emojis
        # We look for text content in .food-item
        foods = page.locator(".food-item")
        count = foods.count()
        if count == 0:
             print("FAILURE: No food items found.")
             sys.exit(1)

        first_food_text = foods.first.inner_text()
        print(f"Food Item Text: '{first_food_text}'")

        # Simple check if it looks like an emoji (not empty, not SVG markup)
        if len(first_food_text) > 0 and "<svg" not in first_food_text:
             print("SUCCESS: Food items are text/emoji.")
        else:
             print(f"FAILURE: Food items contain unexpected content: {first_food_text}")

        # Check Lion exists
        lion = page.locator(".lion-container svg")
        if lion.count() > 0:
             print("SUCCESS: Lion SVG present.")
        else:
             print("FAILURE: Lion SVG missing.")

        # Optional: Simulate drag to check mouth?
        # Playwright drag_and_drop might trigger the events
        # We can check if class changes or innerHTML changes
        # But capturing "during drag" state is hard in sync script without polling.
        # We trust the code change for now, or use evaluate to trigger dragstart manually.

        # Visual Check
        page.screenshot(path="verify_feed_lion_update.png")
        print("Saved verify_feed_lion_update.png")
        browser.close()

if __name__ == "__main__":
    run()
