from playwright.sync_api import sync_playwright

def verify_overlays():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Navigate to the local server
        page.goto("http://localhost:8000")
        page.wait_for_load_state("networkidle")

        # Hide start screen which intercepts clicks
        page.evaluate("document.getElementById('start-screen').style.display = 'none'")

        # Function to check attributes
        def check_attributes(selector, role, aria_modal, aria_labelledby):
            element = page.locator(selector)
            if not element.is_visible():
                # Temporarily show it to check attributes if needed,
                # but for now we just check existence in DOM
                pass

            # Check attributes
            print(f"Checking {selector}...")
            actual_role = element.get_attribute("role")
            actual_modal = element.get_attribute("aria-modal")
            actual_labelledby = element.get_attribute("aria-labelledby")

            if actual_role != role:
                print(f"  FAIL: role expected '{role}', got '{actual_role}'")
            else:
                print(f"  PASS: role is '{role}'")

            if actual_modal != aria_modal:
                print(f"  FAIL: aria-modal expected '{aria_modal}', got '{actual_modal}'")
            else:
                print(f"  PASS: aria-modal is '{aria_modal}'")

            if actual_labelledby != aria_labelledby:
                print(f"  FAIL: aria-labelledby expected '{aria_labelledby}', got '{actual_labelledby}'")
            else:
                print(f"  PASS: aria-labelledby is '{aria_labelledby}'")

        # 1. Games Menu Overlay
        check_attributes("#games-menu-overlay", "dialog", "true", "games-menu-title")

        # 2. Challenges Overlay
        check_attributes("#challenges-overlay", "dialog", "true", "challenges-title")

        # 3. Sticker Book Overlay
        check_attributes("#sticker-book-overlay", "dialog", "true", "sticker-book-title")

        # 4. Parental Gate Overlay
        check_attributes("#parental-gate-overlay", "dialog", "true", "pg-title")

        # 5. Parental Gate Close Button
        pg_close_btn = page.locator("#parental-gate-overlay .close-menu-btn")
        actual_label = pg_close_btn.get_attribute("aria-label")
        if actual_label == "Close Parental Gate":
            print("  PASS: Parental Gate close button has correct aria-label")
        else:
            print(f"  FAIL: Parental Gate close button expected 'Close Parental Gate', got '{actual_label}'")

        # Take a screenshot of one overlay open just to see
        # Open Games Menu
        page.click("#menu-btn")
        page.wait_for_selector("#games-menu-overlay", state="visible")
        page.screenshot(path="verification/games_menu_overlay.png")
        print("Screenshot saved to verification/games_menu_overlay.png")

        browser.close()

if __name__ == "__main__":
    verify_overlays()
