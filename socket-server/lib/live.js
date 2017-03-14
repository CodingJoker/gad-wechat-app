var debug = require('debug')('app');
var moment = require('moment');
var Promise = require('bluebird');

var LIVE_NOT_FOUND = 'Live不存在';
var LIVE_ID_INVALID = 'LIVE ID非法';

var db = require('./db');

exports.getById = function (liveId) {
    return new Promise(function (resolve, reject) {
        if (!liveId) {
            return reject(new Error(LIVE_ID_INVALID));
        }

        var redis = db.getRedis();
        redis.get('lvb:live:id' + liveId, function(err, data){
            if(data && JSON.parse(data)){
                return resolve(JSON.parse(data));
            }
            var mysql = db.getMysql();
            mysql.query('SELECT * FROM `lives` WHERE id=?', [liveId], function (err, result) {
                if (err) {
                    return reject(err);
                }

                if (result && result[0]) {
                    if(redis){
                        redis.set('lvb:live:id' + liveId, JSON.stringify(result[0]), function(err, result){
                            if(err){
                                //
                                return;
                            }
                            redis.expire('lvb:live:id' + liveId, 600);
                        });
                    }
                    return resolve(result[0]);
                }

                reject(new Error(LIVE_NOT_FOUND));
            });
        });
    });
};

exports.getStatusById = function (liveId) {
    return new Promise(function (resolve, reject) {
        if (!liveId) {
            return reject(new Error(LIVE_ID_INVALID));
        }

        var mysql = db.getMysql();
        mysql.query('SELECT * FROM `lives` WHERE id=?', [liveId], function (err, result) {
            if (err) {
                return reject(err);
            }

            if (result && result[0]) {
                return resolve(result[0]['state'] == 1);
            }

            resolve(false);
        });
    });
};

exports.getTotal = function (live, cb) {
    var key = 'lvb:live:online:' + live.id;
    var redis = db.getRedis();
    redis.zcard(key, function (err, total) {
        if (err) {
            return cb(err);
        }

        cb(null, total * 5 + (total % 5));
    });
};

exports.online = function (user, live, cb) {
    var key = 'lvb:live:online:' + live.id;
    var redis = db.getRedis();
    redis.zadd(key, new Date().getTime(), user.UserId, function (err, result) {
        if (err) {
            return cb(err);
        }

        debug('user:%d online', user.UserId);
        cb(null, result);
    });
};

exports.offline = function (user, live, cb) {
    var key = 'lvb:live:online:' + live.id;
    var redis = db.getRedis();
    redis.zrem(key, user.UserId, function (err, result) {
        if (err) {
            return cb(err);
        }

        cb(null, result);
    });
};

exports.silent = function (live, state, cb) {
    var redis = db.getRedis();
    if (state !== null) {
        redis.set('lvb:live:silent:' + live.id, state, function (err, result) {
            if (err) {
                return cb(err);
            }

            return cb(null, result);
        });
    } else {
        redis.get('lvb:live:silent:' + live.id, function (err, result) {
            if (err) {
                return cb(err);
            }

            return cb(null, result == 'true');
        });
    }
};

exports.logLive = function (user, live, type, role_type, message, datetime, cb) {
    var sql = 'INSERT INTO `live_messages` (`live_id`,`type`,`detail`,`user_id`,`username`,`user_pic`,`role_type`,`created_at`,`updated_at`) VALUES (?,?,?,?,?,?,?,?,?)';
    var mysql = db.getMysql();
    mysql.query(sql, [live.id, type, message, user.UserId, user.NickName, user.Avatar, role_type, datetime, datetime], function (err, result) {
        if (err) {
            return cb(err);
        }

        cb(null, result);
    });
};
