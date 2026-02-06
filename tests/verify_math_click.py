
from playwright.sync_api import sync_playwright

def test_math_game_click(page):
    # 0. Block Service Worker
    page.route("**/sw-register.js", lambda route: route.abort())

    # 1. Mock AudioContext, SpeechSynthesis
    page.add_init_script("""
        window.AudioContext = class {
            createGain() { return { connect: () => {}, gain: { value: 0 } }; }
            createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {} }; }
            decodeAudioData(buffer) { return Promise.resolve({}); }
            resume() { return Promise.resolve(); }
        };
        window.speechSynthesis = {
            speak: () => {},
            cancel: () => {},
            getVoices: () => []
        };
        window.SpeechSynthesisUtterance = class {};

        // Disable Idle Timer by overwriting setTimeout? No, that's dangerous.
        // Instead, let's style the ghost hand to be invisible and non-interactive
        const style = document.createElement('style');
        style.innerHTML = `
            #start-screen { display: none !important; pointer-events: none !important; }
            #loading-screen { display: none !important; pointer-events: none !important; }
            .ghost-hand { display: none !important; pointer-events: none !important; }
        `;
        document.head.appendChild(style);
    """)

    # 2. Load the page
    page.goto("http://localhost:8000")

    # 3. Force remove start screen just in case
    page.evaluate("""
        const start = document.getElementById('start-screen');
        if (start) start.remove();
        const load = document.getElementById('loading-screen');
        if (load) load.remove();
    """)

    # 4. Initialize Math Game directly
    page.evaluate("import('./js/games/math.js').then(m => m.initMathGame())")

    # 5. Wait for Math Stage
    stage = page.wait_for_selector("#math-stage")
    assert stage is not None

    # 6. Get the target match value
    target = page.wait_for_selector("#math-target-zone")
    correct_answer = target.get_attribute("data-match")
    print(f"Correct answer is: {correct_answer}")

    # 7. Find the option with the correct answer
    correct_option_selector = f"#math-opt-{correct_answer}"
    correct_option = page.wait_for_selector(correct_option_selector)

    # 8. Click the option
    # Use force=True to bypass check? No, we want to ensure it's clickable by a user.
    # But if ghost hand appears momentarily, retry might handle it.
    correct_option.click()

    # 9. Verify Success
    try:
        page.wait_for_function(
            "document.getElementById('math-target-zone').classList.contains('matched')",
            timeout=2000
        )
        print("Success: matched class found on target zone!")
    except Exception:
        print("Failure: matched class NOT found (expected behavior before fix)")
        # This exit code 0 is intentional for the "before fix" run,
        # but to verify the fix later I should assert this works.
        # For now, I'll raise exception so I can confirm it fails.
        raise Exception("Click did not trigger match logic")

    assert target.text_content() == correct_answer
    print("Math game click interaction verified successfully!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            test_math_game_click(page)
        except Exception as e:
            print(f"Test failed: {e}")
            exit(1)
        finally:
            browser.close()
