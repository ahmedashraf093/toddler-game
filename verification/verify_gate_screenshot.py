from playwright.sync_api import sync_playwright
import http.server
import socketserver
import threading
import time

def verify_gate_screenshot():
    PORT = 8125
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
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            page.goto(f"http://localhost:{PORT}/index.html")
            page.wait_for_load_state("networkidle")

            # Hide loading screen aggressively
            page.add_style_tag(content="#loading-screen { display: none !important; }")

            # 1. Trigger the parental gate manually
            page.evaluate("""async () => {
                const { ParentalGate } = await import('./js/engine/parental-gate.js');
                // Ensure overlay is ready to be shown
                document.getElementById('parental-gate-overlay').classList.add('hidden');

                // Show it
                ParentalGate.show();
            }""")

            # 2. Wait for overlay
            page.wait_for_selector("#parental-gate-overlay:not(.hidden)")

            # 3. Take screenshot
            screenshot_path = "verification/parental_gate_screenshot.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        finally:
            browser.close()
            server.shutdown()
            server.server_close()

if __name__ == "__main__":
    verify_gate_screenshot()
