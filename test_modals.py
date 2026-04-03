from playwright.sync_api import sync_playwright

def test_modals():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={"width": 375, "height": 667})
        page = context.new_page()

        page.goto("http://localhost:3000")
        page.wait_for_timeout(1000)

        # Bypass Parental Gate and start
        page.evaluate("localStorage.setItem('parentalGateStartTime', Date.now().toString())")
        page.click("#start-btn", force=True)
        page.wait_for_timeout(500)

        # 1. Test Games Menu
        menu_btn = page.locator("#menu-btn")
        print("Menu btn expanded before:", menu_btn.get_attribute("aria-expanded"))
        menu_btn.click(force=True)
        page.wait_for_timeout(500)
        print("Menu btn expanded after open:", menu_btn.get_attribute("aria-expanded"))
        page.click("#games-menu-overlay .close-menu-btn", force=True)
        page.wait_for_timeout(500)
        print("Menu btn expanded after close:", menu_btn.get_attribute("aria-expanded"))
        print("Is menu btn focused:", page.evaluate("document.activeElement.id === 'menu-btn'"))

        # 2. Test Challenges Menu
        challenge_btn = page.locator("#challenges-btn")
        print("Challenge btn expanded before:", challenge_btn.get_attribute("aria-expanded"))
        challenge_btn.click(force=True)
        page.wait_for_timeout(500)
        print("Challenge btn expanded after open:", challenge_btn.get_attribute("aria-expanded"))
        page.click("#challenges-overlay .close-menu-btn", force=True)
        page.wait_for_timeout(500)
        print("Challenge btn expanded after close:", challenge_btn.get_attribute("aria-expanded"))
        print("Is challenge btn focused:", page.evaluate("document.activeElement.id === 'challenges-btn'"))

        # 3. Test Sticker Book Menu
        sticker_btn = page.locator("#sticker-book-btn")
        print("Sticker btn expanded before:", sticker_btn.get_attribute("aria-expanded"))
        sticker_btn.click(force=True)
        page.wait_for_timeout(500)
        print("Sticker btn expanded after open:", sticker_btn.get_attribute("aria-expanded"))
        page.click("#sticker-book-overlay .close-menu-btn", force=True)
        page.wait_for_timeout(500)
        print("Sticker btn expanded after close:", sticker_btn.get_attribute("aria-expanded"))
        print("Is sticker btn focused:", page.evaluate("document.activeElement.id === 'sticker-book-btn'"))

        browser.close()

test_modals()
