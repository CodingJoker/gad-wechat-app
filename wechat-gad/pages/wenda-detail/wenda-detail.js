var app =  getApp();
var config = require('../../config');
Page({
    onLoad: function(option){
        var topic;
        if(app.globalData.liveList){
            topic = app.globalData.liveList.filter(function (item) {
                return item.liveId == option.id;
            });
        }

        if(topic){
            topic = topic[0];
            this.setData({
                topic:topic
            });
        }
        else
            topic = this.requestData(option.id);
    },
    data:{
      topic:{}
    },
    requestData:function (id) {
        var that = this;
        wx.request({
            url:config.host+ '/live/detail/' + id,
            success:function (res) {
                that.setData({
                    topic:transData(res.data)
                });
            }
        })
    },
    toChatRoom:function () {
        wx.navigateTo({
            url: '../wenda-chatroom/wenda-chatroom?id='+this.data.topic.liveId
        })
    },
    buy:function () {
        wx.navigateTo({
            url: '../wenda-chatroom/wenda-chatroom?id='+this.data.topic.liveId
        })
    }
})

function transData(data) {
    //时间判断
    var newData = [];
    var nowTime = new Date().getTime();
    var time = new Date(Date.parse(data.time.replace(/-/g,'/'))).getTime();
    var temp = Object.assign({},data,{liveStatus:formateTime(time,nowTime)});
    return temp;
}

function formateTime(time,nowTime) {
    //进行中
    if(time < (nowTime - 1000 * 60 * 60 ))
        return -1;

    if(time > (nowTime - 1000 * 60 * 60 ) && time < nowTime)
        return 0;

    var hoursCount = Math.floor((time - nowTime)/(1000*60*60));

    if(hoursCount < 24){
        return  hoursCount + '小时后';
    }

    return  Math.floor(hoursCount / 24) + '天后';
}