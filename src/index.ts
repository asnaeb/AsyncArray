export class AsyncArray<T> {
    [i: number]: T

    public static from<T>(array: T[]) {
        return new AsyncArray(array)
    }

    readonly #array: T[]

    public get sync() {
        return this.#array
    }

    public get length() {
        return this.#array.length
    }

    public set length(length) {
        this.#array.length = length
    }

    public constructor(array: T[] = []) {
        this.#array = array

        return new Proxy(this, {
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
                    const int = +p
                    if (Number.isInteger(int))
                        return array[int] = newValue
                }

                return Reflect.set(target, p, newValue)
            }
        })
    }

    public forEach(callback: (item: T, index: number, array: T[]) => any) {
        const length = this.length

        return new Promise<void>(resolve => {
            const iterate = async (i = 0) => {
                if (i === length)
                    return resolve()
    
                await callback(this.#array[i], i, this.#array)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }

    public map<M>(callback: (item: T, index: number, array: T[]) => M) {
        const length = this.length
        const map: M[] = []

        return new Promise<AsyncArray<M>>(resolve => {
            const iterate = async (i = 0): Promise<void> => {
                if (i === length)
                    return resolve(new AsyncArray(map))
    
                const mapped = await callback(this.#array[i], i, this.#array)
                map.push(mapped)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }
}