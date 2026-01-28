import sys
import time
import subprocess
from playwright.sync_api import sync_playwright, expect

def run_verification():
    # Start server
    print("Starting server...")
    server_process = subprocess.Popen([sys.executable, "-m", "http.server", "8080"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2) # Wait for server

    try:
        with sync_playwright() as p:
            print("Launching browser...")
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(reduced_motion='reduce')
            page = context.new_page()

            # Mock Audio to prevent errors
            page.add_init_script("""
                window.AudioContext = function() {
                    return {
                        createGain: () => ({ connect: () => {}, gain: { value: 0 } }),
                        createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {} }),
                        destination: {},
                        state: 'suspended',
                        resume: () => Promise.resolve(),
                        suspend: () => Promise.resolve()
                    };
                };
                window.speechSynthesis = {
                    speak: () => {},
                    cancel: () => {},
                    getVoices: () => []
                };
                window.SpeechSynthesisUtterance = function() {};
            """)

            # Block Service Worker
            context.route("**/js/sw-register.js", lambda route: route.abort())

            # Capture console logs
            page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))

            url = "http://localhost:8080/index.html"
            print(f"Navigating to {url}")
            page.goto(url)
            page.wait_for_load_state("networkidle")

            # Disable animations for stability
            page.add_style_tag(content="* { animation: none !important; transition: none !important; }")

            # Hide start screen to access menu button
            page.evaluate("document.getElementById('start-screen').style.display = 'none';")

            # 1. Click Menu Button
            print("Focusing and activating Menu Button...")
            page.focus("#menu-btn")
            page.keyboard.press("Enter")

            # Wait for overlay
            overlay = page.locator("#games-menu-overlay")
            expect(overlay).to_be_visible()

            # 2. Verify Focus is on Close Button
            print("Verifying Focus on Close Button...")
            # Wait a bit for the focus timeout
            page.wait_for_timeout(200)

            focused_class = page.evaluate("document.activeElement.className")
            print(f"Focused element class: {focused_class}")

            if "close-menu-btn" not in focused_class:
                print("❌ Focus NOT on close button!")
                # Print what it is
                outer = page.evaluate("document.activeElement.outerHTML")
                print(f"Actual active element: {outer}")
                sys.exit(1)
            else:
                print("✅ Focus is on close button.")

            # 3. Close Menu via keyboard (Enter on close button)
            print("Closing Menu via Enter key...")
            page.keyboard.press("Enter")

            # Wait for hidden
            expect(overlay).to_be_hidden()

            # 4. Verify Focus returns to Menu Button
            print("Verifying Focus returned to Menu Button...")
            page.wait_for_timeout(100)

            focused_id_after = page.evaluate("document.activeElement.id")
            print(f"Focused element ID: {focused_id_after}")

            if focused_id_after != "menu-btn":
                print("❌ Focus DID NOT return to menu button!")
                outer = page.evaluate("document.activeElement.outerHTML")
                print(f"Actual active element: {outer}")
                sys.exit(1)
            else:
                print("✅ Focus returned to menu button.")

            # 5. Verify ARIA attributes on overlay
            print("Verifying ARIA attributes...")
            role = overlay.get_attribute("role")
            modal = overlay.get_attribute("aria-modal")
            labelledby = overlay.get_attribute("aria-labelledby")

            if role != "dialog":
                print(f"❌ Incorrect role: {role}")
                sys.exit(1)
            if modal != "true":
                print(f"❌ Incorrect aria-modal: {modal}")
                sys.exit(1)
            if labelledby != "games-menu-title":
                print(f"❌ Incorrect aria-labelledby: {labelledby}")
                sys.exit(1)

            print("✅ ARIA attributes correct.")

            browser.close()
            print("🎉 Verification Passed!")

    finally:
        server_process.kill()

if __name__ == "__main__":
    run_verification()
