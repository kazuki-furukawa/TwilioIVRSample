const express = require('express')
  , router = express.Router()
  , twilio = require('twilio')
  , ope = { voice: 'alice', language: 'ja-jp' }
  , serverUrl = process.env.serverUrl
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , MongoStore = require('connect-mongo')(session)
  , mongoose = require('mongoose');

// Cookie
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cookieParser());

// MongoDB
// var connectionString = "mongodb://ff-project:sOh3Hj7stHjaFjxvj8bwiNXWfLJfK6N3fSUnXqtcOgwbL2U9P9ODL4sIzFnLmoM0TGn28Rd4DVNdcNisjnIjCA==@ff-project.documents.azure.com:10250/?ssl=true";
// mongoose.connect(connectionString);

// Session
router.use(session({
  secret: 'ffproject',
  cookie: {
    httpOnly: false,
    maxAge: 30 * 60 * 1000
  },
  // store:sessionStore
}));

// gatherの分岐処理
// 1が押された時：転送
// 2が押された時：このシステムから電話させる
// 3が押された時：予約する
// 0が押された時：終了する
router.post('/', function (req, res) {
  console.log('---------------------------------------------');
  console.log("start selectedMain");
  console.log('---------------------------------------------');

  let value = req.body;
  let jsonObj = JSON.parse(JSON.stringify(value))
  let pushNumber = jsonObj.Digits;
  req.session.digits = pushNumber;
  console.log("pushNumber=" + pushNumber);

  // twimlを定義
  console.log("twiml on");
  let twiml = new twilio.TwimlResponse();
  console.log("ok");

  // pushNumberに値が入っていればスイッチケースを実行
  if (pushNumber) {
    switch (pushNumber) {

      case '1':

        twiml.say('予約します', ope);
        // 予約にリダイレクト
        twiml.redirect(serverUrl + "/reserve");
        break;


      case '2':

        twiml.say('予約を確認します', ope);
        // システムが電話をかける処理にリダイレクト（現在の電話自体は終了）
        twiml.redirect(serverUrl + "/reserve");
        break;

      case '3':

        twiml.say('予約を削除します', ope);
        // システムが電話をかける処理にリダイレクト（現在の電話自体は終了）
        twiml.redirect(serverUrl + "/reserve");
        break;

      case '4':

        twiml.say('受付に転送します', ope);
        // 転送処理にリダイレクト
        twiml.redirect(serverUrl + "/dial");
        break;

      case '5':

        twiml.say('待ち状況を確認します', ope);
        // システムが電話をかける処理にリダイレクト（現在の電話自体は終了）
        twiml.redirect(serverUrl + "/wait");
        break;

      //   twiml.say('古川に電話します', ope);
      //   // システムが電話をかける処理にリダイレクト（現在の電話自体は終了）
      //   twiml.redirect(serverUrl+"/call");
      //   break;

      // case '6':

      //   twiml.say('録音します', ope);
      //   // システムが電話をかける処理にリダイレクト（現在の電話自体は終了）
      //   twiml.redirect(serverUrl+"/record");
      //   break;  

      case '0':

        twiml.say('終了します。失礼いたします。', ope);
        break;

      default:
        twiml.say('指定の数字を押してください', ope);
        // 初期メニューにリダイレクト
        twiml.redirect(serverUrl);
        break;
    }
  } else {
    // 初期メニューにリダイレクト
    console.log("pushNumber is undefined");
    twiml.say('初期メニューに戻ります', ope);
    twiml.redirect(serverUrl);
  }

  console.log("case is over");

  // レスポンスのbodyにリクエストのbodyをそのまま渡す
  res.body = req.body;

  // レスポンスにtwimlを渡す
  res.type('text/xml');
  res.send(twiml.toString());

  console.log("end selectedMain");
});

module.exports = router;