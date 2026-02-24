
import pytest
from playwright.sync_api import sync_playwright

def test_music_game_accessibility(page):
    # 0. Block Service Worker to prevent reloads/caching issues
    page.route("**/sw-register.js", lambda route: route.abort())

    # 1. Mock AudioContext since we are in a headless environment
    page.add_init_script("""
        window.AudioContext = class {
            constructor() {
                this.state = 'running';
            }
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
            get currentTime() { return Date.now() / 1000; }
            resume() { return Promise.resolve(); }
        };
        window.webkitAudioContext = window.AudioContext;
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

    # 6. Verify Accessibility Attributes on the first key
    first_key = keys.first

    # These checks are expected to fail before the fix
    role = first_key.get_attribute("role")
    tabindex = first_key.get_attribute("tabindex")
    aria_label = first_key.get_attribute("aria-label")

    print(f"Role: {role}, Tabindex: {tabindex}, Aria-Label: {aria_label}")

    if role != "button":
        raise AssertionError("Missing role='button'")
    if tabindex != "0":
        raise AssertionError("Missing tabindex='0'")
    if not aria_label or "Note" not in aria_label:
        raise AssertionError(f"Missing or incorrect aria-label: {aria_label}")

    # 7. Verify Keyboard Interaction
    # Focus the key
    first_key.focus()

    # Check if focused
    # Use evaluate to check document.activeElement
    is_focused = first_key.evaluate("el => document.activeElement === el")
    assert is_focused, "Key could not be focused"

    # Press Enter
    page.keyboard.press("Enter")

    # Check for active class (visual feedback)
    # animateKey adds 'active' class. It removes it first, triggers reflow, then adds it.
    # We might need to wait a tiny bit or just check immediately as it is synchronous DOM manipulation (except for the reflow hack)
    # The reflow hack is synchronous.

    assert "active" in first_key.get_attribute("class"), "Key did not become active on Enter"

    print("Music game accessibility verified successfully!")
