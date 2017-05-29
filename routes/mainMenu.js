const express = require('express')
  , router = express.Router()
  , twilio = require('twilio')
  , ope = { voice: 'alice', language: 'ja-jp' }
  , serverUrl = process.env.serverUrl;

// ルートで呼び出される初期メニュー
router.post('/', function (req, res) {
  console.log('---------------------------------------------');
  console.log("start app post");
  console.log('---------------------------------------------');

  let value = req.body;
  let jsonObj = JSON.parse(JSON.stringify(value))
  console.log(req.session);
  console.log(jsonObj);

  res.setHeader('Content-Type', 'text/plain');
  // twimlを定義
  let twiml = new twilio.TwimlResponse();

  twiml.say('こちらは福島アイシーティィー病院でございます', ope);

  twiml.gather({
    method: 'POST',
    action: serverUrl + "/selectedMain",
    finishOnKey: '#',
    timeout: 20
  }, function (gatherNode) {
    gatherNode.say("予約する場合は1を、", ope);
    gatherNode.say("予約の確認をする場合は2を、", ope);
    gatherNode.say("予約の削除をする場合は3を、", ope);
    gatherNode.say('病院受付に転送する場合は4を、', ope);
    gatherNode.say("現在の待ち状況を確認するには５を、", ope);
    // gatherNode.say("システムに古川へ電話させる場合は5を、", ope);
    // gatherNode.say('録音する場合は6を、', ope);

    gatherNode.say("終了する場合は０を押して、最後にシャープを押してください", ope);
  });

  // レスポンスのbodyにリクエストのbodyをそのまま渡す
  res.body = req.body;

  // レスポンスにtwimlを渡す
  res.type('text/xml');
  res.send(twiml.toString());

  console.log("end app post");
});

module.exports = router;