import {Server} from 'node:http'
import {AsyncArray} from '../index.js'

const arr = new Array(5).fill(0).map((e, i) => ({e, i, greeting: 'hello'}))

const server = new Server(async (req, res) => {
    if (req.url?.startsWith('/async')) {
        const mapped = await AsyncArray.from(arr).Async.map(i => ({date: new Date().toISOString(), ...i}))
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify(mapped.at(-1)))
    }

    if (req.url?.startsWith('/sync')) {
        const mapped = arr.map(i => ({date: new Date().toISOString(), ...i}))
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify(mapped.at(-1)))
    }

    if (req.url?.startsWith('/test')) {
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(Math.floor(Math.random() * 1000).toString())
    }
})

//server.listen(3000, () => console.log('listening..'))

console.time('sync')
AsyncArray.from(arr).map(i => ({...i, date: 'NEVEER'}))
console.timeEnd('sync')

const {Async} = AsyncArray.from(arr)
console.time('async')
const mapped = await Async.map(i => ({...i, date: 'NEVEER'}))
console.timeEnd('async')

console.log(mapped)