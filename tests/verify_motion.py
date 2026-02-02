
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        # Create context with reduced motion enabled
        browser = await p.chromium.launch()
        context = await browser.new_context(color_scheme='light', reduced_motion='reduce')
        page = await context.new_page()

        # Block Service Workers
        await context.route("**/*sw*", lambda route: route.abort())

        # Load page
        await page.goto("http://localhost:8080/index.html")

        # Inject style to ensure animations are NOT disabled by the test runner (we want to test the CSS media query)
        # By default Playwright might not force it, but 'reduced_motion="reduce"' in context should trigger the media query.

        # Trigger celebration via console
        print("Triggering celebration...")
        await page.evaluate("import('./js/engine/ui.js').then(m => m.showCelebration())")

        # Wait a bit
        await asyncio.sleep(1)

        # Check if celebration overlay is visible
        overlay_visible = await page.is_visible("#celebration-overlay")
        if not overlay_visible:
            print("ERROR: Celebration overlay not visible")
            # It might be hidden by our future CSS if we are not careful?
            # No, we want the overlay to show, but the moving parts to be gone.

        # Check for flying elements
        # In standard mode, there should be .confetti, .balloon, etc.
        # In reduced motion, we want them hidden.

        # We need to know which type was spawned. showCelebration picks random.
        # We can just check if ANY of them are visible.

        flying_selectors = [
            "#celebration-overlay .confetti",
            "#celebration-overlay .balloon",
            "#celebration-overlay .star-anim",
            "#celebration-overlay .emoji-bounce",
            "#celebration-overlay .bubble"
        ]

        found_flying = False
        for sel in flying_selectors:
            count = await page.locator(sel).count()
            if count > 0:
                # check visibility
                first = page.locator(sel).first
                if await first.is_visible():
                    print(f"FAIL: Found visible flying element: {sel}")
                    found_flying = True
                    break

        if found_flying:
            print("❌ Verification FAILED: High motion elements are visible despite prefers-reduced-motion.")
        else:
            print("✅ Verification PASSED: High motion elements are hidden.")

        # Also check background decoration animation
        # We can check computed style of .cloud-1
        cloud_anim = await page.evaluate("getComputedStyle(document.querySelector('.cloud-1')).animationName")
        print(f"Cloud animation name: {cloud_anim}")

        if cloud_anim and cloud_anim != 'none':
             print("❌ Verification FAILED: Background animation is still active.")
        else:
             print("✅ Verification PASSED: Background animation is disabled.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
