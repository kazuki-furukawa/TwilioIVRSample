let express = require('express');
let router = express.Router();
let twilio = require('twilio');
let ope = { voice: 'alice', language: 'ja-jp' }
    , serverUrl = process.env.serverUrl;
// 待ち状況確認
router.post('/', function (req, res) {
    console.log('---------------------------------------------');
    console.log("start post wait");
    console.log('---------------------------------------------');

    console.log("twiml on");
    let twiml = new twilio.TwimlResponse();
    console.log("ok");

    twiml.say('現在、一時間以内の予約件数は、4件で、約30分待ちです。', ope);
    twiml.redirect(serverUrl);

    // レスポンスにtwimlを渡す
    res.type('text/xml');
    res.send(twiml.toString());
    console.log("end post wait");
});

module.exports = router;