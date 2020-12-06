const isInternalLink = (url) => {
    const regexp = /to=int$/;
    const endWithtInt = regexp.test(url);
    return endWithtInt
}


module.exports = {
    url: 'https://www.apec.fr/candidat/recherche-emploi.html/emploi',
    scrapMethodology: async (browser) => {
        const scrapAll = async () => {
            const page = await browser.getPage();
            const jobs = await collectAllJobsFromPage(page);
            handleApecPublicationDateFormat(jobs);
            for (job in jobs) {
                const { link } = jobs[job];
                jobs[job].link = await browser.goToPageAndCollect(link, getExternalLink);
            }

            return jobs
        }

        const collectAllJobsFromPage = async (page) => {
            try {
                await page.waitForSelector('.container-result');
                const jobs = await page.$$eval('.container-result > div > a', (jobs) => jobs.map(job => {
                    const title = job.querySelector('.card-title').textContent;
                    const company = job.querySelector('.card-offer__company').textContent;
                    const details = [...[...job.querySelectorAll(".details-offer")].map(details => [...details.childNodes]
                        .map(li => li.textContent))]
                        .flatMap(item => item)
                    const [salary, contract, localisation, date_of_publication] = details;
                    const link = job.href
                    return {
                        title, company, details: {
                            salary, contract, localisation, date_of_publication
                        }, link
                    };
                }))
                return jobs;
            } catch (error) {
                console.log("ERROR__ can't collect jobs from page __ : ", error.message)
            }
        }

        const handleApecPublicationDateFormat = (jobs) => {
            jobs.map(job => {
                const [day, month, year] = job.details.date_of_publication.split('/');
                job.details.date_of_publication = `${month}/${day}/${year}`;
                return jobs;
            })
        }

        const getExternalLink = async (page, handleNewTargetPage) => {
            try {
                const next_link = await findLinkOnJobPage(page);
                // console.log({ next_link });
                if (isInternalLink(next_link)) {
                    return next_link
                } else {
                    await page.goto(next_link)
                    await clickOnExternalLink(page);
                    const external_link = await handleNewTargetPage(page);
                    return external_link;
                }
            } catch (error) {
                console.log("ERROR [EXT LINK NOT FOUND]: ", error.message);
            }
        }

        const findLinkOnJobPage = async (page) => {
            try {
                await page.waitForSelector('div.card-offer__text');
                const small_link = await page.$eval("div.Card-offer__text > a.small-link", link => link.href);
                // await lookForExternalLink(page);
                return small_link;
            } catch (error) {
                const next_link = await page.$eval('.actions > a', link => link.href);
                return next_link;
            }
        }

        const clickOnExternalLink = async (page) => {
            console.log('START LOOKING FOR EXTERNAL LINK : ', await page.url())
            try {
                await page.waitForSelector('.continue');
                await page.$eval('.continue > button', btn => btn.click());
                return await page.url();
            } catch (error) {
                console.log('external link not reached :', error.message);
            }
        }

        const jobs = await scrapAll();

        return jobs
    },
}

