const Rx = require('rxjs/Rx');
const request = require('superagent');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');
const assert = require('assert');
const fs = require("fs-extra")

const r = 6371;//地球半径千米  
const dis = 3;//2千米距离  

// const bar_id = 10000052;
// const point = {
//     lng: 102.6984490,
//     lat: 25.0648070
// }

const bar_id = 10000032;
const point = {
    lng: 116.7594770,
    lat: 39.6050480
}
// 文件名命名规范：{around/base}_{bar_id}_{distance of two points}_{radius}_{offset(可选)}
// const filename = "./result/around_10000052_3000_3000.js"
const filename = "./result/around_10000032_3000_3000_20.js"

const max_count_items = 900 // 最多能查询到1000条记录
const baseurl = "http://restapi.amap.com/v3/place/around?"
const params = {
    "key": "efbf6d7744f3e2901e508409cc35cd08",
    "offset": 20,
    "radius": 3000,
    "extensions": 'base'
}
/**
 * 
 * @param {*} dis 
 * @param {object:lng,lat} point 
 */
function getPoints(point) {

    let lat = point.lat

    //计算经度 delta
    let dlng = 2 * Math.asin(Math.sin(dis / (2 * r)) / Math.cos(lat * Math.PI / 180));
    dlng = dlng * 180 / Math.PI;//角度转为弧度  

    //计算纬度 delta
    let dlat = dis / r;
    dlat = dlat * 180 / Math.PI;

    return {
        base: { lng: point.lng, lat: point.lat },
        up: { lng: point.lng, lat: point.lat + dlat },
        down: { lng: point.lng, lat: point.lat - dlat },
        left: { lng: point.lng - dlng, lat: point.lat + dlat },
        right: { lng: point.lng + dlng, lat: point.lat + dlat },
        right_up: { lng: point.lng + dlng, lat: point.lat + dlat },
        left_up: { lng: point.lng - dlng, lat: point.lat + dlat },
        right_down: { lng: point.lng + dlng, lat: point.lat - dlat },
        left_down: { lng: point.lng - dlng, lat: point.lat - dlat }
    }
}

function concatUrl() {
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
    around_points = getPoints(point)
    let urls = concatUrl()
    console.log(urls[0])
    console.log(`共有url个数为：${urls.length}`)
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
        // .subscribe(res => console.log(res))
        .map(poi => {
            poi["bar_id"] = bar_id
            return poi
        })
        .scan((acc, poi) => {
            acc.push(poi)
            return acc
        }, [])
        .map(res => `module.exports = ${JSON.stringify(res)}`)
        .subscribe(async function (pois) {
            await fs.writeFile(filename, pois, 'utf8')
        })
}
main()