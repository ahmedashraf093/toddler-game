import pytest
from playwright.sync_api import expect
import re
import time

def test_start_screen_fade_out(page):
    # Block SW
    page.route("**/sw-register.js", lambda route: route.abort())

    # Load page
    page.goto("http://localhost:8000")

    # Check start screen visible
    start_screen = page.locator("#start-screen")
    expect(start_screen).to_be_visible()

    # Click start button (force because of pulse animation)
    page.click("#start-btn", force=True)

    # Check if fade-out class is added immediately
    # We expect .fade-out class to be present
    expect(start_screen).to_have_class(re.compile(r"fade-out"))

    # Wait for animation to finish
    page.wait_for_timeout(600)

    # Check if hidden
    expect(start_screen).to_be_hidden()

def test_parental_gate_close_button_visible(page):
    # Block SW
    page.route("**/sw-register.js", lambda route: route.abort())

    # Load page
    page.goto("http://localhost:8000")

    # Open Parental Gate
    page.evaluate("window.toggleParentalGate(true)")

    # Check Close Button
    close_btn = page.locator("#parental-gate-overlay .close-menu-btn")
    expect(close_btn).to_be_visible()

    # Get bounding box
    box = close_btn.bounding_box()
    print(f"Close Button Bounding Box: {box}")

    # Should be inside viewport (y >= 0, x >= 0, y <= viewport_height, etc)
    # If off-screen (top: -20px), y might be -20 or 0 (clipped?)

    assert box['y'] >= 0, f"Close button is off-screen vertically (top): {box['y']}"
    assert box['x'] >= 0, f"Close button is off-screen horizontally (left): {box['x']}"
