var express = require('express')
var fs = require('fs')
var https = require('https')
var app = express()
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

app.post('/lms//oauth-api/rest/v1/token', (_, res) => {
  res.json({
    access_token: "token-sample",
    expires_in: 1800,
    token_type: "Bearer"
  });
})

app.get('/lms//odatav4/public/admin/dataextraction-service/v1/Items', (req, res) => {
  console.log(req.query);
  if(req.query['$skip']==0){
    const user = fs.readFileSync('Items.json');
    res.json(JSON.parse(user));
  }else {
    res.json('ok');
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