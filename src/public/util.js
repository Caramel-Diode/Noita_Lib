const DOMContentLoaded = new Promise(resolve => {
    if (document.readyState !== "complete") addEventListener("DOMContentLoaded", resolve, { once: true });
    else resolve();
});
/** @type {typeof Document.prototype.createElement} */
const createElement = Document.prototype.createElement.bind(document);
/** @type {typeof Document.prototype.createElementNS} */
const createElementNS = Document.prototype.createElementNS.bind(document);
const { freeze } = Object;

/**
 * 解析字符串为bigint
 * @param {string} str 数值字符串表示
 * @param {number?} radix 进制 (`0` 或 `undefined` 表示自动检测)
 * @returns {bigint}
 */
const parseBigint = (str, radix = 0) => {
    str = ("" + str).trimStart().toLowerCase();

    // 处理符号（清晰版）
    let isNegative = false;
    if (str.startsWith("-")) {
        isNegative = true;
        str = str.slice(1);
    } else if (str.startsWith("+")) str = str.slice(1);

    // 仅在自动检测或指定为16进制时 检查开头是否为`0x` 并移除
    if ((radix === 0 || radix === 16) && str.startsWith("0x")) {
        str = str.slice(2);
        radix = 16;
    }

    if (radix === 0) radix = 10;

    // 验证 radix 是否在有效范围内
    if (radix < 2 || radix > 36) throw new RangeError("Radix must be an integer between 2 and 36");

    const map = new Map([..."0123456789abcdefghijklmnopqrstuvwxyz".slice(0, radix)].map((char, index) => [char, index]));

    // 解析数字部分
    let result = 0n; // 使用 BigInt 初始化结果
    let hasDigits = false; // 标记是否有有效数字
    for (const char of str) {
        const value = map.get(char);

        // 如果字符不在当前进制范围内，停止解析
        if (value === void 0) break;

        // 将当前字符的值累加到结果中
        result = result * BigInt(radix) + BigInt(value);
        hasDigits = true;
    }
    if (hasDigits) return isNegative ? -result : result; // 如果是负数，添加负号
    throw new SyntaxError("No valid digits found");
};

window.parseBigint = parseBigint;

class Bits {
    /** @type {Array<boolean>} */
    #bits = [];

    /**
     * @param {Array<0|1|true|false>|number|bigint} data (不支持负值)
     * @param {boolean?} toBoolean
     */
    constructor(data) {
        if (Array.isArray(data)) for (const v of data) this.#bits.push(!!v);
        else {
            if (data < 0) throw new Error("Negative values are not supported");
            for (const char of data.toString(2).split("")) this.#bits.push(!!+char);
        }
    }

    get length() {
        return this.#bits.length;
    }

