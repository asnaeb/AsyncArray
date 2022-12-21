import {AsyncArray} from '../index.js'

type PrimaryKeyObject = Record<string | number, string | string[]> | Record<string | number, number | number[]>
export type PrimaryKeys<T extends {}> = T[] | [PrimaryKeyObject] | string[] | number[]

declare const keys: PrimaryKeys<{a: 0}>

AsyncArray.to(keys).forEach(i => i)