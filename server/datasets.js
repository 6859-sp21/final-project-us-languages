const fs = require('fs');
const path = require("path");
const csv = require('csv-parser');
const express = require('express')
const router = express.Router();

// Some CSV files may be generated with, or contain a leading Byte Order Mark. This may cause issues parsing headers and/or data from your file.
const stripBom = require('strip-bom-stream');

// latitude/longitude of metro areas
const locationsFile = path.resolve(__dirname, '../datasets/location_coordinates.txt');

// borders of US states and counties, borders of countries
const bordersFile = path.resolve(__dirname, '../datasets/us.json');
const countriesFiles = path.resolve(__dirname, '../datasets/ne_110m_admin_0_countries.geo.json');

// contains the languages spoken by metro area, state, and county
const languagesWithMetroFile = path.resolve(__dirname, '../datasets/languages_total_metro.txt')
const languagesWithStatesFile = path.resolve(__dirname, '../datasets/2019_state_languages_breakdown.csv');
const languagesWithCountiesFile = path.resolve(__dirname, '../datasets/2019_county_languages_breakdown_5year_est.txt');

// contains only the unique languages by metro, state
const languagesOnlyMetroFile = path.resolve(__dirname, '../datasets/languages_only_metro.txt')
const languagesOnlyStatesFile = path.resolve(__dirname, '../datasets/languages_only_states.csv')

// const countyLanguagesData = [];
const formattedCountyLanguagesData = {};
const langStateData = [];
const countriesData = fs.readFileSync(countriesFiles);
const bordersData = fs.readFileSync(bordersFile);
const locationsData = [];
const langMetroData = [];
const languagesOnlyMetroData = [];
const languagesOnlyStatesData = [];
const formattedLocationsData = {};

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
  .pipe(csv({separator: '\t'}))
  .on('data', (row) => {
    languagesOnlyMetroData.push(row.Language)
  })
  .on('end', () => {
    languagesOnlyMetroData.sort();
    console.log('Languages Only CSV file successfully processed');
});

fs.createReadStream(languagesOnlyStatesFile)
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: ','}))
  .on('data', (row) => {
    languagesOnlyStatesData.push(row.Language)
  })
  .on('end', () => {
    console.log('Languages Only CSV file successfully processed');
});

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
