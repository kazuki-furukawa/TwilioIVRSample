"use strict";

//kintoneクラス作成
var kintone = function () {

    var request = require('request');

    //接続情報
    var subdomain = process.env.KINTONE_SUBDOMAIN;
    var userid = process.env.KINTONE_USERID;
    var password = process.env.KINTONE_PASSWORD;
    var appid = process.env.KINTONE_APPID_KANJYA;

    //kintoneからデータの取得
    this.getData = function (userId) {

        console.log('---------------------------------------------');
        console.log('kintoneKanjya.js:' + 'getData START');
        console.log('---------------------------------------------');
        console.log('kintoneKanjya.js:' + 'getData kanjya:' + userId);

        var queryStr = 'userId = \"' + userId + '\"';
        queryStr += ' order by kanjyaId asc';

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
                    fields: ["kanjyaId", "kana"]
                }
            }, function (err, response, body) {
                console.log("kintoneKanjya.js:getData statusCode:" + response.statusCode);
                if (err) {
                    console.log("kintoneKanjya.js:getData " + err);
                    reject(err);
                } else {
                    if (response.statusCode == 200) {
                        console.log("kintoneKanjya.js:getData " + JSON.stringify(body));
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
    this.getData2 = function (kanjyaId, kubun, yobouName) {

        console.log('---------------------------------------------');
        console.log('kintoneKanjya.js:' + 'getData2 START');
        console.log('---------------------------------------------');
        console.log('kintoneKanjya.js:' + 'getData2 kanjyaId:' + kanjyaId);
        console.log('kintoneKanjya.js:' + 'getData2 kubun:' + kubun);
        console.log('kintoneKanjya.js:' + 'getData2 yobouName:' + yobouName);

        var queryStr = 'kanjyaId = \"' + kanjyaId + '\"';
        queryStr += ' and kubun = \"' + kubun + '\"';
        queryStr += ' and yobouName = \"' + yobouName + '\"';

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
                    fields: ["$id", "kubun", "yobouName", "yobouDate1", "yobouDate2", "yobouDate3", "yobouDate4"]
                }
            }, function (err, response, body) {
                console.log("kintoneKanjya.js:getData2 statusCode:" + response.statusCode);
                if (err) {
                    console.log("kintoneKanjya.js:getData2 " + err);
                    reject(err);
                } else {
                    if (response.statusCode == 200) {
                        console.log("kintoneKanjya.js:getData2 " + JSON.stringify(body));
                        resolve("reserve is success");
                    } else {
                        reject(response.statusCode);
                    }
                }
            });
        });

        return pro;

    };

    //kintoneにデータを保存する(非同期)
    this.addData = function (kanjyaId, kubun, yobouName, yobouDate1, yobouDate2, yobouDate3, yobouDate4) {

        console.log('---------------------------------------------');
        console.log('kintoneKanjya.js:' + 'addData START');
        console.log('---------------------------------------------');
        console.log('kintoneKanjya.js:' + 'addData kanjyaId:' + kanjyaId);
        console.log('kintoneKanjya.js:' + 'addData kubun:' + kubun);
        console.log('kintoneKanjya.js:' + 'addData yobouName:' + yobouName);
        console.log('kintoneKanjya.js:' + 'addData yobouDate1:' + yobouDate1);
        console.log('kintoneKanjya.js:' + 'addData yobouDate2:' + yobouDate2);
        console.log('kintoneKanjya.js:' + 'addData yobouDate3:' + yobouDate3);
        console.log('kintoneKanjya.js:' + 'addData yobouDate4:' + yobouDate4);

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
                        kanjyaId: {
                            value: kanjyaId
                        },
                        kubun: {
                            value: kubun
                        },
                        yobouName: {
                            value: yobouName
                        },
                        yobouDate1: {
                            value: yobouDate1
                        },
                        yobouDate2: {
                            value: yobouDate2
                        },
                        yobouDate3: {
                            value: yobouDate3
                        },
                        yobouDate4: {
                            value: yobouDate4
                        }
                    }
                }
            }, function (err, response, body) {
                if (err) {
                    reject(err);
                } else {
                    if (response.statusCode == 200) {
                        console.log("kintoneKanjya.js:addData " + JSON.stringify(body));
                        resolve(JSON.parse(JSON.stringify(body)));
                    } else {
                        reject(response.statusCode);
                    }
                }
            });
        });

        //POST成功
        pro.then(function (res) {
            console.log('kintoneKanjya.js:addData ' + ' END');
            return;
        });

        //POST失敗
        pro.catch(function (err) {
            console.log('kintoneKanjya.js:addData ' + ' ERR:' + err);
            return;
        });
    };

    //kintoneデータの更新(非同期)
    this.putData = function (record_Id, yobouDate1, yobouDate2, yobouDate3, yobouDate4) {

        console.log('---------------------------------------------');
        console.log('kintoneKanjya.js:' + 'putData START');
        console.log('---------------------------------------------');
        console.log('kintoneKanjya.js:' + 'putData record_Id:' + record_Id);

        var jsonStr = null;
        var pro = new Promise(function (resolve, reject) {
            request({
                method: 'PUT',
                url: 'https://' + subdomain + '.cybozu.com/k/v1/record.json',
                headers: {
                    'X-Cybozu-Authorization': new Buffer(userid + ':' + password).toString('base64'),
                    'Content-Type': 'application/json'
                },
                json: {
                    app: appid,
                    id: record_Id,
                    record: {
                        yobouDate1: {
                            value: yobouDate1
                        },
                        yobouDate2: {
                            value: yobouDate2
                        },
                        yobouDate3: {
                            value: yobouDate3
                        },
                        yobouDate4: {
                            value: yobouDate4
                        }
                    }
                }
            }, function (err, response, body) {
                if (err) {
                    //console.log("kintoneKanjya.js:putData " + err);
                    reject(err);
                } else {
                    if (response.statusCode == 200) {
                        console.log("kintoneKanjya.js:putData " + JSON.stringify(body));
                        resolve(JSON.parse(JSON.stringify(body)));
                    } else {
                        reject(response.statusCode);
                    }
                }
            });
        });

        //POST成功
        pro.then(function (res) {
            console.log('kintoneKanjya.js:putData ' + ' END');
            return;
        });

        //POST失敗
        pro.catch(function (err) {
            console.log('kintoneKanjya.js:putData ' + ' ERR:' + err);
            return;
        });

    };

};

module.exports = kintone;
