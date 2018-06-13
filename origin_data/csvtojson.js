const csv2json = require("csvtojson")
const fs = require("fs-extra")

async function main() {
    let jsonArray = await csv2json().fromFile('./sample_location.csv')
    console.log(jsonArray)
    await fs.writeFile('./sample_location.json', JSON.stringify( jsonArray), 'utf8')
}

main()