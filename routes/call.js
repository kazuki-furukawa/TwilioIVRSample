
let express = require('express');
let router = express.Router();
let twilio = require('twilio');
let ope = { voice: 'alice', language: 'ja-jp' };
// twilio が古川に電話する
router.post('/', function (req, res) {
    console.log('---------------------------------------------');
    console.log("start post call");
    console.log('---------------------------------------------');
    let accountSid = process.env.accountSid;
    let authToken = process.env.authToken;
    let client = require('twilio')(accountSid, authToken);
    client.calls.create({
        url: "http://demo.twilio.com/docs/voice.xml",
        to: process.env.MyNumber,
        from: process.env.TwilioNumber
    }, function (err, call) {
        process.stdout.write(call.sid);
    });

    console.log("twiml on");
    let twiml = new twilio.TwimlResponse();
    console.log("ok");

    twiml.say('終了します。失礼いたします。', ope);

    // レスポンスにtwimlを渡す
    res.type('text/xml');
    res.send(twiml.toString());
    console.log("end post call");
});

module.exports = router;