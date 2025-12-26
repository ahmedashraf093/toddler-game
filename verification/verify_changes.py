from playwright.sync_api import sync_playwright

def verify_frontend_changes():
    """
    Verification script for Palette's accessibility changes to index.html.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Using mobile view to check responsive impact too
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()

        # Mock Audio & aggressive loader hiding (standard for this repo)
        page.add_init_script("""
            window.AudioContext = class {
                createGain() { return { connect: () => {}, gain: { value: 0, linearRampToValueAtTime: () => {} } }; }
                createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 } }; }
                decodeAudioData() { return Promise.resolve({}); }
                createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, buffer: null }; }
            };
            window.webkitAudioContext = window.AudioContext;
            const style = document.createElement('style');
            style.innerHTML = `
                * { animation: none !important; transition: none !important; }
                #loading-screen { display: none !important; }
            `;
            document.head.appendChild(style);
        """)

        # Serve static file via file:// protocol is tricky with modules, so using localhost
        # Assuming server is running on 8080 (started in prev step, but I killed it. I need to restart it.)
        # Actually I need to restart it in the bash session. I will assume it is running or I will start it.
        # But for this script I will rely on the user running the server or I will start it via subprocess if needed.
        # Since I cannot use subprocess to start persistent server easily here without blocking, I should have kept it running.
        # I will use http://localhost:8080.

        try:
            page.goto("http://localhost:8080/index.html")
        except:
             print("Error: Server not running on 8080.")
             return

        # 1. Verify Loading Screen ARIA
        # We can't easily screenshot the loader as it's hidden by my script, but we can verify DOM.
        # But wait, my script hides it!
        # I should check the DOM attribute on the hidden element.
        loader = page.locator("#loading-screen")
        role = loader.get_attribute("role")
        aria_live = loader.get_attribute("aria-live")

        print(f"Loader: role={role}, aria-live={aria_live}")

        # 2. Verify Parental Gate Buttons
        # Force show the parental gate to take a screenshot
        page.evaluate("document.getElementById('parental-gate-overlay').classList.remove('hidden')")

        # Verify Attributes via locator
        clear_btn = page.locator("button[data-val='clear']")
        enter_btn = page.locator("button[data-val='enter']")

        clear_label = clear_btn.get_attribute("aria-label")
        enter_label = enter_btn.get_attribute("aria-label")

        print(f"Clear Button: {clear_label}")
        print(f"Enter Button: {enter_label}")

        # Take screenshot of the Parental Gate
        page.screenshot(path="verification/verification.png")

        browser.close()

if __name__ == "__main__":
    verify_frontend_changes()
