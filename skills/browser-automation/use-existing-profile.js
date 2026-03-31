const { chromium } = require('playwright');

(async () => {
  // Use existing Chrome profile with persistent context
  const browser = await chromium.launchPersistentContext(
    'C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data',
    {
      headless: false,
      channel: 'chrome',
      args: ['--disable-blink-features=AutomationControlled']
    }
  );
  
  console.log('Chrome opened with your profile!');
  
  // Get existing pages or create new one
  const pages = browser.contexts()[0].pages();
  if (pages.length > 0) {
    await pages[0].bringToFront();
    await pages[0].goto('https://www.facebook.com');
  } else {
    const page = await browser.contexts()[0].newPage();
    await page.goto('https://www.facebook.com');
  }
  
  console.log('Facebook loaded with your login!');
  console.log('Please login if needed, then tell me!');
  
  // Keep browser open
  await browser.contexts()[0].waitForTimeout(30000);
})();
