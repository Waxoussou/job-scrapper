const colors = require('../colorsUtils');
const settings = require('./settings');

function isDate(string) {
    const regexp = /^((\d{2})[-.,\/]){2}(\d{2,4}$)/
    return regexp.test(string)
}

function reverseDate(string) {
    return string.split("/").reverse().join('-')
}

function getDayDiffFromDates(date) {
    if (!isDate(date)) return 'not a valid date'
    const now = new Date().getTime();
    const d = new Date(reverseDate(date)).getTime()
    const diff = now - d
    return (diff / 86400000).toFixed(2)
}

function isUrlInt(url) {
    const regexp = /to=int$/;
    const endWithtInt = regexp.test(url);
    return endWithtInt
}
async function scrapJobDetailsFromPage(browser, url) {
    const page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 720
    })

    page.on('load', () => console.log('Page loaded!'));

    await page.goto(url);

    const job_cards = await page.$$eval(' .container-result > div > a', card => card.map((context, index) => {
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
        // const diff = getDayDiffFromDates(date_of_publication);

        return { job_title, company, details: { salary, contract, localisation, date_of_publication }, diff, link }
    }))
    await page.close();

    return await job_cards
}


module.exports = {
    colorLog: function (color, message) {
        const color_choice = colors[color];
        console.log(color_choice + message + colors.Reset)
    },
    navigateFromOfferToCompanyWebSite: async (browser, job) => {
        const pg = await browser.newPage();

        await pg.goto(job.link, { waitUntil: 'load', timeout: 0 });
        try {
            pg.waitForSelector('div.actions > a');
            await pg.$eval('div.card-offer__text > a.small-link', link => link.click());
        } catch (error) {
            console.log(colors.BgYellow + colors.FgBlack + "WARNING [JOB IN JOB_CARD " + colors.Reset, error.message, "\n");
            console.log(colors.FgMagenta + pg.url() + colors.Reset);
            try {
                const url = await pg.$eval('div.actions > a', link => link.href);
                const isInt = isUrlInt(url);
                if (isInt) {
                    job.link = url
                    console.log({ isInt, link });
                    return settings.ONLY_EXT_JOBS_OFFER ? null : url;
                }
                // await pg.$eval('div.actions > a', link => link.click());
                await pg.goto(url);
            } catch (error) {
                console.log("ERROR [alternative link not found]: ", error.message)
                console.log(colors.FgMagenta + pg.url() + colors.Reset);
                const url = await pg.url();
                job.link = url;
                return job
            }
        }
        try {
            await pg.waitForSelector('.continue > button');
            console.log('SECOND TRY : ', pg.url());
            await pg.$eval('.continue > button', el => el.click());
            const new_target = await this.browser.waitForTarget(target => target.opener() === pg.target());
            console.log(colors.FgBlue + "NEW TARGET" + colors.Reset, new_target.url());
            job.link = await new_target.url();
            new_target.close()
            return job
        } catch (error) {
            console.log(colors.BgYellow + colors.FgGreen + "WARNING @[WAITING FOR TARGET] : " + colors.Reset + colors.FgRed + error.message + colors.Reset)
            job.link = await pg.url()
        }
        console.log('LINK BEFORE RETURN FROM strategy', { link: job.link })
        pg.close();
        return job;
    },
    scrapUntilDateReach: async function (browser, url, daysOld_limit) {
        let job_data_collector = [];
        let isJobDateLimit = false;
        while (!isJobDateLimit) {
            console.log({ page: url.searchParams.get('page') })
            let job_card = await scrapJobDetailsFromPage(browser, url);
            job_data_collector.push(...job_card);
            url.nextPage()
            const nb_job_limit_passed = job_card.filter(job => job.diff >= daysOld_limit).length
            console.log({ nb_job_limit_passed });
            if (nb_job_limit_passed > 0) isJobDateLimit = true
        }
        return job_data_collector.filter(job => job.diff < daysOld_limit);
    },
} 
