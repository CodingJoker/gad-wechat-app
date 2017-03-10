
 /*
* @Author: jumorzhu@tecent.com
* @Last Modified by:   jumorzhu
* @Created time: 2017-03-03 10:11
*/

var liveList = require('./live/list');
var liveDetail = require('./live/detail');
var liveChatRoom = require('./live/chatroom');

 module.exports = function(imitator) {
     // 返回一个json
     imitator('/json', {name: 'hello world'});
     imitator('/live/list', liveList());
     imitator('/live/detail/', liveDetail());
     imitator('/live/chatroom/',liveChatRoom());
 }
