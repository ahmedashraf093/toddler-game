from playwright.sync_api import sync_playwright

def verify_next_round_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mock window.AudioContext and other audio-related APIs
        page.add_init_script("""
            window.AudioContext = function() {
                return {
                    createGain: () => ({ connect: () => {}, gain: { value: 0 } }),
                    createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 } }),
                    destination: {},
                    currentTime: 0,
                    state: 'running',
                    resume: () => Promise.resolve(),
                    suspend: () => Promise.resolve()
                };
            };
            window.webkitAudioContext = window.AudioContext;
            window.speechSynthesis = {
                speak: () => {},
                cancel: () => {},
                pause: () => {},
                resume: () => {},
                getVoices: () => []
            };
            window.SpeechSynthesisUtterance = function() {};
        """)

        # Stop animations to help with stability
        page.add_style_tag(content="""
            * {
                animation: none !important;
                transition: none !important;
            }
        """)

        # Go to the app
        page.goto("http://localhost:8080/index.html")

        # Wait for loading screen to disappear
        page.wait_for_selector("#loading-screen", state="hidden")

        # Wait for start screen
        page.wait_for_selector("#start-btn")

        # Ensure loading screen is effectively gone
        page.evaluate("document.getElementById('loading-screen').remove()")

        # Click start button using js to avoid stability check issues if animations persist
        page.evaluate("document.getElementById('start-btn').click()")

        # Wait for game to "start" (start screen hidden)
        page.wait_for_selector("#start-screen", state="hidden")

        # Trigger the "Next Round" button display via console
        page.evaluate("""
            import('./js/engine/ui.js').then(module => {
                module.showNextRoundButton();
            });
        """)

        # Wait a bit for execution
        page.wait_for_timeout(1000)

        # Check if button is visible
        btn = page.locator("#reset-btn")
        if btn.is_visible():
            print("Reset button is visible")
        else:
            print("Reset button is NOT visible")

        # Check if focused
        # We need to wait a bit as the focus is in a setTimeout(..., 100)
        page.wait_for_timeout(200)
        is_focused = page.evaluate("document.activeElement === document.getElementById('reset-btn')")
        print(f"Is reset button focused? {is_focused}")

        # Take screenshot
        page.screenshot(path="verification/next_round_btn.png")

        browser.close()

if __name__ == "__main__":
    verify_next_round_button()
