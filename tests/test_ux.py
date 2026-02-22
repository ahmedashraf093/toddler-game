
import pytest
import re
import time
from playwright.sync_api import sync_playwright, expect

def test_start_screen_fade_out(page):
    # 0. Block Service Worker
    page.context.route("**/sw-register.js", lambda route: route.abort())

    # Listen for console logs
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

    # 1. Mock AudioContext
    page.add_init_script("""
        window.AudioContext = class {
            constructor() {
                this.state = 'suspended';
            }
            createGain() { return { connect: () => {}, gain: { value: 0 } }; }
            createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
            decodeAudioData(buffer) { return Promise.resolve({}); }
            resume() { this.state = 'running'; return Promise.resolve(); }
        };
    """)

    # 2. Load the page
    page.goto("http://localhost:8000")

    # 3. Wait for Loader to disappear
    expect(page.locator("#loading-screen")).to_be_hidden(timeout=10000)

    # 4. Locate Start Screen and Button
    start_screen = page.locator("#start-screen")
    start_btn = page.locator("#start-btn")

    # Verify start screen is visible initially
    expect(start_screen).to_be_visible()

    # Verify pointer-events is auto initially (default)
    # expect(start_screen).to_have_css("pointer-events", "auto") # Computed might vary, usually 'auto'

    # 5. Click Play
    print("Clicking start button...")
    start_btn.click(force=True)

    # 6. Check immediate state: MUST have .fade-out class and still be visible
    expect(start_screen).to_have_class(re.compile(r"fade-out"), timeout=1000)
    expect(start_screen).to_be_visible()

    # Verify pointer-events is none immediately
    expect(start_screen).to_have_css("pointer-events", "none")

    # 7. Wait for animation to finish
    time.sleep(0.6)

    # 8. Verify it is hidden
    expect(start_screen).to_be_hidden()