    /**
     * @template {boolean?} T
     * @param {number} [length]
     * @param {T} [toBoolean = true]
     * @returns {Array<T extends true ? boolean : 0|1> }
     */
    toArray(length = this.#bits.length, toBoolean = true) {
        if (length < this.#bits.length) throw new Error("The length must not be less than " + this.#bits.length);
        return new Array(length - this.#bits.length).fill(toBoolean ? false : 0).concat(toBoolean ? this.#bits : this.#bits.map(Number));
    }

    toBigInt() {
        return this.#bits.reduce((acc, bit) => (acc << 1n) | (bit ? 1n : 0n), 0n);
    }
    /**
     * 转为2~36进制字符串
     * @param {number} radix 进制 (2~36)
     */
    toString(radix = 10) {
        return this.toBigInt().toString(radix);
    }
}
/**
 * @template {string} P
 */
class Token {
    /**
     * @param {number} i
     * @returns {Token<"EOF">}
     */
    static eof(i) {
        return new this("EOF", null, i, i);
    }
    /**
     * @param {P} type
     * @param {any} data
     * @param {number} start
     * @param {number} end
     */
    constructor(type, data, start, end) {
        /** @type {P|"EOF"} */
        this.type = type;
        this.data = data;
        /** 起止位置 */
        this.range = {
            /** 开始位置 */
            start,
            /** 结束位置 */
            end
        };
    }
}

/**
 * @template {string} T
 * @typedef LexerOption 分词器配置
 * @prop {T} id
 * @prop {boolean} [ignore]
 * @prop {string} [data]
 * @prop {(raw:string) => any} [value]
 * @prop {(source:string)=>string|undefined} [match]
 */
/** @template {string} T */
class Lexer {
    static preset = {
        BLANK: {
            id: "BLANK",
            ignore: true,
            match(source) {
                let i = 0;
                while (i < source.length && Lexer.isBlank(source[i])) i++;
                if (i > 0) return source.slice(0, i);
            }
        },
        SPELL_ID: {
            id: "SPELL_ID",
            match(source) {
                let i = 0;
                while (i < source.length && Lexer.isWordPart(source[i])) i++;
                if (i > 0) return source.slice(0, i);
            }
        },
        SPELL_TAG: {
            id: "SPELL_TAG",
            match(source) {
                if (!source.startsWith("#")) return;
                let i = 1;
                while (i < source.length && Lexer.isWordPart(source[i])) i++;
                return source.slice(0, i);
            },
            /** 移除#开头 */
            value: raw => raw.slice(1)
        }
    };
    /** 检查字符是否为空白符 (仅支持ASCII范围)
     * @type {(char:string) => 1|0}
     */
    static isBlank = (() => {
        const table = new Uint8Array(64).fill(0);
        for (const c of `\t\n\v\f\r `) table[c.charCodeAt(0)] = 1;
        return char => {
            const code = char.charCodeAt(0);
            return code < 64 ? table[code] : 0;
        };
    })();
    /** 检查字符是数字构成成分
     * ```javascript
     * /[0-9+-]/
     * ```
     * @type {(char:string) => 1|0}
     */
    static isNumberPart = (() => {
        const table = new Uint8Array(64).fill(0);
        table[43] = table[45] = 1; // + -
        for (let i = 48; i <= 57; i++) table[i] = 1; // [0-9] 48-57
        return char => {
            const code = char.charCodeAt(0);
            return code < 64 ? table[code] : 0;
        };
    })();
    /** 检查字符是否为常规字符
     * ```javascript
     * /[a-zA-Z0-9_]/
     * ```
     * @type {(char:string) => 1|0}
     */
    static isWordPart = (() => {
        const table = new Uint8Array(128).fill(0);
        for (let i = 48; i <= 57; i++) table[i] = 1; // [0-9] 48-57
        //                                   [A-Z] 65-90     [a-z] 97-122
        for (let i = 0; i < 26; i++) table[65 + i] = table[97 + i] = 1;
        table[95] = 1; // [_] 95
        return char => {
            const code = char.charCodeAt(0);
            return code < 128 ? table[code] : 0;
        };
    })();
    /** @type {Array<LexerOption<T>>} */
    #tokenTypes = [];
    /**
     * @param {Array<LexerOption<T>>} options
     */
    constructor(options) {
        for (const option of options) {
            if (option.data) {
                const { data } = option;
                option.match = source => {
                    if (source.startsWith(data)) return data;
                };
            }
            if (!option.match) throw new Error("未实现match");
            this.#tokenTypes.push(option);
        }
    }
    /**
     * @param {string} source
     * @returns {Iterable<Token<T>,Token<T>,Token<T>>}
     */
    tokenise(source) {
        let remain = source;
        let i = 0;
        const tokenTypes = this.#tokenTypes;
        // const { Token } = Lexer;
        return {
            *[Symbol.iterator]() {
                $: while (remain.length) {
                    for (const { id, match, ignore, value } of tokenTypes) {
                        let data = match(remain);
                        if (!data) continue;
                        remain = remain.slice(data.length); // 消耗长度
                        const start = i;
                        i += data.length;
                        if (ignore) continue $;
                        if (value) data = value(data);
                        yield new Token(id, data, start, i);
                        continue $;
                    }
                    throw new SyntaxError(`无法匹配到合适的Token类型, ${i} \n${remain}`);
                }
                yield Token.eof(i);
            }
        };
    }
}

/**
 * @typedef {`>=${Number}`|`<=${Number}`|`${Number}~${Number}`|`${Number}`} RangeValueExp
 * ### 范围值表达式
 * ---
 * 支持以下三种表示
 * * `>=min`
 * * `<=max`
 * * `min~max`
 * * `value`
 */

/** 范围值 */
class RangeValue {
    /** 是否为固定值 */
    isFixed = false;
    /** @type {number} */
    median;
    /**
     * @overload
     * @param {RangeValueExp} exp 范围表达式
     
     */

    /**
     * @overload
     * @param {Number} min 最小值
     * @param {Number} max 最大值
     */

    /**
     * @overload
     * @param {Number} value 固定值
     */

    static {
        Reflect.defineProperty(this.prototype, Symbol.toStringTag, {
            value: "RangeValue",
            configurable: false,
            writable: false,
            enumerable: false
        });
    }

    constructor(...args) {
        if (args.length > 1) {
            let [v1, v2] = args;
            if (!Number.isFinite(v1)) this.median = v2;
            else if (!Number.isFinite(v2)) this.median = v1;
            else this.median = (v1 + v2) / 2;
            if (v1 > v2) [this.max, this.min] = args;
            else if (v1 < v2) [this.min, this.max] = args;
            else {
                this.min = this.max = v1;
                this.isFixed = true;
            }
        } else if (typeof args[0] === "string") {
            /** @type {String} */
            const exp = args[0];
            if (exp.startsWith(">=")) {
                const value = +exp.slice(2);
                if (isNaN(value)) throw new SyntaxError("解析失败");
                this.median = this.min = value;
                this.max = Infinity;
            } else if (exp.startsWith("<=")) {
                const value = +exp.slice(2);
                if (isNaN(value)) throw new SyntaxError("解析失败");
                this.median = this.max = value;
                this.min = -Infinity;
            } else if (exp.includes("~")) {
                const [min, max] = exp.split("~");
                if (isNaN(min) || isNaN(max)) throw new SyntaxError("解析失败");
                this.min = +min;
                this.max = +max;
                if (this.max < this.min) [this.min, this.max] = [this.max, this.min];
                this.median = (this.min + this.max) / 2;
            } else {
                const value = +exp;
                if (isNaN(value)) throw new SyntaxError("解析失败");
                this.min = this.max = this.median = value;
                this.isFixed = true;
            }
        } else if (typeof args[0] === "number") {
            this.median = this.min = this.max = args[0];
            this.isFixed = true;
        }
        Reflect.defineProperty(this, "median", { enumerable: false, value: this.median });
        Reflect.defineProperty(this, "isFixed", { enumerable: false, value: this.isFixed });
        /** Object.freeze 防止意外修改 */
        freeze(this);
    }

    /** @param {String} [unitSymbol] 单位符号 */
    toString(unitSymbol = "") {
        if (this.max === Infinity) return "≥ " + this.min + unitSymbol;
        if (this.min === -Infinity) return "≤ " + this.max + unitSymbol;
        if (this.max - this.min) return `${this.min}${unitSymbol} ~ ${this.max}${unitSymbol}`;
        else return this.median + unitSymbol;
    }

    valueOf() {
        return this.median;
    }

    toJSON() {
        return { min: this.min, max: this.max };
    }

    /**
     * 返回一个同步修改最大值和最小值的新Range对象
     * @param {(value:Number)=>Number} callback
     */
    withChange(callback) {
        return new RangeValue(callback(this.min), callback(this.max));
    }

    /**
     * @param {Number|RangeValue} value
     * @returns {Boolean}
     */
    include(value) {
        if (typeof value === "number") {
            if (isNaN(value)) throw new RangeError("NaN不应用于判断");
            if (this.isFixed) return this.median === value;
            return this.min <= value && this.max >= value;
        }
        if (value instanceof RangeValue) return value.max <= this.max && value.min >= this.min;
        throw new TypeError("参数类型不合法");
    }

    /**
     * @param {(value:Number)=>any} callback
     * @param {Number} [step]
     */
    for(callback, step = 1) {
        for (let i = this.min; i <= this.max; i += step) callback(i);
    }

    /**
     * @param {Number} step
     * @returns {Array<Number>}
     */
    asArray(step = 1) {
        const array = [];
        for (let i = this.min; i <= this.max; i += step) array.push(i);
        return array;
    }
}

window.RangeValue = RangeValue;

/** 游戏时间换算对象 */
class GameTime {
    static toS = f => f / 60;
    static toF = s => Math.round(s * 60);

    $f = 0;
    $s = 0;
    /** @param {Number} f 时间(帧) */
    constructor(f) {
        this.$f = f;
        this.$s = f / 60;
        this.f = this.$f + "f";
        this.s = Math.round(this.$s * 100) / 100 + "s";
        freeze(this);
    }
}

/** 包围盒 */
class AABB extends DOMRect {
    /**
     *
     * @param {Number} width
     * @param {Number} height
     */
    constructor(width, height) {
        super(0, 0, width, height);
    }
    toString() {
        return this.width + "×" + this.height;
    }
    toJSON() {
        return { width: this.width, height: this.height };
    }
}

/** 精灵图分割器 */
class SpriteSpliter {
    static #defaultWorker = (async (base64, width) => {
        const bitmap = await createImageBitmap(await (await fetch(base64)).blob());
        /** @type {ImageEncodeOptions} */
        const imageEncodeOptions = { type: "image/webp", quality: 1 };
        // 图标默认为正方形
        width ??= bitmap.height;
        // 图标是水平排列的
        const iconAmount = bitmap.width / width;
        /** @type {Array<Promise<Blob>>} */
        const blobs = new Array(iconAmount);
        for (let i = 0; i < iconAmount; i++) {
            const canvas = new OffscreenCanvas(width, bitmap.height);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(bitmap, -i * width, 0);
            // bitmaps[i] = canvas.transferToImageBitmap();
            blobs[i] = canvas.convertToBlob(imageEncodeOptions);
        }
        // 非常奇怪的是 Chromium浏览器在file协议下无法使用 worker生成blob-url
        // const urls = (await Promise.all(blobs)).map(blob => URL.createObjectURL(blob));
        const reader = new FileReaderSync();
        postMessage((await Promise.all(blobs)).map(blob => reader.readAsDataURL(blob)));
        bitmap.close();
        close(); //使用Blob-URL时不要终止
    }).toString();

