var express = require('express');
var router = express.Router();
var WechatAPI = require('wechat-api');
var date = require('date-and-time');

//idou
// var appid = 'wxe930933240166eff';
// var appsecret = 'c0a4593e7df4dbe389f17484c9c5869d';

//ireland8
var appid = 'wx6152a2be5b8d5d66';
var appsecret = '55833021cb21b753aa6aed198249697a';
var api = new WechatAPI(appid, appsecret);

//set urllib's default ttl
api.setOpts({timeout: 20000});

//connect to db
var mongoose = require('mongoose')

//api.ireland8.com not working? cloudflare dns!
mongoose.connect('mongodb://52.17.83.25/ireland8');

//import news model
var News = require('../models/news').News

//update every reboot
updateNews();

//==========add daily task========//
var CronJob = require('cron').CronJob;
function addScheduledTask(time) {
    var job = new CronJob({
        cronTime: time,
        onTick: function () {
            checkUpdates()
        },
        start: false,
        timeZone: 'Europe/Dublin'
    });
    job.start();
}

var time1 = '00 00 12 * * 1-5';
var time2 = '00 00 13 * * 1-5';
var time3 = '00 00 14 * * 1-5';
var time4 = '00 00 16 * * 1-5';

var time5 = '00 00 10 * * 6-7';
var time6 = '00 00 12 * * 6-7';

addScheduledTask(time1)
addScheduledTask(time2)
addScheduledTask(time3)
addScheduledTask(time4)
addScheduledTask(time5)
addScheduledTask(time6)
//==========add daily task========//

//==========check update===========//
function checkUpdates() {
    //today's 0:00
    var gap = new Date(parseInt(new Date().setHours(0, 0, 0, 0))).getTime() / 1000
    console.log("today's midnight " + gap);
    
    //async callback, return the latest timestamp
    News.find({}).sort('-update_time').limit(1).exec(function (err, news) {
        if (!err) {
            var latest_timestamp = JSON.parse(JSON.stringify(news[0])).update_time;
            console.log("the latest timestamp record in db " + latest_timestamp);
            //not updated yet, try again
            if (latest_timestamp - gap < 0) {
                updateNews();
            }
        }
    })


}
//==========check update===========//


//update action, 500 req limit/month
function updateNews() {

    //get 20 news items and store to db
    var count = 20;
    var offset = 0;
    //how many times code get executed
    // Math.ceil(total_count / count)
    api.getMaterials("news", offset, count, function (err, result) {
        console.log('entering api call function body.');
        if (!err) {
            console.log(result)
            var data_json = result
            
            //store news to db
            var item_count = data_json.item_count;
            for (var i = item_count; i--;) {

                var item_length = data_json.item[i].content.news_item.length;

                for (var j = 0; j < item_length; j++) {

                    //Create one
                    var news = new News()

                    //write each attr to db
                    news.title = data_json.item[i].content.news_item[j].title
                    news.author = data_json.item[i].content.news_item[j].author
                    news.digest = data_json.item[i].content.news_item[j].digest
                    news.content_source_url = data_json.item[i].content.news_item[j].content_source_url
                    news.url = data_json.item[i].content.news_item[j].url
                    news.thumb_url = data_json.item[i].content.news_item[j].thumb_url
                    news.update_time = data_json.item[i].update_time

                    news.save(function (err) {
                        if (!err) {
                            console.log('one news record saved!' + news)
                            return news;
                        } else {
                            return console.log(err)
                        }
                    })
                }
            }
        }
        console.log(err);
    });
}



//get request handler
router.get('/news', function (req, res, next) {
    //get news
    getNews(req, res);

    //flag 1
    console.log('entering get function:' + new Date().toLocaleString());
});

//get news
function getNews(req, res) {
    var page = Number(req.param('page'));
    //by default 20 news perpage
    var perpage = 20;
    if (req.param('perpage') != null) {
        perpage = Number(req.param('perpage'));
    }
    var length = 0;

    News.find({}).sort('-update_time').limit(perpage).skip(perpage * page).exec(function (err, news) {
        if (!err) {
            //flag 2
            console.log('done reading from mongodb: ' + new Date().toLocaleString());

            length = news.length;
            console.log("records count: " + length);

            var arr = [];
            //traverse convert
            for (var i = 0; i < length; i++) {
                var json = JSON.parse(JSON.stringify(news[i]))
                var ns = json.update_time;
                var parsed_date = getLocalTime(ns);
                delete json.update_time;
                // console.log(parsed_date)
                json.update_time = parsed_date;
                arr.push(json)
            }

            //allow cross-site access
            res.header("Access-Control-Allow-Origin", "*");

            res.json({ articles: arr })

        } else {
            return console.log(err)
        }
    });
}

  
//date util
function getLocalTime(ns) {
    // return new Date(parseInt(ns) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
    var timestamp = new Date(parseInt(ns) * 1000);
    date.locale('zh-cn');
    return date.format(timestamp, 'YYYY年MMMD日dddd');
}

module.exports = router;