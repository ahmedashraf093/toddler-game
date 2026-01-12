import re
import sys

def check_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    errors = []

    # Check Games Menu Overlay
    if 'id="games-menu-overlay"' in content:
        if 'role="dialog"' not in content.split('id="games-menu-overlay"')[1].split('>')[0]:
            errors.append("Games Menu Overlay missing role='dialog'")
        if 'aria-modal="true"' not in content.split('id="games-menu-overlay"')[1].split('>')[0]:
            errors.append("Games Menu Overlay missing aria-modal='true'")
        if 'aria-labelledby="games-menu-title"' not in content.split('id="games-menu-overlay"')[1].split('>')[0]:
            errors.append("Games Menu Overlay missing aria-labelledby='games-menu-title'")
        if 'id="games-menu-title"' not in content:
            errors.append("Games Menu Title missing id='games-menu-title'")

    # Check Challenges Overlay
    if 'id="challenges-overlay"' in content:
        if 'role="dialog"' not in content.split('id="challenges-overlay"')[1].split('>')[0]:
            errors.append("Challenges Overlay missing role='dialog'")
        if 'aria-modal="true"' not in content.split('id="challenges-overlay"')[1].split('>')[0]:
            errors.append("Challenges Overlay missing aria-modal='true'")
        if 'aria-labelledby="challenges-title"' not in content.split('id="challenges-overlay"')[1].split('>')[0]:
            errors.append("Challenges Overlay missing aria-labelledby='challenges-title'")
        if 'id="challenges-title"' not in content:
            errors.append("Challenges Title missing id='challenges-title'")

    # Check Sticker Book Overlay
    if 'id="sticker-book-overlay"' in content:
        if 'role="dialog"' not in content.split('id="sticker-book-overlay"')[1].split('>')[0]:
            errors.append("Sticker Book Overlay missing role='dialog'")
        if 'aria-modal="true"' not in content.split('id="sticker-book-overlay"')[1].split('>')[0]:
            errors.append("Sticker Book Overlay missing aria-modal='true'")
        if 'aria-labelledby="sticker-book-title"' not in content.split('id="sticker-book-overlay"')[1].split('>')[0]:
            errors.append("Sticker Book Overlay missing aria-labelledby='sticker-book-title'")
        if 'id="sticker-book-title"' not in content:
            errors.append("Sticker Book Title missing id='sticker-book-title'")

    # Check Parental Gate Overlay
    if 'id="parental-gate-overlay"' in content:
        if 'role="dialog"' not in content.split('id="parental-gate-overlay"')[1].split('>')[0]:
            errors.append("Parental Gate Overlay missing role='dialog'")
        if 'aria-modal="true"' not in content.split('id="parental-gate-overlay"')[1].split('>')[0]:
            errors.append("Parental Gate Overlay missing aria-modal='true'")
        if 'aria-labelledby="pg-title"' not in content.split('id="parental-gate-overlay"')[1].split('>')[0]:
            errors.append("Parental Gate Overlay missing aria-labelledby='pg-title'")
        if 'id="pg-title"' not in content:
            errors.append("Parental Gate Title missing id='pg-title'")

        # Check close button label in Parental Gate
        pg_content = content.split('id="parental-gate-overlay"')[1].split('</div>')[0]
        if 'aria-label="Close Parental Gate"' not in pg_content and 'aria-label="Close menu"' not in pg_content: # Allow either but prefer specific
             # Wait, the search logic above is weak because of nested divs.
             # Let's just grep the specific button.
             pass

    # Regex check for the specific button
    pg_close_btn_pattern = r'<button class="close-menu-btn" onclick="toggleParentalGate\(false\)"[^>]*aria-label="Close Parental Gate"'
    if not re.search(pg_close_btn_pattern, content):
        errors.append("Parental Gate Close Button missing aria-label='Close Parental Gate'")

    if errors:
        print("Accessibility Verification FAILED:")
        for e in errors:
            print(f"- {e}")
        sys.exit(1)
    else:
        print("Accessibility Verification PASSED!")
        sys.exit(0)

if __name__ == "__main__":
    check_file("index.html")
