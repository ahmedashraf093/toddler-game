
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Load the index.html directly since it's a static site
        url = 'file://' + os.path.abspath('index.html')
        page.goto(url)

        # Wait for the start screen to be visible
        page.wait_for_selector('#start-screen')

        # Inject style to stop animations for screenshot stability
        page.add_style_tag(content='''
            *, *::before, *::after {
                transition: none !important;
                animation: none !important;
            }
        ''')

        # Take a screenshot of the start screen with the new button
        page.screenshot(path='verification/start_screen_with_buttons.png')

        # Click the update button to verify interaction (it might trigger alert or text change)
        # Note: Since we are running from file://, Service Worker won't register, so it will hit the 'Service Worker not supported' or 'not registered' path.
        # But we can verify the button exists and is clickable.

        page.click('#update-btn')

        # Wait a bit for the text change '⏳'
        page.wait_for_timeout(500)

        page.screenshot(path='verification/update_button_clicked.png')

        browser.close()

if __name__ == '__main__':
    run()
