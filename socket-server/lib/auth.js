var cookie = require('cookie');
var crypto = require('crypto');
var debug = require('debug')('app');
var Promise = require('bluebird');

var config = require('../config.json');
var db = require('./db');
var Live = require('./live');
var Session = require('./session');
var User = require('./user');

function decrypt(payload, key) {
    var payload = new Buffer(payload, 'base64').toString();
    payload = JSON.parse(payload);

    var key = new Buffer(key, 'base64');
    var iv = new Buffer(payload.iv, 'base64');
    var decryptor = crypto.createDecipheriv('AES-256-CBC', key, iv);
    var text = decryptor.update(payload.value, 'base64', 'utf8') + decryptor.final('utf8');

    return text.substr(6, 40);
}

exports.getUser = function (request) {
    return new Promise(function (resolve, reject) {
        //return resolve(User.getById(1));
        // var cookies = cookie.parse(request.headers.cookie);
        // var cookies = cookie.parse(
        //     'eas_sid=x1Z4j7K8O076t6c13236b6M7D5; flv=23.0 r0; pvid=7882133286; tvfe_boss_uuid=da4cb8ad0e0e5b59; _ga=GA1.2.1087028439.1479192873; mobileUV=1_15885edd183_51caf; pac_uid=1_550928460; msuid=ixbc6l6a2dg70d0vvnljfyvwhjge5wuuqhpfq6bh; LW_uid=f1Z4k8i7n4n0Z6Q3X814S2y7Y9; cuid=1075285163; LW_sid=g1E4f878E2N5q5O567X9L1x7E6; same_pc=%5B%7B%22uin%22%3A%22550928460%22%2C%22qnid%22%3A12589%2C%22status%22%3A1%7D%5D; ts_refer=new.gad.qq.com/live/detail/143; ts_uid=1582141534; o_cookie=550928460; _qpsvr_localtk=0.9838219523514697; ptui_loginuin=1756538092; IED_LOG_INFO2=userUin%3D1756538092%26nickName%3DFire%26userLoginTime%3D1489400855; ts_refer=xui.ptlogin2.qq.com/cgi-bin/xlogin; pgv_pvi=1870860288; pgv_si=s2855687168; gaduid=58198ab31a6b0; ptisp=ctc; RK=BHfaM+yKWa; ptcz=85e295fa0d30f0eb16776afbf30d6f1b26542f38aee96f289dbff2a453ea4505; pt2gguin=o0550928460; uin=o0550928460; skey=@CQnQ7Rz3j; isLogined=1; pgv_info=ssid=s7097576325&pgvReferrer=; ts_last=new.gad.qq.com/course/10000034; pgv_pvid=4802467781; ts_uid=1582141534; XSRF-TOKEN=eyJpdiI6ImJ1ZlQwNXN4Wnk4WjZLU2doYVhIOXc9PSIsInZhbHVlIjoiazZjOXdiWlFYZm1jd1dkS0d6a3FBSnowM2RoNzZvT1RYdmVUYXU4Z3l0bWhEaDNPcUU3b2xKUTl6TVJBMzlaVFEzNVA1b2pPbXNrU3pmeHVhSlFEMmc9PSIsIm1hYyI6IjVmMTE5NTZjMGYwYWRiZTFiNzA2NWE0YmE2YzY0OTUwNmRhYmQ5MmEzODdkZTQ2ODM5OGJlNDgxNGMxN2RlMDAifQ%3D%3D; laravel_session=eyJpdiI6ImxGTFBZaEhIWENJZktzZXJ6MWxrd3c9PSIsInZhbHVlIjoiaFM4YmhRalpES3FmNkJXdzMxT1NKRDRjck43dVwvaGxtc2MrcWRWWWoycGJPY0lFbWsrMStXU1ZPTVVuSDNCVUlORFRuUGRSZENQRklya1hJNXVYaGN3PT0iLCJtYWMiOiJjZTdlZGEyMDI1N2Q0ODUzYzVkM2NiZDM5MjA0NmZlNGUzZWNhMDRlMWZlZTI1MmFlYjhiMDI5YWVmNDE0MjI1In0%3D'
        // );
        // if (!cookies.laravel_session) {
        //     return reject(new Error('没有GAD登录态'));
        // }
        //
        // var sessionId = decrypt(cookies.laravel_session, config.auth.key);
        // if (!sessionId) {
        //     return reject(new Error('非法会话'));
        // }

        // Session.getUserId('laravel:' + sessionId).then(User.getById).then(function (user) {
        //     resolve(user);
        // }).catch(function (err) {
        //     reject(err);
        // });
        console.log(`UserId:${request._query.userid}`);
        User.getById(request._query.userid).then(function (user) {
            resolve(user);
        }).catch(function (err) {
            reject(err);
        });
    });
};

exports.ban = function (userId, live, user, cb) {
    if (user.roleId == 3) {
        return cb(new Error('您没有权限禁言'));
    }

    var redis = db.getRedis();
    redis.hset('lvb:live:ban:' + live.id, userId, userId, function (err, result) {
        if (err) {
            return cb(err);
        }

        debug('user:%d is baned', userId);
        return cb(null, result);
    });
};

var isBaned = exports.isBaned = function (user, live, cb) {
    var redis = db.getRedis();
    redis.hexists('lvb:live:ban:' + live.id, user.UserId, function (err, result) {
        if (err) {
            return cb(err);
        }

        cb(null, !result);
    });
};

exports.getBanedList = function (live, cb) {
    var redis = db.getRedis();
    redis.hgetall('lvb:live:ban:' + live.id, function (err, rows) {
        if (err) {
            return cb(err);
        }

        var users = [];
        for (var uid in rows) {
            var user = rows[uid];
            users.push(user);
        }

        cb(null, users);
    });
};

exports.release = function (user, releaseUserId, live, cb) {
    if (user.roleId == 3) {
        return cb(new Error('您没有权限解禁'));
    }

    var redis = db.getRedis();
    redis.hdel('lvb:live:ban:' + live.id, releaseUserId, function (err, result) {
        if (err) {
            return cb(err);
        }

        debug('user:%d is released', releaseUserId);
        cb(null, releaseUserId);
    });
};

exports.check = function (user, live, cb) {
    if (user.roleId != 3) {
        //return cb(null, true);
    }

    Live.silent(live, null, function (err, state) {
        if (state) {
            return cb(new Error('当前全员禁言'));
        }

        isBaned(user, live, function (err, result) {
            if (err) {
                return cb(err);
            }

            cb(null, result);
        });
    });
};
