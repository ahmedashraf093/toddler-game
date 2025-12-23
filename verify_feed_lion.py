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

        # Disable Animations Globally
        page.add_style_tag(content="""
            *, *::before, *::after {
                transition: none !important;
                animation: none !important;
            }
            #loading-screen { display: none !important; }
        """)

        page.goto("http://localhost:8080")
        page.wait_for_timeout(1000)

        # JS Click Start
        page.evaluate("document.getElementById('start-btn').click()")
        page.wait_for_timeout(500)

        # Ensure Start Screen is Hidden
        page.evaluate("document.getElementById('start-screen').style.display = 'none'")

        # Click Menu
        page.evaluate("document.getElementById('menu-btn').click()")
        page.wait_for_timeout(1000)

        # Click Feed Lion Card (by finding it in DOM)
        page.evaluate("""
            const cards = Array.from(document.querySelectorAll('.game-select-card'));
            const lionCard = cards.find(c => c.textContent.includes('Feed Lion'));
            if(lionCard) lionCard.click();
        """)

        page.wait_for_timeout(2000)

        # Screenshot
        if page.locator(".lion-container").is_visible():
            print("SUCCESS: Lion found")
            page.screenshot(path="verification_feed_lion_enhanced.png")
        else:
            print("FAIL: Lion not visible")

        browser.close()

if __name__ == "__main__":
    verify_feed_lion()
