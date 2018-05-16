const request = require('superagent');
const cheerio = require('cheerio');
const eventproxy = require('eventproxy')
const {MongoClient}=require('mongodb');

const fs = require("fs");
var ep = new eventproxy();

const BASE_URL = "http://www.poi86.com";
const CITY_URL = "/poi/amap/city/430100.html";

var distinct_urls = [];
var item_urls = [];

const response = request.get(BASE_URL+CITY_URL);
const db_url = 'mongodb://localhost:27017/';
// Database Name
const db_name = 'poi';
const collection_name  = "changsha";

async function main(){
    let client;
    try{
    client = await MongoClient.connect(db_url);    
    const db = client.db(dbName);
    const collection = db.collection(collection_name);
    }catch(err){
        console.log(err.stack);
    }

    
    if(client){
        client.close();
    }
}


request.get(BASE_URL+CITY_URL)
    .then(res=>{
        if(res.err) throw err;
        let $ = cheerio.load(res.text);
        $(".list-group-item a").each(function(i,elem){
            //存城市各个地区的URL
            distinct_urls[i]=BASE_URL+$(this).attr("href");
        });        
        // 使用 ep 控制爬取各个区域URL的并发
        ep.after('item_url',distinct_urls.length,function(){
            fs.writeFile("item_urls.json",JSON.stringify({data:item_urls}),function(err){
                if(err){
                    console.log(err);
                    throw err;
                }
                console.log('地点URL写入完成');
            })
        })

        distinct_urls.map(url=>{
            // 处理
            request.get(url)
                .then(res=>{
                    if(res.err) throw res.err;
                    var $ = cheerio.load(res.text);
                    var pageCount = $(".pagination li a").slice(-1).text().split('/')[1];//获取分页
                    $("table tr td a").slice(1).each(function(i,elem){
                        item_urls.push($(this).attr("href"));
                    }); 
                    ep.emit('item_url', []);
                })
        })

        fs.writeFile("data.json",JSON.stringify({data:distinct_urls}),function(err){
            if(err){
                console.log(err);
                throw err;
            }
            console.log('写入完成');
        })
    })
    

