const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Click on "Sarah Jenkins (Climate Equity)" sample button to fill credentials
  const sarahBtn = await page.$('button:has-text("Sarah Jenkins")');
  if (sarahBtn) {
    console.log('Clicking Sarah Jenkins quick fill...');
    await sarahBtn.click();
    await page.waitForTimeout(500);
  }

  // Click on "Sign In to Planning Console" button
  const signInBtn = await page.$('#btn-login-planner, button:has-text("Sign In to Planning Console")');
  if (signInBtn) {
    console.log('Signing into Planning Console...');
    await signInBtn.click();
    await page.waitForTimeout(2500);
  }

  // Open Scenario Planner Drawer if not already open
  console.log('Opening Scenario Drawer...');
  const scenarioBtn = await page.$('button:has-text("ROI"), button:has-text("Simulate Asset"), button[title*="Scenario"]');
  if (scenarioBtn) {
    await scenarioBtn.click();
    await page.waitForTimeout(1000);
  }

  // Click "Click directly anywhere on map to position pin"
  console.log('Activating map click placement...');
  const placeBtn = await page.$('button:has-text("position pin"), button:has-text("Click directly anywhere on map"), button:has-text("Direct Map Pin")');
  if (placeBtn) {
    await placeBtn.click();
    await page.waitForTimeout(1000);
  }

  // Click directly on the Leaflet map in the center area
  console.log('Clicking on the map...');
  const mapElement = await page.$('.leaflet-map, .leaflet-container');
  if (mapElement) {
    const box = await mapElement.boundingBox();
    if (box) {
      // Click slightly right/down of center (Southeast Raleigh area)
      await page.mouse.click(box.x + box.width * 0.52, box.y + box.height * 0.54);
      await page.waitForTimeout(1500);
    }
  }

  // Capture screenshot of the map with the dropped pin and catchment circle
  await page.screenshot({ path: 'C:/Users/Lohith/.gemini/antigravity-ide/brain/60829a6a-06be-40fe-b83b-922862b6bc94/.tempmediaStorage/map_click_placed.png' });
  console.log('Saved map_click_placed.png');

  // Click "Simulate Intervention Impact"
  console.log('Clicking Simulate Intervention Impact...');
  const simulateBtn = await page.$('button:has-text("Simulate Intervention Impact")');
  if (simulateBtn) {
    await simulateBtn.click();
    await page.waitForTimeout(2500);
  }

  // Capture screenshot of the Scenario Drawer showing the HUD and Tiger Data calculation breakdown
  await page.screenshot({ path: 'C:/Users/Lohith/.gemini/antigravity-ide/brain/60829a6a-06be-40fe-b83b-922862b6bc94/.tempmediaStorage/simulation_tiger_insights.png' });
  console.log('Saved simulation_tiger_insights.png');

  await browser.close();
  console.log('Verification finished successfully!');
})().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
