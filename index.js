var express = require('express')
var fs = require('fs')
var https = require('https')
var app = express()
const morgan = require('morgan');

app.use(morgan('combined'));

app.get('/', function (req, res) {
  res.send('hello world')
})

app.get('/([\$])metadata', (req,res) => {
  res.type('application/xml');
  res.send(fs.readFileSync('metadata.xml'))
})

app.get('/User*', (req, res) => {
  const user = fs.readFileSync('User.json');
  res.json(JSON.parse(user));
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
