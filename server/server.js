// Import express framework
const express = require('express')
const path = require("path");
const datasets = require('./datasets.js')
const audioclips = require('./audioclips.js')

// Import middleware
const cookieParser = require('cookie-parser')
const compression = require('compression')
const helmet = require('helmet')
// const cors = require('cors')

// Enable reading of environment variables
require('dotenv').config();

const PORT = process.env.PORT || 8080
const app = express(); 

// Implement middleware
// I think if you set proxies on the frontend and also use cors on the backend, it won't work
// app.use(cors()) 
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Deployment: serve build of React files
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

// Implement route for errors
app.use((err, req, res, next) => {
    console.error(err.stack) 
    res.status(500).send('Something broke!')
 })

app.use('/api/datasets', datasets);
app.use('/api/audioclips', audioclips);

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
