
const Rx = require('rxjs/Rx');
const request = require('superagent');
const cheerio = require('cheerio');

var urls=['http://www.poi86.com/poi/6118808.html'];

// var urls_observer = Rx.Observable.from(urls);
// var highOrder = urls_observer.map(url=>Rx.Observable.interval(1000).take(3));
// var firstOrder = highOrder.mergeAll();
// firstOrder.subscribe(x=>console.log(x));


var crawler = Rx.Observable.from(urls).flatMap(url => request.get(url));
var timer = Rx.Observable.interval(1000);
Rx.Observable.zip(crawler, timer).map(([c, t]) => c).subscribe(
    x=>{
        if(x.err) return err;
        var $ = cheerio.load(x.text);
        var labels = [];
        var values = [];
        var node = $(".list-group .list-group-item");        
        var columns =$(".list-group .list-group-item span").text().split(':');
        
        var indexs = columns.map(c=>node.text().indexOf(c)); 
        var contents =[];
        for(var i=0;i<indexs.length-2;i++){
            contents.push(node.text().slice(indexs[i],indexs[i+1]));
        }
        contents.push(node.text().slice(indexs[indexs.length-2]));
        console.log(contents);

        // $(".list-group .list-group-item").map(item=>{
        //     console.log($(this).parent().hasClass('list-group'));
        //     console.log($(this).siblings().length);
        // })
    },
    err=>console.log("err"+err),
    complete=>{
        console.log("done");
    }
);

