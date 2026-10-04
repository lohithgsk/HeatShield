const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Click on Launch Resident Cooling Map
  await page.click('button:has-text("Launch Resident Cooling Map")');
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'client/public/map_preview.png' });
  console.log('Map screenshot saved successfully');
  await browser.close();
})();
