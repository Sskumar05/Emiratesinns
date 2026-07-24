import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  console.log("Starting Playwright...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('RAW DATA')) {
      console.log(`BROWSER_LOG: ${text}`);
    }
  });

  try {
    console.log("Navigating to /rooms...");
    await page.goto('http://localhost:5173/rooms', { waitUntil: 'networkidle' });
    
    console.log("Clicking View Details...");
    await page.waitForSelector('a[href^="/rooms/"]');
    await page.click('a[href^="/rooms/"]');

    console.log("Waiting for step 1...");
    await page.waitForSelector('text=Review your selection');
    await page.click('button:has-text("Continue")');

    console.log("Waiting for step 2...");
    await page.waitForSelector('text=Guest details');
    await page.fill('label:has-text("Full Name") input', 'Real Test User');
    await page.fill('label:has-text("Mobile Number") input', '9876543210');
    await page.fill('label:has-text("Email Address") input', 'test@example.com');
    await page.click('button:has-text("Continue")');

    console.log("Waiting for step 3...");
    await page.waitForSelector('text=Booking summary');
    await page.click('button:has-text("Proceed to Payment")');

    console.log("Waiting for Payment page...");
    await page.waitForSelector('text=Pay');
    await page.click('button:has-text("Pay")');

    console.log("Waiting for Success...");
    await page.waitForSelector('text=Payment Successful!', { timeout: 15000 });
    
    console.log("Clicking Download Invoice...");
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
      page.click('button:has-text("Download Invoice")')
    ]);

    if (download) {
      console.log(`Invoice downloaded: ${download.suggestedFilename()}`);
    }

    // Wait a bit to ensure async backend generate function completes and logs
    await page.waitForTimeout(3000);
    
    console.log("Going to admin invoices...");
    await page.goto('http://localhost:5173/admin/invoices', { waitUntil: 'networkidle' });
    
    console.log("Clicking admin download PDF for the first invoice...");
    const downloadBtns = await page.$$('button[title="Download PDF"]');
    if (downloadBtns.length > 0) {
      const [adminDownload] = await Promise.all([
        page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
        downloadBtns[0].click()
      ]);
      if (adminDownload) {
        console.log(`Admin invoice downloaded: ${adminDownload.suggestedFilename()}`);
      }
    }

    await page.waitForTimeout(2000);
    console.log("Test finished.");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
  }
}

run();
