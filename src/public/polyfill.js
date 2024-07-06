/**
 * ## Polyfill 等到firefox正式支持这些函数时 此文件就可以不需要嵌入了
 */

/**
 * 取交集运算
 * @param {Set} set
 */
Set.prototype.intersection ??= set => {
    const result = new Set();
    for (const e of set) if (this.has(e)) result.add(e);
    return result;
};

/**
 * 取并集运算
 * @param {Set} set
 */
Set.prototype.union ??= set => new Set([...this, ...set]);

/**
 * 取补集运算
 * @param {Set} set
 */
Set.prototype.difference ??= set => {
    const result = new Set([...this]);
    for (const e of set) result.delete(e);
    return result;
};

/**
 * 对应某些低版本的chromium内核浏览器需要这个函数的补丁
 */

//prettier-ignore
Promise.withResolvers ??=  () => {
    let resolve, reject;
    const promise = new Promise((res, rej) => (resolve = res, reject = rej));
    return { promise, resolve, reject };
};
