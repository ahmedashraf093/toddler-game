from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        context.route("**/sw-register.js", lambda route: route.abort())
        page = context.new_page()

        # Console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PageError: {exc}"))

        page.add_init_script("""
            const style = document.createElement('style');
            style.innerHTML = '* { animation: none !important; transition: none !important; }';
            if (document.head) document.head.appendChild(style);
        """)

        # Robust Mock
        page.add_init_script("""
            window.AudioContext = class {
                createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {} }, type: '' }; }
                createGain() { return { connect: () => {}, gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
                createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, buffer: null, onended: null }; }
                createBiquadFilter() { return { connect: () => {}, frequency: { value: 0 }, type: '' }; }
                decodeAudioData() { return Promise.resolve({}); }
                createBuffer() { return { getChannelData: () => new Float32Array(100) }; }
                resume() { return Promise.resolve(); }
                get currentTime() { return 0; }
                get state() { return 'running'; }
            };

            // Mock SpeechSynthesisUtterance
            window.SpeechSynthesisUtterance = class {
                constructor(text) { this.text = text; }
            };

            // Mock speechSynthesis
            const mockSynth = {
                speak: (utt) => { console.log('Mock Speak:', utt.text); },
                cancel: () => {},
                onvoiceschanged: null,
                getVoices: () => []
            };

            try {
                Object.defineProperty(window, 'speechSynthesis', {
                    value: mockSynth,
                    writable: true
                });
            } catch(e) {
                window.speechSynthesis = mockSynth;
            }
        """)

        try:
            page.goto("http://localhost:8080/index.html")

            page.click("#start-btn", force=True)

            print("Calling setMode('traffic')...")
            page.evaluate("window.setMode('traffic')")

            # Wait for traffic stage
            stage = page.locator("#traffic-stage")
            expect(stage).to_be_visible()

            page.click(".traffic-light-box", force=True)
            page.wait_for_timeout(3000)
            page.screenshot(path="verification/traffic_light.png")
            print("Screenshot saved to verification/traffic_light.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
