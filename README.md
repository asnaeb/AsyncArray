# AsyncArray
[![npm](https://img.shields.io/badge/npm-1.5.5-blueviolet?style=flat)](https://www.npmjs.com/package/@asn.aeb/async-array)
![deps](https://img.shields.io/badge/dependencies-none-brightgreen?style=flat)
![license](https://img.shields.io/badge/license-GPL-blue?style=flat)
## Arrays with async capabilities
`Array` class extension that uses `setImmediate` on iterative methods 
so that the event loop won't be stuck until the end of the iteration. 
Additionally, async callbacks can be used on every instance method that 
takes a callback as an argument.

Keep in mind that async methods are slower than native ones so use it when 
speed **is not** a priority and not blocking the event loop **is**.
## Installation
```
npm i @asn.aeb/async-array
```
## Usage
```javascript
import {AsyncArray} from '@asn.aeb/async-array'
```
An instance of `AsyncArray` can be constructed with normal class syntax
and its constructor shares the same signature with `Array`'s constructor.
```javascript
let arr

arr = new AsyncArray()
// -> AsyncArray(0) []

arr = new AsyncArray(3) 
// -> AsyncArray(3) [<empty>, <empty>, <empty>]

arr = new AsyncArray(1, 2, 3) 
// -> AsyncArray(3) [1, 2, 3]
```
It works just like a normal array
```javascript
arr.push(4, 5, 6)

arr[6] = 7

for (const item of arr) { /* .. */ }
```
With one additional property on its prototype
```javascript
arr.async
```
Under this property, beside this library's own methods, you will find many methods 
that have the same name as `Array.prototype` methods that you know. 
They will provide exactly the same functionality with the difference 
that they will run asynchronously, not blocking the Node.js event loop, 
and will return a promise. Just append `await` before the method invocation or use `.then` after it and use it like you normally would. Some examples can be:

```javascript
await arr.async.filter(item => item > 5) 
// -> AsyncArray(2) [6, 7] 

await arr.async.find(item => item > 5) 
// -> 6 

await arr.async.reduce((acc, curr) => `${acc}.${curr}`) 
// -> '1.2.3.4.5.6.7'

await arr.async.some(item => item > 10) 
// -> false

await arr.async.map(item => item * 10) 
// -> AsyncArray(6) [10, 20, 30, 40, 50, 60, 70]
```

## `AsyncArray.prototype.async`
- `every`
- `filter`
- `fill`
- `find`
- `findIndex`
- `findLast`
- `findLastIndex`
- `forEach`
- `includes`
- `indexOf`
- `lastIndexOf`
- `map`
- `reduce`
- `reduceRight`
- `some`
- **`splitToChunks`**

## Derive from existing arrays
You may find yourself wanting to use these methods on an existing `Array` object. 
Maybe you fetched some data from somewhere - or got a computation result from 
a library - in the form of an array 
```javascript
const myArray = ['normal', 'boring', 'array']
```
Async methods can be used on this object in two ways:
### 1. Copy the array into a new `AsyncArray` object
Using the `from` static method, `myArray` will be left untouched and a new object will be
created in the form of an `AsyncArray` instance
```javascript
const myAsyncArray = AsyncArray.from(myArray)

myAsyncArray[0] = 'async'
myAsyncArray[1] = 'fun'

console.log(myArray)
// prints -> AsyncArray(3) ['normal', 'boring', 'array']

console.log(myAsyncArray)
// prints -> AsyncArray(3) ['async', 'fun', 'array']

console.log(myArray === myAsyncArray)
// prints -> false

console.log(myArray instanceof AsyncArray)
// prints -> false
```
Here, `myAsyncArray` and `myArray` will reference two different objects.
### 2. Transform the `Array` to an `AsyncArray`
Copying over a very large array to a new object can take a while and can be often unnecessary, 
remember we are here to avoid *blocking*. You can transform an array-like object to an `AsyncArray`
by using the `to` static method. Let's repeat the previous example
```javascript
const myAsyncArray = AsyncArray.to(myArray)

myAsyncArray[0] = 'async'
myAsyncArray[1] = 'fun'

console.log(myArray)
// prints -> AsyncArray(3) ['async', 'fun', 'array']

console.log(myAsyncArray)
// prints -> AsyncArray(3) ['async', 'fun', 'array']

console.log(myArray === myAsyncArray)
// prints -> true

console.log(myArray instanceof AsyncArray)
// prints -> true
```
As you can see, `myArray` has not been duplicated. It has just been transformed to an
`AsyncArray` instance and variable `myAsyncArray` now just references that object. 

> #### **Typescript users note**
> If you are looking carefully, you will notice the above example could have been written
> as follows
> ```javascript
> AsyncArray.to(myArray)
> 
> myArray[0] = 'async'
> myArray[1] = 'fun'
> 
> console.log(myArray instanceof AsyncArray) // -> true
> ```
> While this is generally okay, it is always better to assign the transformed object
> to a new identifier when using Typescript so that you can have the correct type on it. Otherwise, you may incurr in problems with typings.

## Async Callbacks
Iterating methods are passed a callback function to be executed on each item of the array they are iterating. Callbacks
passed to `AsyncArray` methods can return a `Promise` which will be resolved before the next iteration. This allows 
the use of async callbacks or callbacks that just return a promise which will be automatically resolved.
### Examples
Log an item every second
```javascript
const myArray = new AsyncArray(1, 2, 3)

// Returned promise is automatically resolved before next iteration
myArray.async.forEach(item => new Promise(resolve => {
    setTimeout(() => resolve(console.log(item)), 1000)
}))
```
Sequentially query a database with key-schema `{id: number}` from an array of numbers and retrieve the result into a new `AsyncArray`
```javascript
const keys = new AsyncArray(1, 2, 3)

const db = myDbClient() // <- Hypotetical database client

// Assume db.get() returns a promise that resolves to the actual item
const items = await arr.async.map(id => db.get({id}))
```
> #### **Note on `map`**
> When using `async.map` method, you may want to obtain an array of promises
> rather than resolving them sequentially. 
> To this purpose, `async.map` method can be given an additional argument,
> specifying whether or not the promises returned should be resolved.
> ```javascript
> const promises = await arr.async.map(id => db.get({id}), false)
>
> // Promises can now be resolved in parallel
> const items = await Promise.all(promises)
> ```
## Own methods
The following methods are not derived from `Array.prototype` methods and provide additional
functionalities, always in the same async flavor.
### `splitToChunks`
Splits the `AsyncArray` object into `AsyncArray`'s of the size passed to its parameter. The last chunk may have a shorter size.
```javascript
const whole = new AsyncArray(1, 2, 3, 4, 5, 6, 7)
const split = await whole.async.splitToCunks(2)

console.log(split.length)
// prints -> 4

console.log(split[0])
// prints -> AsyncArray(2) [1, 2]

console.log(split[1])
// prints -> AsyncArray(2) [3, 4]

console.log(split[2])
// prints -> AsyncArray(2) [5, 6]

console.log(split[3])
// prints -> AsyncArray(2) [7]
```

## Info
This library is under development. More methods are planned to be added in the future and
some work is scheduled to investigate how the speed can be improved. 
While it can be useful, keep in mind that this is not complete and its api is heavily subject to changes.
Contribution / suggestions / feedback on GitHub are really appreciated. 




