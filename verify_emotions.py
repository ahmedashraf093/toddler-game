
import os
from playwright.sync_api import sync_playwright, expect

def verify_emotions_scroll():
    with sync_playwright() as p:
        iphone_se = p.devices['iPhone SE']
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(**iphone_se)

        # Block SW
        context.route("**/js/sw-register.js", lambda route: route.abort())

        page = context.new_page()
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

        page.add_init_script("""
            // Mock SpeechSynthesis
            Object.defineProperty(window, 'speechSynthesis', {
                value: { speak: () => {}, cancel: () => {}, getVoices: () => [], onvoiceschanged: null },
                writable: true
            });
            window.SpeechSynthesisUtterance = class { constructor() {} };
            localStorage.setItem('challengeState', JSON.stringify({ completedDays: 100, lastDailyDate: new Date().toISOString() }));

            const style = document.createElement('style');
            style.innerHTML = `*, *::before, *::after { animation: none !important; transition: none !important; }`;
            document.head.appendChild(style);
        """)

        try:
            print("Loading game...")
            page.goto("http://localhost:8080/index.html")
            expect(page.locator("#start-btn")).to_be_visible(timeout=10000)

            print("Injecting Force-Start Logic...")
            page.evaluate("""async () => {
                const mod = await import('./js/games/emotions.js');
                document.getElementById('start-screen').style.display = 'none';
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('games-menu-overlay').style.display = 'none';

                const stage = document.getElementById('emotions-stage');
                if(stage) {
                    stage.classList.remove('hidden');
                    stage.classList.add('active');
                    stage.style.display = 'flex';
                }
                mod.initEmotionGame();
            }""")

            stage = page.locator("#emotions-stage")
            expect(stage).to_be_visible(timeout=5000)

            # Check dimensions
            print("Checking dimensions...")
            dims = page.evaluate("""() => {
                const stage = document.getElementById('emotions-stage');
                return {
                    windowHeight: window.innerHeight,
                    bodyHeight: document.body.clientHeight,
                    stageClientHeight: stage.clientHeight,
                    stageScrollHeight: stage.scrollHeight,
                    stageScrollTop: stage.scrollTop,
                    bodyOverflow: window.getComputedStyle(document.body).overflow
                };
            }""")

            print(f"Dimensions: {dims}")

            # Screenshot
            os.makedirs("verification", exist_ok=True)
            screenshot_path = "verification/emotions_debug.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Verification failed: {e}")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_emotions_scroll()
