var xhrPath = '/vagrant/gad-im/node_modules/xmlhttprequest-ssl/lib/XMLHttpRequest.js';
require(xhrPath);
var xhrName = require.resolve(xhrPath);
var cachedXhr = require.cache[xhrName].exports;
var cookies = 'laravel_session=eyJpdiI6Ik8xYkJ2a29uOEtUMERyNUlnNFhMeHc9PSIsInZhbHVlIjoiK0NpVGp1WXBTd0U3V1BIdytiUHNsRGY0eENaZm9iQ0pkd2JVZEtEckdXeTBpWHFWYlJxNnlWUlRUVFJZNWpERzVERlpSVGNqQ01lanVESXN4SVNcL3NRPT0iLCJtYWMiOiIwMmM0OGZmZTM2MzQwMTllYzdlMGQyNTU1ZWY1NmZmOWVkOGM0YWJmMDkzMWExNTg5YmFlN2NjYzdhZTlhOGI0In0%3D';
var newXhr = function () {
    cachedXhr.apply(this, arguments);
    this.setDisableHeaderCheck(true);

    var stdOpen = this.open;
    this.open = function () {
        stdOpen.apply(this, arguments);
        this.setRequestHeader('Cookie', cookies);
    }
};

newXhr.XMLHttpRequest = newXhr;
require.cache[xhrName].exports = newXhr;

var io = require('socket.io-client');



var id = 0;
var t;
function c() {
    for (var i = 0; i < 100; i++) {
        if (id > 2000) return clearInterval(t);

        (function (_i) {
            var socket = io('ws://api.gad.qq.com/chat?id=10000002', {
                forceNew: true,
                reconnection: false,
                transports: ['websocket']
            });

            /*
            console.log('connect:' + i);
            socket.on('login', function () {
                console.log('login: ' + _i);
            });

            socket.on('notify', function (message) {
                console.log('管理员:' + message.message);
            });

            socket.on('message', function (message) {
                console.log(message.content);
            });
             */
            socket.on('error', function (err) {
                console.log('错误' + _i + ':' + err);
            });

        })(id++);
    }
}

t = setInterval(c, 5000);

