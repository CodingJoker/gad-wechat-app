var app = getApp();
Page({
    onLoad:function () {
        console.log("开始连接");
        wx.connectSocket({
            url: 'ws://10.123.6.71:3001',
            header:{
                'content-type': 'application/octet-stream'
            },
            method:"GET",
            success:function (data) {
                console.log('连接成功！');
                console.log(data)
            },
            fail:function (err) {
                console.log('连接失败！草');
                console.log(err);
            },
            complete:function (msg) {
                console.log('函数完成!')
            }
        });
        wx.onSocketOpen(function(res) {
            console.log('WebSocket连接已打开！');
            wx.sendSocketMessage({
                data:'Hello from client!'
            });
        });
        wx.onSocketError(function(res){
            console.log('WebSocket连接打开失败，请检查！')
        })
        wx.onSocketMessage(function(res) {
            console.log('收到服务器内容：');
            console.table(res);
        })
    }
})