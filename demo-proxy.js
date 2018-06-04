const request = require('request-promise')
const cheerio = require('cheerio')
const Rx = require('rxjs/Rx');
const proxyUrl = 'http://195.146.1.90:3128'
// const proxiedRp = rp.defaults({ proxy: proxyUrl })

const ip_url = 'http://www.xicidaili.com/nn/1'

const load_url = "http://www.poi86.com/poi/amap/city/430100.html"

async function main() {
  let ips = await getIps()
  console.log(ips)
  // const urls = [
  //   "http://ip.mafengshe.com/",
  // ]
  // await Promise.all(urls.map(i => get(i)))
}

async function getIps() {
  return Rx.Observable.fromPromise(request.get(ip_url))
    .subscribe(res => {
      var $ = cheerio.load(res)
      let tbody = $("#ip_list tbody").children()
      let ips=[]
      for (let i = 1; i < tbody.length; i++) {
        let eles = tbody.slice(i, i + 1).children()
        ips.push(`http://${eles[1].children[0].data}/${eles[2].children[0].data}`)
      }
      return ips
    })
}

async function get(url) {
  const res = await proxiedRp.get(url)
  const $ = cheerio.load(res)
  console.log(res)
  console.log(url)
}

main()