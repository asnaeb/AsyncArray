class AsyncArrayConstructor<T> {
    readonly #items: T[]
    readonly #length: number

    public constructor(items: T[]) {
        this.#items = items
        this.#length = this.#items.length
    }

    public forEach(callback: (item: T, index: number, array: T[]) => any) {
        return new Promise<void>(resolve => {
            const iterate = async (i = 0) => {
                if (i === this.#length)
                    return resolve()
    
                await callback(this.#items[i], i, this.#items)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }

    public map<M>(callback: (item: T, index: number, array: T[]) => M) {
        const map: M[] = []

        return new Promise<M[]>(resolve => {
            const iterate = async (i = 0) => {
                if (i === this.#length)
                    return resolve(map)
    
                const mapped = await callback(this.#items[i], i, this.#items)
                map.push(mapped)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }
}

export class AsyncArray<T> extends Array<T> {
    public get async () {
        return new AsyncArrayConstructor(this)
    }
}