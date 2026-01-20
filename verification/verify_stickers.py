from playwright.sync_api import sync_playwright
import sys
import time
import json

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Reduced motion preference
        context = browser.new_context(reduced_motion='reduce')
        page = context.new_page()

        # Mock Audio & Speech to prevent errors
        page.add_init_script("""
            window.AudioContext = class {
                createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 }, type: '' }; }
                createGain() { return { connect: () => {}, gain: { value: 0, linearRampToValueAtTime: () => {} } }; }
                destination = {};
                currentTime = 0;
                resume() { return Promise.resolve(); }
                suspend() { return Promise.resolve(); }
            };
            window.speechSynthesis = {
                speak: () => {},
                cancel: () => {},
                getVoices: () => [],
                onvoiceschanged: null
            };
            window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
        """)

        # Disable Animations
        page.add_style_tag(content="* { animation: none !important; transition: none !important; }")

        # Use localhost
        file_url = "http://localhost:8080/index.html"
        print(f"Loading {file_url}...")
        page.goto(file_url)

        # Wait for page load
        page.wait_for_load_state("networkidle")

        # Inject some stickers directly into localStorage and reload/re-init
        stickers_data = {
            "progress": 50,
            "collection": [
                {"id": "lion", "icon": "🦁", "name": "Lion", "date": 123456789},
                {"id": "star", "icon": "⭐", "name": "Star", "date": 123456789}
            ]
        }

        print("Injecting sticker data...")
        page.evaluate(f"localStorage.setItem('toddler_game_stickers_v1', '{json.dumps(stickers_data)}');")

        # Reload to pick up local storage or re-call init
        page.reload()
        page.wait_for_load_state("networkidle")

        # Force hide Start Screen overlay to ensure we can click other things
        print("Hiding Start Screen...")
        page.evaluate("document.getElementById('start-screen').style.display = 'none';")

        # Open Sticker Book
        print("Opening sticker book...")
        page.click("#sticker-book-btn")

        # Wait for overlay
        page.wait_for_selector("#sticker-book-overlay", state="visible")

        # Check for stickers
        stickers = page.locator(".sticker-item")
        count = stickers.count()
        print(f"Found {count} stickers.")

        if count == 0:
            print("❌ FAILURE: No stickers found in grid.")
            sys.exit(1)

        # Verify accessibility attributes
        first_sticker = stickers.first
        role = first_sticker.get_attribute("role")
        tabindex = first_sticker.get_attribute("tabindex")
        aria_label = first_sticker.get_attribute("aria-label")

        print(f"First Sticker - Role: {role}, Tabindex: {tabindex}, Label: {aria_label}")

        errors = []
        if role != "button":
            errors.append(f"Expected role='button', got '{role}'")
        if tabindex != "0":
            errors.append(f"Expected tabindex='0', got '{tabindex}'")
        if not aria_label:
            errors.append("Missing aria-label")
        elif "Lion" not in aria_label:
             errors.append(f"aria-label '{aria_label}' does not contain 'Lion'")

        if errors:
            print("❌ ACCESSIBILITY FAILURE:")
            for e in errors:
                print(f"  - {e}")
            sys.exit(1)

        print("✅ SUCCESS: Sticker accessibility attributes verified.")

        # Focus the first sticker to show focus ring in screenshot
        print("Focusing first sticker...")
        first_sticker.focus()
        page.wait_for_timeout(500) # Wait for focus styles

        # Take screenshot
        screenshot_path = "verification/sticker_book.png"
        print(f"Taking screenshot to {screenshot_path}...")
        page.screenshot(path=screenshot_path)

        browser.close()

if __name__ == "__main__":
    run()
