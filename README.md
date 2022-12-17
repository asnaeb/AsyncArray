# AsyncArray
Array class with non-blocking methods and async/await support.
It provides the same functionality as native Arrays, using `setImmediate` on each iteration. The event loop won't be stuck until
the end of the full array computation with these methods but this comes at the cost of speed
so use it when speed is not a priority and **not blocking** the event loop **is**.
### Installation
```
npm i @asn.aeb/async-array
```

### Examples
 ```javascript
// AsyncArray can derive from arrays
const array = [1, 2, 3]
const async = AsyncArray.from(array)

// Or be constructed (Standard methods under sync property)
const async = new AsyncArray()
async.sync.push(1, 2, 3)

// Items can be set and accessed with array notation
async[3] = 4
async[3] // --> 4
````
#### forEach
```javascript
await async.forEach(item => /* .. */)
```
Async callbacks are allowed
```javascript
// Will log every second
await async.forEach(async item => {
    await new Promise(resolve => {
        setTimeout(() => resolve(console.log(item)), 1000)
    })
})
```
#### map
```javascript
const mapped = await async.map(item => /* .. */)
mapped instanceof AsyncArray // true
```
Async callback example
```javascript
const items = await dbKeys.map(async key => await db.get(key))
```

### Info
This library is under development. More methods are planned to be added in the future and
some work is scheduled to investigate how the speed can be improved. 
While it can be useful, keep in mind that this is not complete and its api is heavily subject to changes.
Contribution and suggestions on GitHub are really appreciated. 




