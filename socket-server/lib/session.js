var config = require('../config.json');
var PHPUnserialize = require('php-unserialize');
var Promise = require('bluebird');

var db = require('./db');

exports.getUserId = function (sid) {
    return new Promise(function (resolve, reject) {
        if (!sid) {
            return reject(new Error('会话ID错误'));
        }

        var redis = db.getRedis();
        redis.get(sid, function (err, data) {
            if (err) {
                return reject(err);
            }

            var session = PHPUnserialize.unserialize(PHPUnserialize.unserialize(data));
            if (session && session['login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d']) {
                return resolve(session['login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d']);
            }

            reject(new Error('用户未登录'));
        });
    });
};