import re
import time
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Block Service Workers
        context.route("**/*sw.js", lambda route: route.abort())
        context.route("**/sw-register.js", lambda route: route.abort())

        page = context.new_page()

        # Listen to console messages
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        # Inject CSS safely
        page.add_init_script("""
            const css = '#loading-screen { display: none !important; }';
            if (document.head) {
                const style = document.createElement('style');
                style.innerHTML = css;
                document.head.appendChild(style);
            } else {
                window.addEventListener('DOMContentLoaded', () => {
                    const style = document.createElement('style');
                    style.innerHTML = css;
                    document.head.appendChild(style);
                });
            }
        """)

        # Load the game
        page.goto("http://localhost:8000")

        # Click Play button with force=True because of pulse animation
        print("Clicking Start Button...")
        try:
            page.click("#start-btn", force=True, timeout=5000)
        except Exception as e:
            print(f"Error clicking start button: {e}")
            # Fallback: Try to force hide start screen if click failed (maybe already hidden?)
            page.evaluate("document.getElementById('start-screen').style.display = 'none'")

        # Wait for start screen to be hidden
        print("Waiting for start screen to hide...")
        try:
            page.wait_for_selector("#start-screen", state="hidden", timeout=5000)
        except Exception as e:
            print(f"Start screen did not hide: {e}")
            page.evaluate("document.getElementById('start-screen').style.display = 'none'")

        # Open menu
        print("Opening Menu...")
        page.click("#menu-btn")

        # Click Music card
        print("Selecting Music Game...")
        music_card = page.locator(".game-select-card").filter(has_text="Music")
        music_card.click()

        # Wait for Music Stage
        page.wait_for_selector(".music-stage", state="visible")
        print("Music Game Active.")

        # Check accessibility attributes
        keys = page.locator(".xylophone-key")
        # Wait for keys to be present
        keys.first.wait_for(state="visible")

        count = keys.count()
        print(f"Found {count} keys.")

        # Verify role and tabindex
        first_key = keys.first
        role = first_key.get_attribute("role")
        tabindex = first_key.get_attribute("tabindex")
        aria_label = first_key.get_attribute("aria-label")

        print(f"Key 1 - Role: {role}, Tabindex: {tabindex}, Aria-Label: {aria_label}")

        success = True
        if role != "button" or tabindex != "0":
            print("FAIL: Missing accessibility attributes.")
            success = False
        else:
            print("PASS: Accessibility attributes present.")

        # Test Keyboard 1-8
        print("Testing Key '1'...")
        page.keyboard.press("1")

        # Check for active class
        try:
            expect(first_key).to_have_class(re.compile(r"active"), timeout=2000)
            print("PASS: Key '1' triggered active state.")
        except AssertionError:
            print("FAIL: Key '1' did NOT trigger active state.")
            success = False

        # Test Tab + Enter
        print("Testing Tab + Enter...")
        # Focus the first key (simulated tab)
        first_key.focus()
        page.keyboard.press("Enter")

        try:
            expect(first_key).to_have_class(re.compile(r"active"), timeout=2000)
            print("PASS: Enter key triggered active state.")
        except AssertionError:
            print("FAIL: Enter key did NOT trigger active state.")
            success = False

        browser.close()

        if not success:
            exit(1)

if __name__ == "__main__":
    run()
