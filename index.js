const { chromium } = require("@playwright/test");

async function scrape() {
  const launchOptions = {
    "executablePath": "/usr/bin/chromium-browser",
    "args": ['--disable-gpu']
  }
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36"

  browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({"userAgent": userAgent});
  let data = [];

  for(var i =0; i <= 1000; i++){
    await page.goto('https://www.phs.org/Pages/default.aspx')

    const performanceTimingJson = await page.evaluate(() => JSON.stringify(window.performance.timing))
    const performanceTiming = JSON.parse(performanceTimingJson)

    const startToInteractive = performanceTiming.domInteractive - performanceTiming.navigationStart
    const servername = await page.evaluate(() => document.querySelector('meta[name="servername"]').getAttribute('content'))
    result = {}
    result[servername] = startToInteractive / 1000
    data.push(result)
  }

  const fs = require("fs");
  fs.writeFile('performance_results.json', JSON.stringify(data), (error) => {
    if (error) throw error;
  });

  await page.close()
  await browser.close()
}

scrape()