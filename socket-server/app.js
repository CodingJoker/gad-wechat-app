var debug = require('debug')('app');
var port = process.env.PORT || 8801;
var fs = require('fs');
var moment = require('moment');
var io = require('socket.io')(port);
var redis = require('socket.io-redis');

var config = require('./config.json');
var Auth = require('./lib/auth');
var Live = require('./lib/live');
var User = require('./lib/user');



io.adapter(redis(config.redis.dns));

var im = io.of('/live');
im.on('connection', function (socket) {
    debug('user connected ' + socket.id);
    console.log(`A user connect live:${socket.id}`);
    var error = function (err, errId) {
        console.log(err);
        if (typeof err == 'string') {
            err = new Error(err);
        }
        socket.emit('notify', {id: errId, message: err.message});
        debug(err);
    };

    Live.getById(socket.request._query.id).then(function (live) {
        socket.live = live;
        if (socket.live.state == 1) {
            return error('已经结束', 'end');
        }

        return Auth.getUser(socket.request);
    }).then(function (user) {

        socket.user = user;
        return User.getUserRole(user, socket.live);
    }).then(function (role) {
        var roleInfo = {
            name:{
                admin: '管理员',
                teacher: '嘉宾',
                user: '普通用户',
                system: '系统管理员',
                lookuser: '围观'
            },
            id:{
                admin: 2,
                teacher: 1,
                user: 3,
                system: 2,
                lookuser: 3
            }
        };
        socket.user.io = socket.id;
        socket.user.role = role;
        socket.user.roleName = roleInfo['name'][role];
        socket.user.roleId = roleInfo['id'][role];
    }).then(function () {
        // 房间号
        var roomId = socket.live.id;
        var managerRoomId = roomId + '-live-manager';

        // 加入直播房间
        socket.join(roomId);

        // 下发登录状态
        //Live.online(socket.user, socket.live, function (err, result) {
        //if (err) {
        //    return error(err);
        //}

        //socket.emit('login', socket.user);

        // 下发在线人数
        /*Live.getTotalOnline(socket.live, function (err, online) {
         if (err) {
         return error(err);
         }

         im.to(roomId).emit('online', online);
         });*/

        /*
         im.clients(function(err, clients){
         if (err) {
         return error(err);
         }
         im.to(roomId).emit('online', clients.length);
         });
         */
        //});

        // 处理连接断开
        socket.on('disconnect', function () {
            //if (socket.user) {
            //Live.offline(socket.user, socket.live, function (err, result) {
            //if (err) {
            //    return error(err);
            //}

            // 下发在线人数
            /*
             Live.getTotalOnline(socket.live, function (err, online) {
             if (err) {
             return error(err);
             }

             im.to(roomId).emit('online', online);
             });*/

            /*
             im.clients(function(err, clients){
             if (err) {
             return error(err);
             }
             im.to(roomId).emit('online', clients.length);
             });
             */
            //});
            //}

            debug('user disconnected ' + socket.id);
        });

        if (socket.request._query.mobile) {
            //移动端只统计在线
            return;
        }

        Auth.isBaned(socket.user, socket.live, function (err, result) {
            if (err) {
                return error(err);
            }
            socket.emit('baned', result);
        });

        // 下发禁言列表和禁言状态
        if (socket.user.role != 'user') {
            socket.join(socket.live.id + '-live-manager');
            Auth.getBanedList(socket.live, function (err, users) {
                if (err) {
                    return error(err);
                }
                socket.emit('ban', users);
            });

            Live.silent(socket.live, null, function (err, state) {
                if (err) {
                    return error(err);
                }
                im.to(managerRoomId).emit('silent', state);
            });
        }

        // 处理聊天消息
        socket.on('message', function (content) {
            console.log(`user ${socket.user.UserId}  message: ${content.content}`);
            if (socket.live) {
                Live.getStatusById(socket.live.id).then(function (status) {
                    //校验
                    if (status == true) {
                        return error('Live已经结束');
                    }
                    if (socket.user.role == 'lookuser') {
                        return error('只能围观');
                    }
                    if (content.type < 1 || content.type > 3) {
                        return error('非法type');
                    }
                    if (socket.user.roleId != 1 && content.type >= 2) {
                        return error('消息类型不符');
                    }
                    if (content.content.length > 1000 || content.content.length <= 0) {
                        return error('字数限制');
                    }
                    Auth.check(socket.user, socket.live, function (err, state) {
                        if (err) {
                            return error(err);
                        }

                        if (state) {
                            var datetime = moment().format('YYYY-MM-DD HH:mm:ss');
                            Live.logLive(socket.user, socket.live, content.type, socket.user.roleId, content.content, datetime, function (err, id) {
                                if (err) throw err;
                                im.to(roomId).emit('message', {id: id.insertId, type: content.type, content: content.content, key: content.key, user: socket.user, datetime: datetime});
                            });
                        } else {
                            socket.emit('notify', {id:'banmessage', message: '您已被禁言'});
                        }
                    });
                });
            }
        });

        // 处理禁言
        socket.on('ban', function (userId) {
            Auth.ban(userId, socket.live, socket.user, function (err, result) {
                if (err) {
                    console.log(err);
                    return error(err);
                }

                if (result == 1) {
                    im.to(managerRoomId).emit('ban', [userId]);
                    im.to(roomId).emit('notify', {id: 'ban', userId: userId, message: '用户“' + userId + '”已被“' +
                    socket.user.NickName + '（' + socket.user.roleName + '）”禁言'});
                }
            });
        });

        // 处理解禁
        socket.on('release', function (releaseId) {
            Auth.release(socket.user, releaseId, socket.live, function (err, result) {
                if (err) {
                    return error(err);
                }

                if (result) {
                    im.to(roomId).emit('release', {id:'release', userId:releaseId});
                    im.to(roomId).emit('notify', {id:'release', userId:releaseId, message: '您已被解禁'});
                }
            });
        });

        // 处理全员禁言
        socket.on('silent', function (state) {
            if (socket.user.roleId != 1 && socket.user.roleId != 2) {
                return socket.emit('notify', {message: '您没有权限禁言'});
            }

            Live.silent(socket.live, state, function (err, result) {
                if (err) {
                    return error(err);
                }

                im.to(managerRoomId).emit('silent', state);
                im.to(roomId).emit('notify', {message: state ? '全员禁言开启' : '全员禁言解除'});
            });
        });
    }).catch(function (err) {
        error(err);
    });
});
