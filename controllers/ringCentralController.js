const RingCentral = require('@ringcentral/sdk').SDK;
require('dotenv').config();

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET
});

let accentConversionActive = false; 

async function ringCentralLogin() {
  await rc.login({
    username: process.env.RINGCENTRAL_USERNAME,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD
  });
  console.log('Logged into RingCentral');
}

function activateAccentConversion(req, res) {
  accentConversionActive = true;
  console.log('Accent conversion activated');
  res.status(200).json({ message: 'Accent conversion activated' });
}

function deactivateAccentConversion(req, res) {
  accentConversionActive = false;
  console.log('Accent conversion deactivated');
  res.status(200).json({ message: 'Accent conversion deactivated' });
}

function isAccentConversionActive() {
  return accentConversionActive;
}

module.exports = { 
  ringCentralLogin, 
  activateAccentConversion, 
  deactivateAccentConversion, 
  isAccentConversionActive 
};
