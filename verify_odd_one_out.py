from playwright.sync_api import sync_playwright, expect
import os
import re

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mock Object.defineProperty for window.speechSynthesis
        page.add_init_script("""
        Object.defineProperty(window, 'speechSynthesis', {
            value: {
                speak: () => {},
                cancel: () => {},
                onvoiceschanged: null,
                getVoices: () => []
            },
            writable: true
        });
        window.SpeechSynthesisUtterance = class {};
        """)

        # Mock window.location.reload
        page.add_init_script("""
        window.location.reload = () => console.log('Reload called');
        """)

        try:
            # 1. Navigate to the game
            page.goto("http://localhost:8080/index.html")

            # Wait for content to load slightly
            page.wait_for_timeout(1000)

            # FORCE HIDE LOADING SCREEN
            page.evaluate("""
                const loader = document.getElementById('loading-screen');
                if (loader) {
                    loader.style.display = 'none';
                    loader.classList.add('hidden');
                }
            """)

            page.wait_for_selector("#start-btn", state="visible")

            # 2. Start the game
            page.click("#start-btn", force=True)

            # 3. Open Menu
            page.wait_for_selector("#menu-btn", state="visible")
            page.click("#menu-btn")

            page.wait_for_selector("#games-menu-overlay", state="visible")

            # 4. Select Odd One Out game
            # We look for the game card with text "Odd One"
            odd_one_card = page.locator(".game-select-card").filter(has_text="Odd One")
            expect(odd_one_card).to_be_visible()
            odd_one_card.click()

            # 5. Verify Game Stage is active
            # Use regex to match class containing active, ignoring partial matches if classes are space separated
            expect(page.locator("#odd-one-stage")).to_have_class(re.compile(r"active"))
            expect(page.locator(".odd-one-grid")).to_be_visible()

            # 6. Verify items
            cards = page.locator(".odd-one-card")
            expect(cards).to_have_count(4)

            # Take screenshot
            os.makedirs("/home/jules/verification", exist_ok=True)
            page.screenshot(path="/home/jules/verification/odd_one_out.png")
            print("Screenshot saved to /home/jules/verification/odd_one_out.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
