
async function scrapJobDetailsFromPage(browser, url, scrapWebsite) {
    const page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 720
    })

    page.on('load', () => console.log('Page loaded!'));

    await page.goto(url);

    const job_cards = await s()

    await page.close();

    return await job_cards
}

exports.scrapUntilDateReach = async function (browser, url, daysOld_limit, scrapStrategy) {
    let job_data_collector = [];
    let isJobDateLimit = false;
    while (!isJobDateLimit) {
        console.log({ page: url.searchParams.get('page') })
        let job_card = await scrapStrategy(browser, url);
        job_data_collector.push(...job_card);
        url.nextPage()
        const nb_job_limit_passed = job_card.filter(job => job.diff >= daysOld_limit).length
        console.log({ nb_job_limit_passed });
        if (nb_job_limit_passed > 0) isJobDateLimit = true
    }
    return job_data_collector.filter(job => job.diff < daysOld_limit);
}