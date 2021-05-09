const fs = require('fs');
const path = require("path");
const csv = require('csv-parser');
const express = require('express')
const router = express.Router();

// Some CSV files may be generated with, or contain a leading Byte Order Mark. This may cause issues parsing headers and/or data from your file.
const stripBom = require('strip-bom-stream');

// latitude/longitude of metro areas
const locationsFile = path.resolve(__dirname, '../datasets/location_coordinates.txt');
const locationsData = [];
const formattedLocationsData = {};

// borders of US states and counties, borders of countries
const bordersFile = path.resolve(__dirname, '../datasets/us.json');
const countriesFile = path.resolve(__dirname, '../datasets/ne_110m_admin_0_countries.geo.json');
const countriesData = fs.readFileSync(countriesFile);
const bordersData = fs.readFileSync(bordersFile);

// contains the languages spoken by metro area, state, and county
const languagesWithMetroFile = path.resolve(__dirname, '../datasets/languages_total_metro.txt');
const languagesWithStatesFile = path.resolve(__dirname, '../datasets/2019_state_languages_breakdown.csv');
const languagesWithCountiesFile = path.resolve(__dirname, '../datasets/2019_county_languages_breakdown_5year_est.txt');
const langMetroData = [];
const langStateData = [];
const formattedCountyLanguagesData = {};

// contains only the unique languages by metro, state
const languagesOnlyMetroFile = path.resolve(__dirname, '../datasets/languages_only_metro.csv');
const languagesOnlyStatesFile = path.resolve(__dirname, '../datasets/languages_only_states.csv');
const languagesOnlyMetroData = {};
const languagesOnlyStatesData = {};

// contains the global origins of languages and country codes for each country
const originsFile = path.resolve(__dirname, '../datasets/global_language_origins.csv');
const countryCodesFile = path.resolve(__dirname, '../datasets/country_codes.txt');
const originsData = {};
const countryCodesData = {};

fs.createReadStream(originsFile)  
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: ','}))
  .on('data', (row) => {
    const iso = row['iso_code'];
    const wals = row['wals_code'];
    if (iso.length !== 0) {
      if (iso in originsData) {
        // Some languages have regional variants. Only include the ones that are the default
        if (row['language'].split(' ').length === 1) { 
          originsData[iso] = row;
        }
      } else {
        originsData[iso] = row;
      }
    } else if (wals.length !== 0) {
      originsData[wals] = row;
    }
  })
  .on('end', () => {
    console.log('Origins CSV file successfully processed');
});

fs.createReadStream(countryCodesFile)  
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: '\t'}))
  .on('data', (row) => {
    const iso2 = row['ISO2'];
    const iso3 = row['ISO3'];
    if (iso2.length !== 0) {
      countryCodesData[iso2] = row;
    } else if (iso3.length !== 0) {
      countryCodesData[iso3] = row;
    }
  })
  .on('end', () => {
    console.log('Country codes CSV file successfully processed');
});

fs.createReadStream(languagesWithCountiesFile)  
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: '\t'}))
  .on('data', (row) => {
    // countyLanguagesData.push(row)
    formattedCountyLanguagesData[parseInt(row.GEOID.slice(2))] = row;
  })
  .on('end', () => {
    console.log('Counties CSV file successfully processed');
});

fs.createReadStream(languagesWithStatesFile)
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: ','}))
  .on('data', (row) => {
    langStateData.push(row)
  })
  .on('end', () => {
    console.log('State languages CSV file successfully processed');
});

fs.createReadStream(locationsFile)
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: '\t'}))
  .on('data', (row) => {
    locationsData.push(row)
  })
  .on('end', () => {
    locationsData
      .forEach(entry => { 
        formattedLocationsData[entry.Location] = {
          "coordinates": {
            "latitude": entry.Latitude,
            "longitude": entry.Longitude,
          }
        };
      });
    console.log('Locations CSV file successfully processed');
});

fs.createReadStream(languagesWithMetroFile)
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: '\t'}))
  .on('data', (row) => {
    langMetroData.push(row)
  })
  .on('end', () => {
    console.log('Languages CSV file successfully processed');
});

fs.createReadStream(languagesOnlyMetroFile)
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: ','}))
  .on('data', (row) => {
    const lang = row.Language;
    languagesOnlyMetroData[lang] = row;
  })
  .on('end', () => {
    // languagesOnlyMetroData.sort();
    console.log('Languages Only CSV file successfully processed');
});

fs.createReadStream(languagesOnlyStatesFile)
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: ','}))
  .on('data', (row) => {
    const lang = row.Language;
    languagesOnlyStatesData[lang] = row;
  })
  .on('end', () => {
    console.log('Languages Only CSV file successfully processed');
});

/**
 * GET /api/datasets/country-codes
 * 
 * Sends country codes JSON (keys are iso2 codes of each country)
 */ 
 router.get('/country-codes', async(req, res) => { 
  res.send({countryCodesData: countryCodesData});
})


/**
 * GET /api/datasets/global-origins
 * 
 * Sends global origins JSON of languages (keys are iso3 codes of each language)
 */ 
 router.get('/global-origins', async(req, res) => { 
  res.send({originsData: originsData});
})

/**
 * GET /api/datasets/countries
 * 
 * Sends parsed topojson data of countries
 */ 
router.get('/countries', async(req, res) => { 
   const countries = JSON.parse(countriesData);
   res.send({countriesData: countries});
})

/**
 * GET /api/datasets/borders
 * 
 * Sends parsed topojson data of the borders for states and counties
 */ 
router.get('/borders', async(req, res) => { 
   const borders = JSON.parse(bordersData);
   res.send({bordersData: borders});
})

/**
 * GET /api/datasets/locations
 * 
 * Sends parsed csv objects of US locations and their coordinates
 */ 
router.get('/locations', async(req, res) => { 
    res.send({locationsData: formattedLocationsData});
 })

/**
 * GET /api/datasets/counties-languages
 * 
 * Sends parsed csv data of languages spoken in the US by county
 */ 
  router.get('/counties-languages', async(req, res) => { 
    res.send({countyData: formattedCountyLanguagesData});
 })


/**
 * GET /api/datasets/state-languages
 * 
 * Sends parsed csv data of languages spoken in the US corresponding to state
 */ 
  router.get('/state-languages', async(req, res) => { 
    res.send({langStateData: langStateData});
 })

 /**
 * GET /api/datasets/metro-languages
 * 
 * Sends parsed csv data of languages spoken in the US corresponding to metro area
 */ 
 router.get('/metro-languages', async(req, res) => { 
    res.send({langMetroData: langMetroData});
 })

/**
 * GET /api/datasets/metro-languages-only
 * 
 * Sends parsed csv data of all unique languages in the US by metro area
 */ 
   router.get('/metro-languages-only', async(req, res) => { 
    res.send({languagesOnlyMetroData: languagesOnlyMetroData});
 })

   /**
 * GET /api/datasets/state-languages-only
 * 
 * Sends parsed csv data of all unique languages in the US by state
 */ 
    router.get('/state-languages-only', async(req, res) => { 
      res.send({languagesOnlyStatesData: languagesOnlyStatesData});
   })

 module.exports = router;
