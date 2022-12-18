import {InspectOptions, inspect} from 'util'

const wm = new WeakMap<AsyncArrayConstructor<any>, any[]>()

type ArrayPrototype<T> = {
    [K in keyof T[] as (T[])[K] extends Function ? K : never]: (T[])[K] 
}

class AsyncArrayConstructor<T> implements ArrayLike<T> {
    [i: number]: T

    public [inspect.custom]() {
        const array = this.toArray()

        function stringify(value: any) {
            function replacer(key: string, value: unknown) {
                switch (typeof value) {
                    case 'string':
                        return `'${value}'`
                    default: return value
                }
            }

            return JSON.stringify(value, replacer)
                .replace(/"/g, '')
                .replace(/,/g, ', ')
                .replace(/:/g, ': ')
                .replace(/\[/g, '[ ')
                .replace(/\]/g, ' ]')
                .replace(/\{/g, '{ ')
                .replace(/\}/g, ' }')
        }

        return `AsyncArray (${array.length}) ` + stringify(this.toArray())
    }

    public *[Symbol.iterator]() {
        const array: T[] = this.toArray()

        for (let i = 0; i < array.length; i++) {
            yield array[i]
        }
    }

    public get [Symbol.toStringTag]() {
        return 'AsyncArray'
    }

    public get sync() {
        const array: T[] = this.toArray()
        const prototype = {}
        
        for (const k of Object.getOwnPropertyNames(Array.prototype)) {
            switch (k) {
                case 'constructor':
                case 'toLocaleString':
                case 'toString':
                case 'length':
                    break
                default: {
                    const method = Array.prototype[<any>k]
                    Object.assign(prototype,  {[k]: method.bind(array)})
                    break
                }
            }
        }

        return prototype as ArrayPrototype<T>
    }

    public get length(): number {
        const array: T[] = wm.get(this)!

        return array.length
    }

    public set length(newLength) {
        const array: T[] = wm.get(this)!

        array.length = newLength
    }

    public constructor(array: T[]) {
        const proxy = new Proxy(this, {
            get(target, p) {
                if (typeof p === 'string') {
                    const int: number = +p
                    
                    if (Number.isInteger(int))
                        return array[int]
                }

                return Reflect.get(target, p)
            },
            set(target, p, newValue) {
                if (typeof p === 'string') {
                    const int: number = +p

                    if (Number.isInteger(int)) 
                        return array[int] = newValue
                }

                return Reflect.set(target, p, newValue)
            }
        })
        
        wm.set(this, array)
        wm.set(proxy, array)

        return proxy
    }

    public toArray(): T[] {
        return wm.get(this)!
    }

    public forEach(callback: (item: T, index: number, array: T[]) => any) {
        const array = this.toArray()
        const length = array.length

        return new Promise<void>(resolve => {
            const iterate = async (i = 0) => {
                if (i === length)
                    return resolve()
    
                await callback(array[i], i, array)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }

    public map<M>(callback: (item: T, index: number, array: T[]) => M) {
        const array = this.toArray()
        const length = array.length
        const map: M[] = []

        return new Promise<AsyncArrayConstructor<M>>(resolve => {
            const iterate = async (i = 0): Promise<void> => {
                if (i === length)
                    return resolve(new AsyncArrayConstructor(map))
    
                const mapped = await callback(array[i], i, array)
                map.push(mapped)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }
}

export class AsyncArray<T> extends AsyncArrayConstructor<T> {
    public static from<U extends any[]>(array: U) {
        return new AsyncArrayConstructor<U extends (infer I)[] ? I : never>(array)
    }

    constructor() {
        super([])
    }
}