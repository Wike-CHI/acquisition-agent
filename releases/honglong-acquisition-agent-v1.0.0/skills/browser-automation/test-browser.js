const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Browser opened!');
  
  // Navigate to Facebook
  await page.goto('https://www.facebook.com');
  console.log('Facebook loaded!');
  
  // Wait for user to interact
  await page.waitForTimeout(5000);
  
  await browser.close();
})();