    /**
     * @param {IDBTransactionMode} [mode]
     * @returns {Promise<IDBObjectStore>}
     */
    static #getStore(mode = "readonly") {
        const { promise, resolve } = Promise.withResolvers();
        const req = indexedDB.open("noitaLib", 1);
        req.addEventListener("success", ({ target }) => {
            /** @type {IDBDatabase} */
            const db = target.result;
            resolve(db.transaction(["Blob"], mode).objectStore("Blob"));
        });
        return promise;
    }

    /**
     * 从IndexDB中获取Base64缓存
     * @param {String} key
     * @returns {Promise<Array<String>>}
     */
    static async get(key) {
        const { promise, resolve } = Promise.withResolvers();
        (await this.#getStore()).get(key).addEventListener("success", ({ target }) => resolve(target.result));
        return await promise;
    }

    /**
     * 缓存Base64数据
     * @param {String} key
     * @param {Array<String>} value Base64数据
     */
    static async set(key, value) {
        (await this.#getStore("readwrite")).add(value, key);
    }

    // Blob缓存状态获取
    static {
        const { promise, resolve } = Promise.withResolvers();
        /** @type {Promise<Boolean>} */
        this.hasCache = promise;
        const requset = indexedDB.open("noitaLib", 1);
        /** @param {IDBDatabase} db */
        const createStroe = db => {
            db.createObjectStore("Blob", { autoIncrement: true });
            resolve(false);
        };
        requset.addEventListener(
            "success",
            ({ target }) => {
                /** @type {IDBDatabase} */
                const db = target.result;
                if (db.objectStoreNames.contains("Blob")) {
                    db.close();
                    resolve(true);
                } else createStroe(db);
            },
            { once: true }
        );
        requset.addEventListener("upgradeneeded", ({ target }) => createStroe(target.result), { once: true });
    }

    /**
     * @overload 通用简单类型
     * @param {string} name 解析线程名称
     * @param {string} url 精灵图路径/Base64URL
     * @param {number} [width] 图标宽度
     */
    /**
     * @overload 自定义类型
     * @param {string} name 解析线程名称
     * @param {()=>void} workerFn Web Worker 函数
     * @param {[message:any,transfer:Array<Transferable>]} postData Web Worker 所需参数
     */
    constructor(name, a, b) {
        name = "Noita:" + name;
        const { promise, resolve } = Promise.withResolvers();
        /** @type {Promise<Array<string>>} */
        this.results = promise;
        SpriteSpliter.hasCache.then(async hasCache => {
            // 缓存优先
            if (hasCache) {
                const res = await Promise.all((await SpriteSpliter.get(name)).map(URL.createObjectURL));
                return resolve(res);
            }
            /** @type {Worker} */
            let worker, workerUrl, postData;
            if (typeof a === "function") {
                workerUrl = URL.createObjectURL(new Blob(["(", a, ")()"]));
                postData = b;
            } else workerUrl = URL.createObjectURL(new Blob(["(", SpriteSpliter.#defaultWorker, ")('", a, "',", b, ")"]));
            worker = new Worker(workerUrl, { name });
            URL.revokeObjectURL(workerUrl);
            worker.addEventListener(
                "message",
                async ({ data }) => {
                    console.log("非缓存", name);
                    /** @type {Array<Blob>} */
                    const blobs = await Promise.all(data.map(async b64 => await (await fetch(b64)).blob()));
                    resolve(blobs.map(URL.createObjectURL));
                    SpriteSpliter.set(name, blobs);
                    worker.terminate();
                },
                { once: true }
            );
            if (postData) worker.postMessage(...postData);
        });
    }
}

const $icon = (() => {
    class Icon extends HTMLImageElement {
        /**
         * @overload
         * @param {Number} height
         * @param {Number} width
         */

        /**
         * @overload
         * @param {Number} size
         */

        /**
         * 仅填写一个参数时认为该参数同时为宽高的值
         */
        constructor(width = 1, height = width) {
            super();
            this.width = width;
            this.height = height;
        }
        /**
         * @param {Number} zoom
         * @returns {String}
         */
        base64(zoom = 1) {
            const _w = this.naturalWidth * zoom,
                _h = this.naturalHeight * zoom,
                w = this.naturalWidth,
                h = this.naturalHeight;
            const canvas = createElement("canvas");
            canvas.width = _w;
            canvas.height = _h;
            const ctx = canvas.getContext("2d", { desynchronized: true });
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this, 0, 0, w, h, 0, 0, _w, _h);
            return canvas.toDataURL("image/png");
        }

        static define(name) {
            h.img["noita-" + name] = this;
        }
    }
    return (size, altTag) => {
        altTag = altTag + "图标:";
        return class extends Icon {
            #alt;
            constructor() {
                super(size);
            }
            /** @param {Promise<string>|string} url */
            set src(url) {
                if (typeof url === "string") url = Promise.resolve(url);
                url.then(v => {
                    if (v) {
                        this.decoding = "async";
                        this.style.imageRendering = "pixelated";
                        super.alt = this.#alt;
                        super.src = v;
                    } else this.hidden = true;
                });
            }
            get src() {
                return super.src;
            }
            set alt(value) {
                this.#alt = altTag + value;
            }
        };
    };
})();

const _Math = (() => {
    const inject = {
        /**
         * 四舍五入保留x小数
         * @param {Number} num
         * @param {Number} [x] 最多保留的小数位数 默认保留两位
         * @returns {Number}
         */
        roundTo(num, x = 2) {
            const t = Math.pow(10, x);
            return Math.round(num * t) / t;
        },
        /**
         * 以弧度为单位转换为以角度为单位
         * @param {Number} rad 弧度
         * @returns {Number} 角度
         */
        radianToDegree: rad => (rad * 180) / Math.PI,
        /**
         * 获得夹逼后的值
         * @param {Number} value 待夹逼的值
         * @param {Number} min 最小值
         * @param {Number} max 最大值
         * @returns 夹逼后的值
         */
        clamp: (value, min, max) => Math.min(Math.max(value, min), max),
        /**
         * 返回随机数
         */
        /**
         * @overload
         * @param  {Number} min
         * @param  {Number} max
         * @returns {Number}
         */
        /**
         * @overload
         * @param  {Number} max
         * @returns {Number}
         */
        random(...param) {
            if (param.length === 0) return window.Math.random();
            if (param.length === 1) {
                if (param[0]) return window.Math.round(window.Math.random() * param[0]);
                else return 0;
            }
            let min, max;
            if (param[0] > param[1]) {
                max = param[0];
                min = param[1];
            } else if (param[0] < param[1]) {
                max = param[1];
                min = param[0];
            } else return param[0];
            return Math.round(Math.random() * (max - min) + min);
        },
        /**
         * 随机分布
         * @param {Number} min 最小值
         * @param {Number} max 最大值
         * @param {Number} mean 平均值
         * @param {Number} sharpness 锐度
         * @param {Number} baseline 基线
         * @returns {Number}
         */
        randomDistribution(min, max, mean, sharpness = 1, baseline = 0.005) {
            if (min < max && mean > min && mean < max) {
                let val = ((Math.random() - baseline) / (1 - baseline)) * (max - min) + min;
                return val;
            } else {
                console.error(new Error("参数非法"));
                return NaN;
            }
        },
        /**
         * **洗牌** 打乱数组顺序
         * @param {Array} array
         */
        shuffle(array) {
            if (array.length > 1) {
                for (let i = array.length; i > 0; i--) {
                    let j = this.random(0, i);
                    const temp = array[j];
                    array[j] = array[i];
                    array[i] = temp;
                }
            }
        }
    };
    /** @type {typeof inject & Math} */
    const result = Object.assign(Object.create(window.Math), inject);
    return result;
})();

const Callable = new Proxy(Function, {
    construct(_, [fn], { name, prototype }) {
        if (typeof fn !== "function") throw "应传入函数作为构造参数 " + fn;
        Object.defineProperty(fn, "name", { value: `fn<${name}>`, enumerable: false });
        return Object.setPrototypeOf(fn, prototype);
    }
});

/** 可重载函数 */
class OverloadFunction extends Callable {
    /**
     * 将函数/成员名 转化为类型表
     * 函数名应该是仅由 typeof 结果("string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function") 构成的字符串(大驼峰)
     * @param {String} name
     */
    static #nameToTypes(name) {
        return name.split("_").join().toLocaleLowerCase();
    }
    /**
     * @param {Array} args
     */
    static #argToTypes(args) {
        const result = new Array(args.length);
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            result[i] = typeof args[i];
            if (arg instanceof Object) {
                const { constructor } = arg;
                if (constructor) result[i] = constructor.name.toLowerCase();
            }
        }
        return result.join();
    }
    /** @type {Map<String,Function>} */
    #fnMap;

    /**
     * @overload
     * @param {...Function} overloads 重载函数表(具名函数的函数名表示类型(下划线分隔类型) 匿名函数表示默认函数)
     */
    /**
     * @overload
     * @param {{[key: String]: Function}} [overloads] 重载函数表(成员名表示类型(下划线分隔类型))
     * @param {Function} [defaultFn] 默认函数
     */
    constructor(...args) {
        const fnMap = new Map();
        let defaultFn;
        super(function (...args) {
            const types = OverloadFunction.#argToTypes(args);
            const fn = fnMap.get(types) ?? defaultFn;
            if (!fn) return OverloadFunction.#error(types.split(","), fnMap);
            if (new.target) return new fn(...args);
            return fn.apply(this, args);
        });
        this.#fnMap = fnMap;
        if (args[0] instanceof Function) {
            for (let i = 0; i < args.length; i++) {
                if (args[i].name) this.#fnMap.set(OverloadFunction.#nameToTypes(args[i].name), args[i]);
                else defaultFn = args[i];
            }
        } else {
            let overloads;
            [overloads, defaultFn] = args;
            for (const name in overloads) this.#fnMap.set(OverloadFunction.#nameToTypes(name), overloads[name]);
        }
    }

    static #error(types, fnMap) {
        const args = [];
        const msg = [`未实现的重载形式\nfn(`];
        for (let i = 0; i < types.length; i++) {
            msg.push("%c", types[i], "%c,");
            args.push("background:#1f1f1f80;color:#3ac9b0;padding:1px 3px;margin:1px;border-radius:3px;font-weight:800", "background:none");
        }
        msg[msg.length - 1] = "%c)";
        console.error(msg.join(""), ...args, "\n", fnMap);
        throw new TypeError("未实现的重载形式");
    }
    /**
     * 实现一个重载
     * @template {Function} T
     * @param {T} fn
     * @param  {..."string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"} types
     */
    implement(fn, ...types) {
        this.#fnMap.set(types.join(), fn);
    }
}

