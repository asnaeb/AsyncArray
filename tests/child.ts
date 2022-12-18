import {AsyncArray} from '../index.js'

console.time('normal')
const arr = new Array(1e6).fill(0).map((e, i) => ({e, i, greeting: 'hello', date: new Date().toISOString()}))
console.timeEnd('normal')

console.time('async')
const asy = AsyncArray.from(arr)
console.timeEnd('async')
