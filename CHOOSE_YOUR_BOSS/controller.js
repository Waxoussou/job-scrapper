module.exports = {
    url: "https://www.chooseyourboss.com/offres/emploi-{what}-{where}",
    async scrapMethodology(browser) {
        const scrappAll = async () => {
            const page = await browser.getPage();
            const jobs = await collectAllJobsFromPage(page);

            return jobs
        }
        const collectAllJobsFromPage = async (page) => {

            console.log('collecting job ');
            try {
                await page.waitForSelector('.container>.row>.col-md-8.col-xs-12');

                const jobs = await page.$$eval(".offer", jobCard => {
                    return jobCard.map(job => {
                        const title = job.querySelector('.offer__title>a').innerText;
                        const company = job.querySelector('.company_name>.company-link').innerText;
                        const [contract, salary, required_experience, localisation] = [...job.querySelectorAll('.profile>.others>.col-md-12>.list-inline>li')].map(li => li.innerText);
                        const link = job.querySelector('.offer__title>a').href;
                        return { title, company, details: { contract, salary, localisation }, link };
                    })
                })

                return jobs;
            } catch (error) {
                console.log("SCRAP JOBS ERROR : ", error.message);
            }
        }

        const jobs = await scrappAll();
        // return [{ title: null, company: null, details: {}, link: null }]
        return jobs;
    }
}