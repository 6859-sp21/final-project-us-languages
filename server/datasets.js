const fs = require('fs');
const path = require("path");
const csv = require('csv-parser');
const express = require('express')
const router = express.Router();

const locationsFile = path.resolve(__dirname, '../datasets/location_coordinates.csv');
const languagesFile = path.resolve(__dirname, '../datasets/languages_total.csv')
const countriesFiles = path.resolve(__dirname, '../datasets/ne_110m_admin_0_countries.geo.json');

const countriesData = fs.readFileSync(countriesFiles);
const locationsData = [];
const languagesData = [];

fs.createReadStream(locationsFile)
  .pipe(csv({separator: '\t'}))
  .on('data', (row) => {
    locationsData.push(row)
  })
  .on('end', () => {
    console.log('Locations CSV file successfully processed');
});

fs.createReadStream(languagesFile)
  .pipe(csv({separator: '\t'}))
  .on('data', (row) => {
    languagesData.push(row)
  })
  .on('end', () => {
    console.log('Languages CSV file successfully processed');
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
 * GET /api/datasets/locations
 * 
 * Sends parsed csv objects of US locations and their coordinates
 */ 
router.get('/locations', async(req, res) => { 
    res.send({locData: locationsData});
 })

 /**
 * GET /api/datasets/languages
 * 
 * Sends parsed csv data of languages spoken in the US
 */ 
 router.get('/languages', async(req, res) => { 
    res.send({langData: languagesData});
 })

 module.exports = router;
