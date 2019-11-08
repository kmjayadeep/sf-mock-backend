const express = require('express');
const fs = require('fs');
const https = require('https');
const app = express();
const moment = require('moment');
const morgan = require('morgan');
const bodyParser = require('body-parser');

app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/', function (_, res) {
  res.send('hello world')
})

app.get('/([\$])metadata', (req, res) => {
  res.type('application/xml');
  res.send(fs.readFileSync('metadata.xml'))
})

app.post('/lms/oauth-api/rest/v1/token', (_, res) => {
  res.json({
    access_token: "token-sample",
    expires_in: 1800,
    token_type: "Bearer"
  });
})

const empty = {
  "@odata.context": "$metadata#Items",
  "@odata.metadataEtag": "",
  "@odata.count": 1,
  "value": []
};

let userData, itemData, offeringsData, participantsData;

const resetData = () => {
  userData = JSON.parse(fs.readFileSync('User.json'));
  itemData = JSON.parse(fs.readFileSync('Items.json'));
  offeringsData = JSON.parse(fs.readFileSync('Offerings.json'));
  participantsData = JSON.parse(fs.readFileSync('OfferingParticipants.json'));
}

resetData();

app.get('/User*', (req, res) => {
  res.json(userData);
})

app.get('/lms/odatav4/public/admin/dataextraction-service/v1/Items', (req, res) => {
  res.setHeader('date', moment().format('ddd, DD MMM YYYY HH:mm:ss ') + 'GMT')
  // return res.json(empty);
  const filter = req.query['$filter'] || '';
  if (req.query['$skip'] == 0 && !filter.includes('FT_')) {
    res.json(itemData);
  } else {
    res.json(empty);
  }
})

app.get('/lms/odatav4/public/admin/dataextraction-service/v1/ScheduledOfferings', (req, res) => {
  res.setHeader('date', moment().format('ddd, DD MMM YYYY HH:mm:ss ') + 'GMT')
  // return res.json(empty);
  const filter = req.query['$filter'] || '';
  if (req.query['$skip'] == 0 && !filter.includes('FT_')) {
    res.json(offeringsData);
  } else {
    res.json(empty);
  }
})

app.get('/lms/odatav4/public/admin/dataextraction-service/v1/ScheduledOfferingParticipants', (req, res) => {
  const filter = req.query['$filter'] || '';
  res.setHeader('date', moment().format('ddd, DD MMM YYYY HH:mm:ss ') + 'GMT')
  // return res.json(empty);
  if (req.query['$skip'] == 0 && !filter.includes('FT_')) {
    res.json(participantsData);
  } else {
    res.json(empty);
  }
})

app.get('/data/:resource', (req, res)=>{
  switch(req.params.resource){
    case 'User':
      return res.json(userData);
    case 'Items':
      return res.json(itemData);
    case 'Offerings':
      return res.json(offeringsData);
    case 'OfferingParticipants':
      return res.json(participantsData);
  }
  res.json('invalid resource');
});

app.post('/data/:resource', (req, res)=>{
  const data = req.body;
  console.log(data);
  switch(req.params.resource){
    case 'User':
      userData = data;
      break;
    case 'Items':
      itemData = data;
      break;
    case 'Offerings':
      offeringsData = data;
      break;
    case 'OfferingParticipants':
      participantsData = data;
      break;
    default:
      res.json('invalid resource');
  }
  res.json('ok');
});

app.get('/reset', (_, res)=>{
  resetData();
  res.json('ok');
})

const env = process.env.NODE_ENV;

if (env == 'development') {
  https.createServer({
      key: fs.readFileSync('security/keytmp.pem'),
      cert: fs.readFileSync('security/cert.pem'),
      requestCert: false,
      rejectUnauthorized: false
    }, app)
    .listen(process.env.PORT || 443, function () {
      console.log('Server started')
    })
} else {
  app.listen(process.env.PORT || 3000, ()=>{
    console.log('prod server started')
  })
}