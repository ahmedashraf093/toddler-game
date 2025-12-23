from playwright.sync_api import sync_playwright
import time
import sys
import json

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(**p.devices['Pixel 5'])
        page = context.new_page()

        # Mock Audio
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

        # Unlock game
        page.evaluate("""
            localStorage.setItem('toddler_game_challenges_v1', JSON.stringify({
                completedDays: [1, 2, 3],
                lastPlayed: Date.now()
            }));
            location.reload();
        """)
        time.sleep(3)

        page.evaluate("document.getElementById('start-btn').click()")
        time.sleep(1)
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

        try:
            page.wait_for_selector("#feed-lion-stage", timeout=5000)
            print("SUCCESS: Game stage loaded.")
        except:
            print("FAILURE: Stage timeout.")
            sys.exit(1)

        time.sleep(2)

        # Check Food Items structure
        # Should be .food-item > .food-wiggle
        food_wiggle = page.locator(".food-item .food-wiggle").first
        if food_wiggle.count() > 0:
             print("SUCCESS: Food item has wiggle wrapper.")
             # Verify animation property via computed style
             anim_name = food_wiggle.evaluate("el => getComputedStyle(el).animationName")
             print(f"Animation Name: {anim_name}")
             if "gentle-wiggle" in anim_name:
                 print("SUCCESS: Animation is applied.")
             else:
                 print("WARNING: Animation name mismatch or missing.")
        else:
             print("FAILURE: Food item missing wiggle wrapper.")

        page.screenshot(path="verify_wiggle.png")
        print("Saved verify_wiggle.png")
        browser.close()

if __name__ == "__main__":
    run()
