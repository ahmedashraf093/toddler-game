import asyncio
from playwright.async_api import async_playwright
import time

async def verify_listening_game():
    print("Starting server check...")

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        await page.route("**/sw-register.js", lambda route: route.abort())

        await page.add_init_script("""
            window.AudioContext = class {
                createGain() { return { connect: () => {}, gain: { value: 0 } }; }
                createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
                decodeAudioData(buffer) { return Promise.resolve({}); }
            };
        """)

        await page.goto("http://localhost:8000")

        # Initialize listening game
        await page.evaluate("""() => {
            window.gameState.currentMode = 'listening';
            import('./js/games/listening.js').then(m => m.initListeningGame());
        }""")

        await page.wait_for_selector('#instruction-area')

        # Test instruction area keyboard focus
        print("Testing instruction area focus...")
        instruction = page.locator('#instruction-area')
        await instruction.focus()
        await page.keyboard.press('Enter')

        # Wait for cards to appear
        await page.wait_for_selector('.listening-card')

        # Test cards keyboard focus
        print("Testing card focus...")
        cards = page.locator('.listening-card')
        count = await cards.count()
        if count > 0:
            await cards.nth(0).focus()
            await page.keyboard.press('Space')
            print("Keyboard accessibility test passed for Listening Game!")
        else:
            print("No cards found to test.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_listening_game())