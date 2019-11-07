var express = require('express')
var fs = require('fs')
var https = require('https')
var app = express()
const moment = require('moment');
const morgan = require('morgan');

app.use(morgan('dev'));

app.get('/', function (req, res) {
  res.send('hello world')
})

app.get('/([\$])metadata', (req, res) => {
  res.type('application/xml');
  res.send(fs.readFileSync('metadata.xml'))
})

app.get('/User*', (req, res) => {
  const user = fs.readFileSync('User.json');
  res.json(JSON.parse(user));
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

app.get('/lms/odatav4/public/admin/dataextraction-service/v1/Items', (req, res) => {
  res.setHeader('date', moment().format('ddd, DD MMM YYYY HH:mm:ss ')+'GMT')
  // return res.json(empty);
  const filter = req.query['$filter'] || '';
  if (req.query['$skip'] == 0 && !filter.includes('FT_')) {
    const user = fs.readFileSync('Items.json');
    res.json(JSON.parse(user));
  } else {
    res.json(empty);
  }
})

app.get('/lms/odatav4/public/admin/dataextraction-service/v1/ScheduledOfferings', (req, res) => {
  res.setHeader('date', moment().format('ddd, DD MMM YYYY HH:mm:ss ')+'GMT')
  // return res.json(empty);
  const filter = req.query['$filter'] || '';
  if (req.query['$skip'] == 0 && !filter.includes('FT_')) {
    const user = fs.readFileSync('Offerings.json');
    res.json(JSON.parse(user));
  } else {
    res.json(empty);
  }
})

app.get('/lms/odatav4/public/admin/dataextraction-service/v1/ScheduledOfferingParticipants', (req, res) => {
  const filter = req.query['$filter'] || '';
  res.setHeader('date', moment().format('ddd, DD MMM YYYY HH:mm:ss ')+'GMT')
  // return res.json(empty);
  if (req.query['$skip'] == 0 && !filter.includes('FT_')) {
    const user = fs.readFileSync('OfferingParticipants.json');
    res.json(JSON.parse(user));
  } else {
    res.json(empty);
  }
})

https.createServer({
    key: fs.readFileSync('security/keytmp.pem'),
    cert: fs.readFileSync('security/cert.pem'),
    requestCert: false,
    rejectUnauthorized: false
  }, app)
  .listen(443, function () {
    console.log('Server started')
  })