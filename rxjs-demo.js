const Rx = require('rxjs/Rx');
const request = require('superagent');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');
const assert = require('assert');

const base_url = "http://www.poi86.com";
const city_url = "/poi/amap/city/430100.html";

const db_url = 'mongodb://localhost:27017/';
// Database Name
const db_name = 'poi';
const collection_name = "changsha";

async function main() {
    // connect to database;
    let client, db, collection;
    try {
        client = await MongoClient.connect(db_url);
        db = client.db(db_name);
        collection = db.collection(collection_name);
    } catch (err) {
        console.log(err.stack);
    }

    console.log("Hello~");
    //crawler data
    var timer$ = Rx.Observable.interval(2000);

    var distinct_url_stream$ = Rx.Observable.fromPromise(request.get(base_url + city_url))
        .flatMap(x => {
            var arr_urls = [];
            if (x.err) return err;
            var $ = cheerio.load(x.text);
            $(".list-group-item a").slice(1).each(function (i, elem) {
                arr_urls.push(base_url + $(this).attr("href"));
            });
            return arr_urls;
        })
        .flatMap(url => {
            return request.get(url);
        })
        .map((res) => {
            console.log("-------------")
            if (res.err) throw res.err;
            var $ = cheerio.load(res.text);
            var pageCount = $(".pagination li a").slice(-1).text().split('/')[1];//获取分页
            return { pageCount: pageCount, url: res.request.url };
        })
        .flatMap(({ pageCount, url }) => {
            console.log(pageCount);
            console.log(url);
            var url_prefix = url.split('/').slice(0, -1).join('/');
            var urls = [];
            for (let i = 1; i <= pageCount; i++) {
                urls.push(url_prefix + '/' + i + '.html');
            }
            console.log("length of distinct page urls:" + urls.length);
            return urls;
        })
        .zip(timer$)
        .map(([c, t]) => c)
        .flatMap(url => request.get(url))

    var item_url_stream$ = distinct_url_stream$.flatMap(res => {
        if (res.err) return res.err;
        var $ = cheerio.load(res.text);
        console.log("----------");
        var urls = [];
        $("table tr td a").slice(1).each(function (i, elem) {
            urls.push(base_url + $(this).attr("href"));
        });
        return urls;
    })
        .zip(timer$)
        .map(([c, t]) => c)
        .flatMap(url =>
            Rx.Observable.of(url)
                .flatMap(url => request.get(url))
                .retry(3)
        )
        .map(res => {
            if (res.err) return res.err;
            var $ = cheerio.load(res.text);
            var node = $(".list-group .list-group-item");
            var columns = $(".list-group .list-group-item span").text().split(':'); // 属性字段
            var indexs = columns.map(c => node.text().indexOf(c));
            var contents = [];
            for (var i = 0; i < indexs.length - 2; i++) {
                contents.push(node.text().slice(indexs[i], indexs[i + 1]).replace(/(^\s*)|(\s*$)/g,""));
            }
            contents.push(node.text().slice(indexs[indexs.length - 2]));

            //添加字段
            var content_json = {"地点名称":$(".panel-heading h1").text()};
            contents.map(c => {
                arr = c.split(":");
                content_json[arr[0]] = arr[1];
            })
            console.log(content_json);

            //加入数据库
            collection.insert(content_json);
        })
        .subscribe(
            x => { console.log(x) },
            err => console.log(err),
            complete => {
                if (client) client.close();
                console.log("done!");
            }
        );
}
main()