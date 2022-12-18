const wm = new WeakMap<AsyncArrayConstructor<any>, any[]>()

class AsyncArrayConstructor<T> {
    [i: number]: T

    public get sync() {
        const prototype: any = {}

        for (const k of Object.getOwnPropertyNames(Array.prototype)) {
            const v = Array.prototype[<any>k]
            
            if (typeof v === 'function' && k !== 'constructor')
                prototype[k] = v.bind(wm.get(this))
        }

        return Object.freeze(prototype) as {
            [K in keyof T[] as K extends (number | symbol | 'length') ? never : K]: T[][K]
        }
    }

    public get length(): number {
        return wm.get(this)!.length
    }

    public set length(length) {
        wm.get(this)!.length = length
    }

    public constructor(array: T[]) {
        const proxy = new Proxy(this, {
            get(target, p) {
                if (typeof p === 'string') {
                    const int = +p
                    
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

    public forEach(callback: (item: T, index: number, array: T[]) => any) {
        const array = wm.get(this)!
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
        const array = wm.get(this)!
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
        return new AsyncArrayConstructor<U>(array)
    }

    constructor() {
        super([])
    }
}