
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:8000")

        # Inject style to hide overlays
        page.add_style_tag(content="#start-screen, #loading-screen { display: none !important; }")

        # Use dynamic import to init game mode, bypassing global scope issues
        page.evaluate("""
            import('./js/main.js').then(module => {
                // Manually trigger init sequence if needed, or just rely on manual navigation simulation
                // Since main.js is a module, functions aren't on window.
                // But we can simulate UI clicks if the overlays are gone.
                // However, listener bindings happen on load.
                // Let's assume load happened.
            });
        """)

        # Wait for potential load
        time.sleep(1)

        # Open Menu
        print("Selecting Music Game...")
        # Since start screen is hidden, the main UI should be interactable if logic initialized.
        # If logic didn't init because we bypassed start button, we might need to simulate start button click logic.
        # But we can't easily access module scope.

        # Better approach: Click the start button but ensure animations are off so it doesn't flake.
        # Reload to reset state.
        page.reload()
        page.add_style_tag(content="#start-btn { animation: none !important; }")

        # Click start button normally
        page.click("#start-btn")
        time.sleep(0.5)

        page.click("#menu-btn")
        time.sleep(0.5)

        # Click Music Card
        music_card = page.locator('.game-select-card:has-text("Music")')
        if music_card.count() > 0:
            music_card.click()
        else:
            print("Error: Music card not found")
            browser.close()
            return

        time.sleep(1)

        # Verify Stage
        if page.is_visible("#music-stage"):
            print("✅ Music Stage is visible")
        else:
            print("❌ Music Stage not visible")

        # Verify Keys
        keys = page.locator(".xylophone-key")
        count = keys.count()
        print(f"Found {count} keys (Expected 8)")

        if count == 8:
            print("✅ Key count correct")
        else:
            print("❌ Incorrect key count")

        # Verify Accessibility
        first_key = keys.first
        role = first_key.get_attribute("role")
        label = first_key.get_attribute("aria-label")
        tabindex = first_key.get_attribute("tabindex")

        print(f"First Key - Role: {role}, Label: {label}, Tabindex: {tabindex}")

        if role == "button" and label and tabindex == "0":
            print("✅ Accessibility attributes present")
        else:
            print("❌ Missing accessibility attributes")

        # Verify Styles (Height Logic)
        height1 = float(first_key.evaluate("el => el.getBoundingClientRect().height"))
        last_key = keys.last
        height8 = float(last_key.evaluate("el => el.getBoundingClientRect().height"))

        print(f"Height 1: {height1}, Height 8: {height8}")
        if height1 > height8:
            print("✅ Visual Logic Correct: Lower notes are taller")
        else:
            print("❌ Visual Logic Incorrect")

        # Screenshot
        page.screenshot(path="verification_music.png")
        print("📸 Screenshot saved to verification_music.png")

        browser.close()

if __name__ == "__main__":
    run()
