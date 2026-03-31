const { chromium } = require('playwright');

(async () => {
  // Connect to existing Chrome with debugging port
  // First, need to check if Chrome has remote debugging enabled
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  console.log('Connected to existing Chrome!');
  
  const contexts = browser.contexts();
  if (contexts.length > 0) {
    const page = await contexts[0].newPage();
    await page.goto('https://www.facebook.com');
    console.log('Facebook opened in existing Chrome!');
    await page.waitForTimeout(3000);
  } else {
    console.log('No existing contexts found');
  }
})().catch(err => {
  console.log('Error:', err.message);
  console.log('Make sure Chrome is running with remote debugging:');
  console.log('chrome --remote-debugging-port=9222');
});
