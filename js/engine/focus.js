// 🎨 Palette: Accessibility Focus Management

const focusStack = [];

/**
 * Traps focus within the given element.
 * Saves the current active element to restore later.
 *
 * @param {HTMLElement} element The container to trap focus in.
 */
export function trapFocus(element) {
    if (!element) return;

    // Save the element that had focus before opening the modal
    const previouslyFocused = document.activeElement;
    focusStack.push(previouslyFocused);

    // Find all focusable elements
    const focusableElements = Array.from(element.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    )).filter(el => {
        // Simple visibility check
        return el.offsetParent !== null;
    });

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element inside the modal
    firstElement.focus();

    // Create the keydown handler
    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    };

    // Store the handler on the element so we can remove it later
    element._trapListener = handleKeyDown;
    element.addEventListener('keydown', handleKeyDown);
}

/**
 * Releases the focus trap and restores focus to the previous element.
 *
 * @param {HTMLElement} element The container that had focus trapped.
 */
export function releaseFocus(element) {
    if (!element) return;

    // Remove the event listener
    if (element._trapListener) {
        element.removeEventListener('keydown', element._trapListener);
        delete element._trapListener;
    }

    // Restore focus to the last element in the stack
    const elementToRestore = focusStack.pop();
    if (elementToRestore && document.body.contains(elementToRestore)) {
        elementToRestore.focus();
    }
}
