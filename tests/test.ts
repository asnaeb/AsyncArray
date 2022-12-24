import {Server} from 'node:http'
import {AsyncArray} from '../index.js'

const arr: string[] | number[] | ['x', 'y'] = []

const as = AsyncArray.to(arr)


// TODO TESTS