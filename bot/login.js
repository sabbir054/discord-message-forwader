const puppeteer = require('puppeteer');
const fs = require('fs').promises ;
const path = require('path');
const SELECTOR = require('./selector');
const readline = require('readline');
require('dotenv').config();


// Function to capture user input in the terminal
async function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question(query, answer => {
        rl.close();
        resolve(answer);
    }));
}



async function proceedFromtheUserInput (page){
  try { 
    await page.screenshot({ path: 'error.png' });
    await page.goto("https://discord.com/login")
    const userInput = await askQuestion("Please complete the login and press: (Yes/No): ");
    if (userInput.toLowerCase() === 'yes' && !page.url().includes('/login')){
        console.log("Session saved successfully!");
    } else{
        console.log("Login not Faild. Exiting...");
        process.exit(1)
    }
  } catch (error) {
    console.error('Error during user input:', error);
  }
}


/**
 * Logs into Discord
 * @param {puppeteer.Page} page
 */
async function login(page) {
    //login manually
    console.log("Logging in...",page.url());
    if (page.url().includes('/login')) {
      console.log('Logging with credentials');
      //wait for required element
      try {
        await Promise.all([
            page.waitForSelector(SELECTOR.email,{ timeout: 60000 }),
            page.waitForSelector(SELECTOR.password),
            page.waitForSelector(SELECTOR.loginButton)
        ]);

        await page.type(SELECTOR.email, process.env.DISCORD_EMAIL, { delay: 50 });
        await page.type(SELECTOR.password, process.env.DISCORD_PASSWORD, { delay: 50 });
        await page.click(SELECTOR.loginButton);

        await page.waitForNavigation({ waitUntil: 'networkidle0' });
      } catch(error){
        console.log('Login error occurred:',error.message);}};


      const verify = await page.waitForSelector(SELECTOR.loginVerify, {timeout: 20*1000,}).catch(()=> null);
      // console.log(verify? "login completed" : "Something went wrong");
      // console.log(page)
      if (!verify){ 
        console.log("Login verification required");
        await proceedFromtheUserInput(page)}
      else{
        console.log("Login completed successfully");
        return true;
      } 

      


}

module.exports = login
