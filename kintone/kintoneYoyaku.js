"use strict";

//kintoneクラス作成
var kintone = function () {

    var request = require('request');

    //接続情報
    var subdomain = process.env.KINTONE_SUBDOMAIN;
    var userid = process.env.KINTONE_USERID;
    var password = process.env.KINTONE_PASSWORD;
    var appid = process.env.KINTONE_APPID_YOYAKU;

    //kintoneからデータの取得
    this.getData = function (userId) {

        console.log('---------------------------------------------');
        console.log('kintoneYoyaku.js:' + 'getData START');
        console.log('---------------------------------------------');
        console.log('kintoneYoyaku.js:' + 'getData userId:' + userId);

        var queryStr = 'userId = \"' + userId + '\" and status not in (\"済\")';
        queryStr += ' order by yoyakuDateTime asc';

        var jsonStr = null;
        var pro = new Promise(function (resolve, reject) {
            request({
                method: 'GET',
                url: 'https://' + subdomain + '.cybozu.com/k/v1/records.json',
                headers: {
                    'X-Cybozu-Authorization': new Buffer(userid + ':' + password).toString('base64'),
                    'Content-Type': 'application/json'
                },
                json: {
                    app: appid,
                    query: queryStr,
                    fields: ["kanjyaId", "yoyakuDateTime", "ids"]
                }
            }, function (err, response, body) {
                console.log("kintoneYoyaku.js:getData statusCode:" + response.statusCode);
                if (err) {
                    console.log("kintoneYoyaku.js:getData err " + err);
                    reject(err);
                } else {
                    if (response.statusCode == 200) {
                        console.log("kintoneYoyaku.js:getData sucsess " + JSON.stringify(body));
                        resolve(JSON.parse(JSON.stringify(body)));
                    } else {
                        reject(response.statusCode);
                    }
                }
            });
        });

        return pro;

    };

    //kintoneからデータの取得（予防接種単位）
    this.getData2 = function (kanjyaId, yoyakuDateTime) {

        console.log('---------------------------------------------');
        console.log('kintoneYoyaku.js:' + 'getData2 START');
        console.log('---------------------------------------------');
        console.log('kintoneYoyaku.js:' + 'getData2 kanjyaId:' + kanjyaId);
        console.log('kintoneYoyaku.js:' + 'getData2 yoyakuDateTime:' + yoyakuDateTime);

        var queryStr = 'kanjyaId = \"' + kanjyaId + '\"';
        queryStr += ' and yoyakuDateTime = \"' + yoyakuDateTime + '\"';

        var jsonStr = null;
        var pro = new Promise(function (resolve, reject) {
            request({
                method: 'GET',
                url: 'https://' + subdomain + '.cybozu.com/k/v1/records.json',
                headers: {
                    'X-Cybozu-Authorization': new Buffer(userid + ':' + password).toString('base64'),
                    'Content-Type': 'application/json'
                },
                json: {
                    app: appid,
                    query: queryStr,
                    fields: ["$id", "kanjyaId", "yoyakuDateTime", "jyotai"]
                }
            }, function (err, response, body) {
                console.log("kintoneYoyaku.js:getData2 statusCode:" + response.statusCode);
                if (err) {
                    console.log("kintoneYoyaku.js:getData2 " + err);
                    reject(err);
                } else {
                    if (response.statusCode == 200) {
                        console.log("kintoneYoyaku.js:getData2 " + JSON.stringify(body));
                        resolve(JSON.parse(JSON.stringify(body)));
                    } else {
                        reject(response.statusCode);
                    }
                }
            });
        });

        return pro;

    };

    //kintoneにデータを保存する(非同期)
    this.addData = function (userId, kanjyaId, yoyakuDateTime) {

        console.log('---------------------------------------------');
        console.log('kintoneYoyaku.js:' + 'addData START');
        console.log('---------------------------------------------');
        console.log('kintoneYoyaku.js:' + 'addData userId:' + userId);
        console.log('kintoneYoyaku.js:' + 'addData kanjyaId:' + kanjyaId);
        console.log('kintoneYoyaku.js:' + 'addData yoyakuDateTime:' + yoyakuDateTime);

        var jsonStr = null;
        var pro = new Promise(function (resolve, reject) {
            request({
                method: 'POST',
                url: 'https://' + subdomain + '.cybozu.com/k/v1/record.json',
                headers: {
                    'X-Cybozu-Authorization': new Buffer(userid + ':' + password).toString('base64'),
                    'Content-Type': 'application/json'
                },
                json: {
                    app: appid,
                    record: {
                        userId: {
                            value: userId
                        },
                        kanjyaId: {
                            value: kanjyaId
                        },
                        yoyakuDateTime: {
                            value: yoyakuDateTime
                        },
                        jyotai: {
                            value: []
                        }
                    }
                }
            }, function (err, response, body) {
                if (err) {
                    //console.log("kintoneYoyaku.js:addData " + err);
                    reject(err);
                } else {
                    console.log("kintoneYoyaku.js:addData " + JSON.stringify(body));
                    if (response.statusCode <= 200) {
                        resolve(JSON.parse(JSON.stringify(body)));
                    } else {
                        reject(response.statusCode);
                    }
                }
            });
        });

        return pro;
    };

    //kintoneのデータ削除(record_Idは配列で渡すこと)
    this.deleteData = function (record_Id) {

        console.log('---------------------------------------------');
        console.log('kintoneYoyaku.js:' + 'deleteData START');
        console.log('---------------------------------------------');
        console.log('kintoneYoyaku.js:' + 'deleteData record_Id:' + record_Id);

        var jsonStr = null;
        var pro = new Promise(function (resolve, reject) {
            request({
                method: 'DELETE',
                url: 'https://' + subdomain + '.cybozu.com/k/v1/records.json',
                headers: {
                    'X-Cybozu-Authorization': new Buffer(userid + ':' + password).toString('base64'),
                    'Content-Type': 'application/json'
                },
                json: {
                    app: appid,
                    ids: [record_Id]
                }
            }, function (err, response, body) {
                if (err) {
                    console.log("kintoneYoyaku.js:deleteData " + err);
                    reject(err);
                } else {
                    if (response.statusCode == 200) {
                        console.log("kintoneRireki.js:deleteData " + JSON.stringify(body));
                        resolve();
                    } else {
                        reject(response.statusCode);
                    }
                }
            });
        });

        return pro;

    };

};

module.exports = kintone;
