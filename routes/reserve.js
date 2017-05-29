const express = require('express')
  , router = express.Router()
  , twilio = require('twilio')
  , ope = { voice: 'alice', language: 'ja-jp' }
  , kintoneUser = require('../kintone/kintoneUser.js')
  , kintoneYoyaku = require('../kintone/kintoneYoyaku.js')
  , kintoneKanjya = require('../kintone/kintoneKanjya.js')
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

// // MongoDB
// var connectionString = "mongodb://ff-project:sOh3Hj7stHjaFjxvj8bwiNXWfLJfK6N3fSUnXqtcOgwbL2U9P9ODL4sIzFnLmoM0TGn28Rd4DVNdcNisjnIjCA==@ff-project.documents.azure.com:10250/?ssl=true";
// mongoose.connect(connectionString);
// // Modelの定義
// var UserSchema = new mongoose.Schema({
//     sid    : String,
//     password  : String
// },{collection: 'info'});

// Session
router.use(session({
  secret: 'ffproject',
  cookie: {
    httpOnly: false,
    maxAge: 30 * 60 * 1000
  },
  // store:sessionStore
}));

// 予約する
router.post('/', function (req, res) {
  console.log('---------------------------------------------');
  console.log("start reserve");
  console.log('---------------------------------------------');

  console.log("twiml on");
  let twiml = new twilio.TwimlResponse();
  console.log("ok");

  let KintoneUser = new kintoneUser();

  let pushNumber = req.session.digits;

  console.log(req.session);
  console.log("pushNumber = " + pushNumber);

  let value = req.body;
  let jsonObj = JSON.parse(JSON.stringify(value));
  let tel = new String();
  if (pushNumber == 0) {
    tel = jsonObj.Called;
  } else {
    tel = jsonObj.Caller;
  }

  // 非同期処理でデータベースから電話番号で個人を特定
  let promise = KintoneUser.getuserName(tel);
  promise.then(function (result) {
    let resultJson = JSON.parse(JSON.stringify(result));
    console.log("kintoneUser.js:" + JSON.stringify(result) + " END");

    req.session.userId = resultJson.userId.value;

    res.body = req.body;

    console.log("pushNumber = " + pushNumber);
    console.log("swich case start");
    switch (pushNumber) {

      case '1':
        console.log("swich case 1");
        twiml.say(resultJson.userName.value + "様からの予約受付を開始します", ope);
        // 患者情報選択にリダイレクト
        twiml.redirect(serverUrl + "/reserve/selectkanjya");
        res.type('text/xml');
        res.send(twiml.toString());
        break;

      case '2':
      case '3':
      case '0':
        console.log("swich case 2,3,0");
        let KintoneKanjya = new kintoneKanjya();
        // 非同期処理でデータベースから電話番号で個人を特定
        let promise = KintoneKanjya.getData(req.session.userId);
        promise.then(function (result2) {
          console.log("kintoneKanjya.js:" + "" + " END");
          let resultJson2 = JSON.parse(JSON.stringify(result2));

          req.session.KanjyaKana = resultJson2;

          if (pushNumber == 2 || pushNumber == 0) {
            console.log("swich case 2,0");
            twiml.say(resultJson.userName.value + "様からの予約確認を開始します", ope);
            twiml.redirect(serverUrl + "/confirmation");
          } else {
            console.log("swich case 3");
            twiml.say(resultJson.userName.value + "様からの予約削除を開始します", ope);
            twiml.redirect(serverUrl + "/delete");
          }

          res.type('text/xml');
          res.send(twiml.toString());
        });

        break;
    }

  });

  console.log("end reserve");

});

