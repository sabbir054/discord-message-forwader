require('dotenv').config();



/**
 * Gets the ID of the last message element on the page.
 * 
 * @param {object} page - Puppeteer's Page object representing the browser tab.
 * @returns {Promise<string|null>} - The ID of the last message element, or null if none found.
 */




async function getLastMessageId(page) {
    // Select all message list items
    const messages = await page.evaluate(() =>{
        const messageElements = document.querySelectorAll('li.messageListItem__5126c');
        const lastMessageElm = messageElements[messageElements.length - 1];
        const lastMessageText = lastMessageElm.innerText;
        console.log("lastMessageText", lastMessageText);
        return lastMessageElm ? lastMessageElm.getAttribute("id"): null;
    });
    return messages;
}

/**
 * Gets the ID of the last message element on the page.
 * 
 * @param {object} page - Puppeteer's Page object representing the browser tab.
 * @param {String} channel - Discord channel.
 * @returns {Promise<string|null>} - The ID of the last message element.
 */






async function scrapeMessage(page,channel) {
	const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const channelUrl = `https://discord.com/channels/${process.env.DISCORD_SERVER_ID}/${channel}`;
    // console.log("channelUrl", channelUrl);
    await page.goto(channelUrl, { waitUntil: 'networkidle2' });
    await sleep(5000) // Wait for 5 seconds to ensure the page is fully loaded
    console.log("Page loaded successfully!");

    try {
        console.log("Channel ID:", channel);
        const channelName = await page.evaluate((channelId) => {

        const channelElement = document.querySelector(`a[data-list-item-id="channels___${channelId}"]`);
        return channelElement ? channelElement.innerText : null;
        }, channel);

        console.log("Channel Name:", channelName);
        const lastMessageId = await getLastMessageId(page);
        console.log("Last Message ID:", lastMessageId);
    }catch (error) {
        console.error("Error scraping message:", error);
    }
   
}   



module.exports = { scrapeMessage };

