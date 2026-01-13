from playwright.sync_api import sync_playwright, expect
import time

def verify_mute_btn():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile emulation to match the app's target
        context = browser.new_context(**p.devices['Pixel 5'])

        # Block SW to prevent caching issues/reloads during test
        context.route("**/sw.js", lambda route: route.abort())
        context.route("**/js/sw-register.js", lambda route: route.abort())

        page = context.new_page()

        # Load the page (assuming server is running on 8000)
        page.goto("http://localhost:8000/index.html")

        # Inject CSS to disable animations for stability
        page.add_style_tag(content="* { animation: none !important; transition: none !important; }")

        # 1. Verify Initial State
        mute_btn = page.locator("#mute-btn")
        expect(mute_btn).to_be_visible()

        initial_label = mute_btn.get_attribute("aria-label")
        print(f"Initial Label: {initial_label}")

        # 2. Click Mute Button
        mute_btn.click()

        # 3. Verify State Change
        new_label = mute_btn.get_attribute("aria-label")
        new_title = mute_btn.get_attribute("title")
        new_pressed = mute_btn.get_attribute("aria-pressed") # Should be None now

        print(f"New Label: {new_label}")
        print(f"New Title: {new_title}")
        print(f"New Pressed: {new_pressed}")

        if initial_label == "Mute Sound":
            assert new_label == "Unmute Sound"
            assert new_title == "Unmute Sound"
        elif initial_label == "Unmute Sound":
            assert new_label == "Mute Sound"
            assert new_title == "Mute Sound"

        # Ensure aria-pressed is NOT present (since we removed it)
        # However, check if the HTML had it or if JS removed it.
        # My code doesn't explicitly removeAttribute if it was there, but my previous patch ADDED it.
        # The original HTML didn't have it.
        # So it should be None.
        assert new_pressed is None

        print("Verification Successful!")
        browser.close()

if __name__ == "__main__":
    verify_mute_btn()
