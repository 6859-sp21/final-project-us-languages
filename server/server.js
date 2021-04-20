// Import express framework
const express = require('express')

const fs = require('fs');
const path = require("path");

// Import middleware
const cookieParser = require('cookie-parser')
const compression = require('compression')
const helmet = require('helmet')
const cors = require('cors')

require('dotenv').config();
const PORT = process.env.PORT || 8080
const app = express(); 

// Implement middleware
// app.use(cors()) 
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Implement route for errors
app.use((err, req, res, next) => {
    console.error(err.stack) 
    res.status(500).send('Something broke!')
 })

const rawData = fs.readFileSync(path.resolve(__dirname, '../datasets/ne_110m_admin_0_countries.geo.json'));


 app.get('/api/countries', async(req, res) => { 
    const countries = JSON.parse(rawData);
    res.send({mapData: countries});
 })

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
