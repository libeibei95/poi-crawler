const Rx = require('rxjs/Rx');
const request = require('request-promise');
const cheerio = require('cheerio');

const url = 'http://www.xicidaili.com/nn/1'
Rx.Observable.fromPromise(request.get(url))
  .subscribe(res=>{
    var $=cheerio.load(res)
    let ips =[];
    let tbody = $("#ip_list tbody").children()

    for(let i=1;i<tbody.length;i++){
      let eles = tbody.slice(i,i+1).children()
      ips.push(`http://${eles[1].children[0].data}/${eles[2].children[0].data}`)
    }
    console.log(ips)
  })