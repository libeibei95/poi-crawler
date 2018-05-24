const rp = require('request-promise')
const cheerio =require('cheerio')
const proxyUrl = 'http://195.146.1.90:3128'
const proxiedRp = rp.defaults({proxy:proxyUrl})

async function main(){
  const urls = [
    //"http://www.baidu.com",
    "http://ip.mafengshe.com/",
  ]
  await Promise.all(urls.map(i => get(i)))
}

async function get(url){
  const res = await proxiedRp.get(url)
  const $ = cheerio.load(res)
  console.log(res)
  console.log(url)
}

main()