var
    app = getApp()
    ,config = require('../../config.js')
    ,Promise = require('../../utils/es6-promise').Promise
    ,chat = require('../../utils/socket.io')
;
function  log(obj) {
    console.log('--------------------------------------------');
    console.log(obj);
    console.log('--------------------------------------------');
};
Page({
    data: {
        liveinfo: null,
        loadStatus: true,  //加载状态
        messageList: [],    //消息数组
        firstId: 0,         //最小id，用于获取消息列表用
        isEnd: false,        //聊天室是否关闭
        isWatching: false,   //是否围观用户
        isLong: false,      //live简介是否过长，需要缩略展示
        isMessageEnd: false,        //消息是否全部拉取完毕
        sendingList: [],     //正在发送中的消息
        userinfo: {
            UserId:151580,
            NickName:'Jumor',
            Avatar:'http://q1.qlogo.cn/g?b=qq&k=mqpGJpegXpKyWkSyMulYHw&s=100',
            type:'1'
        },         //当前用户信息
        isStart: true,
        MESSAGE_LENGTH: 20,       //一次拉取消息的数量
        teachers: [],            //嘉宾信息单独拿出来
        resendindex: -1,         //重新发送消息的索引值
        leftMessageNum: 0,        //剩余消息数量
        sayTime: 0,              //记录最后一次发言时间
        isBan: false,               //是否被禁言
        toView:"msg0" ,    //scroll-view scroll到某个id
        clearUserInput:''
    },
    noRenderData:{
        liveid: 10003,
        nowPlayVideoId:null,
        audioCtxs:{} //缓存audio上下文
    },
    socket:null,
    onLoad: function (option) {
        var that = this;
        console.log("开始连接");
        that.socket = chat('ws://127.0.0.1:8801/live?id='+that.noRenderData.liveid+'&userid=151580');
        that.socket.on('connect', function() {
            log('connected to message server, login...');
            //that.socket.emit('login', that._usercode, 'tako');
        });

        that.socket.on('loginSuccess', function() {
            log('loginSuccess');
        });
        that.socket.on('error', function(err) {
            log('error to connect message server');
        });
        that.socket.on('disconnect', function() {
            info('Disconnected');
        });
        that.socket.on('message', function(msg) {
            console.log('Socket msg:')
            log(msg);
            var newmsg = {
                    'id': msg.id,
                    'type': msg.type,
                    'detail':msg.content,
                    'username':msg.user.NickName,
                    'user_pic':msg.user.Avatar,
                    'live_id':that.noRenderData.liveid,
                    'user_id':msg.user.UserId,
                    'created_at':msg.datetime,
                    'updated_at':msg.datetime,
                    'role_type':msg.user.roleId,
                    'like_count':0,
                    'is_liked':false
                };
            console.log('Processed msg:')
            log(newmsg);

            that.setMessageStatus(msg.key , 'success' , newmsg);

            that.jumpToMessage('bottom');
        });
        that.socket.on('notify', function(msg) {
            console.info('notify event');
            log(msg);
            if(msg.id && (msg.id == "banmessage")){
                wx.showToast({
                    title: '您已被管理员禁言，现在无法发送信息',
                    icon: 'success',
                    duration: 3000 ,
                    success:function () {
                        setTimeout(function () {
                            wx.hideToast();
                        },1000)
                    }
                })
            }
            if(msg.id && (msg.id == "ban")){
                // if(msg.userId == livechatroom.userinfo.UserId){
                //     livechatroom.isBan = true;
                // }
            }
            if(msg.id && (msg.id == "release")){
                // if(msg.userId == livechatroom.userinfo.UserId){
                //     livechatroom.isBan = false;
                // }
            }
        });
        that.socket.on('baned', function(flag) {
            log(`Banned speak : ${!flag}`);
            // livechatroom.isBan = !flag;
        });
    },
    onReady:function () {
        //加载数据 页面跳转到最新数据
        var that = this;
        that.getHistoryMessage().then(that.jumpToMessage,function (err) {
            console.log(err);
        });
    },
    onUnload:function () {
        wx.onSocketOpen(function() {
            wx.closeSocket()
        })
    },
    getHistoryMessage: function () {
        var that = this;
        var promise = new Promise((resolve,reject)=>{
            if (this.isMessageEnd){
                reject('No more Message!');
                return promise;
            }
            that.setData({
                loadStatus:false
            });
            wx.request({
                url: config.host + "/live/chatroom/" + this.noRenderData.liveid,
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
    jumpToMessage:function (where) {
        var msgid =  where == 'top' ? this.data.messageList.length : 1;
        this.setData({
            toView: 'msg' + msgid
        });
    },
    moreMessage: function () {
        var that = this;
        that.getHistoryMessage().then(function (msg) {
            that.jumpToMessage('top');
            console.log(`Loadstatus: ${that.data.loadStatus}`);
        },function (err) {
            console.log(err);
        });
    },
    toggleVoice:function (e) {
        var
            playId = e.currentTarget.dataset.id
            ,that = this
            ,audioCtxs = that.noRenderData.audioCtxs
            ,audioCtx
        ;
        console.log(`Id:${playId} wants to trigger toggleVoice()`);

        //如果现在正在播放且点击的语音不是当前语音则暂停当前正在播放的语音
        if(that.noRenderData.nowPlayVideoId && playId != that.noRenderData.nowPlayVideoId){
            console.log(`NowPlay:${that.noRenderData.nowPlayVideoId} pause`);
            audioCtxs['audio' + that.noRenderData.nowPlayVideoId].pause();
        }

        //缓存audio上下文环境
        if(audioCtxs['audio' + playId]){
            audioCtx = audioCtxs['audio' + playId];
        }else{
            var audioKey = 'audio' + playId;
            audioCtx = wx.createAudioContext(audioKey);
            audioCtxs[audioKey] = audioCtx;
        }

        if(playId == that.noRenderData.nowPlayVideoId){
           audioCtx.seek(0);
           return;
        }

        audioCtx.play();
        that.noRenderData.nowPlayVideoId = playId;
    },
    like:function (e) {
        console.log('Like Tap');
        var index = e.target.dataset.index;
        var temp = this.data.messageList;
        temp[index]['is_liked'] = !temp[index]['is_liked'];
        this.setData({
            messageList:temp
        });

    },
    sendMessage:function (e) {
        if(e.detail.value == '')
            return;
        var that = this;
        var contentObj = {
            'content': e.detail.value,
            'key': new Date().getTime() + "gad" + parseInt(Math.random()*10000),
            'type': 1
        };

        //发送消息，设置消息传输初始状态
        that.socket.emit('message', contentObj);
        var tempSendingList = that.data.sendingList;
        tempSendingList.push(contentObj);



        var tempMessageList = this.data.messageList

        var newmsg = {
            'id': 0,
            'type': 1,
            'detail':e.detail.value,
            'username':that.data.userinfo.NickName,
            'user_pic':that.data.userinfo.Avatar,
            'live_id':that.noRenderData.liveid,
            'user_id':that.data.userinfo.UserId,
            //'created_at':msg.datetime,
            //'updated_at':msg.datetime,
            'role_type':that.data.userinfo.type,
            'like_count':0,
            'is_liked':false,
            'key': contentObj.key,
            'sendingStatus': 'sending',// sending 发送中、 success 发送成功、 fail 发送失败
            'is_fail':false
        };

        tempMessageList.push(newmsg);

        //统一更新数据 && 清除用户输入
        that.setData({
            clearUserInput:"",
            messageList:tempMessageList,
            sendingList:tempSendingList
        });

        //跳到底部
        that.jumpToMessage('bottom');
    },
    setMessageStatus:function (key,status,msg) {
            var
                that = this
                ,tempMessageList = that.data.messageList
                ,tempSendingList = that.data.sendingList
                ,isSelfInput = tempSendingList.filter(function (msg) {return msg.key == key})[0] //取
            ;

            if(!isSelfInput){
                tempMessageList.push(msg);
                that.setData({
                    messageList:tempMessageList
                });
                return;
            }

            //删除正在发送的消息列表中的消息
            tempSendingList.splice(tempSendingList.indexOf(isSelfInput),1);

            //设置messageList中消息的相关状态
            if(status == 'success'){
                var selfMsg = tempMessageList.filter(function (msg) { return msg.key == key})[0];

                selfMsg.id = msg.id;
                selfMsg.created_at = msg.created_at;
                selfMsg.sendingStatus = 'success';
            }else{
                selfMsg.sendingStatus = 'fail';
            };

            //更新消息
            that.setData({
                messageList:tempMessageList,
                sendingList:tempSendingList
            });
    },


});