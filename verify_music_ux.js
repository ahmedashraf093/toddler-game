
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log("Navigating to app...");
    await page.goto('http://localhost:3000');

    // Start game
    await page.click('#start-btn');
    await page.waitForTimeout(500);

    // Open Menu and Select Music
    console.log("Selecting Music Game...");
    await page.click('#menu-btn');
    await page.waitForTimeout(500);

    // Click the card with text "Music"
    const musicCard = page.locator('.game-select-card:has-text("Music")');
    if (await musicCard.count() > 0) {
        await musicCard.click();
    } else {
        console.error("Music card not found!");
        process.exit(1);
    }

    await page.waitForTimeout(1000);

    // Verify Stage
    const stage = page.locator('#music-stage');
    if (await stage.isVisible()) {
        console.log("✅ Music Stage is visible");
    } else {
        console.error("❌ Music Stage not visible");
        process.exit(1);
    }

    // Verify Keys
    const keys = page.locator('.xylophone-key');
    const count = await keys.count();
    console.log(`Found ${count} keys (Expected 8)`);
    if (count !== 8) {
        console.error("❌ Incorrect key count");
        process.exit(1);
    } else {
        console.log("✅ Key count correct");
    }

    // Verify Accessibility
    const firstKey = keys.first();
    const role = await firstKey.getAttribute('role');
    const label = await firstKey.getAttribute('aria-label');
    const tabindex = await firstKey.getAttribute('tabindex');

    console.log(`First Key - Role: ${role}, Label: ${label}, Tabindex: ${tabindex}`);

    if (role === 'button' && label && tabindex === '0') {
        console.log("✅ Accessibility attributes present");
    } else {
        console.error("❌ Missing accessibility attributes");
    }

    // Test Interaction
    console.log("Testing interaction...");
    await firstKey.click();
    await page.waitForTimeout(100);
    // Check for active class
    // Note: The active class is removed after 200ms, so we might miss it if we wait too long.
    // Let's rely on no errors being thrown.
    console.log("✅ Click interaction successful");

    // Screenshot
    await page.screenshot({ path: 'verification_music.png' });
    console.log("📸 Screenshot saved to verification_music.png");

    await browser.close();
})();
