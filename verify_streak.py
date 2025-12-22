from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Mock Audio & Speech
        page.add_init_script("""
        window.AudioContext = class {
            createGain() { return { gain: { setValueAtTime:()=>{}, linearRampToValueAtTime:()=>{}, exponentialRampToValueAtTime:()=>{} }, connect:()=>{} }; }
            createOscillator() { return { type:'', frequency:{value:0}, connect:()=>{}, start:()=>{}, stop:()=>{} }; }
            createBufferSource() { return { buffer:null, connect:()=>{}, start:()=>{} }; }
            decodeAudioData() { return Promise.resolve({}); }
            resume() { return Promise.resolve(); }
            get state() { return 'running'; }
            get currentTime() { return Date.now()/1000; }
        };
        Object.defineProperty(window, 'speechSynthesis', {
            value: { speak:()=>{}, cancel:()=>{}, onvoiceschanged:null, getVoices:()=>[] },
            writable: true
        });
        window.SpeechSynthesisUtterance = class {};
        """)

        # Mock reload
        page.add_init_script("window.location.reload = () => console.log('Reload mocked');")

        try:
            page.goto("http://localhost:8080/index.html")
            page.wait_for_timeout(1000)

            # Hide Loader
            page.evaluate("document.getElementById('loading-screen').style.display = 'none';")
            page.click("#start-btn", force=True)
            page.click("#menu-btn")
            page.click(".game-select-card:has-text('Odd One')")

            # Play 3 Rounds
            for i in range(1, 4):
                print(f"Playing Round {i}...")
                page.wait_for_selector(".odd-one-card")

                # Find the odd one (client logic has isOdd property, but DOM doesn't expose it directly except via click handler logic which we can't inspect easily without hacking)
                # However, we can cheat: the JS code attaches data-name.
                # Or we can just try clicking all 4 until one gets class 'solved'.

                # Better approach: Iterate cards.
                cards = page.locator(".odd-one-card").all()
                found = False
                for card in cards:
                    # Check if clicking it solves it.
                    # Since clicking incorrect shakes, we can check for shake class?
                    # But that takes time.
                    # Let's inspect the item data if possible.
                    # The DOM element has `data-name`. That doesn't help identify Odd.

                    # We'll just click them one by one. If it didn't solve, it shakes.
                    # If it solved, it has class 'solved'.

                    card.click()
                    page.wait_for_timeout(200) # wait for reaction

                    if "solved" in card.get_attribute("class"):
                        print(f"  Round {i} Solved!")
                        found = True

                        # Verify Celebration
                        celebration = page.locator("#celebration-overlay")

                        if i < 3:
                            # Should NOT show celebration
                            expect(celebration).to_be_hidden()
                            print("  No celebration (Correct)")
                            # Wait for next round (approx 1.5s delay in code)
                            page.wait_for_timeout(2000)
                        else:
                            # Should SHOW celebration
                            # Note: showCelebration removes 'hidden' class.
                            # expect(celebration).not_to_have_class("hidden") -> Playwright helper to_be_visible handles this
                            expect(celebration).to_be_visible()
                            print("  Celebration Visible! (Correct)")

                        break

                if not found:
                    print("Failed to find odd card?")
                    exit(1)

            print("Verification Successful!")

        except Exception as e:
            print(f"Error: {e}")
            exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    run()
