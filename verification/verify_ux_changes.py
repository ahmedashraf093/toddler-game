from playwright.sync_api import sync_playwright

def verify_a11y_menu():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 800, 'height': 600})
        page = context.new_page()

        # Navigate
        page.goto("http://localhost:8000/index.html")
        page.wait_for_load_state("networkidle")

        # Force click start button using JS
        page.evaluate("document.getElementById('start-btn').click()")

        # Wait for start screen to fade out/hide
        page.locator("#start-screen").wait_for(state="hidden")

        # Click "Games" to open menu
        page.get_by_role("button", name="Games Menu").click()

        # Wait for menu to appear
        menu_overlay = page.locator("#games-menu-overlay")
        menu_overlay.wait_for(state="visible")

        # Check ARIA attributes
        role = menu_overlay.get_attribute("role")
        aria_modal = menu_overlay.get_attribute("aria-modal")
        aria_labelledby = menu_overlay.get_attribute("aria-labelledby")

        print(f"Menu Role: {role}")
        print(f"Aria Modal: {aria_modal}")
        print(f"Aria LabelledBy: {aria_labelledby}")

        # Find the active card
        active_card = page.locator(".game-select-card[aria-current='true']")
        if active_card.count() > 0:
            print(f"Found {active_card.count()} active card(s) with aria-current='true'")
        else:
            print("No card with aria-current='true' found!")

        # Screenshot
        page.screenshot(path="verification/menu_a11y_clean.png")

        browser.close()

if __name__ == "__main__":
    verify_a11y_menu()
