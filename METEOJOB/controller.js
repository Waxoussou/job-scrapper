// const { getPage } = require('../utils');

const testDateRgxp = (date) => {
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'décembre'];
    let [_, day, month, year] = date.split(' ')
    if (!year) year = new Date().getFullYear();
    month = months.indexOf(month) + 1;

    return `${month}/${day}/${year}`
}

module.exports = {
    url: "https://www.meteojob.com/jobsearch/offers?what=developpeur&where=Toulouse%20(31)",
    scrapMethodology: async (browser) => {

        const scrapAllJobs = async () => {
            const page = await browser.getPage();

            const jobs = await collectAllJobsFromPage(page);
            setPublicationDatesToFormatedDate(jobs);
            return jobs;
        }

        const collectAllJobsFromPage = async page => {
            try {
                const jobs = await page.$$eval("article.mj-offer", cards => cards.map(ctx => {
                    const title = ctx.querySelector('h2.title').innerText;
                    const link = ctx.querySelector('a.block-link').href
                    const details = [...ctx.querySelectorAll('div.info  li')].map(detail => detail.innerText);
                    const [contract, localisation] = details;
                    const date_of_publication = ctx.querySelector('.tags').innerText;
                    return { title, link, details: { contract, localisation, date_of_publication } }
                }));
                return jobs;
            } catch (error) {
                console.log("ERROR__[METEOJOB CTRL]_: ", error.message);
            }
        }

        const setPublicationDatesToFormatedDate = jobs => {
            jobs.map((job, index) => {
                jobs[index].details.date_of_publication = getFormatedPublicationDate(job)
            });
        }

        const getFormatedPublicationDate = (job) => {
            const { date_of_publication } = job.details;
            const publicationDate = testDateRgxp(date_of_publication);
            return publicationDate;
        }

        const jobs = await scrapAllJobs();

        return jobs
    }
}

