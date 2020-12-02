const puppeteer = require('puppeteer');
const { navigateFromOfferToCompanyWebSite, colorLog, scrapUntilDateReach } = require('./utils');
const WebLink = require('../Models/WebLink');

const colors = require('../colorsUtils');

module.exports = async function apecScrap(options) {
    const url = new WebLink('APEC');
    options && url.setUrlSearchParams(options.params);
    const MAX_DAYS_OLD_OF_PUBLICATION = options && options.daysOld_limit || 3;

    colorLog('BgGreen', url);

    const browser = await puppeteer.launch({
        // headless: false,
        args: ["--disable-setuid-sandbox"],
        'ignoreHTTPSErrors': true
    });

    /**
     * going though pages of job list while limit number of job days/old is not passed   
     */
    let job_card = await scrapUntilDateReach(browser, url, MAX_DAYS_OLD_OF_PUBLICATION)

    /**
     * Navigate though each job page until job_offer is reached and 
     * Scrapping returning URL  or Null if only int job of APEC
     */
    for (const job in job_card) {
        console.log(colors.FgYellow + "job n°" + (+job + 1) + " / " + job_card.length + " launching ___" + colors.Reset);
        const updated_job = await navigateFromOfferToCompanyWebSite(browser, job_card[job]);
        job_card[job] = updated_job;
    }

    /**
     * Filter null jobs (apec int jobs link) if setting ONLY_EXT_JOBS_OFFER is set to True
     */
    job_card = job_card.filter(job => job !== null);

    await browser.close();
    return job_card;
}


