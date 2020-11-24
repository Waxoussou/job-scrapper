const puppeteer = require('puppeteer');
const fs = require("fs");
const { exec } = require("child_process");
const { navigateFromOfferToCompanyWebSite, colorLog, scrapJobDetailsFromPage } = require('./utils');
const WebLink = require('../Models/WebLink');

const colors = require('../colorsLog');

(async () => {
    const apec_url = new WebLink('APEC').setUrlSearchParams({ key_word: "react", location: 'toulouse' });
    const MAX_DAYS_OLD_OF_PUBLICATION = 7;

    colorLog('BgGreen', apec_url);

    const browser = await puppeteer.launch({
        // headless: false,
        args: ["--disable-setuid-sandbox"],
        'ignoreHTTPSErrors': true
    });

    let job_card = await scrapJobDetailsFromPage(browser, apec_url);

    job_card = job_card.filter(job => job.diff <= MAX_DAYS_OLD_OF_PUBLICATION)

    for (const job in job_card) {
        console.log(colors.FgYellow + "job n°" + job + " launching ___" + colors.Reset);
        const updated_job = await navigateFromOfferToCompanyWebSite(browser, job_card[job]);
        job_card[job] = updated_job;
    }

    // filter null jobs (apec int jobs link) if setting ONLY_EXT_JOBS_OFFER is set to True
    job_card = job_card.filter(job => job !== null);

    console.log(colors.BgRed + 'end of program', colors.Reset);
    console.log({ job_card });
    console.log(colors.BgCyan + "\n" + "prepare data writting on file : final_data.json \n" + colors.Reset);

    fs.writeFile("final_data.json", JSON.stringify({ job_card }), (err) => {
        if (err) throw err;
        console.log(colors.FgGreen + 'job cards saved successfully' + colors.Reset);
    });

    await browser.close();
    await exec("open final_data.json", (err) => {
        if (err) colorLog("FgRed", err.message);
    })
})();

