from playwright.sync_api import sync_playwright
import sys
import time
import re

def verify_bubbles():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Abort Service Worker registrations
        context.route("**/sw-register.js", lambda route: route.abort())
        context.route("**/sw.js", lambda route: route.abort())

        page = context.new_page()

        # Mock AudioContext and speechSynthesis
        page.add_init_script("""
            window.AudioContext = class {
                createOscillator() { return { type: '', frequency: { setValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }; }
                createGain() { return { gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} }; }
                decodeAudioData(data) { return Promise.resolve({}); }
                get destination() { return {}; }
                get currentTime() { return 0; }
            };
            window.webkitAudioContext = window.AudioContext;
            window.speechSynthesis = { speak: () => {}, cancel: () => {}, getVoices: () => [] };
            window.SpeechSynthesisUtterance = class { constructor() {} };
        """)

        page.goto("http://localhost:8000/index.html")

        # Bypass Parental Gate and start game
        page.evaluate("localStorage.setItem('parentalGateStartTime', Date.now().toString());")

        # Hide start screen
        page.evaluate("document.getElementById('start-screen').style.display = 'none';")

        print("Testing Bubble Pop...")
        # Start Bubble Pop Game
        page.evaluate("""
            import('./js/games/bubble-pop.js').then(module => {
                module.initBubblePopGame();
            });
        """)

        # Pause animations on bubbles
        page.add_style_tag(content=".bubble { animation-play-state: paused !important; }")

        page.wait_for_selector(".bubble")
        bubbles = page.locator(".bubble")

        count = bubbles.count()
        print(f"Found {count} bubbles in Bubble Pop.")

        for i in range(count):
            bubble = bubbles.nth(i)
            role = bubble.get_attribute("role")
            tabindex = bubble.get_attribute("tabindex")
            aria_label = bubble.get_attribute("aria-label")
            val = bubble.evaluate("el => el.dataset.value")

            assert role == "button", f"Expected role='button', got '{role}'"
            assert tabindex == "0", f"Expected tabindex='0', got '{tabindex}'"
            assert aria_label == val, f"Expected aria-label='{val}', got '{aria_label}'"

            # Focus and simulate keydown
            bubble.focus()
            bubble.press("Enter")

            classes = bubble.get_attribute("class")
            if val == page.locator(".bubble-instruction b").inner_text():
                assert "popped" in classes, "Target bubble should have 'popped' class after Enter"
            else:
                assert "shake" in classes, "Wrong bubble should have 'shake' class after Enter"

        print("Bubble Pop tested successfully.")

        print("Testing Alphabet Pop...")
        # Start Alphabet Pop Game
        page.evaluate("""
            import('./js/games/alphabet-pop.js').then(module => {
                module.initAlphabetPopGame();
            });
        """)

        page.wait_for_selector("#alphabet-stage .bubble")
        bubbles_alpha = page.locator("#alphabet-stage .bubble")

        count_alpha = bubbles_alpha.count()
        print(f"Found {count_alpha} bubbles in Alphabet Pop.")

        for i in range(count_alpha):
            bubble = bubbles_alpha.nth(i)
            role = bubble.get_attribute("role")
            tabindex = bubble.get_attribute("tabindex")
            aria_label = bubble.get_attribute("aria-label")
            val = bubble.evaluate("el => el.dataset.value")

            assert role == "button", f"Expected role='button', got '{role}'"
            assert tabindex == "0", f"Expected tabindex='0', got '{tabindex}'"
            assert aria_label == val, f"Expected aria-label='{val}', got '{aria_label}'"

            # Focus and simulate keydown
            bubble.focus()
            bubble.press("Space")

            classes = bubble.get_attribute("class")
            if val == page.locator("#alphabet-stage .bubble-instruction b").inner_text():
                assert "popped" in classes, "Target bubble should have 'popped' class after Space"
            else:
                assert "shake" in classes, "Wrong bubble should have 'shake' class after Space"

        print("Alphabet Pop tested successfully.")

        browser.close()

if __name__ == "__main__":
    verify_bubbles()
