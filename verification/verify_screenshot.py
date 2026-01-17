import sys
import time
from playwright.sync_api import sync_playwright

def run_test():
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(reduced_motion='reduce')
        page = context.new_page()

        # Mock Audio
        page.add_init_script("""
            window.AudioContext = class {
                createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
                createGain() { return { connect: () => {}, gain: { value: 0, linearRampToValueAtTime: () => {} } }; }
                connect() {}
                resume() { return Promise.resolve(); }
                destination = {};
                currentTime = 0;
            };
            window.webkitAudioContext = window.AudioContext;
            window.speechSynthesis = { speak: () => {}, cancel: () => {}, getVoices: () => [] };
            window.SpeechSynthesisUtterance = class {};
        """)

        print("Navigating...")
        page.goto("http://localhost:8000")

        # Inject styles
        page.add_style_tag(content="* { animation: none !important; transition: none !important; }")

        print("Waiting for start button...")
        try:
            page.wait_for_selector("#start-btn", timeout=10000)
            page.evaluate("document.getElementById('start-btn').click()")
        except:
            print("Start button issue, continuing...")

        print("Opening menu...")
        # Force open menu via JS
        page.evaluate("document.getElementById('menu-btn').click()")

        print("Waiting for game cards...")
        page.wait_for_selector(".game-select-card")

        print("Finding Listening game...")
        # Find the card with text "Listening"
        found = page.evaluate("""() => {
            const cards = Array.from(document.querySelectorAll('.game-select-card'));
            const listening = cards.find(c => c.textContent.includes('Listening'));
            if (listening) {
                listening.click();
                return true;
            }
            return false;
        }""")

        if not found:
            print("Listening game card not found via JS!")
            sys.exit(1)

        print("Clicked Listening game. Waiting for grid...")
        page.wait_for_selector("#listening-grid")
        page.wait_for_selector(".listening-card")

        # Wait a bit for layout
        time.sleep(1)

        print("Checking tabindex...")
        tabindex = page.eval_on_selector(".listening-card", "el => el.getAttribute('tabindex')")
        print(f"Tabindex: {tabindex}")

        # Highlight the element to show it's focused/selected
        page.evaluate("""
            const el = document.querySelector('.listening-card');
            el.style.border = '5px solid red';
            el.focus();
        """)

        page.screenshot(path="verification/listening_a11y.png")
        print("Screenshot saved to verification/listening_a11y.png")

        browser.close()

if __name__ == "__main__":
    run_test()
