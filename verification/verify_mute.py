from playwright.sync_api import sync_playwright, expect

def verify_button_a11y():
    with sync_playwright() as p:
        # Use a mobile device descriptor to ensure responsiveness and proper layout checks
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(**p.devices['Pixel 5'])
        page = context.new_page()

        # Navigate to the app
        page.goto("http://localhost:8000")

        # Disable animations to ensure stability for clicks
        page.add_style_tag(content="*, *::before, *::after { animation: none !important; transition: none !important; }")

        # Wait for loader to disappear
        page.wait_for_selector("#loading-screen", state="hidden", timeout=10000)

        # --- Check Mute Button (On Start Screen) ---
        mute_btn = page.locator("#mute-btn")
        expect(mute_btn).to_be_visible()

        # Wait for JS to initialize attributes
        page.wait_for_timeout(1000)

        print("Initial Mute Button Attributes:")
        print(f"Title: {mute_btn.get_attribute('title')}")
        print(f"Aria-Label: {mute_btn.get_attribute('aria-label')}")

        expect(mute_btn).to_have_attribute("title", "Mute Sound")
        expect(mute_btn).to_have_attribute("aria-label", "Mute Sound")
        expect(mute_btn).to_have_text("🔊")

        # Click Mute Button
        mute_btn.click()
        page.wait_for_timeout(500)

        print("Post-Click Mute Button Attributes:")
        print(f"Title: {mute_btn.get_attribute('title')}")
        print(f"Aria-Label: {mute_btn.get_attribute('aria-label')}")

        expect(mute_btn).to_have_attribute("title", "Unmute Sound")
        expect(mute_btn).to_have_attribute("aria-label", "Unmute Sound")
        expect(mute_btn).to_have_text("🔇")

        # --- Dismiss Start Screen ---
        print("Dismissing start screen...")
        # Force click via JS if standard click fails due to any overlay/bounds issues (though disabling animations usually fixes it)
        page.evaluate("document.getElementById('start-btn').click()")
        page.wait_for_selector("#start-screen", state="hidden")

        # --- Check Other Buttons (Now Accessible) ---

        # Sticker Book Button
        sticker_btn = page.locator("#sticker-book-btn")
        expect(sticker_btn).to_have_attribute("title", "My Stickers")

        # Open Menu to check Close Button
        menu_btn = page.locator("#menu-btn")
        menu_btn.click()

        # Wait for menu
        overlay = page.locator("#games-menu-overlay")
        expect(overlay).to_be_visible()

        # Check Close Button
        close_btn = overlay.locator(".close-menu-btn")
        expect(close_btn).to_have_attribute("title", "Close Menu")

        # Take Screenshot
        page.screenshot(path="verification/verification.png")

        browser.close()

if __name__ == "__main__":
    verify_button_a11y()
