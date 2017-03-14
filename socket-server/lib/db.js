var debug = require('debug')('app');
var mysql = require('mysql');
var redis = require('redis');

var config = require('../config.json');
var redisClient;
var mysqlConnection;

exports.getRedis = function () {
    if (!redisClient) {
        redisClient = redis.createClient(config.redis);
        redisClient.on('error', function (err) {
            debug('redis connect error:' + err);
        });

        redisClient.on('connect', function () {
            debug('redis connected');
        });
    }

    return redisClient;
};

function mysqlConnect() {
    mysqlConnection = mysql.createConnection(config.mysql);
    mysqlConnection.connect(function(err) {
        if (err) {
            debug('mysql connect error:' + err);
            return;
        }

        debug('mysql connected');
    });

    mysqlConnection.on('error', function(err) {
        if (err.code = 'PROTOCOL_CONNECTION_LOST') {
            debug('mysql reconnecting...');
            mysqlConnect();
        }
    });

    return mysqlConnection;
}

setInterval(function () {
    if (!mysqlConnection) {
        return;
    }

    mysqlConnection.ping(function (err) {
        if (err) {
            mysqlConnect();
            debug('mysql reconnecting...');
        }
    });
}, 1000 * 60);

exports.getMysql = function () {
    return mysqlConnection ? mysqlConnection : mysqlConnect();
};
