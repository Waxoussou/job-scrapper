const apecScrap = require('./APEC/apecScrapper');
const { exec } = require('child_process');
const fs = require('fs');
const { colorLog } = require('./APEC/utils');
const colors = require('./colorsLog');

(async function launchApp() {
    exec('node server.js', (err) => { if (err) console.log(err) })

    const options = { params: { key_word: 'react', location: 'Toulouse' }, daysOld_limit: 5 };

    const job_card = await apecScrap(options)
    
    console.log(colors.BgRed + 'end of program', colors.Reset);
    console.log({ job_card });
    console.log(colors.BgCyan + "\n" + "prepare data writting on file : final_data.json \n" + colors.Reset);

    /** WRITTING DATA INTO JSON FILE */
    fs.writeFile("client/data/final_data.json", JSON.stringify({ job_card }), (err) => {
        if (err) throw err;
        console.log(colors.FgGreen + 'job cards saved successfully' + colors.Reset);
    });

    /** LAUNCH BROWSER AND LOAD DATA FROM JSON */
    await exec(" open http://127.0.0.1:8125/", (err) => {
        if (err) colorLog("FgRed", err.message);
    })
})()

