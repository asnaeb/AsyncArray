import assert from 'node:assert'
import {AsyncArray} from '../index.js'

console.time('create')
const arr = Array(5).fill(0).map((e, i) => ({e, i, greeting: 'hello', date: new Date().toISOString()}))

console.timeEnd('create')

console.time('clone')
await new AsyncArray(arr).foreach(i => console.log(i))
console.timeEnd('clone')

//assert.deepStrictEqual(res, [1000, 2000, 3000, 4000, 5000])
