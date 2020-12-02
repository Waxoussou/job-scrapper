const puppeteer = require('puppeteer');
const WebLink = require("./WebLink");
const Job = require("./Job");

class Scrapper {
    browserInstance;
    url;

    constructor(options) {
        this.options = options
    }

    setUp = async () => {
        console.log("Setting Up Scrapper");
        await this.#launchBrowserInstance(this.options.headless);
    }

    #launchBrowserInstance = async (headless) => {
        try {
            const browser = await puppeteer.launch({
                headless: typeof headless === "boolean" ? headless : true,
                ...{
                    // slowMo: 250,
                    devtools: true
                }
            });
            this.browserInstance = browser;
            this.browserInstance.methods = {
                getPage: this.getPage,
                getLinkFromNewTargetPage: this.getLinkFromNewTargetPage,
                goToPageAndCollect: this.goToPageAndCollect,
            };
        } catch (error) {
            console.log('ERR:[BROWSER INSTANCE] : could not be launched ', error.message);
        }
    }

    run = async (websiteObject) => {
        this.prepareUrl(websiteObject.url);
        const jobs = await this.handleScrapping(websiteObject);
        return jobs;
    }

    prepareUrl = (website) => {
        const url = new WebLink(website);
        url.getWebNameFromPathUrl();
        this.options.params && url.setUrlSearchParams(this.options.params);
        this.url = url;
    }

    handleScrapping = async (websiteObject) => {
        let jobs = [];
        let isJobDateLimit = false;

        while (!isJobDateLimit) {
            await this.openNewPage();

            const job_offers = await websiteObject.scrapMethodology(this.browserInstance.methods)


            job_offers.forEach(({ title, company, details, link }) => jobs.push(new Job(title, company, details, link)))

            this.url.nextPage();
            isJobDateLimit = this.isLimitReached(jobs)
        }
        return jobs.filter(job => job.days_since_publication < this.options.daysSincePublication__limit);
    }

    openNewPage = async () => {
        try {
            const page = await this.browserInstance.newPage();

            page.on('load', () => console.log(this.url.getWebNameFromPathUrl(), ' : Page loaded! '));

            const firstpage = await this.browserInstance.pages();
            await firstpage[0].close()
            await page.goto(this.url.href);
        } catch (error) {
            console.log("ERROR_[open new page on url]_: ", error.message);
        }
    }

    getPage = async () => {
        const page = (await this.browserInstance.pages())[0];
        return page;
    }

    getLinkFromNewTargetPage = async (page) => {
        // const page = await this.browserInstance.goto(link);
        const target = await this.waitForNewTargetPage(page);
        const url = await this.getNewOpenedTargetPageUrl(target);
        return url;
    }

    waitForNewTargetPage = async (page) => {
        const target = await this.browserInstance.waitForTarget(target => target.opener() === page.target());
        return target
    }

    getNewOpenedTargetPageUrl = async (new_target) => {
        try {
            const external_link = await new_target.url();
            const opened_page = await new_target.page();
            await opened_page.close();
            console.log({ external_link });
            return external_link;
        } catch (error) {
            console.log("something went wrong ", error.message);
        }
    }

    goToPageAndCollect = async (link, collectAction) => {
        const page = await this.getPage();
        await page.goto(link);
        const res = await collectAction(page, this.getLinkFromNewTargetPage);

        return res;
    }

    isLimitReached = (jobs) => {
        // SEND TRUE IF NO LIMIT DAY GIVEN in order to avoid infinite page scrapping 
        if (!this.options.daysSincePublication__limit || !jobs.length) return true;

        const nb_job_limit_passed = jobs.filter(job => {
            //must act like there is a date passed since 
            //we can't calcultate diff and want to avoid infinite scrapping
            if (!job.hasPublicationDate()) return true
            return job.days_since_publication >= this.options.daysSincePublication__limit
        }).length
        console.log({ nb_job_limit_passed });

        return nb_job_limit_passed > 0 ? true : false;
    }

    close = async () => {
        await this.browserInstance.close()
    }

    debug = async () => {
        await (await this.browserInstance.pages())[0].evaluate(() => { debugger; });
    }
}

module.exports = Scrapper;
