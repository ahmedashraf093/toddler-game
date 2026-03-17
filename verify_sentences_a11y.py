import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Abort service workers
        await context.route("**/*.js", lambda route: route.continue_())
        await context.route("**/sw.js", lambda route: route.abort())

        await page.goto("http://localhost:8080")

        # Hide start screen
        await page.evaluate('document.getElementById("start-screen").style.display = "none"')
        await page.evaluate('window.gameState.currentMode = "sentences"')
        await page.evaluate('import("./js/games/sentences.js").then(m => m.initSentenceGame())')

        # Wait for the game to render
        await page.wait_for_selector('.sentence-strip')

        # 1. Verify sentence-part elements
        parts = await page.locator('.sentence-part[role="button"]').all()
        assert len(parts) >= 2, f"Expected at least 2 sentence parts with role=button, found {len(parts)}"

        for part in parts:
            role = await part.get_attribute('role')
            tabindex = await part.get_attribute('tabindex')
            aria_label = await part.get_attribute('aria-label')

            assert role == 'button', f"Expected role='button', got '{role}'"
            assert tabindex == '0', f"Expected tabindex='0', got '{tabindex}'"
            assert aria_label in ['Hear subject', 'Hear action'], f"Unexpected aria-label: '{aria_label}'"

            print(f"Verified sentence part: role={role}, tabindex={tabindex}, aria-label={aria_label}")

        # 2. Verify sentence options
        options = await page.locator('.sentence-option').all()
        assert len(options) == 3, f"Expected 3 options, found {len(options)}"

        for opt in options:
            aria_label = await opt.get_attribute('aria-label')
            assert aria_label is not None, "sentence-option missing aria-label"
            print(f"Verified sentence option: aria-label={aria_label}")

        # 3. Verify keyboard focusability
        first_part = parts[0]
        await first_part.focus()
        is_focused = await first_part.evaluate("node => document.activeElement === node")
        assert is_focused, "sentence-part could not receive focus"
        print("Verified sentence part can receive focus.")

        first_opt = options[0]
        await first_opt.focus()
        is_focused = await first_opt.evaluate("node => document.activeElement === node")
        assert is_focused, "sentence-option could not receive focus"
        print("Verified sentence option can receive focus.")

        print("All accessibility tests passed successfully!")
        await browser.close()

asyncio.run(run())
