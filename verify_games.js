
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.new_context({
        viewport: { width: 375, height: 667 }, // iPhone SE
    });
    const page = await context.newPage();

    console.log("Navigating to app...");
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);

    // Start app
    await page.click('#start-btn');
    await page.waitForTimeout(500);

    // Test Connect Dots
    console.log("Testing Connect Dots...");
    await page.click('#menu-btn');
    await page.waitForTimeout(500);

    // Find card in games-grid and click it
    // We can use the text 'Connect' 
    const connectCard = page.locator('.game-select-card:has-text("Connect")');
    await connectCard.click();
    await page.waitForTimeout(1000);

    const dotsStageVisible = await page.isVisible('#connect-dots-stage');
    const canvasWidth = await page.evaluate(() => document.getElementById('dots-canvas')?.width);
    const canvasHeight = await page.evaluate(() => document.getElementById('dots-canvas')?.height);

    console.log("Connect Dots Stage Visible:", dotsStageVisible);
    console.log("Canvas Size:", canvasWidth, "x", canvasHeight);
    await page.screenshot({ path: 'verification_connect.png' });

    // Test Emotions
    console.log("Testing Emotions...");
    await page.click('#menu-btn');
    await page.waitForTimeout(500);
    const emotionsCard = page.locator('.game-select-card:has-text("Emotions")');
    await emotionsCard.click();
    await page.waitForTimeout(1000);

    const emotionsStageVisible = await page.isVisible('#emotions-stage');
    const emotionsBox = await page.locator('#emotions-stage').boundingBox();

    console.log("Emotions Stage Visible:", emotionsStageVisible);
    console.log("Emotions Stage Bounding Box:", emotionsBox);
    await page.screenshot({ path: 'verification_emotions.png' });

    await browser.close();
})();
