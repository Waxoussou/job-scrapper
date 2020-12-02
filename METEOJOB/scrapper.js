const { getPage } = require('../utils');

const testDateRgxp = (date) => {
    const months = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];
    let [_, day, month, year] = date.split(' ')
    if (!year) year = new Date().getFullYear();
    month = months.indexOf(month) + 1;
    return `${day}/${month}/${year}`
}

module.exports = {
    url: "https://www.meteojob.com/jobsearch/offers?what=developpeur&where=Toulouse%20(31)",
    scrapMethodology: async (browser) => {
        const scrapAllJobs = async () => {
            const page = await browser.getPage();

            try {
                const job_list_container = await page.$$eval("article.mj-offer", cards => cards.map(ctx => {
                    const title = ctx.querySelector('h2.title').innerText;
                    const link = ctx.querySelector('a.block-link').href
                    const details = [...ctx.querySelectorAll('div.info  li')].map(detail => detail.innerText);
                    const [contract, localisation] = details;
                    const date_of_publication = ctx.querySelector('.tags').innerText;
                    return { title, link, details: { contract, localisation, date_of_publication } }
                }));
                job_list_container.map((job, index) => job_list_container[index].details.date_of_publication = testDateRgxp(job.details.date_of_publication))
                return job_list_container;
            } catch (error) {
                console.log("ERROR__[METEOJOB CTRL]_: ", error.message);
            }
        }

        const jobs = await scrapAllJobs();

        return jobs
    }
}

// module.exports = meteojobScrapper; 
