const Rx = require('rxjs/Rx');
const request = require('superagent');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');
const assert = require('assert');
const fs = require("fs-extra")

const db_url = 'mongodb://localhost:27017/';
// Database Name
const db_name = 'poi';
const collection_name = "amap_location_poi";

const max_count_items = 1000 // 最多能查询到1000条记录
const baseurl = "http://restapi.amap.com/v3/place/around?"
const params = {
    "key": "1671a9ac7bd0a4ea83aa392dabb038b4",
    "location": "116.481488,39.990464",
    "offset": 50,
    "radius": 2000,
    "extensions": 'all'
}

function concatUrl() {
    let count_page = Math.ceil(max_count_items / params.offset)
    let url = baseurl
    let urls = []
    for (const [k, v] of Object.entries(params)) {
        url = `${url}${k}=${v}&`
    }
    for (let i = 1; i <= count_page; i++) {
        urls.push(`${url}page=${i}`)
    }
    return urls
}
async function getData(obj) {
    let res = await request(obj.url)
    res.id = obj.id;
    return res
}
async function main() {

    let count_page = Math.ceil(max_count_items / params.offset)
    let client, db, collection;
    try {
        client = await MongoClient.connect(db_url);
        db = client.db(db_name);
        collection = db.collection(collection_name);
    } catch (err) {
        console.log(err.stack);
    }

    /**
     * 从 csv 中读取影吧 location 信息
     */
    let bar_location_array

    try {
        let data = await fs.readFile('./bar_location.csv', 'utf8')
        let arr = data.split('\r\n').slice(0, -1)
        bar_location_array = arr.map(ele => {
            let arr = ele.split(',')
            return {
                "id": arr[0],
                "lng": arr[1],
                "lat": arr[2]
            }
        })
    } catch (err) {
        return console.log(err)
    }

    /**
     * 以下开始拼接字符串，抓取数据
     */
    //控制流量的计时器
    let timer$ = Rx.Observable.interval(200)

    // location拼接
    let location$ = Rx.Observable.from(bar_location_array)
        .map(ele => ({ 'id': `${ele.id}`, 'location': `location=${ele.lng},${ele.lat}` }))

    //url 拼接，获得最终的 url
    let urls$ = location$.map(ele => {
        let url = baseurl
        for (const [k, v] of Object.entries(params)) {
            url = `${url}${k}=${v}&`
        }
        return { 'id': ele.id, 'url': `${url}${ele.location}&` }
    })
        .flatMap(obj => {
            let urls = []
            for (let i = 1; i <= count_page; i++) {
                urls.push({ 'id': obj.id, 'url': `${obj.url}page=${i}` })
            }
            return urls
        })

    // //限制流量，并开始抓取数据
    urls$.zip(timer$)
        .map(([c, t]) => c)
        .flatMap(obj => getData(obj))
        .flatMap(obj => {
            let res = obj
            if (res.err) return res.err
            let json = JSON.parse(res.text)
            let pois_arr = Array.from(json.pois)
            for (poi of pois_arr) {
                poi["bar_id"] = obj.id
            }
            return pois_arr
        })
        .subscribe(x => {
            //todo
            //写入mongodb数据库
            collection.insert(x);
        },err=>{console.log(err)})



}

main()