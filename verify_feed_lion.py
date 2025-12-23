from playwright.sync_api import sync_playwright

def verify_feed_lion():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        page.add_init_script("""
            window.AudioContext = class {
                createGain() { return { connect: () => {}, gain: { value: 0 } }; }
                createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
                decodeAudioData(data) { return Promise.resolve({}); }
                createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, buffer: {} }; }
            };
            localStorage.setItem('toddler_game_challenges_v1', JSON.stringify({
                completedDays: [1],
                currentDay: 2,
                progress: {}
            }));
        """)

        # Disable Animations & Hide Loader Aggressively
        page.add_style_tag(content="""
            *, *::before, *::after {
                transition: none !important;
                animation: none !important;
            }
            #loading-screen { display: none !important; }
        """)

        page.goto("http://localhost:8080")

        # Click Start and Ensure Start Screen Gone
        page.eval_on_selector("#start-btn", "el => el.click()")
        page.wait_for_timeout(500)
        page.evaluate("document.getElementById('start-screen').style.display = 'none'")

        # Open Menu
        page.eval_on_selector("#menu-btn", "el => el.click()")
        page.wait_for_timeout(500)

        # Click Feed Lion
        # Use eval to click to bypass any overlay issues
        feed_btn = page.locator(".game-select-card").filter(has_text="Feed Lion")
        if feed_btn.count() > 0:
            is_locked = page.evaluate("el => el.classList.contains('locked')", feed_btn.element_handle())
            if is_locked:
                print("FAIL: Game is locked")
            else:
                print("SUCCESS: Game is unlocked")
                # Force click via JS to be safe
                feed_btn.evaluate("el => el.click()")
                page.wait_for_timeout(1000)

                # Check for Lion
                lion = page.locator(".lion-container")
                if lion.count() > 0:
                     print("SUCCESS: Lion container found")
                     page.screenshot(path="verification_feed_lion.png")
                else:
                     print("FAIL: Lion container not found")
        else:
            print("FAIL: Feed Lion card not found")

        browser.close()

if __name__ == "__main__":
    verify_feed_lion()
