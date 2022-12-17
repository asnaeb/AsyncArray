import {Server} from 'node:http'
import {AsyncArray} from '../index.js'

const arr = new Array(1e6).fill(0).map((e, i) => ({e, i, greeting: 'hello'}))

const server = new Server(async (req, res) => {
    if (req.url?.startsWith('/async')) {
        const mapped = await AsyncArray.from(arr).map(i => ({date: new Date().toISOString(), ...i}))
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify(mapped.sync.at(-1)))
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

const a = new AsyncArray()
a[0] = 'hello'
a.sync.push(1, 2, 3, 4)
console.log(a[2])
console.log(a.sync)
console.log(a)