from playwright.sync_api import sync_playwright
import re
import http.server
import socketserver
import threading
import time

def verify_gate():
    PORT = 8124 # Changed port just in case
    Handler = http.server.SimpleHTTPRequestHandler

    server = socketserver.TCPServer(("", PORT), Handler)

    def start_server():
        print("serving at port", PORT)
        server.serve_forever()

    # Daemon thread to kill it on exit
    t = threading.Thread(target=start_server, daemon=True)
    t.start()

    # Wait a bit for server to start
    time.sleep(1)

    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            page.goto(f"http://localhost:{PORT}/index.html")
            page.wait_for_load_state("networkidle")

            # Now verify
            print("Starting verification loop...")

            for i in range(50):
                # Evaluate script to trigger gate
                # We need to ensure overlay is hidden first
                page.evaluate("""() => {
                    const overlay = document.getElementById('parental-gate-overlay');
                    overlay.classList.add('hidden');
                }""")

                # Use dynamic import to access ParentalGate
                result = page.evaluate("""async () => {
                    const { ParentalGate } = await import('./js/engine/parental-gate.js');

                    // Mock speakText if possible? or just ignore errors.

                    ParentalGate.show();

                    const qText = document.getElementById('pg-question').textContent;
                    return qText;
                }""")

                # result should be "A x B = ?"
                # Parse it
                m = re.match(r"(\d+)\s*x\s*(\d+)\s*=\s*\?", result)
                if not m:
                    print(f"FAILED: Invalid format '{result}'")
                    exit(1)

                a = int(m.group(1))
                b = int(m.group(2))

                if not (2 <= a <= 5) or not (2 <= b <= 5):
                    print(f"FAILED: Numbers out of range! {a} x {b}")
                    exit(1)

                correct_ans = a * b

                # Enter answer
                # Fix f-string issue by using double braces for literal braces
                page.evaluate(f"""async () => {{
                    const {{ ParentalGate }} = await import('./js/engine/parental-gate.js');
                    ParentalGate.handleInput('clear'); // clear buffer
                    '{str(correct_ans)}'.split('').forEach(c => ParentalGate.handleInput(c));
                    ParentalGate.handleInput('enter');
                }}""")

                # Check if overlay is hidden (meaning unlocked)
                is_hidden = page.evaluate("document.getElementById('parental-gate-overlay').classList.contains('hidden')")
                if not is_hidden:
                     print(f"FAILED: Gate did not unlock with correct answer {correct_ans}")
                     exit(1)

            print("SUCCESS: 50 iterations passed. Range is 2-5.")

        finally:
            browser.close()
            server.shutdown()
            server.server_close()

if __name__ == "__main__":
    verify_gate()
