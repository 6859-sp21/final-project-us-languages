const fs = require('fs');
const path = require("path");
const csv = require('csv-parser');
const stringify = require('csv-stringify');

// Some CSV files may be generated with, or contain a leading Byte Order Mark. This may cause issues parsing headers and/or data from your file.
const stripBom = require('strip-bom-stream');

// latitude/longitude of metro areas
const originsFile = path.resolve(__dirname, '../datasets/global_language_origins.csv');
const metroFile = path.resolve(__dirname, '../datasets/languages_only_metro.csv');
const stateFile = path.resolve(__dirname, '../datasets/languages_only_states.csv');

const originsData = {};
const languagesMetro = {};
const languagesStates = {};



fs.createReadStream(metroFile)
    .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
    .pipe(csv({separator: ','}))
    .on('data', (row) => {
        const lang = row.Language.toLowerCase(); 
        languagesMetro[lang] = row;
    })
    .on('end', async () => {
        console.log('Processing metro finished');
    });

fs.createReadStream(stateFile)
    .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
    .pipe(csv({separator: ','}))
    .on('data', (row) => {
        const lang = row.Language.toLowerCase();
        languagesStates[lang] = row;
    })
    .on('end', async () => {
        console.log('Processing states finished');
    });

fs.createReadStream(originsFile)
    .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
    .pipe(csv({separator: ','}))
    .on('data', (row) => {
        const lang = row.language.toLowerCase();
        originsData[lang] = row;
        if (lang in languagesMetro) {
            languagesMetro[lang].ISO = row['iso_code'];
        }
        if (lang in languagesStates) {
            languagesStates[lang].ISO = row['iso_code'];
        }
    })
    .on('end', async () => {
        console.log('Processing origins finished', languagesMetro, languagesStates);
        writeToFile(languagesStates, stateFile);
        writeToFile(languagesMetro, metroFile);
    });

function writeToFile(data, path) {
    // write to local csv
    stringify(Object.values(data), {
        header: true
        }, function (err, output) {
        fs.writeFile(path, output, (err) => {
            if (err) console.log(err.message, err.stack);
        });
        })

}
