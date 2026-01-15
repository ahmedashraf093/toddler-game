
from playwright.sync_api import sync_playwright

def verify_difficulty_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Block Service Worker
        page.route("**/js/sw-register.js", lambda route: route.abort())

        # Mock window.AudioContext and others
        page.add_init_script("""
            window.AudioContext = function() {
                return {
                    createGain: () => ({ gain: { value: 0 }, connect: () => {} }),
                    createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 } }),
                    destination: {},
                    resume: () => Promise.resolve(),
                    state: 'running'
                };
            };
            window.speechSynthesis = {
                speak: () => {},
                cancel: () => {},
                getVoices: () => [],
                onvoiceschanged: null
            };
            window.SpeechSynthesisUtterance = function() {};
        """)

        # Disable animations
        page.add_init_script("""
            const style = document.createElement('style');
            style.textContent = '* { animation: none !important; transition: none !important; }';
            document.head.appendChild(style);
        """)

        # Load the page (assuming running locally on port 8080)
        page.goto("http://localhost:8080")

        # Wait for loading screen to be hidden
        page.wait_for_selector("#loading-screen", state="hidden")

        # Click start button (forcing)
        page.click("#start-btn", force=True)

        # Open menu and select Math game
        page.click("#menu-btn", force=True)
        page.click("div[class*='game-select-card']:has-text('Math Party')", force=True)

        # Click Hard button
        print("Clicking Hard button...")
        page.click(".diff-btn.diff-hard") # Should work without force=True now

        # Check if gameState was updated
        difficulty = page.evaluate("window.gameState.mathDifficulty")
        print(f"Current difficulty in state: {difficulty}")

        # Take screenshot
        page.screenshot(path="verification/difficulty_fixed.png")
        print("Screenshot saved to verification/difficulty_fixed.png")

        browser.close()

if __name__ == "__main__":
    verify_difficulty_screenshot()
