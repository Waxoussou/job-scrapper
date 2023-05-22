const puppeteer = require('puppeteer');
const WebLink = require("./WebLink");
const Job = require("./Job");

const colors = require("../colorsUtils");

class Scrapper {
    browserInstance;
    url;

    constructor(options) {
        this.options = options
    }

    setUp = async () => {
        console.log("Setting Up Scrapper");
        await this.#launchBrowserInstance();
    }

    #launchBrowserInstance = async () => {
        try {
            const browser = await puppeteer.launch({
                ...this.options.BrowserOptions,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                ignoreHTTPSErrors: true,
            });

            this.browserInstance = browser;
            this.browserInstance.methods = {
                getPage: this.getPage,
                getLinkFromNewTargetPage: this.getLinkFromNewTargetPage,
                goToPageAndCollect: this.goToPageAndCollect,
                debug: this.debug,
            };
        } catch (error) {
            console.log('ERR:[BROWSER INSTANCE] : could not be launched ', error.message);
        }
    }

    run = async (websiteObject) => {
        this.prepareUrl(websiteObject.url);
        console.log("scraping website = ", this.url.getWebNameFromPathUrl());
        const jobs = await this.handleScrapping(websiteObject);
        if (jobs.length === 0) return [this.errorMessage()];

        return jobs;
    }

    prepareUrl = (website) => {
        const url = new WebLink(website);
        this.options.params && url.setUrlSearchParams(this.options.params);
        this.url = url;
    }

    errorMessage = () => {
        return {
            website: this.url.getWebNameFromPathUrl(),
            status: "ERROR",
            message: "no jobs found, try to look for older offers"
        };
    }

    handleScrapping = async (websiteObject, jobs = []) => {
        await this.openNewPage();

        const job_offers = await websiteObject.scrapMethodology(this.browserInstance.methods)

        if (job_offers) {
            job_offers.forEach(({ title, company, details, link }) => {
                const source = this.url.getWebNameFromPathUrl();
                jobs.push(new Job(title, company, details, link, source))
            })

        }

        if (this.isLimitReached(jobs)) return jobs.filter(job => job.days_since_publication < this.options.daysSincePublication__limit);;

        this.url.nextPage();
        return handleScrapping(websiteObject, jobs)
    }


    openNewPage = async () => {
        try {
            const page = await this.browserInstance.newPage();

            page.on('load', () => console.log(this.url.getWebNameFromPathUrl(), ' : Page loaded! '));

            const firstpage = await this.getPage();
            await firstpage.close()

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
        const target = await this.waitForNewTargetPage(page);
        const url = await this.getNewOpenedTargetPageUrl(target);
        return url;
    }

    waitForNewTargetPage = async (page) => {
        const target = await this.browserInstance.waitForTarget(target => target.opener() === page.target());
        return target;
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

        console.log(colors.FgCyan + "start collecting details from : " + colors.Reset, link,);

        const res = await collectAction(page, this.getLinkFromNewTargetPage);

        return res;
    }

    isLimitReached = (jobs) => {
        // SEND TRUE IF NO LIMIT DAY GIVEN in order to avoid infinite page scrapping 
        if (!this.options.daysSincePublication__limit || !jobs.length) return true;

        const nb_job_limit_passed = jobs.filter(job => {
            //must act like there is a date passed since 
            //we can't calcultate diff and want to avoid infinite scrapping
            if (!job.hasPublicationDate()) return true;
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
