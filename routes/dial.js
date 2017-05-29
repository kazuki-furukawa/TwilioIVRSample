
let express = require('express');
let router = express.Router();
let twilio = require('twilio');
let serverUrl = process.env.serverUrl;
//let twilio = require('twilio');
// 通話中の電話を古川に転送
router.post('/', function (req, res) {
    console.log('---------------------------------------------');
    console.log("start post dial");
    console.log('---------------------------------------------');

    console.log("twiml on");
    let twiml = new twilio.TwimlResponse();
    console.log("ok");

    twiml.dial(process.env.MyNumber, {
        callerID: process.env.TwilioNumber
    });

    res.type('text/xml');
    res.send(twiml.toString());
    console.log("end post dial");
});

module.exports = router;