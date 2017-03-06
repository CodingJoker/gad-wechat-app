
 /*
* @Author: jumorzhu@tecent.com
* @Last Modified by:   jumorzhu
* @Created time: 2017-03-06 15:15
*/
 var faker = require('faker');

 module.exports = function () {
     var d = new Date()
         ,date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
         ,nowHours = d.getHours()
         ,timeContainer = [
             d.getHours(d.setHours(nowHours + 3)),
             d.getHours(d.setHours(nowHours)),
             d.getHours(d.setHours(nowHours - 3)),
         ]
         ;
     var data = {
             title: faker.name.title(),
             customer: (function () {
                 var
                     nameLength = Math.floor(Math.random() * 5 + 1)
                     , customers = []
                     ;

                 for (var i = 0; i < nameLength; i++) {
                     var name = {
                         name: faker.name.lastName(),
                         attavr: 'http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0',
                         desc:'我是 Suji Yan ；程序员 & 独立记者，日本スジテク（ Suji Tech ）的社长 & CEO。本科就读于美国 CS/ECE Top5 的 University ofIllinois Urbana-Champaign ，期间通过 USTEP 项目前往日本东京大学就读。在日本期间除了深入福岛核电站进行新闻采访之外，还采访、观察了许多日本互联网公司和独特的现象，选择在日本开互联网公司。对同一领域内的产品，我会结合中国和美国的情况，聊聊日本现有的产品和市场缺口；本次 Live 同时也会介绍一下在日本设立公司和开展业务需要注意的法律问题和岛核电站进行新闻采访之外，还采访、观察了许多日本互联网公司和独特的现象，选择在日本开互联网公司。对同一领域内的产品，我会结合中国和美国的'
                     };
                     customers.push(name);
                 }

                 return customers;

             })(),
             time: date + ' ' + timeContainer[Math.floor(Math.random() * 3)] + ':00:00',
             liveDesc:'我是 Suji Yan ；程序员 & 独立记者，日本スジテク（ Suji Tech ）的社长 & CEO。本科就读于美国 CS/ECE Top5 的 University ofIllinois Urbana-Champaign ，期间通过 USTEP 项目前往日本东京大学就读。在日本期间除了深入福岛核电站进行新闻采访之外，还采访、观察了许多日本互联网公司和独特的现象，选择在日本开互联网公司。对同一领域内的产品，我会结合中国和美国的情况，聊聊日本现有的产品和市场缺口；本次 Live 同时也会介绍一下在日本设立公司和开展业务需要注意的法律问题和岛核电站进行新闻采访之外，还采访、观察了许多日本互联网公司和独特的现象，选择在日本开互联网公司。对同一领域内的产品，我会结合中国和美国的',
             price:20,
             hasBuy:false
     };
     return data;
 }