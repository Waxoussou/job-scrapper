const puppeteer = require('puppeteer');
const WebLink = require('./WebLink');
// const apecScrapper = require('../APEC/apecScrapper');
// const meteoJobScrapper = require('../METEOJOB/scrapper');
const colors = require('../colorsUtils');
const { navigateFromOfferToCompanyWebSite } = require('../APEC/utils');
async function setup(website) {
    this.browser = await puppeteer.launch({ headless: typeof this.options.headless === "boolean" ? this.options.headless : true });
    this.url = new WebLink(website);

}

async function scrapJobsPage(evaluateJobs) {
    await this.createNewPage();
    try {
        const job_cards = await evaluateJobs(this.page);

        return await job_cards
    } catch (e) {
        console.log(e)
    }
    // await this.page.close();
    return job_cards;
}

async function createNewPage() {
    try {
        const page = await this.browser.newPage();
        page.on('load', () => console.log('Page loaded!'));

        const firstpage = await this.browser.pages();
        await firstpage[0].close()
        this.options.params && this.url.setUrlSearchParams(this.options.params)

        await page.goto(this.url);

        this.page = page;
    } catch (error) {
        console.log(error);
    }
}

async function close() {
    if (this.browser !== null) {
        await this.browser.close()
    }
}

async function navigateThroughPages(scrapStrategy) {
    const { daysOld_limit } = this.options;
    let job_data_collector = [];
    let isJobDateLimit = false;
    while (!isJobDateLimit) {
        console.log({ page: this.url.searchParams.get('page') })

        let job_card = await this.scrapJobsPage(scrapStrategy);

        job_data_collector.push(...job_card);
        this.url.nextPage()
        const nb_job_limit_passed = job_card.filter(job => job.diff >= daysOld_limit).length
        console.log({ nb_job_limit_passed });
        if (nb_job_limit_passed > 0) isJobDateLimit = true
    }

    for (job in job_data_collector) {
        const link = new URL(job_data_collector[job].link);
        const curr_link = new URL(this.page.url());
        console.log(link.hostname, curr_link.hostname);
        if (link.hostname === curr_link.hostname) {
            console.log(colors.FgYellow + "job n°" + (+job + 1) + " / " + job_data_collector.length + " launching ___" + colors.Reset);
            const updated_job = await this.updateLinkOffer(job_data_collector[job], navigateFromOfferToCompanyWebSite);
            job_data_collector[job] = updated_job;
        }

    };

    await this.page.close()
    return job_data_collector.filter(job => job.diff < daysOld_limit);

}

async function updateLinkOffer(job, collectLinkStrategy) {
    const link = await collectLinkStrategy(this.browser, job);
    console.log({ link })
    return link
    try {
        await page.$eval('div.card-offer__text > a.small-link', link => link.click());
    } catch (error) {
        console.log(colors.BgYellow + colors.FgBlack + "WARNING [JOB IN JOB_CARD " + colors.Reset, error.message, "\n");
        console.log(colors.FgMagenta + page.url() + colors.Reset);
        try {
            const url = await page.$eval('div.actions > a', link => link.href);
            // const isInt = isUrlInt(url);
            // if (isInt) {
            //     job.link = url;
            //     return settings.ONLY_EXT_JOBS_OFFER ? null : job;
            // }
            await page.$eval('div.actions > a', link => link.click());
        } catch (error) {
            console.log("ERROR [alternative link not found]: ", error.message)
            console.log(colors.FgMagenta + page.url() + colors.Reset);
            job.link = page.url();
        }
    }
    try {
        await page.waitForNavigation();
        await page.$eval('.continue > button', el => el.click());
        const new_target = await browser.waitForTarget(target => target.opener() === page.target());
        console.log(colors.FgBlue + "NEW TARGET" + colors.Reset, new_target.url());
        job.link = new_target.url();
    } catch (error) {
        console.log(colors.BgYellow + colors.FgGreen + "WARNING @[WAITING FOR TARGET] : " + colors.Reset + colors.FgRed + error.message + colors.Reset)
    }

    return job;

}

function Scrappy(options = {}) {
    let browser;
    let url;
    let page;

    return {
        options,
        browser,
        page,
        url,
        setup,
        createNewPage,
        scrapJobsPage,
        close,
        navigateThroughPages,
        navigateFromOfferToCompanyWebSite,
        updateLinkOffer
    }
}



