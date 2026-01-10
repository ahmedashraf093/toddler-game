
import pytest
from playwright.sync_api import sync_playwright

def test_hideseek_game(page):
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

    # 3. Initialize Hide and Seek Game directly
    # We use evaluate to dynamically import and run.
    page.evaluate("import('./js/games/hide-seek.js').then(m => m.initHideSeekGame())")

    # 4. Check for Game Stage
    stage = page.wait_for_selector("#hide-seek-stage")
    assert stage is not None

    # 5. Check for Hiding Spots (Bush, Box, House)
    spots = page.wait_for_selector(".hiding-spot") # Wait for at least one
    spots_all = page.query_selector_all(".hiding-spot")
    assert len(spots_all) == 3

    # Check content of spots
    spot_texts = [spot.text_content() for spot in spots_all]
    assert '🌳' in spot_texts
    assert '📦' in spot_texts
    assert '🏠' in spot_texts

    # 6. Verify Instruction Banner
    banner = page.wait_for_selector(".instruction-banner")
    assert "Find the Animal!" in banner.text_content()

    print("Hide and Seek game loaded successfully and elements are present.")
