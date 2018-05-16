const request = require('superagent');
const cheerio = require('cheerio');
const eventproxy = require('eventproxy')

const fs = require("fs");
var ep = new eventproxy();

const baseUrl = "http://www.poi86.com";
const cityUrl = "/poi/amap/city/430100.html";

var distinctUrls = [];
var itemUrls = [];

const response = request.get(baseUrl+cityUrl);

async function main(){
    
}x


request.get(baseUrl+cityUrl)
    .then(res=>{
        if(res.err) throw err;
        let $ = cheerio.load(res.text);
        $(".list-group-item a").each(function(i,elem){
            //存城市各个地区的URL
            distinctUrls[i]=baseUrl+$(this).attr("href");
        });        
        // 使用 ep 控制爬取各个区域URL的并发
        ep.after('item_url',distinctUrls.length,function(){
            fs.writeFile("item_urls.json",JSON.stringify({data:itemUrls}),function(err){
                if(err){
                    console.log(err);
                    throw err;
                }
                console.log('地点URL写入完成');
            })
        })

        distinctUrls.map(url=>{
            // 处理
            request.get(url)
                .then(res=>{
                    if(res.err) throw res.err;
                    var $ = cheerio.load(res.text);
                    var pageCount = $(".pagination li a").slice(-1).text().split('/')[1];//获取分页
                    $("table tr td a").slice(1).each(function(i,elem){
                        itemUrls.push($(this).attr("href"));
                    }); 
                    ep.emit('item_url', []);
                })
        })

        fs.writeFile("data.json",JSON.stringify({data:distinctUrls}),function(err){
            if(err){
                console.log(err);
                throw err;
            }
            console.log('写入完成');
        })
    })
    

