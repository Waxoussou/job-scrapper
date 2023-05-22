// const { exec } = require('child_process');
const fs = require('fs');

const Scrapper = require('./Models/Scrapper');

const colors = require('./colorsUtils');
const apecController = require('./APEC/controller');
const meteojobController = require('./METEOJOB/controller');
const lesjeudisController = require('./LES_JEUDIS/controller');
const chooseYourbossController = require('./CHOOSE_YOUR_BOSS/controller');
const monsterController = require('./MONSTER/controller');


(async () => {

    //     exec('node server.js', (err) => { if (err) console.log(err) })

    const BrowserOptions = {
        slowMo: 100,
        devtools: true,
        headless: false,
    }

    const scrap = new Scrapper({
        params: { key_word: 'javascript ', location: "toulouse" },
        daysSincePublication__limit: 5,
        // BrowserOptions
    });

    await scrap.setUp();

    const apec = await scrap.run(apecController);
    const meteojob = await scrap.run(meteojobController)
    const lesjeudis = await scrap.run(lesjeudisController)
    const chooseYourboss = await scrap.run(chooseYourbossController)
    const monster = await scrap.run(monsterController)

    await scrap.close();

    const data = [...apec, ...meteojob, ...lesjeudis, ...chooseYourboss, ...monster];
    // const data = [...lesjeudis, ...chooseYourboss, ...monster];
    // const data = [...meteojob];

    console.log(data);

    /** WRITTING DATA INTO JSON FILE */
    fs.writeFile("client/data/jobsOffer.json", JSON.stringify({ data }), (err) => {
        if (err) throw err;
        console.log(colors.FgGreen + 'jobs saved successfully' + colors.Reset);
    });

    //     /** LAUNCH BROWSER AND LOAD DATA FROM JSON */
    //     await exec(" open http://127.0.0.1:8125/", (err) => {
    //         if (err) colorLog("FgRed", err.message);
    //     })

})()

// (async function launchApp() {
//     exec('node server.js', (err) => { if (err) console.log(err) })

//     const options = { params: { key_word: 'react', location: 'Toulouse' }, daysOld_limit: 1 };

//     const apec = await apecScrap(options)
//     const meteojob = await meteojobController(options)
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

