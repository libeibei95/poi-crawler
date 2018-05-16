const Rx = require('rxjs/Rx');
const request = require('superagent');
const cheerio = require('cheerio');

var urls = ['http://www.poi86.com/poi/amap/district/430103/1.html',
    'http://www.poi86.com/poi/amap/district/430181/1.html']

// var urls_observer = Rx.Observable.from(urls);
// var highOrder = urls_observer.map(url=>Rx.Observable.interval(1000).take(3));
// var firstOrder = highOrder.mergeAll();
// firstOrder.subscribe(x=>console.log(x));
const base_url = "http://www.poi86.com";


var crawler = Rx.Observable.from(urls).flatMap(url => request.get(url));
var timer = Rx.Observable.interval(1000);
var item_urls=[];
Rx.Observable.zip(crawler, timer).map(([c, t]) => c).subscribe(
    x=>{
        if(x.err) return err;
        var $ = cheerio.load(x.text);
        console.log(x.request.url);
        $("table tr td a").slice(1).each(function(i,elem){
            item_urls.push(base_url+$(this).attr("href"));
        }); 
    },
    err=>console.log("err"+err),
    complete=>{
        console.log(item_urls.length);
    }
);

