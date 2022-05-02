const { chromium } = require("@playwright/test");
const fs = require("fs");
const cron = require('node-cron');


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
    result = {"servername": servername, "seconds": startToInteractive / 1000 }
    data.push(result)
  }

  await page.close()
  await browser.close()
  let dt = new Date()
  let dtStr = dt.toLocaleString().split("/").join("_").split(" ").join("_").split(",").join("")

  let csv = '';
  let header = Object.keys(data[0]).join(',');
  let values = data.map(o => Object.values(o).join(',')).join('\n');

  csv += header + '\n' + values;
  console.log(csv);
  fs.writeFile(`${dtStr}.csv`, csv, (error) => {
    if (error) throw error;
  });
}

cron.schedule('* 1 * * * *',  function() {
  scrape();
});