// 予約する：患者情報選択
router.post('/selectkanjya', function (req, res) {

  console.log('---------------------------------------------');
  console.log("start reserve/selectkanjya");
  console.log('---------------------------------------------');

  console.log("twiml on");
  let twiml = new twilio.TwimlResponse();
  console.log("ok");

  let KintoneKanjya = new kintoneKanjya();

  let value = req.body;
  let jsonObj = JSON.parse(JSON.stringify(value));
  //console.log(jsonObj);
  let tel = jsonObj.Caller;

  // 非同期処理でデータベースから
  let promise = KintoneKanjya.getData(req.session.userId);
  promise.then(function (result) {
    let resultJson = JSON.parse(JSON.stringify(result));

    req.session.kanjyaJSON = resultJson;

    twiml.say("これから読み上げる中から予約されるかたを選んで最後にシャープを押してください", ope);
    twiml.gather({
      method: 'POST',
      action: serverUrl + "/reserve/selectkanjya/confirmation",
      finishOnKey: '#',
      timeout: 20
    }, function (gatherNode) {

      for (let i = 0; i < resultJson.records.length; i++) {

        gatherNode.say(resultJson.records[i].kana.value + "の場合は" + (i + 1) + "を、", ope);

      }

      gatherNode.say("終了する場合は０を押して、最後にシャープを押してください。", ope);

      gatherNode.say("メニューに戻る場合はシャープを押してください。", ope);
    });

    res.body = req.body;

    res.type('text/xml');
    res.send(twiml.toString());
  });

  console.log("end reserve/selectkanjya");
});


// 予約する：患者情報確認
router.post('/selectkanjya/confirmation', function (req, res) {
  console.log('---------------------------------------------');
  console.log("start /reserve/selectkanjya/confirmation");
  console.log('---------------------------------------------');

  let value = req.body;
  let jsonObj = JSON.parse(JSON.stringify(value))
  let pushNumber = jsonObj.Digits;
  console.log("pushNumber=" + pushNumber);

  // twimlを定義
  console.log("twiml on");
  let twiml = new twilio.TwimlResponse();
  console.log("ok");

  // pushNumberに値が入っていればスイッチケースを実行
  if (pushNumber) {
    switch (pushNumber) {

      case '0':

        twiml.say('終了します。失礼いたします。', ope);
        break;

      default:

        let kanjya = JSON.parse(JSON.stringify(req.session.kanjyaJSON));

        req.session.selectedKanjya = pushNumber - 1;

        if (kanjya.records.length >= pushNumber) {
          twiml.say(kanjya.records[pushNumber - 1].kana.value + "が選択されました。", ope).pause();

          // 転送処理にリダイレクト
          twiml.redirect(serverUrl + "/reserve/selectMonth");
        } else {
          twiml.say("正しい数字を入力してください", ope);
          // 転送処理にリダイレクト
          twiml.redirect(serverUrl + "/reserve/selectkanjya");
        }

        break;
    }
  } else {
    // 初期メニューにリダイレクト
    console.log("pushNumber is undefined");
    twiml.say('初期メニューに戻ります', ope).pause();
    twiml.redirect(serverUrl);
  }

  console.log("case is over");

  // レスポンスのbodyにリクエストのbodyをそのまま渡す
  res.body = req.body;

  // レスポンスにtwimlを渡す
  res.type('text/xml');
  res.send(twiml.toString());

  console.log("end /reserve/selectkanjya/confirmation");
});


// 予約する：日時設定
router.post('/selectMonth', function (req, res) {

  console.log('---------------------------------------------');
  console.log("start reserve/selectMonth");
  console.log('---------------------------------------------');


  console.log("twiml on");
  let twiml = new twilio.TwimlResponse();
  console.log("ok");

  twiml.gather({
    method: 'POST',
    action: serverUrl + "/reserve/selectDate",
    finishOnKey: '#',
    timeout: 20
  }, function (gatherNode) {
    gatherNode.say("今月中に予約する場合は1を、来月に予約する場合は2を押して、最後にシャープを押してください。", ope);
  })
  res.body = req.body
  res.type('text/xml');
  res.send(twiml.toString());

  console.log("end reserve/selectMonth");
});

