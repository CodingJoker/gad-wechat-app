var app = getApp();
var config = require('../../config.js');
var Promise = require('../../utils/es6-promise').Promise;

Page({
    data: {
        liveinfo: null,
        liveid: null,
        loadStatus: true,  //加载状态
        messageList: [],    //消息数组
        firstId: 0,         //最小id，用于获取消息列表用
        isEnd: false,        //聊天室是否关闭
        isWatching: false,   //是否围观用户
        isLong: false,      //live简介是否过长，需要缩略展示
        isMessageEnd: false,        //消息是否全部拉取完毕
        sendingList: [],     //正在发送中的消息
        userinfo: [],         //当前用户信息
        isStart: true,
        MESSAGE_LENGTH: 20,       //一次拉取消息的数量
        teachers: [],            //嘉宾信息单独拿出来
        resendindex: -1,         //重新发送消息的索引值
        leftMessageNum: 0,        //剩余消息数量
        sayTime: 0,              //记录最后一次发言时间
        isBan: false,               //是否被禁言
        toView:"msg0"     //scroll-view scroll到某个id
    },
    onLoad: function (option) {
        console.log("开始连接");
        this.setData({
            liveid: option.id
        });
        this.getNewMessage();

    },
    getNewMessage: function () {
        var that = this;
        var promise = new Promise((resolve,reject)=>{
            if (this.isMessageEnd){
                reject('No more Message!');
                return;
            }
            that.setData({
                loadStatus:false
            });
            wx.request({
                url: config.host + "/live/chatroom/" + this.data.liveid,
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    var resData = res.data;
                    if (resData.code == 0) {
                        var msgList = that.data.messageList;

                        var isMessageEnd = resData.messageList.length < that.data.MESSAGE_LENGTH ? true : false;

                        msgList.unshift(...resData.messageList);


                        that.setData({
                            messageList: msgList,
                            leftMessageNum: resData.total,
                            firstId: resData.messageList[0].id,
                            isMessageEnd: isMessageEnd,
                            loadStatus:true
                        });
                    }
                    resolve('MessageList get!');
                },
                fail:function (err) {
                    reject(err);
                }
            });
        });

        return promise;
    },
    moreMessage: function () {
        var that = this;
        that.getNewMessage().then(function (msg) {
            that.setData({
                toView:'msg' + (that.data.messageList.length),
            })
            console.log(`Loadstatus: ${that.data.loadStatus}`);
        },function (err) {
            console.log(err);
        });
    },
});