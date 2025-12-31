
import os
from playwright.sync_api import sync_playwright, expect

def verify_emotions_ui():
    with sync_playwright() as p:
        # Launch browser - Mobile emulation for Pixel 5
        pixel_5 = p.devices['Pixel 5']
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(**pixel_5)

        # Block Service Worker Registration script
        context.route("**/js/sw-register.js", lambda route: route.abort())

        page = context.new_page()

        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

        # Add init script to mock things if necessary (based on memory)
        page.add_init_script("""
            // Mock SpeechSynthesis
            Object.defineProperty(window, 'speechSynthesis', {
                value: {
                    speak: () => {},
                    cancel: () => {},
                    getVoices: () => [],
                    onvoiceschanged: null
                },
                writable: true
            });
            window.SpeechSynthesisUtterance = class { constructor() {} };

            // Mock content unlocked to ensure we can see games
            localStorage.setItem('challengeState', JSON.stringify({
                completedDays: 100,
                lastDailyDate: new Date().toISOString()
            }));

            // Disable CSS animations to fix stability checks
            const style = document.createElement('style');
            style.innerHTML = `
                *, *::before, *::after {
                    animation: none !important;
                    transition: none !important;
                }
            `;
            document.head.appendChild(style);
        """)

        try:
            # 1. Load the game
            print("Loading game...")
            page.goto("http://localhost:8080/index.html")

            # Wait for main execution (start btn visible)
            start_btn = page.locator("#start-btn")
            expect(start_btn).to_be_visible(timeout=10000)

            # 2. Inject Logic to Force-Start Emotions Game
            print("Injecting Force-Start Logic...")
            page.evaluate("""async () => {
                console.log("Starting injection...");
                try {
                    // Import the module dynamically
                    const mod = await import('./js/games/emotions.js');
                    console.log("Module imported");

                    // Hide other screens
                    const start = document.getElementById('start-screen');
                    if(start) start.style.display = 'none'; // Force hide

                    const load = document.getElementById('loading-screen');
                    if(load) load.style.display = 'none';

                    const menu = document.getElementById('games-menu-overlay');
                    if(menu) menu.style.display = 'none';

                    // Show Emotions Stage
                    const stage = document.getElementById('emotions-stage');
                    if(stage) {
                        stage.classList.remove('hidden');
                        stage.classList.add('active');
                        stage.style.display = 'flex'; // Force show
                        console.log("Stage classes:", stage.className);
                    } else {
                        console.error("Stage not found!");
                    }

                    // Initialize Game
                    mod.initEmotionGame();
                    console.log("Game initialized");
                } catch(e) {
                    console.error("Injection error:", e);
                }
            }""")

            # Wait for Emotions Stage and Face
            stage = page.locator("#emotions-stage")
            expect(stage).to_be_visible(timeout=5000)

            # Verify UI Elements
            print("Verifying UI Elements...")
            face = page.locator(".face-container")
            expect(face).to_be_visible(timeout=5000)

            # Check dimensions
            box = face.bounding_box()
            print(f"Face Dimensions: {box['width']}x{box['height']}")

            # Verify it is responsive (approx 80vmin of 393x851)
            # 393 * 0.8 = 314.4
            if 300 < box['width'] < 330:
                print("SUCCESS: Face width is responsive (~314px)!")
            else:
                print(f"WARNING: Face width {box['width']} might not be responsive or is maxed out.")

            # Check Palette
            palette = page.locator(".parts-palette")
            expect(palette).to_be_visible()
            p_box = palette.bounding_box()
            print(f"Palette Dimensions: {p_box['width']}x{p_box['height']}")

            # Take Screenshot
            os.makedirs("verification", exist_ok=True)
            screenshot_path = "verification/emotions_mobile.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_emotions_ui()