/** 悬浮提示 */
const hoverMsg = (() => {
    const box = h.dialog({
        role: "tooltip",
        style: {
            background: "none",
            border: "none",
            display: "flex",
            gap: "5px",
            flexDirection: "column",
            placeItems: "start",
            width: "max-content",
            height: "max-content",
            position: "fixed",
            zIndex: 1024,
            pointerEvents: "none"
        }
    });
    const { style } = box;
    DOMContentLoaded.then(() => document.body.append(box));
    box.addEventListener("click", () => {
        if (!supportHover) hoverMsg.hide();
    });
    /** @type {() => void} */
    const showAnimate = (() => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return _ => _;
        return box.animate.bind(
            box,
            [
                { opacity: 0, transform: "scale(0.9)" },
                { opacity: 1, transform: "scale(1)" }
            ],
            { duration: 150, easing: "ease-out" }
        );
    })();
    const symbol = Symbol("promptMessage");
    const event = {
        /**
         * @param {MouseEvent}
         */
        mouseenter: ({ currentTarget }) => hoverMsg.show(currentTarget[symbol], currentTarget),
        mousemove: ({ currentTarget }) => {
            if (style.display === "none") {
                hoverMsg.show(currentTarget[symbol], currentTarget);
            }
        },
        mouseleave: ({ currentTarget }) => {
            currentTarget[symbol].remove();
            style.display = "none";
        }
    };
    return {
        symbol,
        box,
        /**
         * ### 显示提示窗口
         * @param {Node} node
         * @param {HTMLElement} targetElement
         */
        show(node, targetElement) {
            /** 已经被显示的悬浮提示只需要追加新内容 不需要重新应用动画 否则会导致内容模糊 */
            let needAnimate = false;
            if (style.display === "none") {
                box.innerHTML = ""; // 清空上次内容
                needAnimate = true;
            }
            const { innerHeight, innerWidth } = window;
            const { top, bottom, right, left } = targetElement.getBoundingClientRect();
            // 移除仅允许单独展示的悬浮内容
            for (const e of box.children) {
                if (e.hasAttribute("data-single-show")) e.remove();
            }
            box.append(node);
            style.display = "flex";
            const toShow = () => {
                const { height, width } = box.getBoundingClientRect();
                // 判断是否获取成功 否则等待下一帧
                if (!(height && width)) return requestAnimationFrame(toShow);

                // 左右抉择
                const overflowRight = right + width - innerWidth;
                const overflowLeft = -(left - width);

                if (overflowRight <= 0) style.left = right + "px"; // 显示到右侧(最高优先级)
                else if (overflowLeft < overflowRight) {
                    // 显示到左侧
                    const compensation = overflowLeft > 0 ? overflowLeft : 0; // 溢出补偿
                    style.left = left - width + compensation + "px";
                } else {
                    // 显示到右侧
                    const compensation = overflowRight > 0 ? overflowRight : 0; // 溢出补偿
                    style.left = style.left = right - compensation + "px";
                }

                // 上下抉择
                const overflowBottom = bottom + height - innerHeight;
                const overflowTop = -(top - height);

                if (overflowBottom <= 0) style.top = bottom + "px"; // 显示到下侧(最高优先级)
                else if (overflowTop < overflowBottom) {
                    // 显示到上侧
                    const compensation = overflowTop > 0 ? overflowTop : 0; // 溢出补偿
                    style.top = top - height + compensation + "px";
                } else {
                    // 显示到下侧
                    const compensation = overflowBottom > 0 ? overflowBottom : 0; // 溢出补偿
                    style.top = bottom - compensation + "px";
                }
                if (needAnimate) showAnimate();
            };

            // 立刻获取尺寸是不准确的 这里需要用一个宏任务
            requestAnimationFrame(toShow);
            for (const element of box.children) {
                /** @type {HTMLElement} */
                const { shadowRoot } = element;
                if (!shadowRoot) continue;
                if (!keyboard.isShiftDown) continue;
                if (shadowRoot.host.dataset.isShiftDown === "true") continue;
                shadowRoot.host.dataset.isShiftDown = true;
                // 需要用宏任务等待内容加载完成
                requestAnimationFrame(() => contentConvertFn(shadowRoot));
            }
        },
        /**
         * ### 隐藏提示窗口
         */
        hide: () => (style.display = "none"),
        /**
         * 创建消息盒子
         * @template {HTMLElement} T
         * @param {T} target 附加悬浮提示的目标元素
         * @param {Array<Node>} nodes 内容
         * @param {"common"|"white"} style 盒子样式
         * @param {boolean} [replace=false]
         * @returns {T}
         */
        attachWithPanel(target, nodes, style = "common", replace = false) {
            this.attach(target, h`noita-panel`({ "border-style": style }, h.div(...nodes)), replace);
            return target;
        },
        /**
         * @param {HTMLElement} target
         * @param {Node} node
         */
        attach(target, node, replace = false) {
            if (!node) return;
            if (!replace && target[symbol] && target[symbol] !== node) return console.warn("被多个<noita-panel>绑定", node, target);
            target[symbol] = node;
            h.$(target, { Event: event });
        }
    };
})();

