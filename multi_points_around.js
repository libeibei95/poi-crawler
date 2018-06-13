const Rx = require('rxjs/Rx');
const request = require('superagent');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');
const assert = require('assert');
const fs = require("fs-extra")

const r = 6371;//地球半径千米  
const dis = 2;//2千米距离  


/**
 * 
 * @param {*} dis 
 * @param {object:lng,lat} point 
 */
function getPoints(point){

    let lat = point.lat

    //计算经度 delta
    let dlng =  2*Math.asin(Math.sin(dis/(2*r))/Math.cos(lat*Math.PI/180));  
    dlng = dlng*180/Math.PI;//角度转为弧度  

    //计算纬度 delta
    let dlat = dis/r;  
    dlat = dlat*180/Math.PI;  

    return {
        base:{lng:point.lng,lat:point.lat},
        up:{lng:point.lng,lat:point.lat+dlat},
        down:{lng:point.lng,lat:point.lat-dlat},
        left:{lng:point.lng-dlng,lat:point.lat+dlat},
        right:{lng:point.lng+dlng,lat:point.lat+dlat},
        right_up:{lng:point.lng+dlng,lat:point.lat+dlat},
        left_up:{lng:point.lng-dlng,lat:point.lat+dlat},
        right_down:{lng:point.lng+dlng,lat:point.lat-dlat},
        left_down:{lng:point.lng-dlng,lat:point.lat-dlat}
    }
}

async function main(){
    point={
        lng:120.4129410,
        lat:37.3668130
    }
    around_points = getPoints(point)
    await fs.writeFile('./poi_around_2km.json',JSON.stringify(around_points),'utf8')
}
main()