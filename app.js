//app.js
'use strict';

console.log('---------------------------------------------');
console.log("start app init");
console.log('---------------------------------------------');

// 定数
const express = require('express')
    , twilio = require('twilio')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , ope = { voice: 'alice', language: 'ja-jp' }
    , serverUrl = process.env.serverUrl
    , session = require('express-session')
    , MongoStore = require('connect-mongo')(session)
    , mongoose = require('mongoose');

let app = express();

// Cookie
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// MongoDB
//  var connectionString = "mongodb://ff-project:sOh3Hj7stHjaFjxvj8bwiNXWfLJfK6N3fSUnXqtcOgwbL2U9P9ODL4sIzFnLmoM0TGn28Rd4DVNdcNisjnIjCA==@ff-project.documents.azure.com:10250/?ssl=true&sslverifycertificate=false";
//  let db = mongoose.connect(connectionString);
//  let sessionStore = new MongoStore({mongooseConnection:mongoose.connection});
// Session
app.use(session({
    secret: 'ffproject',
    cookie: {
        httpOnly:false,
        maxAge: 30 * 60 * 1000
    },
    // store:sessionStore
}));

console.log("-----routing START-----");

let call = require('./routes/call');
app.use('/call', call);
console.log("call ok");

let dial = require('./routes/dial');
app.use('/dial', dial);
console.log("dial ok");

let record = require('./routes/record');
app.use('/record', record);
console.log("record ok");

let confirmation = require('./routes/confirmation');
app.use('/confirmation', confirmation);
console.log("confirmation ok");

let reserve = require('./routes/reserve');
app.use('/reserve', reserve);
console.log("reserve ok");

let deletePath = require('./routes/delete');
app.use('/delete', deletePath);
console.log("delete ok");

let selectedMain = require('./routes/selectedMain');
app.use('/selectedMain', selectedMain);
console.log("selectedMain ok");

let mainMenu = require('./routes/mainMenu');
app.use('/', mainMenu);
console.log("mainMenu ok");

let wait = require('./routes/wait');
app.use('/wait', wait);
console.log("wait ok");

console.log("------routing END------");

console.log("end app init");

// Create an HTTP server and listen for requests on port 3000
app.listen(process.env.PORT || 8000);