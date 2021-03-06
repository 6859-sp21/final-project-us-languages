const fs = require('fs');
const path = require("path");
const csv = require('csv-parser');
const stringify = require('csv-stringify');

// Some CSV files may be generated with, or contain a leading Byte Order Mark. This may cause issues parsing headers and/or data from your file.
const stripBom = require('strip-bom-stream');

const { google } = require('googleapis')
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly'];
const { GoogleAuth } = require('google-auth-library');  

const express = require('express')
const router = express.Router();

// Enable reading of environment variables
require('dotenv').config();

const audiomapFile = path.resolve(__dirname, '../datasets/audio_mapping3.txt');
const audiomapData = {}

async function main() {
  let refreshDriveFiles = false;

  fs.createReadStream(audiomapFile, {encoding: 'utf8'})
    .pipe(stripBom()) // remove BOM from csv file (BOM causes parsing issue)
    .pipe(csv({separator: ','}))
    .on('data', (row) => {
      const lang = row.Language.toLowerCase();
      audiomapData[lang] = row;
      if (row.DriveID.length === 0) {
        refreshDriveFiles = true;
        console.log('Missing file for: ', lang);
      }
    })
    .on('end', async () => {
      console.log('Audio mapping CSV file successfully processed');
      const auth = await getAuthToken();
      if (refreshDriveFiles) {
        console.log('Refreshing audio mapping csv');
        await getSoundClips(auth)
      }
      // downloadAudio(auth, audiomapData['spanish'].DriveID)
    });
}

main() 

// Source snippet from https://stackoverflow.com/questions/62476413/google-drive-api-downloading-file-nodejs
// async function downloadAudio(auth, fileId, res) {
//   // const dest = fs.createWriteStream(tempAudioFile + '/temp.mp3');
//   const drive = google.drive({version: 'v3', auth});
//   drive.files.get({
//     fileId: fileId,
//     alt: 'media'
//   }, {responseType: 'stream'}, (err, {data}) => {
//     if (err) console.log(err);
//     // console.log('data', data);
//     data
//       .on("data", (data) => {
//         res.write(data);
//       })
//       .on("end", () => res.end())
//       .on("error", (err) => {
//         console.log(err);
//         res.sendStatus(404);
//         return process.exit();
//       })
//   })
// }

// Source snippet from https://hackernoon.com/how-to-use-google-sheets-api-with-nodejs-cz3v316f
// and https://developers.google.com/drive/api/v3/quickstart/nodejs
async function getAuthToken() {
    const auth = new GoogleAuth({
        scopes: SCOPES,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  const authToken = await auth.getClient();
  return authToken;
}

async function getFiles({auth}) {
    const drive = google.drive({version: 'v3', auth});
    drive.files.list({
      fields: 'nextPageToken, files(id,name)'
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const files = res.data.files;
      if (files.length !== 0) {
        files.map((file) => {
          try { 
            const language = file.name.split('_')[0].toLowerCase();
            if (language in audiomapData) {
              audiomapData[language].DriveID = file.id;
              audiomapData[language].Filename = file.name;
              // console.log(`${file.name} (${file.id})`);
            }
          } catch (error) {
            console.log(error);
          }
        }); 

        // write to local csv
        stringify(Object.values(audiomapData), {
          header: true
        }, function (err, output) { 
          fs.writeFile(audiomapFile, output, (err) => {
            if (err) console.log(err.message, err.stack);
          });
        })
      } else {
        console.log('No files found.');
      }
    });
    return true;
  }

async function getSoundClips(auth) {
  try {
    const response = await getFiles({
      auth
    })
    return response;
  } catch(error) {
    console.log(error.message, error.stack);
  }
}

/**
 * GET /api/audioclips/:language
 * 
 * Sends audio stream clip of selected language
 */ 
// router.get('/:language', async(req, res) => { 
//   res.set('content-type', 'audio/mp3');
//   res.set('accept-ranges', 'bytes');
//   const language = req.params.language;
//   const auth = await getAuthToken();
//   const fileId = audiomapData[language].DriveID;
//   await downloadAudio(auth, fileId, res);
// })

/**
 * GET /api/audioclips/metadata
 * 
 * Sends metadata of audio clip mappings
 */ 
 router.get('/metadata', async(req, res) => { 
  res.send({metadata: audiomapData});
})

module.exports = router;
