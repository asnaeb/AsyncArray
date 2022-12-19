import {inspect} from 'util'

const wm = new WeakMap<AsyncArrayConstructor<any>, any[]>()

type ArrayPrototype<T> = {
    [K in keyof T[] as (T[])[K] extends Function ? K : never]: (T[])[K] 
}

class AsyncArrayConstructor<T> implements ArrayLike<T> {
    [i: number]: T

    public [inspect.custom]() {
        return this.toArray()
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

                    if (!(p in target) && (p in target.sync)) {
                        console.warn(
                            `Property [${p}] does not exist on type AsyncArray.` 
                            +` If you were looking for [Array.prototype.${p}]`
                            +` you can access it under the [sync] property:`
                            +` new AsyncArray().sync.${p}`
                        )
                    }
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

    public forEach(callback: (item: T, index: number, array: AsyncArray<T>) => any) {
        const length = this.length

        return new Promise<void>(resolve => {
            const iterate = async (i = 0) => {
                if (i === length)
                    return resolve()
    
                await callback(this[i], i, this)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }

    public map<U>(callback: (item: T, index: number, array: AsyncArray<T>) => U) {
        const length = this.length
        const map = new AsyncArray<U>()

        return new Promise<AsyncArray<U>>(resolve => {
            const iterate = async (i = 0): Promise<void> => {
                if (i === length)
                    return resolve(map)
    
                const mapped = await callback(this[i], i, this)
                map.sync.push(mapped)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }

    public splitToChunks(maxLength: number) {
        const length = this.length

        return new Promise<AsyncArray<AsyncArray<T>>>(resolve => {
            const chunks: AsyncArray<AsyncArray<T>> = new AsyncArray()

            if (length > maxLength) {
                const iterate = (i = 0) => {
                    if (i >= length)
                        return resolve(chunks)
    
                    chunks.sync.push(AsyncArray.from(this.sync.slice(i, i + maxLength)))
                    setImmediate(iterate, i + maxLength)
                }
    
                iterate()
            } 
            
            else {
                chunks.sync.push(this)
                resolve(chunks)
            }
        })
    }
    
}

export class AsyncArray<T> extends AsyncArrayConstructor<T> {
    public static from<S extends Array<any>, U extends S extends (infer V)[] ? AsyncArray<V> : never>
    (array: S): U {
        if (array instanceof AsyncArrayConstructor)
            return array as unknown as U
            
        return new AsyncArrayConstructor(array) as U
    }

    constructor() {
        super([])
    }
}