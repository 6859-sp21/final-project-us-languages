const { google } = require('googleapis')
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly'];
const { GoogleAuth } = require('google-auth-library');  

const express = require('express')
const router = express.Router();

// Enable reading of environment variables
require('dotenv').config();

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
    const res = await drive.files.list({
      fields: 'nextPageToken, files(id,name)'
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const files = res.data.files;
      if (files.length) {
        console.log('Files:');
        files.map((file) => {
          console.log(`${file.name} (${file.id})`);
        });
      } else {
        console.log('No files found.');
      }
      return res;
    });
    return res;
  }

async function getSoundClips() {
  try {
    const auth = await getAuthToken();
    const response = await getFiles({
      auth
    })
    console.log('response: ', response);

    return response;
  } catch(error) {
    console.log(error.message, error.stack);
  }
}

const gDriveFiles = getSoundClips();
  
router.get('/', async(req, res) => { 
  res.send({clips: gDriveFiles});
})

module.exports = router;
