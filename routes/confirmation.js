const express = require('express')
  , router = express.Router()
  , session = require('express-session')
  , twilio = require('twilio')
  , ope = { voice: 'alice', language: 'ja-jp' }
  , kintoneYoyaku = require('../kintone/kintoneYoyaku.js')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , serverUrl = process.env.serverUrl;
// Cookie
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cookieParser());
router.use(session({
  secret: 'ffproject',
  cookie: {
    httpOnly: false,
    maxAge: 30 * 60 * 1000
  },
  // store:sessionStore
}));
// 予約する：患者情報確認
router.post('/', function (req, res) {
  console.log('---------------------------------------------');
  console.log("start /confirmation");
  console.log('---------------------------------------------');

  // twimlを定義
  console.log("twiml on");
  let twiml = new twilio.TwimlResponse();
  console.log("ok");

  let value = req.body;
  let jsonObj = JSON.parse(JSON.stringify(value))
  let user = req.session.userId;

  let KintoneYoyaku = new kintoneYoyaku();
  // 非同期処理でデータベースから電話番号で個人を特定
  let promise = KintoneYoyaku.getData(req.session.userId);
  promise.then(function (result) {
    console.log("kintoneYoyaku.js:" + JSON.stringify(result) + " END");

    let resultJson = JSON.parse(JSON.stringify(result));
    let kana = JSON.parse(JSON.stringify(req.session.KanjyaKana));

    twiml.say("入っている予約は、", ope);

    if (resultJson.records.length != 0) {
      twiml.gather({
        method: 'POST',
        action: serverUrl,
        finishOnKey: '#',
        timeout: 20
      }, function (gatherNode) {
        for (let i = 0; i < resultJson.records.length; i++) {
          console.log(resultJson.records[i].kanjyaId.value + " : " + resultJson.records[i].yoyakuDateTime.value);
          for (let j = 0; j < kana.records.length; j++) {
            if (kana.records[j].kanjyaId.value == resultJson.records[i].kanjyaId.value)
              gatherNode.say((i + 1) + "。" + kana.records[j].kana.value + "さん、", ope);
          }

          let utcDateTime = new Date(resultJson.records[i].yoyakuDateTime.value);
          console.log(utcDateTime);
          utcDateTime.setTime(utcDateTime.getTime() + 9 * 1000 * 60 * 60);
          let y = utcDateTime.getFullYear();
          let m = utcDateTime.getMonth() + 1;
          let d = utcDateTime.getDate();
          let h = utcDateTime.getHours();
          let min = utcDateTime.getMinutes();
          let yoyaku = y + "-" + m + "-" + d + "。" + h + ":" + min;
          console.log(yoyaku);
          gatherNode.say(yoyaku + "。", ope);

        }

        gatherNode.say("です。", ope);
      });
    } else {

      twiml.say("ありません。", ope);

    }

    twiml.redirect(serverUrl);

    res.type('text/xml');
    res.send(twiml.toString());
  });

  console.log("end /confirmation");
});

module.exports = router;
