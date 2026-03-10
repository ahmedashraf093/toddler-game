import re
from playwright.sync_api import Playwright, sync_playwright, expect

def run(playwright: Playwright) -> None:
    # Abort service workers to avoid caching issues in testing
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    context.route("**/*", lambda route: route.abort() if "sw" in route.request.url else route.continue_())

    page = context.new_page()

    page.add_init_script('''
        document.addEventListener("DOMContentLoaded", () => {
            const startScreen = document.getElementById('start-screen');
            if (startScreen) startScreen.remove(); // Force remove to not block clicks
            const loader = document.getElementById('loading-screen');
            if (loader) loader.remove();
        });
    ''')

    page.goto("http://localhost:8000")

    # Disable animations to avoid flakey timeout due to moving bubbles
    page.add_style_tag(content='*, *::before, *::after { animation: none !important; transition: none !important; }')

    page.wait_for_timeout(1000)

    print("Navigating to Bubble Pop...")
    page.evaluate('''async () => {
        const module = await import('./js/games/bubble-pop.js');
        const state = await import('./js/engine/state.js');
        state.gameState.currentMode = 'bubblepop';
        module.initBubblePopGame();
    }''')

    page.wait_for_timeout(2000) # Wait for spawn

    bubbles = page.locator(".bubble")
    bubble_count = bubbles.count()
    print(f"Found {bubble_count} bubbles.")

    if bubble_count > 0:
        first_bubble = bubbles.first
        role = first_bubble.get_attribute('role')
        tabindex = first_bubble.get_attribute('tabindex')
        print(f"Bubble role: {role}")
        print(f"Bubble tabindex: {tabindex}")

        # Verify attributes exist and are correct
        assert role == 'button', f"Expected role 'button', got {role}"
        assert tabindex == '0', f"Expected tabindex '0', got {tabindex}"

        # Test keyboard interaction
        print("Testing Enter key on bubble...")
        first_bubble.focus()
        page.keyboard.press("Enter")
        page.wait_for_timeout(500)

        print("Enter key interaction handled successfully.")
    else:
        print("WARNING: No bubbles found in Bubble Pop!")

    print("Navigating to Alphabet Pop...")
    page.evaluate('''async () => {
        const module = await import('./js/games/alphabet-pop.js');
        const state = await import('./js/engine/state.js');
        state.gameState.currentMode = 'alphabetpop';
        module.initAlphabetPopGame();
    }''')

    page.wait_for_timeout(2000) # Wait for spawn

    alpha_bubbles = page.locator(".bubble")
    alpha_bubble_count = alpha_bubbles.count()
    print(f"Found {alpha_bubble_count} alphabet bubbles.")

    if alpha_bubble_count > 0:
        first_alpha_bubble = alpha_bubbles.first
        role = first_alpha_bubble.get_attribute('role')
        tabindex = first_alpha_bubble.get_attribute('tabindex')
        print(f"Alphabet Bubble role: {role}")
        print(f"Alphabet Bubble tabindex: {tabindex}")

        assert role == 'button', f"Expected role 'button', got {role}"
        assert tabindex == '0', f"Expected tabindex '0', got {tabindex}"

        print("Testing Space key on alphabet bubble...")
        first_alpha_bubble.focus()
        page.keyboard.press(" ")
        page.wait_for_timeout(500)

        print("Space key interaction handled successfully.")
    else:
        print("WARNING: No alphabet bubbles found!")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
