// const { exec } = require('child_process');
const fs = require('fs');

const Scrapper = require('./Models/Scrapper');

const colors = require('./colorsUtils');
const apecController = require('./APEC/controller');
const meteojobScrapper = require('./METEOJOB/scrapper');
const lesjeudisController = require('./LES_JEUDIS/controller');

(async () => {
    const scrap = new Scrapper({
        // headless: false,
        params: { key_word: 'javascript ', location: "toulouse" },
        daysSincePublication__limit: 5
    });

    await scrap.setUp();

    const apec = await scrap.run(apecController);
    const meteojob = await scrap.run(meteojobScrapper)
    const lesjeudis = await scrap.run(lesjeudisController)

    await scrap.close();

    const data = [...apec, ...meteojob,...lesjeudis];
    // console.log(lesjeudis);

    /** WRITTING DATA INTO JSON FILE */
    fs.writeFile("client/data/jobsOffer.json", JSON.stringify({ data }), (err) => {
        if (err) throw err;
        console.log(colors.FgGreen + 'jobs saved successfully' + colors.Reset);
    });

})()

// (async function launchApp() {
//     exec('node server.js', (err) => { if (err) console.log(err) })

//     const options = { params: { key_word: 'react', location: 'Toulouse' }, daysOld_limit: 1 };

//     const apec = await apecScrap(options)
//     const meteojob = await meteoJobScrapper(options)
//     const job_card = [...apec, ...meteojob];

//     console.log(colors.BgRed + 'end of program', colors.Reset);
//     console.log({ job_card });
//     console.log(colors.BgCyan + "\n" + "prepare data writting on file : final_data.json \n" + colors.Reset);

//     /** WRITTING DATA INTO JSON FILE */
//     fs.writeFile("client/data/final_data.json", JSON.stringify({ job_card }), (err) => {
//         if (err) throw err;
//         console.log(colors.FgGreen + 'job cards saved successfully' + colors.Reset);
//     });

//     /** LAUNCH BROWSER AND LOAD DATA FROM JSON */
//     await exec(" open http://127.0.0.1:8125/", (err) => {
//         if (err) colorLog("FgRed", err.message);
//     })
// })()

