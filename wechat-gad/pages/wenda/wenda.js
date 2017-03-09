var app = getApp();
var config = require('../../config.js');
Page({
    data:{
        list:[{"title":"Legacy Metrics Assistant","customer":[{"name":"Huels","attavr":"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0"},{"name":"Harvey","attavr":"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0"},{"name":"Konopelski","attavr":"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0"}],"time":"2017-03-2 18:00:00"},{"title":"Direct Mobility Producer","customer":[{"name":"Nicolas","attavr":"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0"},{"name":"Reilly","attavr":"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0"},{"name":"Roberts","attavr":"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0"}],"time":"2017-03-2 18:00:00"},{"title":"Forward Accounts Planner","customer":[{"name":"Walker","attavr":"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0"}],"time":"2017-03-2 18:00:00"},{"title":"International Web Assistant","customer":[{"name":"Ondricka","attavr":"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0"},{"name":"Kris","attavr":"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0"},{"name":"Beatty","attavr":"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0"},{"name":"Connelly","attavr":"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0"}],"time":"2017-03-2 18:00:00"}]
        ,page : 0
    },
    onLoad:function () {
        this.requestData();
    },
    requestData:function () {
        console.log('call request');
        var that = this;
       setTimeout(function () {
           wx.request({
               url:config.host + '/live/list?page='+ that.data.page,
               success:function (res) {
                 var list =  [];
                 if(that.data.page == 0){
                     list = packData(res.data);
                 }else{
                     list = that.data.list.concat(packData(res.data));
                 }
                   that.setData({
                       list:  list,
                       page: that.data.page + 1
                   });
                 app.globalData.liveList = list;
               }
           });
       },500);
    },
    toDetail:function (e) {
        var url = '../wenda-detail/wenda-detail?id='+e.currentTarget.dataset.liveid;
        console.log(url);
        wx.navigateTo({
            url: url
        })
    }
})

function packData(data) {
    //时间判断
    var newData = [];
    var nowTime = new Date().getTime();
    for(var i = 0 , length = data.length ; i < length ; i++){
        var time = new Date(Date.parse(data[i].time.replace(/-/g,'/'))).getTime();
       var temp = Object.assign({},data[i],{liveStatus:formateTime(time,nowTime)});
       newData.push(temp);
    }
    return newData.sort(timeSort);
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

function timeSort(a1,a2) {
    var
        a1Time = new Date(Date.parse(a1.time.replace(/-/g,'/'))).getTime()
        ,a2Time = new Date(Date.parse(a2.time.replace(/-/g,'/'))).getTime()
    ;
    return a1Time < a2Time;
}