// 予約する：日時設定
router.post('/selectDate', function (req, res) {

  console.log('---------------------------------------------');
  console.log("start reserve/selectDate");
  console.log('---------------------------------------------');

  let value = req.body;
  let jsonObj = JSON.parse(JSON.stringify(value))
  req.session.Month = jsonObj.Digits;

  console.log("twiml on");
  let twiml = new twilio.TwimlResponse();
  console.log("ok");

  if (jsonObj.Digits != "1" && jsonObj.Digits != "2") {
    twiml.say('１、か、２、を選択してください', ope).pause();
    twiml.redirect(serverUrl + "/reserve/selectMonth");
  } else {

    twiml.gather({
      method: 'POST',
      action: serverUrl + "/reserve/selectTime",
      finishOnKey: '#',
      timeout: 20
    }, function (gatherNode) {
      gatherNode.say("日付を入力して、最後にシャープを押してください。", ope);
    });
  }

  res.body = req.body
  res.type('text/xml');
  res.send(twiml.toString());

  console.log("end reserve/selectDateTime");
});

// 予約する：日時設定
router.post('/selectTime', function (req, res) {

  console.log('---------------------------------------------');
  console.log("start reserve/selectTime");
  console.log('---------------------------------------------');

  let value = req.body;
  let jsonObj = JSON.parse(JSON.stringify(value))
  req.session.Date = jsonObj.Digits;

  console.log("twiml on");
  let twiml = new twilio.TwimlResponse();
  console.log("ok");

  twiml.gather({
    method: 'POST',
    action: serverUrl + "/reserve/selectDateTime/confirmation",
    finishOnKey: '#',
    timeout: 20
  }, function (gatherNode) {
    gatherNode.say("時間を入力して、最後にシャープを押してください", ope);
    gatherNode.say("例として、午後二時の場合、１、４、シャープ、と入力します。", ope);
  });
  res.body = req.body
  res.type('text/xml');
  res.send(twiml.toString());

  console.log("end reserve/selectTime");
});

// 予約する：日時確認
router.post('/selectDateTime/confirmation', function (req, res) {
  console.log('---------------------------------------------');
  console.log("start /reserve/selectDateTime/confirmation");
  console.log('---------------------------------------------');

  let value = req.body;
  let jsonObj = JSON.parse(JSON.stringify(value))
  let pushNumber = jsonObj.Digits;

  console.log("twiml on");
  let twiml = new twilio.TwimlResponse();
  console.log("ok");



  let selectedDate = ["x", "x", "x", "x"];
  let intDate = [0, 0, 0, 0]

  let nowDate = new Date();

  if (req.session.Month == "1")
    intDate[0] = nowDate.getMonth() + 1;
  else
    intDate[0] = nowDate.getMonth() + 2;

  intDate[1] = parseInt(req.session.Date);

  intDate[2] = parseInt(pushNumber);

  selectedDate[3] = "00";


  selectedDate[0] = ('0' + intDate[0]).slice(-2);

  if (intDate[1] < 10) {
    selectedDate[1] = '0' + intDate[1];
  } else {
    selectedDate[1] = intDate[1];
  }

  selectedDate[2] = ('0' + intDate[2]).slice(-2);
  if (intDate[2] > 23) {
    selectedDate[2] = '00'
  }
  console.log("値1：" + nowDate.getFullYear() + "/" + intDate[0] + "/" + intDate[1]);
  var dt = new Date(nowDate.getFullYear() + "/" + selectedDate[0] + "/" + selectedDate[1]);
  console.log("値2：" + dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate());
  console.log("判定：" + ((nowDate.getFullYear() + "/" + intDate[0] + "/" + intDate[1]).toString() == (dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate()).toString()));
  if ((nowDate.getFullYear() + "/" + intDate[0] + "/" + intDate[1]).toString() == (dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate()).toString()) {

    req.session.reserveDateTime = nowDate.getFullYear() + "-" + selectedDate[0] + "-" + selectedDate[1] + "T" + selectedDate[2] + ":" + selectedDate[3] + ":00+0900";
    twiml.say(nowDate.getFullYear() + "-" + selectedDate[0] + "-" + selectedDate[1] + "。" + selectedDate[2] + ":" + selectedDate[3] + "。でよろしいですか？", ope);
    twiml.gather({
      method: 'POST',
      action: serverUrl + "/reserve/confirmation",
      finishOnKey: '#',
      timeout: 20
    }, function (gatherNode) {
      gatherNode.say("予約を確定する場合は1を", ope);
      gatherNode.say("日付を入力しなおす場合は2を", ope);
      gatherNode.say("終了する場合は０を押して、最後にシャープを押してください", ope);
    });

  } else {
    twiml.say("入力が正しくありません。もう一度入力してください", ope);
    twiml.redirect(serverUrl + "/reserve/selectMonth");
  }

  res.body = req.body
  res.type('text/xml');
  res.send(twiml.toString());

  console.log("end /reserve/selectDateTime/confirmation");
});

