const Rx = require('rxjs/Rx');
const request = require('request-promise');
const cheerio = require('cheerio');

const url = 'http://www.xicidaili.com/nn/1'
Rx.Observable.fromPromise(request.get(url))
  .subscribe(res=>{
    var $=cheerio.load(res)
    console.log("-------------")
    let ips =[];

    var eles = $("#ip_list tbody").children().slice(1,3).children()
    console.log(`$("#ip_list tbody").children().slice(1,2) is ${$("#ip_list tbody").children().slice(1,2)}`)
    console.log('------------------')
    console.log(`$("#ip_list tbody").children().slice(1,3) is ${$("#ip_list tbody").children().slice(1,3)}`)
    console.log('------------------')
    console.log(`eles[1] is ${eles[1]}`)
    console.log(`length of eles is ${eles.length}`)
    console.log("-----------------")
    console.log(eles[1].children[0].data)
    console.log(eles[2].children[0].data)

    // console.log(Array.from($("#ip_list tbody").children().slice(1)).length)

    // Array.from($("#ip_list tbody").children().slice(1)).map(ele=>{
    //   // console.log(ele)
    //   var eles = $(this).children()
    //   console.log(eles.length)
    //   // console.log(eles[1].children[0].data)
    //   // console.log(eles[2].children[0].data)      
    //   // console.log($(this).children().length)
    // })

    // $("#ip_list tr").slice(1).map(ele=>{
    //   let children = $(this).children()
    //   console.log(children.length)
    // })   

    // console.log($("#ip_list tr").length)
  })