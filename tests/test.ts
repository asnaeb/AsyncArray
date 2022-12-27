import {Server} from 'node:http'
import {AsyncArray} from '../index.js'

const arr: string[] | number[] | ['x', 'y'] = []

const as = AsyncArray.to(arr)

const x = new AsyncArray()

const t = await x.async.map(i => Promise.resolve('asnaeb'))
const f = await x.async.map(i => Promise.resolve('asnaeb'), false)

console.log(t)
console.log(f)

// TODO TESTS