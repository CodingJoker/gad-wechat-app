/**
* @Date:   2017-01-10
* @Email:  550928460@qq.com
* @Last modified time: 2017-01-19
*/
//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hotPics:[]
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      var hotPics = [] ;
      hotPics.push('http://static.zhidao.manmankan.com/kimages/201601/06_1452045905717124.jpg');
      hotPics.push('http://pic.hanhande.com/files/110111/78_113247_1_lit.jpg');
      hotPics.push('http://s2.buzzhand.net/uploads/bb/5/704762/14325145767359.jpg');
      console.log(hotPics);
      that.setData({
        userInfo:userInfo,
        hotPics:hotPics
      })
    })
  }
})
