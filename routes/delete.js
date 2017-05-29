const express = require('express')
  , router = express.Router()
  , session = require('express-session')
  , twilio = require('twilio')
  , ope = { voice: 'alice', language: 'ja-jp' }
  , kintoneYoyaku = require('../kintone/kintoneYoyaku.js')
  , serverUrl = process.env.serverUrl;

router.post('/', function (req, res) {
  console.log('---------------------------------------------');
  console.log("start /delete");
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

    req.session.yoyaku = resultJson;

    twiml.say("削除したい予約の番号を押して最後にシャープを押してください。０が入力された場合メインメニューに戻ります。", ope);
    twiml.say("入っている予約は、", ope);

    if (resultJson.records.length != 0) {
      twiml.gather({
        method: 'POST',
        action: serverUrl + "/delete/do",
        finishOnKey: '#',
        timeout: 100
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
          let yoyaku = y + "-" + m + "-" + d + " " + h + ":" + min;
          console.log(yoyaku);
          gatherNode.say(yoyaku + "。", ope);

        }

        gatherNode.say("です。", ope);
      });
    } else {

      twiml.say("ありません。", ope);

      twiml.redirect(serverUrl);
    }

    res.type('text/xml');
    res.send(twiml.toString());
  });

  console.log("end /delete");
});

router.post('/do', function (req, res) {

  console.log('---------------------------------------------');
  console.log("start /delete/do");
  console.log('---------------------------------------------');

  // twimlを定義
  console.log("twiml on");
  let twiml = new twilio.TwimlResponse();
  console.log("ok");

  let value = req.body;
  let jsonObj = JSON.parse(JSON.stringify(value));
  let yoyaku = JSON.parse(JSON.stringify(req.session.yoyaku));
  let pushNumber = jsonObj.Digits;
  if (pushNumber - 1 >= 0 && pushNumber - 1 <= yoyaku.records.length) {
    let KintoneYoyaku = new kintoneYoyaku();
    // 非同期処理でデータベースから電話番号で個人を特定
    let promise = KintoneYoyaku.deleteData(yoyaku.records[pushNumber - 1].ids.value);
    promise.then(function (result) {
      twiml.say("削除しました。", ope);
      twiml.redirect(serverUrl + "/delete");
      res.type('text/xml');
      res.send(twiml.toString());
    });
  } else if (pushNumber == 0) {
    twiml.redirect(serverUrl);
    res.type('text/xml');
    res.send(twiml.toString());
  } else {
    twiml.say("正しい番号を入力してください", ope);
    twiml.redirect(serverUrl + "/delete");
    res.type('text/xml');
    res.send(twiml.toString());
  }

});

module.exports = router;