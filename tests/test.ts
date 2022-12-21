import {Server} from 'node:http'
import {AsyncArray} from '../index.js'

const myArray = ['normal', 'boring', 'array']

const asy = AsyncArray.to(myArray)
asy[0] = 'async'
asy[1] = 'fun'

console.log(myArray instanceof AsyncArray)



