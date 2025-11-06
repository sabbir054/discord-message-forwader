const puppeteer = require('puppeteer');
const {launchDiscord} = require("./bot/index.js")
require('dotenv').config();


(async () => {

 await launchDiscord()
  

})();
