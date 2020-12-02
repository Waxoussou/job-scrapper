const config = require('./config');
const { getPage } = require('../utils');

module.exports = {
    url: config.URL,
    scrapMethodology: async (browser) => {
        const scrapAll = async () => {

            const page = await browser.getPage();

            const jobs = await evaluateJobs(page);



            return jobs
        }

        const evaluateJobs = async (page) => {
            try {
                await page.waitForSelector('#jobs-content');
                const jobs = await page.$$eval(".col>.job:not(.center)", jobsContent => {
                    return jobsContent.map(jobElement => {
                        const title = jobElement.querySelector('a.job-title').textContent;
                        const company = jobElement.querySelector('.snapshot-item > a').innerText;
                        const link = jobElement.querySelector('a.job-title').href;
                        console.log({ title, company, link })
                        return { title, link, company };
                    })
                })
                return jobs
            } catch (error) {
                console.log("ERROR : Oops, aucune offre ne correspond à la recherche ? ", error.message);
            }
        }

        const jobs = await scrapAll();

        return jobs
    }
}