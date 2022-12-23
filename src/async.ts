import {AsyncArray, Callback, ReduceCallback} from './index'

export class Async<T> {
    #array: AsyncArray<T> 

    constructor(array: AsyncArray<T>) {
        this.#array = array
    }

    public every(callback: Callback<T, boolean>) {
        const array = this.#array
        const length = array.length

        return new Promise<boolean>(resolve => {
            const iterate = async (i = 0) => {
                if (i === length)
                    return resolve(true)

                const test = !!(await callback(array[i], i, array))

                if (!test) 
                    return resolve(false)

                setImmediate(iterate, ++i)
            }

            iterate()
        })
    }

    public filter(callback: Callback<T, boolean | Promise<boolean>>) {
        const array = this.#array
        const length = array.length
        const filtered = new AsyncArray<T>()

        return new Promise<AsyncArray<T>>(resolve => {
            const iterate = async (i = 0) => {
                if (i === length)
                    return resolve(filtered)

                const test = !!(await callback(array[i], i, array))

                if (test) 
                    filtered.push(array[i])

                setImmediate(iterate, ++i)
            }

            iterate()
        })
    }

    public fill<U extends T>(element: U) {
        const array = this.#array 
        const length = array.length

        return new Promise<AsyncArray<U>>(resolve => {
            const iterate = (i = 0) => {
                if (i === length)
                    return resolve(array as AsyncArray<U>)

                array[i] = element

                setImmediate(iterate, ++i)
            }

            iterate()
        })
    }

    public find(callback: Callback<T, boolean | Promise<boolean>>) {
        const array = this.#array
        const length = array.length

        return new Promise<T | undefined>(resolve => {
            const iterate = async (i = 0) => {
                if (i === length)
                    return resolve(undefined)

                const test = !!(await callback(array[i], i, array))

                if (test)
                    return resolve(array[i])

                setImmediate(iterate, ++i)
            }

            iterate()
        })
    }

    public findIndex(callback: Callback<T, boolean | Promise<boolean>>) {
        const array = this.#array
        const length = array.length

        return new Promise<number>(resolve => {
            const iterate = async (i = 0) => {
                if (i === length)
                    return resolve(-1)

                const test = !!(await callback(array[i], i, array))

                if (test)
                    return resolve(i)

                setImmediate(iterate, ++i)
            }

            iterate()
        })
    }

    public findLast(callback: Callback<T, boolean | Promise<boolean>>) {
        const array = this.#array
        const length = array.length

        return new Promise<T | undefined>(resolve => {
            const iterate = async (i = length) => {
                if (i === -1)
                    return resolve(undefined)

                const test = !!(await callback(array[i], i, array))

                if (test)
                    return resolve(array[i])

                setImmediate(iterate, --i)
            }

            iterate()
        })
    }

    public findLastIndex(callback: Callback<T, boolean | Promise<boolean>>) {
        const array = this.#array
        const length = array.length

        return new Promise<number>(resolve => {
            const iterate = async (i = length) => {
                if (i === -1)
                    return resolve(i)

                const test = !!(await callback(array[i], i, array))

                if (test)
                    return resolve(i)

                setImmediate(iterate, --i)
            }

            iterate()
        })
    }

    public forEach(callback: Callback<T, any>, awaitCallback = true) {
        const array = this.#array
        const length = array.length

        return new Promise<void>(resolve => {
            const iterate = async (i = 0) => {
                if (i === length)
                    return resolve()

                if (awaitCallback)
                    await callback(array[i], i, array)
                else    
                    callback(array[i], i, array)    

                setImmediate(iterate, ++i)
            }

            iterate()
        })
    }

    public includes(element: T, fromIndex: number = 0) {
        const array = this.#array    
        const length = array.length

        return new Promise<boolean>(resolve => {
            if (fromIndex >= length)
                resolve(false)

            if (fromIndex < 0) fromIndex += length
            if (fromIndex < -length) fromIndex = 0

            const iterate = (i = fromIndex) => {
                if (i === length) 
                    return resolve(false)

                if (element === array[i])
                    return resolve(true)

                setImmediate(iterate, ++i)
            }

            iterate()
        })
    }

