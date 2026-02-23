
import pytest
import re
from playwright.sync_api import sync_playwright, expect

def test_music_game_accessibility(page):
    # 0. Block Service Worker
    page.route("**/sw-register.js", lambda route: route.abort())

    # 1. Mock AudioContext
    page.add_init_script("""
        window.AudioContext = class {
            createGain() {
                return {
                    connect: () => {},
                    gain: {
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
            get currentTime() { return 0; }
        };
    """)

    # 2. Load the page
    page.goto("http://localhost:8000")

    # 3. Initialize Music Game directly
    page.evaluate("import('./js/games/music.js').then(m => m.initMusicGame())")

    # 4. Check for Stage
    stage = page.locator("#music-stage")
    expect(stage).to_be_visible()

    # 5. Check for Keys
    keys = page.locator(".xylophone-key")
    count = keys.count()
    assert count > 0, "No xylophone keys found"

    first_key = keys.first

    # 6. Verify Accessibility Attributes
    # We check if role is button, tabindex is 0, and aria-label is set.
    # Currently these are missing, so this should fail.
    role = first_key.get_attribute("role")
    tabindex = first_key.get_attribute("tabindex")
    aria_label = first_key.get_attribute("aria-label")

    print(f"Role: {role}, Tabindex: {tabindex}, Aria-Label: {aria_label}")

    assert role == "button", f"Expected role='button', but got '{role}'"
    assert tabindex == "0", f"Expected tabindex='0', but got '{tabindex}'"
    assert aria_label is not None, "aria-label is missing"
    assert "Note" in aria_label, f"aria-label '{aria_label}' does not contain 'Note'"

    # 7. Verify Keyboard Interaction
    first_key.focus()
    # Press Enter
    page.keyboard.press("Enter")

    # Check for active class shortly after
    # Note: animateKey removes active, waits for reflow, then adds active.
    # So we might need to wait a tiny bit or just check if it has active class.
    # But since it's a CSS transition/animation, the class should be present.
    expect(first_key).to_have_class(re.compile(r"active"))
