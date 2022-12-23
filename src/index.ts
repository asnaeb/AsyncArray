import {Async} from './async'

export type Callback<T, R> = (element: T, index: number, array: AsyncArray<T>) => R 
export type ReduceCallback<T, R> = (accumulator: Awaited<R>, current: T, index: number, array: AsyncArray<T>) => R | Promise<R>

export interface ConcatAsyncArray<T> extends ConcatArray<T> {
    slice(start?: number, end?: number): AsyncArray<T>
}

export interface AsyncArray<T> extends Array<T> {
    concat(...items: AsyncArray<ConcatAsyncArray<T>>): AsyncArray<T>
    concat(...items: AsyncArray<T | ConcatAsyncArray<T>>): AsyncArray<T>

    splice(start: number, deleteCount?: number | undefined): AsyncArray<T>
    splice(start: number, deleteCount: number, ...items: T[]): AsyncArray<T>

    map<U>(callback: Callback<T, U>, thisArg?: any): AsyncArray<U>

    flat<A, D extends number = 1>(this: A, depth?: D | undefined): AsyncArray<FlatArray<A, D>>

    flatMap<U, This = undefined>(
        callback: (this: This, value: T, index: number, array: AsyncArray<T>) => U | AsyncArray<U>, 
        thisArg?: This | undefined
    ): AsyncArray<U>

    filter(predicate: Callback<T, boolean>, thisArg?: any): AsyncArray<T>

    reverse(): AsyncArray<T>

    slice(start?: number, end?: number): AsyncArray<T>
}

export class AsyncArray<T> extends Array<T> {
    public static override from:
    <T, U = T>(iterable: ArrayLike<T> | Iterable<T>, mapfn?: (k: T, i: number) => U, thisArg?: any) => AsyncArray<U>

    public static to<T, U extends T>(array: ArrayLike<T> | Iterable<T>): AsyncArray<U> {
        if (array instanceof AsyncArray)
            return array

        return Object.setPrototypeOf(array, this.prototype)
    }

    public get async (): Async<T> {
        return new Async(this)
    }
}