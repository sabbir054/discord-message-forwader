const cheerio = require('cheerio');
const fs = require('fs');
const { produceTradeMessage } = require('../src/producer.js');
const { compareTimes,readAndDeleteJsonFiles } = require('./utils.js');
const { type } = require('os');
require('dotenv').config();

async function saveLastUser(data, filename) {
  try {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
    // console.log(`✅ JSON saved`);
  } catch (err) {
    console.error('nodeOvserverError writing JSON file:', err);
  }
}

function readJSON(filename) {
  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch (err) {
    console.error('nodeOvserverError reading JSON:', err);
    return null;
  }
}



async function getMutations(page) {
  await page.evaluate(() => {
    const targetNode = document.querySelector('[class*="chatContent"]');
    if (!targetNode) {
      console.warn('MutationObserver: Target not found.');
      return;
    }

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.tagName === 'LI' &&
            node.id?.startsWith('chat-messages-')
          ) {
            const elements = node.querySelectorAll(
              '.username_c19a55.desaturateUserColors__41f68.clickable_c19a55'
            );

            const clickable = elements[elements.length - 1] || null;
            if (clickable) {
              clickable.click();
            } else {
              console.log("No clickable element found");
            }

            setTimeout(() => {
              const el = document.querySelector('.userTagUsername__63ed3');
              const userText = el ? el.textContent.trim() : null;
              console.log(`new_item: ${userText}`);

              console.log('press_escape');
              console.log(`new_html: username=${userText}::HTML=${node.outerHTML}`);
            }, 2000);
          }
        }
      }
    });

    observer.observe(targetNode, { childList: true, subtree: true });
    console.log('MutationObserver attached.');
  });
}




async function nodeOvserver(page) {
  

  page.on('console', async msg => {
    const html = msg.text();

    //escape key
    if (html === 'press_escape') await page.keyboard.press('Escape')


    if (html.startsWith('new_html:')) {
      const [_, userName, htmlContent] = html.match(/^new_html: username=(.*?)::HTML=(.*)$/s) || [];
      if (!htmlContent) return;

      // const pageContent = await page.content();
      // fs.writeFileSync(`after-click.html`, pageContent);
      
      console.log(`User Name: ${userName}`);

      const $ = cheerio.load(htmlContent);
      const li = $('li[id^="chat-messages-"]').attr('id');                                                                                                                                                     
      const messageId = li?.split('-')[3]?.trim();
      const content = $(`#message-content-${messageId}`).text().trim();
      const timestamp = $('time').attr('datetime');
      const repliedTo = $('[class^="repliedTextContent_c19a55"]').text().trim();
      const repliedName = $('.repliedMessage_c19a55 .username_c19a55').first().text().replace(/^@/, '');
      const channelId = $('[id^="chat-messages-"]')?.attr('id').match(/^chat-messages-(\d+)-/)?.[1] || null;

      let usernameId = $('[aria-labelledby]').attr('aria-labelledby')?.split(' ').find(id => id.startsWith('message-username-'));      
      let displayName = $(`.username_c19a55`).attr('data-text');
      let href = $('a.originalLink_af017a').attr('href')?.replace('/amp;/g', '');
      
      if (repliedName) {
        usernameId =  $('.header_c19a55').attr('aria-labelledby')?.split(' ').find(id => id.startsWith('message-username-'));
      }

      const userId = usernameId?.split('-')[2];
      console.log("userId: ", userId )
      
      if (!displayName) {
        const lastUser = await readJSON(`./bot/users/${userId}.json`)
        displayName = lastUser?.displayName;
      }

      if (repliedName) {
        displayName = $('.repliedMessage_c19a55').attr('aria-label')?.split(' ')[0];
      }
      
      if (userName !== "null") {
        // readAndDeleteJsonFiles(`./bot/users`, userName, channelId);
        await saveLastUser({userName , displayName, messageId,channelId}, `./bot/users/${userId}.json`)};

      const username = await readJSON(`./bot/users/${userId}.json`)?.userName;

      // username = lastUser?.username;
      console.log({displayName, username, timestamp, content, repliedTo,repliedName, href });
      console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
      // Uncomment to publish to RabbitMQ
      produceTradeMessage(JSON.stringify({displayName, username, timestamp, content,repliedTo, repliedName, href }));
  }
});

  await page.waitForSelector('[class*="chatContent"]', { timeout: 10000 });
  await getMutations(page);
  console.log('✅ Mutation observer injected');

}

module.exports = { nodeOvserver };
