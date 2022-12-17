export class AsyncArray<T> {
    public static from<T>(array: T[]) {
        return new AsyncArray(array)
    }

    readonly #array: T[]
    readonly #length: number

    public get sync() {
        return this.#array
    }

    public constructor(array: T[] = []) {
        this.#array = array
        this.#length = array.length
    }

    public forEach(callback: (item: T, index: number, array: T[]) => any) {
        return new Promise<void>(resolve => {
            const iterate = async (i = 0) => {
                if (i === this.#length)
                    return resolve()
    
                await callback(this.#array[i], i, this.#array)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }

    public map<M>(callback: (item: T, index: number, array: T[]) => M) {
        const map: M[] = []

        return new Promise<AsyncArray<M>>(resolve => {
            const iterate = async (i = 0): Promise<void> => {
                if (i === this.#length)
                    return resolve(new AsyncArray(map))
    
                const mapped = await callback(this.#array[i], i, this.#array)
                map.push(mapped)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }
}