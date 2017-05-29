
let express = require('express');
let router = express.Router();
let twilio = require('twilio');

let serverUrl = process.env.serverUrl;
let ope = { voice: 'alice', language: 'ja-jp' };
// twilio が古川に電話する
router.post('/', function(req, res){
    console.log('---------------------------------------------');
	console.log("start record");
    console.log('---------------------------------------------');
    
    // twimlを定義
    let twiml = new twilio.TwimlResponse();

    twiml.say("録音します。", ope)
         .record({
             maxLength: 10,
             action: serverUrl+"/record/save",
         })
         .say("録音できませんでした。", ope);

    // レスポンスにtwimlを渡す
    res.type('text/xml');
    res.send(twiml.toString());
	console.log("end record");
});

// twilio が古川に電話する
router.post('/save', function(req, res){
    console.log(JSON.stringify(req.body));
    let recordingUrl =  JSON.parse(JSON.stringify(req.body)).RecordingUrl;
    
    console.log("recordingUrl: ",recordingUrl);
    // twimlを定義
    let twiml = new twilio.TwimlResponse();
    twiml.say('録音した音声を再生します。', ope)
        .play(recordingUrl)
        .say('通話を終了します。', ope);
    // レスポンスにtwimlを渡す
    res.type('text/xml');
    res.send(twiml.toString());
});

module.exports = router;