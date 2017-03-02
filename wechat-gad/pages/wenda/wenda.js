var app = getApp();
Page({
    data:{},
    onLoad:function () {
     var list = [{
         title:'这里是标题1',
         customer:[{
             name:'Jumor',
             attavr:"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0",
         },{
             name:'Jumor1',
             attavr:"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0",
         },{
             name:'Jumor2',
             attavr:"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0",
         }],
         time:"2017-03-2 18:00:00"
     },{
         title:'这里是标题2',
         customer:[{
             name:'Shelton',
             attavr:"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0",
         },{
             name:'Shelton',
             attavr:"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0",
         },{
             name:'Jumor2',
             attavr:"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0",
         }],
         time:"2017-02-22 15:00:00"
     },{
         title:'这里是标题3',
         customer:[{
             name:'Shelton',
             attavr:"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0",
         },{
             name:'Shelton',
             attavr:"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0",
         },{
             name:'Jumor2',
             attavr:"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0",
         }],
         time:"2017-03-2 20:00:00"
     },{
         title:'这里是标题4',
         customer:[{
             name:'Shelton',
             attavr:"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0",
         },{
             name:'Shelton',
             attavr:"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0",
         },{
             name:'Jumor2',
             attavr:"http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0",
         }],
         time:"2017-02-22 15:00:00"
     }];

    this.setData({
        'list':  packData(list)
    });
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
    console.log(newData);
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