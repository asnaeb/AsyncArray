import {Server} from 'node:http'
import {AsyncArray} from '../index.js'

const arr = new AsyncArray(3).fill(0)
const map = await arr.async.map(i => new Promise<string>(r => r('hello')))

console.log(map)

