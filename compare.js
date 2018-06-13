
// 对比结果：对POI爬取个数有上限，应该是900个，不同范围的POI有重叠。
// 900
// 900
// 718
// 100
// 5000m 和 3000 m 共有900个相同的POI
// 3000m 和 1000 m 共有713个相同的POI
// 1000m 和 500 m 共有100个相同的POI
const res1 = require('./res1.js')
const res2 = require('./res2.js')
const res3 = require('./res3.js')
const res4 = require('./res4.js')

let arr1 = Array.from(res1)
console.log(arr1.length)

let arr2 = Array.from(res2)
console.log(arr2.length)

let arr3 = Array.from(res3)
console.log(arr3.length)

let arr4 = Array.from(res4)
console.log(arr4.length)

set1 = new Set(arr1.map(a=>a.id))
set2 = new Set(arr2.map(a=>a.id))
set3 = new Set(arr3.map(a=>a.id))
set4 = new Set(arr4.map(a=>a.id))

let intersec_12 = Array.from(new Set([...set1].filter(s=>set2.has(s))))
let intersec_23 = Array.from(new Set([...set2].filter(s=>set3.has(s))))
let intersec_34 = Array.from(new Set([...set3].filter(s=>set4.has(s))))
// console.log(intersection)
console.log(`5000m 和 3000 m 共有${intersec_12.length}个相同的POI`)

console.log(`3000m 和 1000 m 共有${intersec_23.length}个相同的POI`)
console.log(`1000m 和 500 m 共有${intersec_34.length}个相同的POI`)


