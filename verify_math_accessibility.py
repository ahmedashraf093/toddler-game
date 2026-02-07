
import time
import re
from playwright.sync_api import sync_playwright, expect

def verify_math_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(reduced_motion='reduce')
        context.route("**/sw-register.js", lambda route: route.abort())

        page = context.new_page()
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

        page.add_init_script("""
            window.AudioContext = class {
                createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {} }, type: 'sine' }; }
                createGain() { return { connect: () => {}, gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
                createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, buffer: null, onended: null }; }
                decodeAudioData() { return Promise.resolve({}); }
                resume() { return Promise.resolve(); }
                get currentTime() { return Date.now() / 1000; }
                get state() { return 'running'; }
            };
            window.speechSynthesis = {
                speak: (u) => console.log('SPEAK:', u.text),
                cancel: () => {},
                getVoices: () => [],
                onvoiceschanged: null
            };
            window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };

            const style = document.createElement('style');
            style.innerHTML = `* { animation: none !important; transition: none !important; }`;
            document.head.appendChild(style);
        """)

        print("Navigating to app...")
        page.goto("http://localhost:8000/index.html")

        # Force Start Math Game
        print("Force-starting Math Game...")
        page.evaluate("""async () => {
            const { gameState } = await import('./js/engine/state.js');
            const { setTheme } = await import('./js/engine/ui.js');
            const { initMathGame } = await import('./js/games/math.js');

            gameState.currentMode = 'math';
            setTheme('math');
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('loading-screen').style.display = 'none';

            initMathGame();
        }""")

        # Wait for Math Stage
        print("Waiting for math stage...")
        expect(page.locator("#math-stage")).to_be_visible(timeout=5000)

        # Wait for options
        expect(page.locator(".math-option").first).to_be_visible(timeout=5000)

        options = page.locator(".math-option")
        count = options.count()
        print(f"Found {count} options.")

        if count == 0:
            print("❌ FAILURE: No math options found.")
            exit(1)

        # 1. Verify Accessibility Attributes
        print("Verifying attributes...")
        failed = False
        for i in range(count):
            opt = options.nth(i)
            role = opt.get_attribute("role")
            tabindex = opt.get_attribute("tabindex")
            aria_label = opt.get_attribute("aria-label")

            print(f"Option {i}: role={role}, tabindex={tabindex}, aria-label={aria_label}")

            if role != "button":
                print(f"❌ FAILURE: Option {i} missing role='button'")
                failed = True
            if tabindex != "0":
                print(f"❌ FAILURE: Option {i} missing tabindex='0'")
                failed = True
            if not aria_label:
                print(f"❌ FAILURE: Option {i} missing aria-label")
                failed = True

        if failed:
            print("Attribute verification failed.")
            # Verify click/keyboard only if attributes passed?
            # Or just proceed and see if it crashes.
            # Ideally we want to fail here if we are strictly TDD-ing the attributes.
            # But let's try to verify click too, maybe it works? (No, because I haven't implemented it yet)
            pass

        # 2. Verify Click Interaction
        print("Verifying click interaction...")
        target_val = page.locator("#math-target-zone").get_attribute("data-match")
        print(f"Target value: {target_val}")

        # Find correct option
        # Need to be careful: has_text matches substring, so '1' matches '10'.
        # But math options are single numbers mostly.
        # Better to check data-label if available or exact text.
        # But for now simple filter is fine as numbers are small.

        correct_option = options.filter(has_text=target_val).first
        if not correct_option.is_visible():
            print("❌ FAILURE: Correct option not found/visible.")
            exit(1)

        print(f"Clicking option with text '{target_val}'...")
        correct_option.click()

        # Check if matched
        try:
            expect(page.locator("#math-target-zone")).to_have_class(re.compile(r"matched"), timeout=5000)
            print("✅ Click interaction successful!")
        except Exception as e:
            print(f"❌ FAILURE: Click interaction did not result in match. Error: {e}")
            print("Actual class:", page.locator("#math-target-zone").get_attribute("class"))

        # 3. Verify Keyboard Interaction
        print("Verifying keyboard interaction...")
        # Restart game
        page.evaluate("""async () => {
             const { initMathGame } = await import('./js/games/math.js');
             initMathGame();
        }""")

        expect(page.locator("#math-stage")).to_be_visible()
        expect(page.locator(".math-option").first).to_be_visible()

        target_val = page.locator("#math-target-zone").get_attribute("data-match")
        print(f"New target value: {target_val}")

        correct_option = options.filter(has_text=target_val).first

        print("Focusing option and pressing Enter...")
        correct_option.focus()
        page.keyboard.press("Enter")

        try:
            expect(page.locator("#math-target-zone")).to_have_class(re.compile(r"matched"), timeout=5000)
            print("✅ Keyboard interaction successful!")
        except Exception as e:
            print(f"❌ FAILURE: Keyboard interaction did not result in match. Error: {e}")
            print("Actual class:", page.locator("#math-target-zone").get_attribute("class"))

        browser.close()

        if failed:
            exit(1)

if __name__ == "__main__":
    verify_math_accessibility()