const supportHover = matchMedia("(any-hover:hover)").matches;

const keyboard = {
    isShiftDown: false
};
const contentConvertFn = (() => {
    /** @type {Set<ShadowRoot>} */
    const needConvertShadowRoots = new Set();
    /** @type {Set<HTMLElement>} */
    const convertedElements = new Set();
    /** @type {Set<HTMLElement>} */
    const convertedHostElements = new Set();
    /**
     * @param {ShadowRoot} shadowRoot
     */
    const convert = shadowRoot => {
        convertedHostElements.add(shadowRoot.host);
        /** @type {Array<HTMLElement>} */
        for (const element of shadowRoot.querySelectorAll("[data-use-shift-convert]")) {
            element[contentConvertFn.fnSymbol]();
            convertedElements.add(element);
        }
    };

    const listenKeyDown = ({ key }) => {
        if (key === "Shift") {
            keyboard.isShiftDown = true;
            for (const shadowRoot of needConvertShadowRoots) {
                shadowRoot.host.dataset.isShiftDown = true;
                convert(shadowRoot);
            }
            addEventListener("keyup", listenKeyUp, { capture: true, once: true });
        } else addEventListener("keydown", listenKeyDown, { capture: true, once: true });
    };
    const listenKeyUp = ({ key }) => {
        if (key === "Shift") {
            keyboard.isShiftDown = false;
            for (const element of convertedHostElements) element.removeAttribute("data-is-shift-down");
            for (const element of convertedElements) element[contentConvertFn.fnSymbol]();
            convertedHostElements.clear();
            convertedElements.clear();
            addEventListener("keydown", listenKeyDown, { capture: true, once: true });
        } else addEventListener("keyup", listenKeyUp, { capture: true, once: true });
    };
    addEventListener("keydown", listenKeyDown, { capture: true, once: true });
    return Object.assign(convert, {
        /** @type {typeof needConvertShadowRoots.delete} */
        delete: needConvertShadowRoots.delete.bind(needConvertShadowRoots),
        /** @type {typeof needConvertShadowRoots.add} */
        add: needConvertShadowRoots.add.bind(needConvertShadowRoots),
        fnSymbol: Symbol("contentConvert")
    });
})();

