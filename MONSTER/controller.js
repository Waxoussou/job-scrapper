const CONFIG = require('./config');

module.exports = {
    url: "https://www.monster.fr/emploi/recherche/?q=react&where=paris&cy=en&stpage=1&page=2",
    scrapMethodology: async (browser) => {

        const scrappAll = async () => {
            const page = await browser.getPage();
            const jobs = await scrapJobs(page);

            handleMonsterPublicationDateFormat(jobs);
            
            await browser.debug()

            return jobs;
        }

        const scrapJobs = async (page) => {
            console.log(page.url());
            try {

                await page.waitForSelector("#SearchResults");

                const jobs = await page.$$eval("div#SearchResults section.card-content:not(.apas-ad)", jobCard => jobCard.map(job => {
                    const title = job.querySelector('.title>a').innerText;
                    const company = job.querySelector('.company>.name').innerText;
                    const link = job.querySelector('.title>a').href;
                    const date_of_publication = job.querySelector('time').innerText;
                    return { title, company, link, details: { date_of_publication } }
                }))

                return jobs;

            } catch (error) {
                console.log("job not found : ", error.message);
            }
        }

        const handleMonsterPublicationDateFormat = (jobs) => {
            return jobs.map(job => { job.details.date_of_publication = getPublicationDateFormat(job.details.date_of_publication) });
        }

        const getPublicationDateFormat = (string) => {
            let date = new Date();
            if (!string.includes("aujourd'hui")) {
                const regexp = /^il y a \+?(\d{1,2}) jours?$/;
                const days = string.match(regexp)[1]

                date.setDate(date.getDate() - days);
            }
            return date;
        }



        const jobs = await scrappAll();

        return jobs
    },

}