const { chromium } = require("@playwright/test");
const fs = require("fs");
const cron = require('node-cron');

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createFile(filepath, data) {
  fs.open(filepath,'r',function(notExists, file) {
    if (notExists) {

      fs.writeFile(filepath, data, (err) => {
        if (err) console.error(err)
        console.log('Data written')
      });

    } else {
      console.log("File already exists!");
    }
  });
}

async function scrape() {
  const launchOptions = {
    "executablePath": "/usr/bin/chromium-browser",
    "args": ['--disable-gpu']
  }
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36"

  browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({"userAgent": userAgent});
  let data = [];
  for(var i =0; i <= 10; i++){
    await timeout(1000);
    try{
      await page.goto('https://www.phs.org/Pages/default.aspx')
    } catch(err){
      console.log(err)
    }

    const performanceTimingJson = await page.evaluate(() => JSON.stringify(window.performance.timing))
    const performanceTiming = JSON.parse(performanceTimingJson)

    const startToInteractive = performanceTiming.domInteractive - performanceTiming.navigationStart
    const servername = await page.evaluate(() => document.querySelector('meta[name="servername"]').getAttribute('content'))
    let seconds = startToInteractive / 1000
    let dt = new Date()
    let timestamp = dt.toLocaleString('en-US', {timeZone: 'US/Arizona'}).split(",").join("_").split(" ").join("")
    console.log(timestamp)
    fs.appendFileSync('results/performance_results.csv', `${servername},${seconds},${timestamp}` + '\n')
  }
}

let header = 'servername,seconds,timestamp' + '\n';
createFile('results/performance_results.csv', header);

cron.schedule('0 */1 * * * *',  function() {
  scrape();
});
