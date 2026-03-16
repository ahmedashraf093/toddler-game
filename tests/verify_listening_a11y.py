import pytest
from playwright.sync_api import sync_playwright

def test_listening_a11y(page):
    # 0. Block Service Worker to prevent reloads
    page.route("**/sw-register.js", lambda route: route.abort())

    # 1. Mock AudioContext
    page.add_init_script("""
        window.AudioContext = class {
            createGain() { return { connect: () => {}, gain: { value: 0 } }; }
            createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
            decodeAudioData(buffer) { return Promise.resolve({}); }
        };
    """)

    # 2. Load the page
    page.goto("http://localhost:8000")

    # 3. Initialize Listening Game directly
    page.evaluate("import('./js/games/listening.js').then(m => m.initListeningGame())")

    # 4. Check for Instruction Area a11y attributes
    instruction_area = page.locator("#instruction-area")
    assert instruction_area.get_attribute("role") == "button"
    assert instruction_area.get_attribute("tabindex") == "0"
    assert instruction_area.get_attribute("aria-label") == "Replay audio prompt"

    # 5. Check for Option Cards a11y attributes
    cards = page.locator(".listening-card")
    cards.first.wait_for()
    count = cards.count()
    assert count == 3

    for i in range(count):
        card = cards.nth(i)
        assert card.get_attribute("role") == "button"
        assert card.get_attribute("tabindex") == "0"
        assert card.get_attribute("aria-label") is not None

    print("Listening game accessibility attributes verified successfully.")
