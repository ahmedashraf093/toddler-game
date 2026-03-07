import os
from playwright.sync_api import sync_playwright, expect

def verify_a11y():
    with sync_playwright() as p:
        iphone_se = p.devices['iPhone SE']
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(**iphone_se)

        # Block SW
        context.route("**/js/sw-register.js", lambda route: route.abort())

        page = context.new_page()
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

        page.add_init_script("""
            // Mock SpeechSynthesis
            Object.defineProperty(window, 'speechSynthesis', {
                value: { speak: () => {}, cancel: () => {}, getVoices: () => [], onvoiceschanged: null },
                writable: true
            });
            window.SpeechSynthesisUtterance = class { constructor() {} };

            // Disable animations for stability
            const style = document.createElement('style');
            style.innerHTML = `*, *::before, *::after { animation: none !important; transition: none !important; }`;
            document.head.appendChild(style);
        """)

        try:
            print("Loading game...")
            page.goto("http://localhost:8000/index.html")

            # Use javascript to force start and evaluate elements

            # 1. Verify Bubble Pop
            print("\\n--- Verifying Bubble Pop ---")
            page.evaluate("""async () => {
                const mod = await import('./js/games/bubble-pop.js');
                document.getElementById('start-screen').style.display = 'none';
                mod.initBubblePopGame();
            }""")

            # Wait for bubble
            page.wait_for_selector(".bubble", state="attached", timeout=5000)

            # Check attributes
            bubbles = page.locator(".bubble")
            count = bubbles.count()
            print(f"Found {count} bubbles in Bubble Pop.")
            for i in range(count):
                b = bubbles.nth(i)
                role = b.get_attribute("role")
                tabindex = b.get_attribute("tabindex")
                aria_label = b.get_attribute("aria-label")
                print(f"Bubble {i}: role='{role}', tabindex='{tabindex}', aria-label='{aria_label}'")

                assert role == "button", f"Expected role='button', got '{role}'"
                assert tabindex == "0", f"Expected tabindex='0', got '{tabindex}'"
                assert "Pop bubble with number" in aria_label, f"Expected aria-label to contain 'Pop bubble with number', got '{aria_label}'"

            # Clear stage for next test
            page.evaluate("document.getElementById('bubble-stage').remove()")

            # 2. Verify Alphabet Pop
            print("\\n--- Verifying Alphabet Pop ---")
            page.evaluate("""async () => {
                const mod = await import('./js/games/alphabet-pop.js');
                mod.initAlphabetPopGame();
            }""")

            page.wait_for_selector(".bubble", state="attached", timeout=5000)

            bubbles = page.locator(".bubble")
            count = bubbles.count()
            print(f"Found {count} bubbles in Alphabet Pop.")
            for i in range(count):
                b = bubbles.nth(i)
                role = b.get_attribute("role")
                tabindex = b.get_attribute("tabindex")
                aria_label = b.get_attribute("aria-label")
                print(f"Bubble {i}: role='{role}', tabindex='{tabindex}', aria-label='{aria_label}'")

                assert role == "button", f"Expected role='button', got '{role}'"
                assert tabindex == "0", f"Expected tabindex='0', got '{tabindex}'"
                assert "Pop bubble with letter" in aria_label, f"Expected aria-label to contain 'Pop bubble with letter', got '{aria_label}'"

            # Clear stage
            page.evaluate("document.getElementById('alphabet-stage').remove()")

            # 3. Verify Listening
            print("\\n--- Verifying Listening ---")
            page.evaluate("""async () => {
                const mod = await import('./js/games/listening.js');
                mod.initListeningGame();
            }""")

            page.wait_for_selector(".listening-card", state="attached", timeout=5000)

            cards = page.locator(".listening-card")
            count = cards.count()
            print(f"Found {count} cards in Listening.")
            for i in range(count):
                c = cards.nth(i)
                role = c.get_attribute("role")
                tabindex = c.get_attribute("tabindex")
                aria_label = c.get_attribute("aria-label")
                print(f"Card {i}: role='{role}', tabindex='{tabindex}', aria-label='{aria_label}'")

                assert role == "button", f"Expected role='button', got '{role}'"
                assert tabindex == "0", f"Expected tabindex='0', got '{tabindex}'"
                assert aria_label is not None, f"Expected aria-label, got None"

            # 4. Verify Connect Dots
            print("\\n--- Verifying Connect Dots ---")
            page.evaluate("""async () => {
                const mod = await import('./js/games/connect-dots.js');
                document.getElementById('game-board').style.display = 'none'; // hide previous

                // Need to mock the stage for connect dots if it expects it
                const stage = document.createElement('div');
                stage.id = 'connect-dots-stage';
                document.body.appendChild(stage);

                mod.initConnectDotsGame();
            }""")

            page.wait_for_selector(".dot", state="attached", timeout=5000)

            dots = page.locator(".dot")
            count = dots.count()
            print(f"Found {count} dots in Connect Dots.")
            for i in range(count):
                d = dots.nth(i)
                role = d.get_attribute("role")
                tabindex = d.get_attribute("tabindex")
                aria_label = d.get_attribute("aria-label")
                print(f"Dot {i}: role='{role}', tabindex='{tabindex}', aria-label='{aria_label}'")

                assert role == "button", f"Expected role='button', got '{role}'"
                assert tabindex == "0", f"Expected tabindex='0', got '{tabindex}'"
                assert "Dot" in aria_label, f"Expected aria-label to contain 'Dot', got '{aria_label}'"

            print("\\n✅ All verifications passed!")

        except Exception as e:
            print(f"\\n❌ Verification failed: {e}")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_a11y()
