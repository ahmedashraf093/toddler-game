from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Mock audio
    page.add_init_script("""
        window.AudioContext = class {
            constructor() { this.state = 'suspended'; }
            resume() { return Promise.resolve(); }
            createGain() { return { gain: { value: 1 }, connect: () => {} }; }
            createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 } }; }
            destination = {};
        };
        window.speechSynthesis = {
            speak: () => {},
            cancel: () => {},
            getVoices: () => []
        };
        window.SpeechSynthesisUtterance = class {};
    """)

    page.goto("http://localhost:8081")
    page.wait_for_selector("#loading-screen", state="hidden")

    # Hide start screen
    page.evaluate("document.getElementById('start-screen').style.display = 'none';")
    # Start session manually to ensure timer is set
    page.evaluate("localStorage.setItem('parentalGateStartTime', Date.now())")

    # Simulate expired time
    print("Simulating expired timer...")
    page.evaluate("""
        const expired = Date.now() - (20 * 60 * 1000); // 20 mins ago
        localStorage.setItem('parentalGateStartTime', expired);
    """)

    # Wait for the interval to catch it (max 2s should be enough if interval is 1s)
    print("Waiting for Parental Gate...")
    try:
        # We need to wait for the interval to fire.
        # The interval starts in `startGame` -> `ParentalGate.startSession()`.
        # We need to trigger `startGame` logic or simulate it.
        # Clicking start-btn calls startGame.
        # But we hid start screen.
        # Let's call startGame manually or rely on 'load' event if it calls init.
        # main.js: load -> ParentalGate.init().
        # main.js: startGame -> ParentalGate.startSession().
        # We need to call startSession.

        # We can try to click the hidden start button.
        page.evaluate("document.getElementById('start-btn').click()")

        page.wait_for_selector("#parental-gate-overlay:not(.hidden)", state="visible", timeout=5000)
        print("Parental Gate appeared.")
    except Exception as e:
        print(f"Parental Gate did not appear automatically: {e}. Trying manual toggle.")
        page.evaluate("window.toggleParentalGate(true)")
        page.wait_for_selector("#parental-gate-overlay:not(.hidden)", state="visible")

    # Test Escape
    print("Pressing Escape...")
    page.keyboard.press("Escape")

    # Wait for hide
    page.wait_for_selector("#parental-gate-overlay", state="hidden")
    print("Parental Gate hidden via Escape.")

    # Verify it doesn't reappear immediately (timer reset check)
    page.wait_for_timeout(2000)
    expect(page.locator("#parental-gate-overlay")).to_be_hidden()
    print("Parental Gate did not reappear (Timer reset confirmed).")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