// 予約する：確認
router.post('/confirmation', function (req, res) {
  console.log('---------------------------------------------');
  console.log("start /reserve/confirmation");
  console.log('---------------------------------------------');

  let value = req.body;
  let jsonObj = JSON.parse(JSON.stringify(value));
  let pushNumber = jsonObj.Digits;

  // twimlを定義
  console.log("twiml on");
  let twiml = new twilio.TwimlResponse();
  console.log("ok");

  // pushNumberに値が入っていればスイッチケースを実行
  if (pushNumber) {
    switch (pushNumber) {

      case '1':

        twiml.say("予約を確定します。", ope);
        // 転送処理にリダイレクト
        twiml.redirect(serverUrl + "/reserve/finish");
        break;

      case '2':

        twiml.say("月選択に戻ります。", ope);
        // 転送処理にリダイレクト
        twiml.redirect(serverUrl + "/reserve/selectMonth");
        break;

      case '0':

        twiml.say('終了します。失礼いたします。', ope);
        break;

      default:
        twiml.say('指定の数字を押してください', ope).pause();
        // 初期メニューにリダイレクト
        twiml.redirect(serverUrl);
        break;
    }
  } else {
    // 初期メニューにリダイレクト
    console.log("pushNumber is undefined");
    twiml.redirect(serverUrl);
  }

  console.log("case is over");

  // レスポンスのbodyにリクエストのbodyをそのまま渡す
  res.body = req.body;

  // レスポンスにtwimlを渡す
  res.type('text/xml');
  res.send(twiml.toString());

  console.log("end /reserve/selectkanjya/confirmation");
});

// 予約する：完了
router.post('/finish', function (req, res) {
  console.log('---------------------------------------------');
  console.log("start /reserve/finish");
  console.log('---------------------------------------------');

  // let value = req.body;
  // let jsonObj = JSON.parse(JSON.stringify(value));
  // let pushNumber = jsonObj.Digits;
  // console.log("pushNumber=" + pushNumber);

  // twimlを定義
  console.log("twiml on");
  let twiml = new twilio.TwimlResponse();
  console.log("ok");

  let kanjya = JSON.parse(JSON.stringify(req.session.kanjyaJSON));
  let selectedNum = parseInt(req.session.selectedKanjya);

  let KintoneYoyaku = new kintoneYoyaku();
  // 非同期処理でデータベースから電話番号で個人を特定
  let promise = KintoneYoyaku.addData(req.session.userId, kanjya.records[selectedNum].kanjyaId.value, req.session.reserveDateTime);
  promise.then(function (result) {
    console.log("kintoneYoyaku.js:" + "" + " END");

    twiml.say("予約が完了しました。", ope);

    res.type('text/xml');
    res.send(twiml.toString());
  });

  console.log("end /reserve/finish");
});

module.exports = router;