    public indexOf(element: T, fromIndex: number = 0) {
        const array = this.#array    
        const length = array.length

        return new Promise<number>(resolve => {
            if (fromIndex >= length)
                resolve(-1)

            if (fromIndex < 0) fromIndex += length
            if (fromIndex < -length) fromIndex = 0

            const iterate = (i = fromIndex) => {
                if (i === length) 
                    return resolve(-1)

                if (element === array[i])
                    return resolve(i)

                setImmediate(iterate, ++i)
            }

            iterate()
        })
    }

    public lastIndexOf(element: T, fromIndex = this.#array.length - 1) {
        const array = this.#array    
        const length = array.length

        return new Promise<number>(resolve => {
            if (fromIndex < -length)
                resolve(-1)

            if (fromIndex < 0) fromIndex += length
            if (fromIndex >= length) fromIndex = length - 1

            const iterate = (i = fromIndex) => {
                if (i === length) 
                    return resolve(-1)

                if (element === array[i])
                    return resolve(i)

                setImmediate(iterate, --i)
            }

            iterate()
        })
    }

    public map<S>(callback: Callback<T, S>): Promise<AsyncArray<Awaited<S>>>
    public map
    <
        S, 
        B extends boolean,
        U extends B extends true ? AsyncArray<Awaited<S>> : AsyncArray<S>
    >
    (callback: Callback<T, S>, awaitCallback: B): Promise<U>
    public map(callback: Callback<T, unknown>, _await = true) {
        const array = this.#array    
        const length = array.length
        const map = new AsyncArray()

        return new Promise<AsyncArray<unknown>>(resolve => {
            const iterate = async (i = 0) => {
                if (i === length)
                    return resolve(map)
    
                let mapped

                if (_await)
                    mapped = await callback(array[i], i, array) 
                else 
                    mapped = callback(array[i], i, array) 

                map.push(mapped)
    
                setImmediate(iterate, ++i)
            }
    
            iterate()
        })
    }

    public reduce<U = T>(callback: ReduceCallback<T, U>): Promise<U>
    public reduce<U>(callback: ReduceCallback<T, U>, initialValue: U): Promise<U>
    public reduce<U>(callback: ReduceCallback<T, any>, initialValue?: U) {
        const array = this.#array    
        const length = array.length

        return new Promise<U>((resolve, reject) => { 
            let start: number, accumulator: T | U

            if (initialValue !== undefined) {
                start = 0
                accumulator = initialValue
            } 

            else {
                start = 1
                accumulator = array[0]
            }

            const iterate = async (i = start, acc = accumulator) => {
                try {
                    const result = await callback(acc, array[i], i, array)

                    if (i === length - 1) 
                        return resolve(result)

                    setImmediate(iterate, ++i, result)   
                }

                catch (error) {
                    return reject(error)
                }
            }

            iterate()
        })
    }

    public reduceRight(callback: ReduceCallback<T, T>): Promise<T>
    public reduceRight<U>(callback: ReduceCallback<T, U>, initialValue: U): Promise<U>
    public reduceRight<U>(callback: ReduceCallback<T, any>, initialValue?: U) {
        const array = this.#array    
        const length = array.length

        return new Promise<U>((resolve, reject) => { 
            let start: number, accumulator: T | U

            if (initialValue !== undefined) {
                start = length - 1
                accumulator = initialValue
            } 

            else {
                start = length - 2
                accumulator = array[length - 1]
            }

            const iterate = async (i = start, acc = accumulator) => {
                try {
                    const result = await callback(acc, array[i], i, array)

                    if (i === 0) 
                        return resolve(result)

                    setImmediate(iterate, --i, result)   
                }

                catch (error) {
                    return reject(error)
                }
            }

            iterate()
        })
    }

    public some(callback: Callback<T, boolean>) {
        const array = this.#array
        const length = array.length

        return new Promise<boolean>(resolve => {
            const iterate = async (i = 0) => {
                if (i === length)
                    return resolve(false)

                const test = !!(await callback(array[i], i, array))

                if (test)
                    return resolve(true)

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
    
                    chunks.push(array.slice(i, i + maxLength) as AsyncArray<T>)
                    setImmediate(iterate, i + maxLength)
                }
    
                iterate()
            } 
            
            else {
                chunks.push(array)
                resolve(chunks)
            }
        })
    }
}