/** 创建音效播放函数 */
const createSoundEffectPlayFn = src => {
    /** @type {Set<HTMLAudioElement>} */
    const pool = new Set();
    function del() {
        pool.delete(this);
    }
    function add() {
        pool.add(this);
    }

    return () => {
        if (pool.size) return [...pool][0].play();
        const audio = new Audio(src);
        audio.addEventListener("play", del);
        audio.addEventListener("ended", add);
        audio.play();
    };
};

const soundEffect = {
    click: createSoundEffectPlayFn(embed(`#button_click_soft.flac`)),
    select: createSoundEffectPlayFn(embed(`#button_select.flac`))
};

/** 在库准备好后加载 */
const runAtEnd = (() => {
    /** @type {Array<()=>void>} */
    let taskList = [];
    /** @type {typeof taskList.push} */
    const push = taskList.push.bind(taskList);
    const run = () => {
        taskList.forEach(task => task());
        taskList.length = 0;
    };
    return Object.assign(push, { run });
})();

const CPP = {
    RandomDistribution: (() => {
        let seed;

        {
            const seeds = new Uint32Array(1);
            crypto.getRandomValues(seeds);
            [seed] = seeds;
        }

        function Next() {
            let v4 = Math.trunc(seed * 0x41a7 + Math.trunc(seed / 0x1f31d) * -0x7fffffff);
            if (v4 < 0) v4 += 0x7fffffff;
            seed = v4;
            return seed / 0x7fffffff;
        }

        function GetDistribution(mean, sharpness, baseline) {
            let i = 0;
            do {
                let r1 = Next();
                let r2 = Next();
                let div = Math.abs(r1 - mean);
                if (r2 < (1.0 - div) * baseline) return r1;

                if (div < 0.5) {
                    let v11 = Math.sin((0.5 - mean + r1) * Math.PI);
                    let v12 = Math.pow(v11, sharpness);
                    if (v12 > r2) return r1;
                }
                i++;
            } while (i < 100);
            return Next();
        }

        return function RandomDistribution(min, max, mean, sharpness) {
            if (sharpness === 0) return Math.random() * (max - min) + min;
            let adjMean = (mean - min) / (max - min);
            const v7 = GetDistribution(adjMean, sharpness, 0.005);
            const d = Math.floor((max - min) * v7);
            return min + d;
        };
    })()
};
