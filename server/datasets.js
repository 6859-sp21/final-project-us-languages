const fs = require('fs');
const path = require("path");
const csv = require('csv-parser');
const express = require('express')
const router = express.Router();

// Some CSV files may be generated with, or contain a leading Byte Order Mark. This may cause issues parsing headers and/or data from your file.
const stripBom = require('strip-bom-stream');

const stateLanguagesFile = path.resolve(__dirname, '../datasets/2019_state_languages_breakdown.csv');
const countyLanguagesFile = path.resolve(__dirname, '../datasets/2019_county_languages_breakdown_5year_est.txt');
const locationsFile = path.resolve(__dirname, '../datasets/location_coordinates.txt');
const bordersFile = path.resolve(__dirname, '../datasets/us.json');
const languagesWithLocFile = path.resolve(__dirname, '../datasets/languages_total.txt')
const languagesOnlyFile = path.resolve(__dirname, '../datasets/languages_only.txt')
const countriesFiles = path.resolve(__dirname, '../datasets/ne_110m_admin_0_countries.geo.json');

const countyLanguagesData = [];
const formattedCountyLanguagesData = {};
const stateLanguagesData = [];
const countriesData = fs.readFileSync(countriesFiles);
const bordersData = fs.readFileSync(bordersFile);
const locationsData = [];
const languagesWithLocData = [];
const languagesOnlyData = [];
let allLanguagesData = [];
const formattedLocationsData = {};

fs.createReadStream(countyLanguagesFile)  
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: '\t'}))
  .on('data', (row) => {
    countyLanguagesData.push(row)
    formattedCountyLanguagesData[parseInt(row.GEOID.slice(2))] = row;
  })
  .on('end', () => {
    console.log('Counties CSV file successfully processed', countyLanguagesData);
});

fs.createReadStream(stateLanguagesFile)
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: '\t'}))
  .on('data', (row) => {
    stateLanguagesData.push(row)
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

fs.createReadStream(languagesWithLocFile)
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: '\t'}))
  .on('data', (row) => {
    languagesWithLocData.push(row)
  })
  .on('end', () => {
    console.log('Languages CSV file successfully processed');
});

fs.createReadStream(languagesOnlyFile)
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: '\t'}))
  .on('data', (row) => {
    languagesOnlyData.push(row.Language)
  })
  .on('end', () => {
    allLanguagesData = languagesOnlyData;
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
 * GET /api/datasets/counties
 * 
 * Sends parsed csv data of languages spoken in the US by county
 */ 
  router.get('/counties', async(req, res) => { 
    res.send({countyData: formattedCountyLanguagesData});
 })


/**
 * GET /api/datasets/state-languages
 * 
 * Sends parsed csv data of languages spoken in the US
 */ 
  router.get('/state-languages', async(req, res) => { 
    res.send({stateLanguagesData: stateLanguagesData});
 })

 /**
 * GET /api/datasets/languages
 * 
 * Sends parsed csv data of languages spoken in the US
 */ 
 router.get('/languages', async(req, res) => { 
    res.send({langData: languagesWithLocData});
 })

  /**
 * GET /api/datasets/allLanguages
 * 
 * Sends parsed csv data of all languages in the US
 */ 
   router.get('/allLanguages', async(req, res) => { 
    res.send({allLanguagesData: allLanguagesData});
 })

 module.exports = router;
