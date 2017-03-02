/**
* @Date:   2017-01-17
* @Email:  550928460@qq.com
* @Last modified time: 2017-01-19
*/
var app = getApp();
Page({
  data:{
  },
  onLoad:function(){
    console.log('video');
    var videos = [{
      src:'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400',
      title:'One Piece',
      autoPlay:true,
      coverHidden:true
    },{
      src:'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400',
      title:'One Piece 2',
      autoPlay:false,
      coverHidden:false
    },{
      src:'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400',
      title:'One Piece 3',
      autoPlay:false,
      coverHidden:false
    }]
    this.setData({
      'videos': videos
    })
  },
  onReady:function(){
      this.nowPlayVideo = 0;
  },
  switchVideo:function(id){
      if(id == this.nowPlayVideo){
        var nowVideo = wx.createVideoContext('video'+id);
        this.data.videos[id].coverHidden = true;
        this.setData({
          videos:this.data.videos
        })
        nowVideo.play();
        return;
      }
      var preVideo = wx.createVideoContext('video'+this.nowPlayVideo);
      preVideo.pause();
      //取消现在播放视频遮罩
      var nowVideo = wx.createVideoContext('video'+id);
      nowVideo.play();
      this.nowPlayVideo = id;
  },
  playVideo:function(e){
    var id = e.target.dataset.id;
    var
      preVideoId = this.nowPlayVideo
    ;
    this.data.videos[preVideoId].coverHidden = false;
    this.data.videos[id].coverHidden = true;
    this.setData({
      videos:this.data.videos
    })
    this.switchVideo(id);

    return;

  },
  touchMoveHandler:function(){

  },
  videoPlayHandler:function(e){
      var id = e.target.dataset.index;
      this.switchVideo(id);
  },
  videoPauseHandler:function(e){
    console.log('call');
    var id = e.target.dataset.index;
    this.data.videos[id].coverHidden = false;
    this.setData({
      videos:this.data.videos
    })
  }
})
