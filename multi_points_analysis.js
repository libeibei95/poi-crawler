// const data = require('./result/around_10000052_3000_3000.js')

// let data_arr = Array.from(data)
// let data_set = new Set(data_arr.map(d=>d.id))
// console.log(`length of data_arr is ${data_arr.length}`)
// console.log(`length of data_set is ${data_set.size}`)

// const data = require('./result/around_10000032_3000_3000.js')

// let data_arr = Array.from(data)
// let data_set = new Set(data_arr.map(d=>d.id))
// console.log(`length of data_arr is ${data_arr.length}`)
// console.log(`length of data_set is ${data_set.size}`)

const fs = require('fs-extra')
const locations = require('./origin_data/sample_location')
const {MongoClient} = require('mongodb')
var jsonToCSV = require('json-to-csv');

const db_url = 'mongodb://localhost:27017/';
// Database Name
const db_name = 'poi';
const collection_name = "multi_points_1500_around_3000_unique";

async function main() {
    let client, db, collection;
    try {
        client = await MongoClient.connect(db_url);
        db = client.db(db_name);
        collection = db.collection(collection_name);
    } catch (err) {
        console.log(err.stack);
    }
    for (location of locations) {
        let data = require(`./result/batch_around_${location.bar_id}_3000_3000`)
        for(d of data){
            d["bar_id"]=location.bar_id
        }
        
        await collection.insert(data)
        // await fs.writeFile(`./result/batch_around_${location.bar_id}_3000_3000.json`,JSON.stringify(data),'utf8')
        // jsonToCSV(data, `./result/batch_around_${location.bar_id}_3000_3000.csv`)
        //     .then(() => console.log('success'))
        //     .catch(err => console.log(err))
            
        // let data_arr = Array.from(data)
        // let data_set = new Set(data_arr.map(d => d.id))
        // console.log(`there are ${data_arr.length} total pois got around bar ${location.bar_id}`)
        // console.log(`there are ${data_set.size} different pois around bar ${location.bar_id}`)
        // console.log('***************')
    }
}

main()