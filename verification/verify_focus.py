from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()

    # Block SW and Audio to prevent issues
    context.route("**/*.mp3", lambda route: route.abort())
    context.route("**/js/sw-register.js", lambda route: route.abort())

    page = context.new_page()

    # Mock audio
    page.add_init_script("""
        window.AudioContext = class {
            constructor() { this.state = 'suspended'; }
            resume() { return Promise.resolve(); }
            createGain() { return { gain: { value: 1 }, connect: () => {} }; }
            createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 } }; }
            destination = {};
        };
        window.speechSynthesis = {
            speak: () => {},
            cancel: () => {},
            getVoices: () => []
        };
        window.SpeechSynthesisUtterance = class {};
    """)

    page.goto("http://localhost:8081")

    # Wait for loader to disappear
    page.wait_for_selector("#loading-screen", state="hidden")

    # Hide start screen explicitly as per memory
    page.evaluate("document.getElementById('start-screen').style.display = 'none';")

    # 1. Open Menu
    print("Clicking Games Menu button...")
    menu_btn = page.locator("#menu-btn")
    menu_btn.click()

    # Verify Overlay Visible
    overlay = page.locator("#games-menu-overlay")
    expect(overlay).to_be_visible()

    # Verify Focus on Close Button
    # Focus move has a 50ms timeout
    page.wait_for_timeout(200)

    focused_class = page.evaluate("document.activeElement.className")
    print(f"Focused element class: {focused_class}")

    # Check if active element is the close button
    is_close_btn_focused = page.evaluate("document.activeElement.classList.contains('close-menu-btn')")
    if is_close_btn_focused:
        print("PASS: Focus moved to close button.")
    else:
        print(f"FAIL: Focus did not move to close button. Active element: {page.evaluate('document.activeElement.outerHTML')}")

    # 2. Close with Escape
    print("Pressing Escape...")
    page.keyboard.press("Escape")

    # Verify Overlay Hidden
    expect(overlay).to_be_hidden()

    # Verify Focus Restored
    page.wait_for_timeout(100)
    focused_id = page.evaluate("document.activeElement.id")
    print(f"Focused element ID after close: {focused_id}")

    if focused_id == "menu-btn":
        print("PASS: Focus restored to Menu button.")
    else:
        print(f"FAIL: Focus not restored. Active element: {page.evaluate('document.activeElement.outerHTML')}")

    # 3. Open Menu again
    menu_btn.click()
    expect(overlay).to_be_visible()
    page.wait_for_timeout(200)

    # 4. Close with Close Button (Click)
    print("Clicking Close Button...")
    close_btn = overlay.locator(".close-menu-btn")
    close_btn.click()

    expect(overlay).to_be_hidden()

    # Verify Focus Restored
    page.wait_for_timeout(100)
    focused_id = page.evaluate("document.activeElement.id")
    if focused_id == "menu-btn":
        print("PASS: Focus restored to Menu button after clicking close.")
    else:
        print(f"FAIL: Focus not restored after click. Active element: {page.evaluate('document.activeElement.outerHTML')}")

    # Screenshot for good measure
    page.screenshot(path="verification/focus_test.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
