const puppeteer = require('puppeteer');
const SELECTOR = require('./selector.js');
const path = require('path');
const fs = require('fs');
const { nodeOvserver } = require("./mutation_observer.js");
const { scrapeMessage } = require("./scrape_message.js");
const login = require("./login.js");

require('dotenv').config();

const flagFile = path.resolve(__dirname, '.hasRun');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


async function launchDiscord() {
  const headlessFlag = process.env.HEADLESS === 'true' ;
  const browser = await puppeteer.launch({
    args: ['--disable-restore-session-state'],
    headless: headlessFlag? 'new':false,
    userDataDir: `profiles/${process.env.DISCORD_EMAIL.split("@")[0]}` || `profiles/${process.env.DISCORD_EMAIL}` ,
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto('https://discord.com/login', { waitUntil: 'networkidle2' }).catch(() => null);
  await sleep(10 * 1000);
  await login(page);
  await page.close();

  const channels = JSON.parse(process.env.DISCORD_CHANNEL_IDS);
  for (const id of channels) {
    const channelPage = await browser.newPage();
    await channelPage.goto(`https://discord.com/channels/${process.env.DISCORD_SERVER_ID}/${id}`, { waitUntil: 'networkidle2' }).catch(() => null);
    console.log("🚀 Injecting node observer\x1b[32m " + id + "\x1b[0m") ;
    await nodeOvserver(channelPage);
  }
  console.log('🟢 (🚫 \x1b[36m Don’t text the dev browser ! \x1b[36m🚫 )\n🗨️  listening messages . . .');

}

module.exports = { launchDiscord };
