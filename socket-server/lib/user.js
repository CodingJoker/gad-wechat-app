var debug = require('debug')('app');
var moment = require('moment');
var Promise = require('bluebird');

var db = require('./db');

exports.getById = function (id) {
    return new Promise(function (resolve, reject) {
        var mysql = db.getMysql();
        mysql.query('SELECT UserId,NickName,Avatar FROM `User` WHERE UserId=?', [id], function (err, result) {
            if (err) {
                return reject(err);
            }

            if (result && result[0]) {
                var user = result[0];
                user.Avatar = user.Avatar ? user.Avatar : 'http://gad.qpic.cn/assets/forum/img/profile2.jpg';
                if (user.Avatar[0] == '/') {
                    user.Avatar = 'http://gad.qq.com' + user.Avatar;
                }

                return resolve(user);
            }

            return reject(new Error('用户不存在'));
        });
    });
};

exports.getUserRole = function (user, live) {
    return new Promise(function (resolve, reject) {
        getLiveRole(user, live).then(function (roleName) {

            if(roleName == 'no'){
                getRole(user).then(function (role) {
                    if (~role.indexOf(2)) {
                        resolve('system');
                    } else {
                        reject(roleName);
                    }
                }, function (err) {
                        reject(err);
                });
            } else {
              resolve(roleName);
            }
        }, function (err) {
            reject(err);
        });
    });
};

var getRole = exports.getRole = function (user) {
    return new Promise(function (resolve, reject) {
        var mysql = db.getMysql();
        mysql.query('SELECT roleId FROM `User_Role` WHERE `userId`=? AND rowStatus=1', [user.UserId], function (err, rows) {
            if (err) {
                return reject(err);
            }

            var role = [];
            rows.forEach(function (_role) {
              if(_role && _role.roleId){
                role.push(_role.roleId);
              }
            });
            resolve(role);
        });
    });
};

var getLiveRole = exports.getLiveRole = function (user, live) {
    function getRoleType(user, live) {
        return new Promise(function (resolve, reject) {
            var mysql = db.getMysql();
            mysql.query('SELECT * FROM `live_signs` WHERE `live_id`=? AND `user_id`=?', [live.id,user.UserId], function (err, rows) {
                if (err) {
                    return reject(err);
                }

                if (rows && rows[0]) {
                    return resolve(rows[0]);
                }

                resolve({'type':-1});
            });
        });
    }

    function isTeacher(user, live) {
        return new Promise(function (resolve, reject) {
            var mysql = db.getMysql();
            mysql.query('SELECT id FROM `live_signs` WHERE `live_id`=? AND user_id=?', [live.id, user.UserId], function (err, rows) {
                if (err) {
                    return reject(err);
                }

                resolve(rows.length > 0);
            });
        });
    }

    return new Promise(function (resolve, reject) {
        getRoleType(user, live).then(function (role) {
            if(role['type'] == -1){
                return resolve('no');
            }
            //嘉宾
            if (role['type'] == 1) {
                user.NickName = role['nickname'];
                user.Avatar = role['avatar'];
                console.log('avatar', user);
                return resolve('teacher');
            }
            //管理员
            if (role['type'] == 2) {
                return resolve('admin');
            }
            //普通
            if (role['type'] == 3) {
                return resolve('user');
            } else {
                return resolve('lookuser');
            }
              //Promise.all([isTeacher(user,live)]).then(function (_isTeacher) {
                  //if (_isTeacher) {
                  //    return resolve('lookuser');
                  //}
                  //return resolve('user');
              //});
            reject(new Error('没有权限'));
        }, function (err) {
            reject(err);
        });
    });
};
