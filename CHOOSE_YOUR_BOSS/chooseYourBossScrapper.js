const puppeteer = require('puppeteer');
const fs = require("fs");
const { exec } = require("child_process");
const colors = require('../colorsLog');

(async () => {
    const url = "https://www.chooseyourboss.com/offres/emploi-javascript-paris";

    const browser = await puppeteer.launch({
        headless: false,
        args: ["--disable-setuid-sandbox"],
        'ignoreHTTPSErrors': true
    });

    const page = await browser.newPage();

    await page.goto(url)

    await browser.close()


})()