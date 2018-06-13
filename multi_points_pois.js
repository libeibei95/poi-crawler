const Rx = require('rxjs/Rx');
const request = require('superagent');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');
const assert = require('assert');
const fs = require("fs-extra")

const max_count_items = 2000 // 最多能查询到1000条记录
const baseurl = "http://restapi.amap.com/v3/place/around?"

const params = {
    "key": "7991b152e64b99109eccc3a5be35e75e",
    "offset": 50,
    "radius": 1500,
    "extensions": 'base'
}
const location = '120.412941,37.38479943211838'

const filename = './around_up_2km_1500.js'

function concatUrl(params, location) {
    let count_page = Math.ceil(max_count_items / params.offset)

    let url = baseurl
    let urls = []
    for (const [k, v] of Object.entries(params)) {
        url = `${url}${k}=${v}&`
    }
    url = `${url}location=${location}&`
    for (let i = 1; i <= count_page; i++) {
        urls.push(`${url}page=${i}`)
    }
    return urls
}
async function getData(obj) {
    let res = await request(obj.url)
    res.id = obj.id;
    return resres
}
async function main() {

    let time$ = Rx.Observable.interval(200)

    Rx.Observable.of(params)
        .flatMap(params => {
            return concatUrl(params, location)
        })        
        .zip(time$)
        .map(([c, t]) => c)
        .flatMap(url =>
            Rx.Observable.of(url)
                .flatMap(url => request.get(url))
                .retry(3)
        )        
        .flatMap(obj => {
            let res = obj
            console.log("json")
            if (res.err) return res.err
            let json = JSON.parse(res.text)
            console.log(json)

            return Array.from(json.pois)
        })
        .scan((acc, poi) => {
            acc.push(poi)
            return acc
        }, [])
        .map(res=>`module.exports = ${JSON.stringify(res)}`)
        .subscribe(async function (pois) {
            await fs.writeFile(filename, pois, 'utf8')
        })
}
main()