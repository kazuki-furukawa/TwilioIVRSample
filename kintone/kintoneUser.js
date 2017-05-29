"use strict";

//kintoneクラス作成
var kintone = function () {

    var request = require('request');

    //接続情報
    var subdomain = process.env.KINTONE_SUBDOMAIN;
    var userid = process.env.KINTONE_USERID;
    var password = process.env.KINTONE_PASSWORD;
    var appid = process.env.KINTONE_APPID_USER;

    // displayNameの取得
    this.getuserName = function (tel) {

        console.log('---------------------------------------------');
        console.log('kintoneUser.js:' + 'getuserName START');
        console.log('---------------------------------------------');
        console.log('kintoneUser.js:' + 'getuserName tel:' + tel);

        var queryStr = 'tel = \"' + tel + '\"';

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
                    //fields: ["$id","displayName","accessFlg","kanjyaId1","kanjyaId2","kanjyaId3","email"]
                    fields: ["userId", "userName"]
                }
            }, function (err, response, body) {
                if (err) {
                    console.log("kintoneUser.js:getData " + err);
                    reject(err);
                } else {
                    if (response.statusCode == 200) {
                        console.log("kintoneUser.js:getData2 " + JSON.stringify(body));
                        var obj = JSON.parse(JSON.stringify(body));
                        if (obj.records.length == 0) {
                            //reject("ユーザー登録エラー");
                            resolve({ "userName": { "type": "SINGLE_LINE_TEXT", "value": "大澤　えいじ" }, "userId": { "type": "SINGLE_LINE_TEXT", "value": "fcs9999" } });
                        } else {
                            resolve(obj.records[0]);
                        };
                    } else {
                        reject(response.statusCode);
                    };
                };
            });
        });

        return pro;

    };

    // kanjyaId取得
    this.getkanjyaId = function (tel) {

        console.log('---------------------------------------------');
        console.log('kintoneUser.js:' + 'getkanjyaId START');
        console.log('---------------------------------------------');
        console.log('kintoneUser.js:' + 'getkanjyaId tel:' + tel);

        var queryStr = 'tel = \"' + tel + '\"';

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
                    //fields: ["$id","displayName","accessFlg","kanjyaId1","kanjyaId2","kanjyaId3","email"]
                    fields: ["kanjyaId1", "kanjyaId2", "kanjyaId3"]
                }
            }, function (err, response, body) {
                if (err) {
                    console.log("kintoneUser.js:getData " + err);
                    reject(err);
                } else {
                    if (response.statusCode == 200) {
                        console.log("kintoneUser.js:getData2 " + JSON.stringify(body));
                        var obj = JSON.parse(JSON.stringify(body));
                        if (obj.records.length == 0) {
                            reject("ユーザー登録エラー");
                        } else {
                            resolve(obj.records[0]);
                        };
                    } else {
                        reject(response.statusCode);
                    };
                };
            });
        });

        return pro;

    };

};

module.exports = kintone;