(async () => {
    const scrapp = Scrappy({ headless: false, daysOld_limit: 1, params: { key_word: 'node', location: 'toulouse' } });
    await scrapp.setup('APEC');

    const res = await scrapp.navigateThroughPages(apecScrap)
    console.log(res)
    scrapp.close()
})()



async function apecScrap(page) {

    const job_cards = await page.$$eval(' .container-result > div > a', card => card.map((context) => {
        const job_title = context.querySelector('.card-title').textContent;
        const company = context.querySelector('.card-offer__company').textContent;
        const details = [...[...context.querySelectorAll(".details-offer")].map(details => [...details.childNodes]
            .map(li => li.textContent))]
            .flatMap(item => item)
        const [salary, contract, localisation, date_of_publication] = details;
        const link = context.href;

        const now = new Date().getTime() / 86400000;
        const offer_date = new Date(date_of_publication.split('/').reverse().join('/')).getTime() / 86400000;
        const diff = (now - offer_date).toFixed(2)

        return { job_title, company, details: { salary, contract, localisation, date_of_publication }, diff, link }
    }))
    return job_cards
}


// async function setScrapper(website, options) {

//     const browser = await puppeteer.launch({});
//     const url = new WebLink(website);

//     async function navigateThroughPages(scrapStrategy) {
//         const { daysOld_limit } = this.options;
//         let job_data_collector = [];
//         let isJobDateLimit = false;
//         while (!isJobDateLimit) {
//             console.log({ page: this.url.searchParams.get('page') })

//             let job_card = await this.scrapJobsPage(scrapStrategy);

//             job_data_collector.push(...job_card);
//             url.nextPage()
//             const nb_job_limit_passed = job_card.filter(job => job.diff >= daysOld_limit).length
//             console.log({ nb_job_limit_passed });
//             if (nb_job_limit_passed > 0) isJobDateLimit = true
//         }
//         return job_data_collector.filter(job => job.diff < daysOld_limit);

//     }

//     const scrapJobsPage = async (evaluateJobs) => {
//         console.log(this.browser);
//         const page = await this.browser.newPage();
//         page.on('load', () => console.log('Page loaded!'));

//         await page.goto(this.url);

//         const job_cards = await evaluateJobs(page)

//         await page.close();

//         return await job_cards
//     }

//     return {
//         browser,
//         url,
//         scrapJobsPage,
//         navigateThroughPages
//     }
// }


// class Scrapper {
//     //     static strategy = {
//     //         APEC: apecScrapper,
//     //         METEOJOB: meteoJobScrapper,

//     //     }
//     fbrowser = null;

//     constructor(website, options) {
//         this.website = website;
//         this.params = options.params;
//         this.search_limit = options.daysOld_limit || 1;
//         // this.browser = this.start();
//     }

//     async start() {
//         try {
//             this.browser = await puppeteer.launch({
//                 headless: false,
//                 timeout: 10000,

//             })
//             await Scrapper.browser.newPage()
//         } catch (error) {
//             console.log("start: ", error.message)
//         }
//     }
//     async close() {
//         if (Scrapper.browser !== null) {

//             console.log(Scrapper.browser);
//             await Scrapper.browser.close()
//         }
//     }
//     async createPage() {
//         if (!this.browser) {
//             throw new Error('Browser not set.');
//         }
//         try {
//             const page = await Scrapper.browser.newPage();


//             const firstPage = (await Scrapper.browser.pages())[0];
//             await firstPage.close();

//             return page;
//         } catch (error) {
//             console.log(error.messagef)
//         }


//         // const page = await this.browser.newPage();
//         // await page.goto(url)
//         return page;
//     }

//     async scrapJobList() {
//         const url = new WebLink(this.website)
//         this.options && url.setUrlSearchParams(this.params);

//         console.log(url);

//         const browser = await puppeteer.launch({
//             // headless: false,
//             args: ["--disable-setuid-sandbox"],
//             'ignoreHTTPSErrors': true
//         });

//         const jobs = await Scrapper.strategy[this.website](this.search_limit)

//         browser.close()

//         return jobs

// }

// const apec = new Scrapper("APEC", {});
// console.log(apec)
// apec.start();
// console.log(apec)
// apec.createPage();
// apec.close();

// apec.createPage();
// }