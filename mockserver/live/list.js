
 /*
* @Author: jumorzhu@tecent.com
* @Last Modified by:   jumorzhu
* @Created time: 2017-03-03 10:56
*/
var faker = require('faker');

 module.exports = function () {
     var data = []
        ,d = new Date()
        ,date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
        ,nowHours = d.getHours()
        ,timeContainer = [
            d.getHours(d.setHours(nowHours + 3)),
            d.getHours(d.setHours(nowHours)),
            d.getHours(d.setHours(nowHours - 3)),
         ]
     ;
     console.log(timeContainer);

     for(var i = 0 ; i < 4 ; i ++ ){
         var temp = {
             title: faker.name.title(),
             customer: (function () {
                 var
                     nameLength = Math.floor(Math.random() * 5 + 1)
                     , customers = []
                     ;

                 for (var i = 0; i < nameLength; i++) {
                     var name = {
                         name: faker.name.lastName(),
                         attavr: 'http://wx.qlogo.cn/mmopen/vi_32/K3vFfda4OibhtZD8dwOPxp8Wwta3AxIR6Wnq8h8NyIU5icxicdUbmfTUs9J4bm2JS9Ua0CTIEuTwHjuEXoNPNcawQ/0'
                     };
                     customers.push(name);
                 }

                 return customers;

             })(),
             time: date + ' ' + timeContainer[i % 3] + ':00:00',
             liveId:faker.random.number()
         };
         data.push(temp);
     }
     return data;
 }

