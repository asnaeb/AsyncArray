import {Server} from 'node:http'
import {AsyncArray} from '../index.js'

const arr = new AsyncArray<number>(3).fill(0).map((_, i) => String(i))

const map = await arr.async.filter(i => new Promise<boolean>(r => r(true)))

console.log(map)

