const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const sarahBtn = await page.$('button:has-text("Sarah Jenkins")');
  if (sarahBtn) {
    await sarahBtn.click();
    await page.waitForTimeout(500);
  }

  const signInBtn = await page.$('#btn-login-planner, button:has-text("Sign In to Planning Console")');
  if (signInBtn) {
    await signInBtn.click();
    await page.waitForTimeout(2000);
  }

  const scenarioBtn = await page.$('button:has-text("ROI"), button:has-text("Simulate Asset"), button[title*="Scenario"]');
  if (scenarioBtn) {
    await scenarioBtn.click();
    await page.waitForTimeout(1000);
  }

  const simulateBtn = await page.$('button:has-text("Simulate Intervention Impact")');
  if (simulateBtn) {
    console.log('Clicking simulate button...');
    await simulateBtn.click();
    await page.waitForTimeout(2500);
  }

  // Scroll to the How Impact is Calculated section
  console.log('Scrolling to calculation section...');
  const calcHeader = await page.$('text=How Impact is Calculated');
  if (calcHeader) {
    console.log('Found calculation header, scrolling into view...');
    await calcHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
  } else {
    console.log('Calculation header not found!');
  }

  await page.screenshot({ path: 'C:/Users/Lohith/.gemini/antigravity-ide/brain/60829a6a-06be-40fe-b83b-922862b6bc94/.tempmediaStorage/tiger_calculation_scrolled.png' });
  console.log('Saved tiger_calculation_scrolled.png');

  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
