import {Server} from 'node:http'
import {AsyncArray} from '../index.js'

const myArray = new AsyncArray(1, 2, 3)

myArray.async.forEach(item => new Promise(resolve => {
    setTimeout(() => resolve(console.log(item)), 1000)
}))
