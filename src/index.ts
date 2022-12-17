export class AsyncArray<T> extends Array<T> {
    public static override from<T>(element: Iterable<T> | ArrayLike<T>) {
        const array = super.from(element)

        return new this(...array)
    }

    #async_foreach(callback: (item: T, index: number, array: T[]) => any) {
        return new Promise<void>(resolve => {
            const iterate = async (i = 0) => {
                if (i === this.length)
                    return resolve()
    
                await callback(this[i], i, this)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }

    #async_map<M>(callback: (item: T, index: number, array: T[]) => M) {
        const map = new AsyncArray<M>()

        return new Promise<AsyncArray<M>>(resolve => {
            const iterate = async (i = 0) => {
                if (i === this.length)
                    return resolve(map)
    
                const mapped = await callback(this[i], i, this)
                map.push(mapped)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }

    public get async() {
        return {
            forEach: this.#async_foreach.bind(this),
            map: this.#async_map.bind(this)
        }
    }
}