from playwright.sync_api import sync_playwright
import sys
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Use localhost to avoid CORS and module issues
        file_url = "http://localhost:8080/index.html"

        print(f"Loading {file_url}...")
        page.goto(file_url)

        # Wait for page to load
        page.wait_for_selector("#difficulty-bar", state="attached")

        # Mocking window.gameState if it's not available globally yet, but main.js should expose it.
        # However, due to modules, it might take a moment.
        # We'll just manipulate the DOM directly to check attributes, simulating the user action
        # or checking the static HTML if that's where we start.

        # Actually, let's just check the static HTML first, then try to interact.

        # Force show the bar for inspection
        page.evaluate("document.getElementById('difficulty-bar').style.display = 'flex'")

        buttons = page.locator(".diff-btn")
        count = buttons.count()
        print(f"Found {count} difficulty buttons.")

        found_aria_pressed = False

        for i in range(count):
            btn = buttons.nth(i)
            aria_pressed = btn.get_attribute("aria-pressed")
            class_attr = btn.get_attribute("class")
            text = btn.inner_text()

            print(f"Button '{text}': class='{class_attr}', aria-pressed='{aria_pressed}'")

            if aria_pressed is not None:
                found_aria_pressed = True

        if not found_aria_pressed:
            print("❌ FAILURE: No 'aria-pressed' attribute found on difficulty buttons.")
        else:
            print("✅ SUCCESS: 'aria-pressed' attribute found.")

        browser.close()

        if not found_aria_pressed:
            sys.exit(1)

if __name__ == "__main__":
    run()
