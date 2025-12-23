from playwright.sync_api import sync_playwright

def verify_accessibility():
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

        # Disable animations and hide loader aggressively
        page.add_init_script("""
            const style = document.createElement('style');
            style.innerHTML = `
                * { animation: none !important; transition: none !important; }
                #loading-screen { display: none !important; }
            `;
            document.head.appendChild(style);
        """)

        # Navigate to the game
        page.goto("http://localhost:8080/index.html")

        # Wait for start btn
        page.wait_for_selector("#start-btn")

        # Click Play
        page.evaluate("document.getElementById('start-btn').click()")

        # Open Menu
        page.wait_for_selector("#menu-btn")
        page.evaluate("document.getElementById('menu-btn').click()")

        # Wait a bit for JS to process
        page.wait_for_timeout(500)

        # Check if overlay is visible
        is_hidden = page.evaluate("document.getElementById('games-menu-overlay').classList.contains('hidden')")
        print(f"Menu hidden: {is_hidden}")

        if is_hidden:
            print("Forcing menu show...")
            page.evaluate("document.getElementById('games-menu-overlay').classList.remove('hidden')")

        # Select Memory Game - FORCE click via JS if standard click fails
        print("Clicking Memory card...")
        page.evaluate("document.querySelector('[aria-label=\"Play Memory\"]').click()")

        # Wait for game to load
        page.wait_for_selector(".memory-card")

        # Verify Memory Cards have correct attributes
        cards = page.locator(".memory-card").all()
        print(f"Found {len(cards)} memory cards")

        for i, card in enumerate(cards):
            role = card.get_attribute("role")
            tabindex = card.get_attribute("tabindex")
            label = card.get_attribute("aria-label")

            print(f"Card {i}: role={role}, tabindex={tabindex}, label={label}")

            if role != "button":
                print(f"Error: Card {i} missing role=button")
            if tabindex != "0":
                print(f"Error: Card {i} missing tabindex=0")
            if label != "Hidden card":
                print(f"Error: Card {i} has incorrect initial label: {label}")

        # Simulate keyboard interaction on first card
        print("Simulating keyboard interaction...")
        cards[0].press("Enter")

        # Wait for flip
        page.wait_for_timeout(500)

        # Check label after flip
        new_label = cards[0].get_attribute("aria-label")
        print(f"Card 0 label after flip: {new_label}")
        if new_label == "Hidden card":
             print("Error: Label did not update after flip")

        # Take screenshot of memory game
        page.screenshot(path="verification_memory.png")

        # Now check Odd One Out
        page.evaluate("document.getElementById('menu-btn').click()")
        page.wait_for_timeout(500)

        # Force show menu again if needed
        page.evaluate("document.getElementById('games-menu-overlay').classList.remove('hidden')")

        print("Clicking Odd One card...")
        page.evaluate("document.querySelector('[aria-label=\"Play Odd One\"]').click()")

        page.wait_for_selector(".odd-one-card")

        odd_cards = page.locator(".odd-one-card").all()
        print(f"Found {len(odd_cards)} odd one out cards")

        for i, card in enumerate(odd_cards):
            role = card.get_attribute("role")
            tabindex = card.get_attribute("tabindex")
            label = card.get_attribute("aria-label")

            print(f"Odd Card {i}: role={role}, tabindex={tabindex}, label={label}")

            if role != "button":
                print(f"Error: Odd Card {i} missing role=button")
            if tabindex != "0":
                print(f"Error: Odd Card {i} missing tabindex=0")
            if not label:
                print(f"Error: Odd Card {i} missing label")

        page.screenshot(path="verification_oddone.png")

        browser.close()

if __name__ == "__main__":
    verify_accessibility()
