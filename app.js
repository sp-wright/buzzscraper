const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');

let port = process.env.PORT;
if (port == null || port == '') {
  port = 8008;
}

app.listen(port, () => console.log(`server opened on port ${port}`));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const puppeteer = require('puppeteer');

//get quizzes from buzzfeed

const buzzfeedCrawl = async () => {
  const quizzes = [];
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto('https://www.buzzfeed.com/trending/quizzes');

  //header
  //get titles
  const [el] = await page.$x('//*[@id="mod-featured-card-1"]/div[2]/a/h2');
  const text = await el.getProperty('textContent');
  const title = await text.jsonValue();
  //get images
  const [el1] = await page.$x('//*[@id="mod-featured-card-1"]/div[1]/div[1]/img');
  const src = await el1.getProperty('src');
  const img = await src.jsonValue();
  //get links
  const [el2] = await page.$x('//*[@id="mod-featured-card-1"]/div[2]/a');
  const href = await el2.getProperty('href');
  const link = await href.jsonValue();

  quizzes.push({ title: title, image: img, link: link });

  //body
  for (let i = 1; i < 10; i++) {
    //get titles
    const [el] = await page.$x(`//*[@id="mod-story-card-${i}"]/div[2]/div/h2/a`);
    const text = await el.getProperty('textContent');
    const title = await text.jsonValue();
    //get images
    const [el1] = await page.$x(`//*[@id="mod-story-card-${i}"]/div[1]/img`);
    const src = await el1.getProperty('src');
    const img = await src.jsonValue();
    //get links
    const [el2] = await page.$x(`//*[@id="mod-story-card-${i}"]/div[2]/div/h2/a`);
    const href = await el2.getProperty('href');
    const link = await href.jsonValue();

    quizzes.push({ title: title, image: img, link: link });
  }
  await browser.close();
  return quizzes;
};

app.get('/', (req, res) => {
  buzzfeedCrawl().then((quizzes) => {
    res.render('home', { quizzes: quizzes });
  });
});
