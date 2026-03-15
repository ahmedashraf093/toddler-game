import re
from playwright.sync_api import sync_playwright

def test_math_click_and_keyboard():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()

        page = context.new_page()
        page.route("**/*", lambda route: route.abort() if route.request.resource_type in ["image", "media", "font"] else route.continue_())
        page.goto('http://localhost:8080')
        page.wait_for_timeout(1000)

        # Force bypass start screen
        page.evaluate("document.getElementById('start-screen').style.display = 'none';")

        # Start math game
        page.evaluate("import('./js/main.js').then(m => m.default ? m.default.initMathGame() : null).catch(console.error);")
        page.wait_for_timeout(1000)

        # Click menu button
        page.click('#menu-btn')
        page.wait_for_timeout(500)

        # Find math card and click it
        math_card = page.locator('.game-select-card:has-text("Math Party")')
        math_card.click()
        page.wait_for_timeout(1000)

        # Ensure it's not hidden
        page.evaluate("document.getElementById('math-stage').classList.remove('hidden');")

        # Get target answer
        target = page.locator('#math-target-zone')
        target_val = target.get_attribute('data-match')
        print(f"Target Value: {target_val}")

        # Find incorrect answer and select it
        incorrect_options = page.locator(f".math-option:not([data-label='{target_val}'])").all()
        if len(incorrect_options) > 0:
            incorrect_option = incorrect_options[0]
            val = incorrect_option.get_attribute('data-label')
            print(f"Clicking incorrect option: {val}")
            incorrect_option.click()
            page.wait_for_timeout(100)

            # Verify wiggle-error class is added
            class_attr = incorrect_option.get_attribute('class')
            assert 'wiggle-error' in class_attr, "wiggle-error class not found on incorrect click"
            print("✅ Incorrect answer triggers wiggle-error class on click")
            page.wait_for_timeout(400) # wait for animation to clear

        # Find correct answer and use keyboard (Enter) to select it
        correct_option = page.locator(f".math-option[data-label='{target_val}']")
        print(f"Selecting correct option with keyboard: {target_val}")
        correct_option.focus()
        page.keyboard.press("Enter")
        page.wait_for_timeout(1000)

        # Check if matched class is added to target zone
        class_attr = target.get_attribute('class')
        assert 'matched' in class_attr, "matched class not found on target zone after correct selection"
        print("✅ Correct answer triggers matched class on target zone using keyboard")

        browser.close()

if __name__ == "__main__":
    test_math_click_and_keyboard()
