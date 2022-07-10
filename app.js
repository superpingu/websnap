const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

let browser
(async () => {
  browser = await puppeteer.launch({args: ["--no-sandbox", "--disabled-setupid-sandbox"]});
})();

app.get('/websnap/img/', async (req, res) => {
  if(!req.query.url)
    res.status(400).send('error: missing param url');

  try {
    const page = await browser.newPage();

    // customize page dimensions if both width and height query params are provided
    const width = parseInt(req.query.width);
    const height = parseInt(req.query.height);
    if(!isNaN(width) && !isNaN(height))
      await page.setViewport({width: width, height: height});
    // navigate to the page and take the screenshot
    await page.goto(req.query.url, {timeout: 60000, waitUntil: 'domcontentloaded'});
    await new Promise(resolve => setTimeout(resolve, 1000));

    const screenshot = await page.screenshot({type: 'jpeg', quality:10});
    // return the image as jpeg
    res.set('Content-Type', 'image/jpeg')
    res.send(screenshot);

    await page.close();
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error: " + err);
  }
})

app.listen(3032, () => {
  console.log('Dev URL server running @ bonetti.io:3032');
})
