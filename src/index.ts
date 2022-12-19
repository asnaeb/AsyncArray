export class AsyncArray<T> extends Array<T> {
    static override from<S>(array: S[]) {
        const proxy = new Proxy(array, {
            get: (target, p) => {
                if (p === 'Async')
                    return new Async(array)

                return Reflect.get(target, p)
            }
        }) 

        return proxy as AsyncArray<S>
    }

    public get Async () {
        return new Async(this)
    }
}

class Async<T> {
    #array: T[]  

    constructor(array: T[]) {
        this.#array = array
    }

    public forEach(callback: (item: T, index: number, array: T[]) => any) {
        const array = this.#array
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

    public map<U>(callback: (item: T, index: number, array: T[]) => U) {
        const array = this.#array    
        const length = array.length
        const map = new AsyncArray<U>()

        return new Promise<AsyncArray<U>>(resolve => {
            const iterate = async (i = 0): Promise<void> => {
                if (i === length)
                    return resolve(map)
    
                const mapped = await callback(array[i], i, array)
                map.push(mapped)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }

    public splitToChunks(maxLength: number) {
        const array = this.#array
        const length = array.length
        const chunks: AsyncArray<AsyncArray<T>> = new AsyncArray()

        return new Promise<AsyncArray<AsyncArray<T>>>(resolve => {
            if (length > maxLength) {
                const iterate = (i = 0) => {
                    if (i >= length)
                        return resolve(chunks)
    
                    chunks.push(AsyncArray.from(array.slice(i, i + maxLength)))
                    setImmediate(iterate, i + maxLength)
                }
    
                iterate()
            } 
            
            else {
                chunks.push(AsyncArray.from(array))
                resolve(chunks)
            }
        })
    }
}
