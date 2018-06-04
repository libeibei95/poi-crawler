fs = require("fs-extra")

async function main(){
    try{
        let data = await fs.readFile('./bar_location.csv','utf8')
        let arr = data.split('\r\n').slice(0,-1)
        let arr_object =  arr.map(ele=>{
            let arr = ele.split(',')
            return {
                "id":arr[0],
                "lng":arr[1],
                "lat":arr[2]
            }
        })
        console.log(arr_object)
        return arr_object
    }catch(err){
        console.log(err)
    }
}
main()
// fs.readFile('./bar_location.csv','utf8',function(err,data){
//     if(err) return console.log(err)

//     let arr = data.split('\r\n').slice(0,-1)
//     let arr_object =  arr.map(ele=>{
//         let arr = ele.split(',')
//         return {
//             "id":arr[0],
//             "lng":arr[1],
//             "lat":arr[2]
//         }
//     })
//     console.log(arr_object)
//     return arr_object
// })
