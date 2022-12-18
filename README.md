# AsyncArray
Array class with non-blocking methods and async/await support.
It provides the same functionality as native Arrays, using `setImmediate` on each iteration. The event loop won't be stuck until
the end of the full array computation with these methods but this comes at the cost of speed
so use it when speed is not a priority and **not blocking** the event loop **is**.
## Installation
```
npm i @asn.aeb/async-array
```

## Usage
```javascript
import {AsyncArray} from '@asn.aeb/async-array'
```
`AsyncArray`'s can derive form existing arrays using the static method `from`
 ```javascript
const arr = AsyncArray.from([1, 2, 3])
```
Or be standalone
```javascript
const arr = new AsyncArray()
```
Standard array methods will be available under the `sync` property
```javascript
arr.sync.push(1, 2, 3)
```
Items can be set and accessed like using standard array syntax
```javascript
arr[3] = 4
arr[3] // --> 4
```
Iteration with `for...of` can be done as usual
```javascript
for (const item of arr) { /* .. */ }
```
## Methods
- ### forEach
    ```javascript
    await arr.forEach(item => /* .. */)
    ```
    Async callback example
    ```javascript
    // Will log every second
    await arr.forEach(async item => {
        await new Promise(resolve => {
            setTimeout(() => resolve(console.log(item)), 1000)
        })
    })
    ```
- ### map
    ```javascript
    const mapped = await arr.map(item => /* .. */)
    ```
    Async callback example
    ```javascript
    // Assume a database that retrieves items with keys like {id: number}
    const db = dBClient()
    const items = await arr.map(async id => await db.get({id}))
    ```

## Info
This library is under development. More methods are planned to be added in the future and
some work is scheduled to investigate how the speed can be improved. 
While it can be useful, keep in mind that this is not complete and its api is heavily subject to changes.
Contribution and suggestions on GitHub are really appreciated. 




