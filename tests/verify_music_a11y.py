import pytest
from playwright.sync_api import sync_playwright

def test_music_game_accessibility(page):
    # 0. Block Service Worker
    page.route("**/sw-register.js", lambda route: route.abort())

    # 1. Mock AudioContext
    page.add_init_script("""
        window.AudioContext = class {
            constructor() {
                this.currentTime = 0;
            }
            createGain() {
                return {
                    connect: () => {},
                    gain: {
                        value: 0,
                        setValueAtTime: () => {},
                        linearRampToValueAtTime: () => {},
                        exponentialRampToValueAtTime: () => {}
                    }
                };
            }
            createOscillator() {
                return {
                    connect: () => {},
                    start: () => {},
                    stop: () => {},
                    frequency: { setValueAtTime: () => {} },
                    type: 'sine'
                };
            }
            decodeAudioData(buffer) { return Promise.resolve({}); }
        };
    """)

    # 2. Load the page
    page.goto("http://localhost:8000")

    # 3. Initialize Music Game directly
    page.evaluate("import('./js/games/music.js').then(m => m.initMusicGame())")

    # 4. Check for Stage
    stage = page.wait_for_selector("#music-stage")
    assert stage is not None

    # 5. Check for Keys
    keys = page.locator(".xylophone-key")
    count = keys.count()
    assert count > 0, "No xylophone keys found"

    # 6. Verify Accessibility Attributes
    first_key = keys.first

    assert first_key.get_attribute("role") == "button"
    assert first_key.get_attribute("tabindex") == "0"
    aria_label = first_key.get_attribute("aria-label")
    assert aria_label and "Note" in aria_label, f"Missing or incorrect aria-label: {aria_label}"

    # 7. Verify Keyboard Interaction
    first_key.focus()
    page.keyboard.press("Enter")

    # Check for active class shortly after
    try:
        page.wait_for_selector(".xylophone-key.active", timeout=1000)
    except:
        pytest.fail("Key did not become active on Enter key press")
