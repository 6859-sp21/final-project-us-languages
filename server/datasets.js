const fs = require('fs');
const path = require("path");
const csv = require('csv-parser');
const express = require('express')
const router = express.Router();

// Some CSV files may be generated with, or contain a leading Byte Order Mark. This may cause issues parsing headers and/or data from your file.
const stripBom = require('strip-bom-stream');

const locationsFile = path.resolve(__dirname, '../datasets/location_coordinates.txt');
const statesFile = path.resolve(__dirname, '../datasets/us.json');
const languagesFile = path.resolve(__dirname, '../datasets/languages_total.txt')
const countriesFiles = path.resolve(__dirname, '../datasets/ne_110m_admin_0_countries.geo.json');

const countriesData = fs.readFileSync(countriesFiles);
const statesData = fs.readFileSync(statesFile);
const locationsData = [];
const languagesData = [];
let allLanguagesData = [];
const formattedLocationsData = {};

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

fs.createReadStream(languagesFile)
  .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
  .pipe(csv({separator: '\t'}))
  .on('data', (row) => {
    languagesData.push(row)
  })
  .on('end', () => {
    allLanguagesData = Array.from(new Set(languagesData.map(entry => entry.Language)));
    console.log('Languages CSV file successfully processed', languagesData);
});

/**
 * GET /api/datasets/countries
 * 
 * Sends parsed topojson data of countries
 */ 
router.get('/countries', async(req, res) => { 
   const countries = JSON.parse(countriesData);
   res.send({mapData: countries});
})

/**
 * GET /api/datasets/states
 * 
 * Sends parsed topojson data of states
 */ 
router.get('/states', async(req, res) => { 
   const states = JSON.parse(statesData);
   res.send({statesData: states});
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
 * GET /api/datasets/languages
 * 
 * Sends parsed csv data of languages spoken in the US
 */ 
 router.get('/languages', async(req, res) => { 
    res.send({langData: languagesData});
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
