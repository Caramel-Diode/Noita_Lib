/**
 * ## Polyfill 等到firefox正式支持这些函数时 此文件就可以不需要嵌入了
 */

/**
 * 取交集运算
 * @param {Set} set
 */
// Set.prototype.intersection ??= set => {
//     const result = new Set();
//     for (const e of set) if (this.has(e)) result.add(e);
//     return result;
// };

/**
 * 取并集运算
 * @param {Set} set
 */
// Set.prototype.union ??= set => new Set([...this, ...set]);

/**
 * 取补集运算
 * @param {Set} set
 */
// Set.prototype.difference ??= set => {
//     const result = new Set([...this]);
//     for (const e of set) result.delete(e);
//     return result;
// };

/**
 * 对应某些低版本的chromium内核浏览器需要这个函数的补丁
 */

//prettier-ignore
// Promise.withResolvers ??=  () => {
//     let resolve, reject;
//     const promise = new Promise((res, rej) => (resolve = res, reject = rej));
//     return { promise, resolve, reject };
// };

{
    /**
     * 最新提案 [Iterator Chunking](https://github.com/tc39/proposal-iterator-chunking)
     */
    function* chunks(size) {
        if (!Number.isInteger(size) || size < 1) throw new RangeError("chunkSize must be a positive integer");
        let chunk = [];
        while (true) {
            const { value, done } = this.next();
            if (done) {
                if (chunk.length) yield chunk;
                return;
            }
            chunk.push(value);
            if (chunk.length === size) {
                yield chunk;
                chunk = [];
            }
        }
    }
    
    // if (window.Iterator) {
        Reflect.defineProperty(Iterator.prototype, "chunks", {
            value: chunks,
            enumerable: false,
            configurable: false
        });
    // } else {
    //     Reflect.defineProperty(Array.prototype.values().constructor.prototype, "chunks", {
    //         value: chunks,
    //         enumerable: false,
    //         configurable: false
    //     });
    // }
}
{
    // Map 新API补丁
    const getOrInsert = function (key, defaultValue) {
        if (this.has(key)) return this.get(key);
        this.set(key, defaultValue);
        return defaultValue;
    };
    const getOrInsertComputed = function (key, callback) {
        if (typeof callback !== "function") {
            throw new TypeError("getOrInsertComputed: callback must be a function");
        }
        if (this.has(key)) return this.get(key);
        const value = callback(key);
        this.set(key, value);
        return value;
    };
    Map.prototype.getOrInsert ??= getOrInsert;
    WeakMap.prototype.getOrInsert ??= getOrInsert;
    Map.prototype.getOrInsertComputed ??= getOrInsertComputed;
    WeakMap.prototype.getOrInsertComputed ??= getOrInsertComputed;
}
