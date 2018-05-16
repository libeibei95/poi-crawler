const Rx = require('rxjs/Rx');
const request = require('superagent');
const cheerio = require('cheerio');

const base_url = "http://www.poi86.com";
const city_url = "/poi/amap/city/430100.html";

var timer$ = Rx.Observable.interval(1000);

var distinct_url_stream$ = Rx.Observable.fromPromise(request.get(base_url+city_url))
        .flatMap(x=>{
            var arr_urls=[];
            if(x.err) return err;
            var $ = cheerio.load(x.text);
            $(".list-group-item a").slice(1).each(function(i,elem){
                arr_urls.push(base_url+$(this).attr("href"));
            }); 
            return arr_urls;
        })
        .flatMap(url=>{
            return request.get(url);
        })
        .map((res)=>{            
            if(res.err) throw res.err;
            var $ = cheerio.load(res.text);
            var pageCount = $(".pagination li a").slice(-1).text().split('/')[1];//获取分页
            return {pageCount:pageCount,url:res.request.url};
        })
        .flatMap(({pageCount,url})=>{
            console.log(pageCount);
            console.log(url);
            var url_prefix = url.split('/').slice(0,-1).join('/');
            var urls=[];
            for(let i=1;i<=pageCount;i++){
                urls.push(url_prefix+'/'+pageCount+'.html');
            }
            return urls;
        })
        .flatMap(url=>request.get(url));

var item_url_stream$ = Rx.Observable.zip(distinct_url_stream$,timer$)
        .map(([c, t]) => c)
        .flatMap(res=>{
            if(res.err) return res.err;
            var $ = cheerio.load(res.text);
            var urls = [];
            $("table tr td a").slice(1).each(function(i,elem){
                urls.push($(this).attr("href"));
            }); 
            return urls;
        })
        .flatMap(url=>request.get(url));

Rx.Observable.zip(item_url_stream$,timer$)
        .map(([c,t])=>c)
        .map(res=>{
            if(res.err) return res.err;
            var $ = cheerio.load(res.text);
            
        })
        .subscribe(x=>console.log(x));
