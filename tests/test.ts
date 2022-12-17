import {Server} from 'node:http'
import {AsyncArray} from '../index.js'

const arr = new Array(1e6).fill(0).map((e, i) => ({e, i, greeting: 'hello', date: new Date().toISOString()}))

const server = new Server(async (req, res) => {
    if (req.url?.startsWith('/async')) {
        const mapped: any[] = []
        await AsyncArray.from(arr).forEach(i => mapped.push({mapped: true, ...i}))
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify(mapped.at(-1)))
    }

    if (req.url?.startsWith('/sync')) {
        const mapped: any = []
        arr.forEach(i => mapped.push({mapped: true, ...i}))
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify(mapped.at(-1)))
    }

    if (req.url?.startsWith('/test')) {
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(Math.floor(Math.random() * 1000).toString())
    }
})

server.listen(3000, () => console.log('listening..'))