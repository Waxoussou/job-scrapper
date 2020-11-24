const colors = require('../colorsLog');
const settings = require('./settings');

function isDate(string) {
    const regexp = /^((\d{2})[-.,\/]){2}(\d{2,4}$)/
    return regexp.test(string)
}

function reverseDate(string) {
    return string.split("/").reverse().join('-')
}

function getDayDiffFromDates(d1, d2) {
    const diff = d1.getTime() - d2.getTime()
    return (diff / 86400000).toFixed(2)
}

function isUrlInt(url) {
    const regexp = /to=int$/;
    const endWithtInt = regexp.test(url);
    return endWithtInt
}


module.exports = {
    colorLog: function (color, message) {
        const color_choice = colors[color];
        console.log(color_choice + message + colors.Reset)
    },

    prepareUrl: (website, search_params) => {
        const { URL: target_url, SEARCH_PARAMS: { key_word, sort_type, page, location }, CODE_LIEUX } = settings[website];
        const url = new URL(target_url);
        if (search_params) {
            url.searchParams.set(key_word, search_params.key_word || "javascript");
            url.searchParams.set(location, CODE_LIEUX[search_params.location || 'TOULOUSE']);
            url.searchParams.set(page, search_params.page || 0);
        }
        return url;
    },
    navigateNextPage: (url) => {
        let current_page = url.searchParams.get('page');
        current_page++;
        url.searchParams.set('page', current_page);
        return url
    },
    // navigateToPage: (
    // prepareUrl: (website, options = { search_word: 'react', location: 'TOULOUSE', nb_page: 0 }) => {
    //     const { URL_STRUCTURE: { url, key_word, sort_type, page, lieux }, CODE_LIEUX } = settings[website];
    //     const { search_word, location, nb_page } = options
    //     return `${url}${key_word}${search_word}${sort_type}${page}${nb_page}${lieux}${CODE_LIEUX[location]}`;
    // },

    clickAndCollect: async function (browser, url) {
        // TEST if link not from apec is available
        //if only url end with to=int mean no recruiter web site available
        const regexp = /to=int$/;
        const endWithtInt = regexp.test(url);
        console.log({ url, endWithtInt });
        if (!endWithtInt) {
            const page = await browser.newPage();
            await page.goto(url, { timeout: 0 });
            try {
                await page.$eval('.continue > button', el => el.click());
            } catch (error) {
                console.log("error popup=", error.message)
            }
            const new_target = await browser.waitForTarget(target => target.opener() === page.target());
            console.log(colors.FgBlue + "NEW TARGET" + colors.Reset, new_target.url());
            page.close();
            return new_target.url();
        }
    },
    navigateFromOfferToCompanyWebSite: async (browser, job) => {
        const pg = await browser.newPage();
        await pg.goto(job.link, { waitUntil: 'load', timeout: 0 });
        try {
            await pg.$eval('div.card-offer__text > a.small-link', link => link.click());
        } catch (error) {
            console.log(colors.BgYellow + colors.FgBlack + "WARNING [JOB IN JOB_CARD " + colors.Reset, error.message, "\n");
            const url = await pg.$eval('div.actions > a', link => link.href);
            const isInt = isUrlInt(url);
            if (isInt) {
                job.link = url;
                return settings.ONLY_EXT_JOBS_OFFER ? null : job;
            }
            await pg.$eval('div.actions > a', link => link.click());
        }
        try {
            await pg.waitForNavigation();
            await pg.$eval('.continue > button', el => el.click());
            const new_target = await browser.waitForTarget(target => target.opener() === pg.target());
            console.log(colors.FgBlue + "NEW TARGET" + colors.Reset, new_target.url());
            job.link = new_target.url();
        } catch (error) {
            console.log(colors.BgYellow + colors.FgGreen + "WARNING @[WAITING FOR TARGET] : " + colors.Reset + colors.FgRed + error.message + colors.Reset)
        }

        await pg.close();
        return job;
    },

    scrapJobDetailsFromPage: async (browser, url) => {
        const page = await browser.newPage();

        await page.setViewport({
            width: 1200,
            height: 720
        })

        page.on('load', () => console.log('Page loaded!'));

        await page.goto(url);

        const job_cards = await page.$$eval(' .container-result > div > a', card => card.map(context => {
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
        await page.close();

        return await job_cards
    }
} 
