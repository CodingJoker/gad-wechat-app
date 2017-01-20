/**
* @Date:   2017-01-17
* @Email:  550928460@qq.com
* @Last modified time: 2017-01-17
*/
var app = getApp();

Page({
  data:{
    userInfo:{}
  },
  onLoad:function(){
    var _this = this;
    console.log(app.globalData.userInfo);
  }
})
