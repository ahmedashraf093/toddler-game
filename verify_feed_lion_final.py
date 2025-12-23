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
        # Access denied for localStorage on about:blank usually, or cross-origin.
        # We should go to localhost first.
        page.goto("http://localhost:8085/index.html")

        # Clear storage and reload to ensure locked state
        page.evaluate("localStorage.clear(); location.reload();")
        time.sleep(2)

        # Verify Start Screen Hint
        hint = page.locator(".locked-game-hint")
        if hint.count() > 0:
            print("SUCCESS: Start screen hint found.")
        else:
            print("FAILURE: Start screen hint missing.")
            print("Start Screen HTML:")
            print(page.locator("#start-screen").inner_html())

        # Go to Menu
        page.evaluate("""
            const start = document.getElementById('start-screen');
            if(start) start.style.display = 'none';
            const loader = document.getElementById('loading-screen');
            if(loader) loader.remove();
            const menu = document.getElementById('games-menu-overlay');
            if(menu) menu.classList.remove('hidden');
        """)
        time.sleep(1)

        # Verify 'Feed' is gone and 'Feed Lion' exists
        card_texts = page.evaluate("""
            Array.from(document.querySelectorAll('.game-select-card .game-name')).map(el => el.textContent)
        """)

        if "Feed" in card_texts:
             print("FAILURE: Legacy 'Feed' game still in menu.")
        else:
             print("SUCCESS: Legacy 'Feed' game removed.")

        if "Feed Lion" in card_texts:
             print("SUCCESS: 'Feed Lion' game present.")
        else:
             print("FAILURE: 'Feed Lion' game missing.")
             sys.exit(1)

        # Verify Reward Banner on Locked Card
        lion_card = page.locator(".game-select-card").filter(has_text="Feed Lion").first
        banner = lion_card.locator("div").filter(has_text="Reward Game")

        if banner.count() > 0:
            print("SUCCESS: Reward banner found on locked card.")
        else:
            print("FAILURE: Reward banner missing.")

        # Now UNLOCK and Play
        print("Unlocking game...")
        page.evaluate("""
            localStorage.setItem('toddler_game_challenges_v1', JSON.stringify({
                completedDays: [1, 2, 3],
                lastPlayed: Date.now()
            }));
            location.reload();
        """)
        time.sleep(3) # Wait for reload

        # Check that Hint is GONE
        hint = page.locator(".locked-game-hint")
        if hint.count() == 0:
            print("SUCCESS: Start screen hint gone after unlock.")
        else:
            print("WARNING: Start screen hint still present after unlock.")

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
            # Debug: print visible elements
            sys.exit(1)

        time.sleep(2)

        # Visual Check
        page.screenshot(path="verify_final_gameplay.png")
        print("Saved verify_final_gameplay.png")
        browser.close()

if __name__ == "__main__":
    run()
