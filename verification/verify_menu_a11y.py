from playwright.sync_api import sync_playwright
import sys

def verify_menu_a11y():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mock window.AudioContext and other audio-related APIs
        page.add_init_script("""
            window.AudioContext = function() {
                return {
                    createGain: () => ({ connect: () => {}, gain: { value: 0 } }),
                    createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 } }),
                    destination: {},
                    currentTime: 0,
                    state: 'running',
                    resume: () => Promise.resolve(),
                    suspend: () => Promise.resolve()
                };
            };
            window.webkitAudioContext = window.AudioContext;
            window.speechSynthesis = {
                speak: () => {},
                cancel: () => {},
                pause: () => {},
                resume: () => {},
                getVoices: () => []
            };
            window.SpeechSynthesisUtterance = function() {};
        """)

        # Stop animations and hide start screen persistently
        page.add_init_script("""
            const style = document.createElement('style');
            style.innerHTML = `
                * { animation: none !important; transition: none !important; }
                #start-screen { display: none !important; }
                #loading-screen { display: none !important; }
            `;
            document.addEventListener('DOMContentLoaded', () => {
                document.head.appendChild(style);
            });
        """)

        # Block Service Workers to prevent reloads/caching issues
        context.route("**/sw-register.js", lambda route: route.abort())
        context.route("**/sw.js", lambda route: route.abort())

        page.goto("http://localhost:8080/index.html")

        # Handle Loading and Start Screens
        # (Handled by init script styles now)

        page.wait_for_selector("#menu-btn")

        # 1. Verify ARIA attributes on overlay
        print("Checking ARIA attributes on #games-menu-overlay...")
        overlay = page.locator("#games-menu-overlay")

        # It should be hidden initially
        if not overlay.get_attribute("class") or "hidden" not in overlay.get_attribute("class"):
            print("Warning: Menu should be hidden initially.")

        # Check static attributes (we expect them to be there after our changes)
        role = overlay.get_attribute("role")
        aria_modal = overlay.get_attribute("aria-modal")
        aria_labelledby = overlay.get_attribute("aria-labelledby")

        print(f"role: {role}, aria-modal: {aria_modal}, aria-labelledby: {aria_labelledby}")

        if role != "dialog" or aria_modal != "true" or aria_labelledby != "games-menu-title":
            print("❌ FAILURE: Missing or incorrect ARIA attributes on overlay.")
            # We don't exit yet, let's check focus management
        else:
            print("✅ ARIA attributes correct.")

        # 2. Check Focus Management
        print("Checking focus management...")

        # Focus the menu button first to simulate user navigation
        page.focus("#menu-btn")

        # Open menu
        page.click("#menu-btn")

        # Wait for menu to be visible
        overlay.wait_for(state="visible")

        # Wait a bit for focus to move (setTimeout)
        page.wait_for_timeout(200)

        # Check active element
        active_id = page.evaluate("document.activeElement.className")
        print(f"Active element class after opening: {active_id}")

        # We expect the close button inside the overlay to be focused
        # It has class 'close-menu-btn'
        is_close_btn_focused = page.evaluate("""
            document.activeElement.classList.contains('close-menu-btn') &&
            document.activeElement.closest('#games-menu-overlay')
        """)

        if is_close_btn_focused:
            print("✅ Focus moved to close button inside menu.")
        else:
            print("❌ FAILURE: Focus did not move to close button.")

        # Take screenshot of menu open with focus
        page.screenshot(path="verification/menu_focus.png")

        # Close menu via close button
        # Note: We need to click the SPECIFIC close button in the overlay
        page.evaluate("document.querySelector('#games-menu-overlay .close-menu-btn').click()")

        # Wait for menu to hide
        # overlay.wait_for(state="hidden") # It just adds 'hidden' class
        page.wait_for_timeout(200)

        # Check active element
        active_id_after_close = page.evaluate("document.activeElement.id")
        print(f"Active element id after closing: {active_id_after_close}")

        if active_id_after_close == "menu-btn":
            print("✅ Focus returned to menu button.")
        else:
            print("❌ FAILURE: Focus did not return to menu button.")

        browser.close()

if __name__ == "__main__":
    verify_menu_a11y()
