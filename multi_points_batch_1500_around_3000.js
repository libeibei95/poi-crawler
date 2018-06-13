/**
 * 本文件批量处理多个location 周围的POI
 */
const Rx = require('rxjs/Rx');
const request = require('superagent');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');
const assert = require('assert');
const fs = require("fs-extra")

const locations = require("./origin_data/sample_location.js")
const r = 6371;//地球半径千米  
const dis = 3;//2千米距离  

const db_url = 'mongodb://localhost:27017/';
// Database Name
const db_name = 'poi';
const collection_name = "multi_points_1500_around_3000";



const max_count_items = 900 // 最多能查询到1000条记录
const baseurl = "http://restapi.amap.com/v3/place/around?"
const params = {
    "key": "7991b152e64b99109eccc3a5be35e75e",
    "offset": 50,
    "radius": 3000,
    "extensions": 'base'
}
/**
 * 
 * @param {*} dis 
 * @param {object:lng,lat} point 
 */
function getPoints(point) {

    let lat = parseFloat(point.lat)
    let lng = parseFloat(point.lng)

    //计算经度 delta
    let dlng = 2 * Math.asin(Math.sin(dis / (2 * r)) / Math.cos(lat * Math.PI / 180));
    dlng = dlng * 180 / Math.PI;//角度转为弧度  

    //计算纬度 delta
    let dlat = dis / r;
    dlat = dlat * 180 / Math.PI;

    return {
        base: { lng: lng, lat: lat },
        up: { lng: lng, lat: lat + dlat },
        down: { lng: lng, lat: lat - dlat },
        left: { lng: lng - dlng, lat: lat + dlat },
        right: { lng: lng + dlng, lat: lat + dlat },
        right_up: { lng: lng + dlng, lat: lat + dlat },
        left_up: { lng: lng - dlng, lat: lat + dlat },
        right_down: { lng: lng + dlng, lat: lat - dlat },
        left_down: { lng: lng - dlng, lat: lat - dlat }
    }
}

function concatUrl(around_points) {
    let count_page = Math.ceil(max_count_items / params.offset)
    let url = baseurl
    let urls = []
    for (const [k, v] of Object.entries(params)) {
        url = `${url}${k}=${v}&`
    }
    for (let i = 1; i <= count_page; i++) {
        for (a in around_points) {
            urls.push(`${url}page=${i}&location=${around_points[a].lat},${around_points[a].lng}`)
        }
    }
    return urls
}

async function main() {
    // locations.map(d=>console.log(d))

    // let client, db, collection;
    // try {
    //     client = await MongoClient.connect(db_url);
    //     db = client.db(db_name);
    //     collection = db.collection(collection_name);
    // } catch (err) {
    //     console.log(err.stack);
    // }

    let location = locations[0]

    for (location of locations) {
        console.log(location)

        let bar_id = location.bar_id
        // 文件名命名规范：{around/base}_{bar_id}_{distance of two points}_{radius}_{offset(可选)}
        let filename = `./result/batch_around_${bar_id}_3000_3000.js`

        let around_points = getPoints(location)
        let urls = concatUrl(around_points)
        console.log(`${bar_id}共有url个数为：${urls.length}`)
        let timer$ = Rx.Observable.interval(200)

        Rx.Observable.from(urls)
            .zip(timer$)
            .map(([c, t]) => c)
            .flatMap(url =>
                Rx.Observable.of(url)
                    .flatMap(url => request.get(url))
                    .retry(3)
            )
            .flatMap(obj => {
                let res = obj
                if (res.err) return res.err
                let json = JSON.parse(res.text)
                return Array.from(json.pois)
            })
            .map(poi => {
                poi["bar_id"] = bar_id
                return poi
            })
            .toArray()
            .subscribe(res => {
                console.log(res.length)
                console.log("**************************")
                let data = `module.exports = ${JSON.stringify(res)}`
                fs.writeFile(filename, data, 'utf8')
            })
    }
}
main()