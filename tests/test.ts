import assert from 'node:assert'
import {AsyncArray} from '../index.js'

const arr = new AsyncArray(10, 20, 30, 40, 50)

const res = await arr.async.map(i => i * 100)

assert.deepStrictEqual(res, [1000, 2000, 3000, 4000, 5000])
console.log(res)
