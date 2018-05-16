const {MongoClient}=require('mongodb');
const assert = require('assert');

async function connetct_db(){
  const url = 'mongodb://localhost:27017/';
  // Database Name
  const dbName = 'poi';
  let client;

  try {
    // Use connect method to connect to the Server
    client = await MongoClient.connect(url);

    const db = client.db(dbName);
    const collection = db.collection("changsha")
    await collection.insert({a: 111,b:222})
  } catch (err) {
    console.log(err.stack);
  }

  if (client) {
    client.close();
  }
}

module.exports= connetct_db;