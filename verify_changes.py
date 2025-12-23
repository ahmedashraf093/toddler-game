from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mock AudioContext to prevent errors
        page.add_init_script("""
            window.AudioContext = class {
                createGain() { return { connect: () => {}, gain: { value: 0, linearRampToValueAtTime: () => {} } }; }
                createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 } }; }
                decodeAudioData() { return Promise.resolve({}); }
                createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, buffer: null }; }
            };
            window.webkitAudioContext = window.AudioContext;
        """)

        # Disable animations and HIDE LOADING SCREEN
        page.add_init_script("""
            const style = document.createElement('style');
            style.innerHTML = `
                * { animation: none !important; transition: none !important; }
                #loading-screen { display: none !important; visibility: hidden !important; opacity: 0 !important; }
            `;
            document.head.appendChild(style);
        """)

        # Navigate to the game
        page.goto("http://localhost:8080/index.html")

        # 1. Verify CSS Changes
        print("Verifying Global CSS...")

        # Helper to get computed style
        def get_computed_style(prop):
            return page.evaluate(f"window.getComputedStyle(document.body).getPropertyValue('{prop}')")

        user_select = get_computed_style("user-select")
        print(f"user-select: {user_select}")

        if user_select != 'none':
            print("FAILURE: user-select is not 'none'")
        else:
            print("SUCCESS: user-select is 'none'")

        # 2. Verify Memory Game Preview
        print("Verifying Memory Game Preview...")

        # Wait for start btn to be clickable
        page.wait_for_selector("#start-btn", state="visible")

        # Use evaluate click to force it
        print("Clicking Start...")
        page.evaluate("document.getElementById('start-btn').click()")

        # Wait for Menu button
        page.wait_for_selector("#menu-btn", state="visible")
        print("Clicking Menu...")
        page.evaluate("document.getElementById('menu-btn').click()")

        # Wait a bit
        page.wait_for_timeout(500)

        # Click Memory Card
        print("Clicking Memory Game Card...")
        # Ensure overlay is visible just in case
        page.evaluate("document.getElementById('games-menu-overlay').classList.remove('hidden')")
        page.evaluate("document.querySelector('[aria-label=\"Play Memory\"]').click()")

        # Wait for game initialization
        page.wait_for_selector(".memory-card")

        # IMMEDIATELY check for flipped class
        cards = page.locator(".memory-card")
        count = cards.count()
        print(f"Found {count} cards.")

        if count == 0:
             print("FAILURE: No cards found.")
             return

        first_card = cards.first

        # Check immediate state (should be flipped)
        classes_start = first_card.get_attribute("class")
        print(f"Initial classes: {classes_start}")

        if "flipped" in classes_start:
            print("SUCCESS: Card is flipped initially.")
        else:
            print("FAILURE: Card is NOT flipped initially.")

        # Wait for timeout (2000ms + buffer)
        print("Waiting for preview to end (2.5s)...")
        page.wait_for_timeout(2500)

        # Check final state (should NOT be flipped)
        classes_end = first_card.get_attribute("class")
        print(f"Final classes: {classes_end}")

        if "flipped" not in classes_end:
            print("SUCCESS: Card is NOT flipped after timeout.")
        else:
            print("FAILURE: Card IS STILL flipped after timeout.")

        browser.close()

if __name__ == "__main__":
    verify_changes()
