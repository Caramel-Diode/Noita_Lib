const DOMContentLoaded = new Promise(resolve => window.addEventListener("DOMContentLoaded", resolve, { once: true }));
/** @type {typeof document.createElement} */
const createElement = document.createElement.bind(document);
/** @type {typeof document.createElementNS} */
const createElementNS = document.createElementNS.bind(document);
const { freeze } = Object;

/**
 * ### 范围数组生成函数
 * ```js
 * for (const i of rang(from, to, step)) statement;
 * ```
 * @overload
 * @param {Number} from
 * @param {Number} to
 * @param {Number} [step]
 * @returns {Array<Number>}
 */
/**
 * ### 范围数组生成函数
 * ```js
 * for (const i of rang(length)) statement;
 * ```
 * @overload
 * @param {Number} length
 * @returns {Array<Number>}
 */
/**
 * ### 范围数组生成函数
 */
const range = (a, b, step) => {
    if (b === void 0) {
        b = a;
        a = 0;
    }
    if (a > b) {
        step ??= -1;
        if (step >= 0) throw "step should be negative.";
    } else if (b > a) {
        step ??= 1;
        if (step <= 0) throw "step should be positive.";
    } else return [];
    const array = new Array(Math.floor((b - a) / step));
    for (let i = 0; i < array.length; i++, a += step) array[i] = a;
    return array;
};

/**
 * ### 数组分块
 * @template T
 * @param {Array<T>} array 待分块数组
 * @param {Number} size 块大小
 * @returns {Array<Array<T>>}
 */
const toChunks = (array, size) => {
    const len = array.length;
    const chunkAmount = Math.ceil(len / size);
    const chunks = new Array(chunkAmount);

    for (let i = 0, currentIndex = 0; i < chunkAmount; i++) {
        const nextIndex = currentIndex + size;
        chunks[i] = array.slice(currentIndex, nextIndex);
        currentIndex = nextIndex;
    }

    return chunks;
};

/**
 * 将数字转为8位 bit 数组
 * @callback to8Bits
 * @param {Number} num
 * @param {Boolean} toBoolean
 * @returns {[0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1]}
 */
/**
 * 将数字转为16位 bit 数组
 * @callback to16Bits
 * @param {Number} num
 * @param {Boolean} toBoolean
 * @returns {[0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1]}
 */
/**
 * 将数字转为32位 bit 数组
 * @callback to32Bits
 * @param {Number} num
 * @param {Boolean} toBoolean
 * @returns {[0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1]}
 */

/**
 * @type {to8Bits & {16: to16Bits, 32: to32Bits}}
 */
const toBits = (num, toBoolean = false) => {
    const bits = new Array(8);
    if (toBoolean) for (let i = 7; i >= 0; i--) bits[i] = ((num >> i) & 1) === 1;
    else for (let i = 7; i >= 0; i--) bits[i] = (num >> i) & 1;
    return bits;
};

toBits[16] = (num, toBoolean = false) => {
    const bits = new Array(16);
    if (toBoolean) for (let i = 15; i >= 0; i--) bits[i] = ((num >> i) & 1) === 1;
    else for (let i = 15; i >= 0; i--) bits[i] = (num >> i) & 1;
    return bits;
};

toBits[32] = (num, toBoolean = false) => {
    const bits = new Array(32);
    if (toBoolean) for (let i = 31; i >= 0; i--) bits[i] = ((num >> i) & 1) === 1;
    else for (let i = 31; i >= 0; i--) bits[i] = (num >> i) & 1;
    return bits;
};

/** `🔧 工具包` */
const util = {
    /** 解析相关工具 */
    parse: {
        errRestult: Object.freeze([]),
        /** 🏷️ 令牌类 */
        Token: class Token {
            /** 令牌类型类 */
            static Enum = class Enum {
                /**
                 * @param {String} id
                 * @param {String} [color] 前景色
                 * @param {String} [bgColor] 背景色
                 * @param {Number} [fontWeight] 字重
                 * @param {"number"|"string"} [type] 类型
                 * @param {String|Number|undefined} [data] 默认值
                 * @param {Boolean} [needBlank]
                 */
                constructor(id, color = "#fff", bgColor = "#0000", fontWeight = 400, type = "string", needBlank = false, data) {
                    this.id = id;
                    this.type = type;
                    this.style = `color:${color};background:${bgColor};font-weight:${fontWeight};`;
                    this.needBlank = needBlank;
                    this.data = data;
                }
            };
            /**
             * @param {Array<Token>} tokens
             */
            static log(tokens) {
                const baseStyle = "border-radius:2px;padding:1px 1px;line-height:20px;";
                const texts = [],
                    styles = [];
                for (let i = 0; i < tokens.length; i++) {
                    const { text, style, needBlank } = tokens[i].logData;
                    if (needBlank) {
                        texts.push("%c ");
                        styles.push(baseStyle);
                    }
                    texts.push("%c", text);
                    styles.push(baseStyle + style);
                }
                console.log(texts.join(""), ...styles);
                console.table(tokens, ["type", "index", "data"]);
            }

            /** @type {String|Number} */
            data = "";
            /** @type {Array<String>} */
            #cache;
            /** @type {typeof Token.Enum.prototype} */
            #enum;

            get logData() {
                return {
                    text: this.data,
                    style: this.#enum.style,
                    needBlank: this.#enum.needBlank
                };
            }

            /** @returns {String} */
            get type() {
                return this.#enum.id;
            }

            finish() {
                const temp = this.#cache.join("");
                if (this.#enum.type === "number") this.data = +temp;
                else this.data = temp;
                this.#cache = null;
                return this;
            }

            /**
             * @param {String} char
             */
            push(char) {
                this.#cache.push(char);
                return this;
            }

            constructor(tokenEnum, index = -1) {
                if (tokenEnum) {
                    this.#enum = tokenEnum;
                    if (tokenEnum.data) this.data = tokenEnum.data;
                    else this.#cache = [];
                }
                this.index = index;
            }
        },
        /** 检查字符是否为空白符
         * ```javascript
         * /[\s]/
         * ```
         * @type {(char:String) => Boolean}
         */
        isBlank: Set.prototype.has.bind(new Set("\r\n\r\t\v 　")),
        /** 检查字符是数字构成成分
         * ```javascript
         * /[0-9+-]/
         * ```
         * @type {(char:String) => Boolean}
         */
        isNumberPart: Set.prototype.has.bind(new Set("0123456789+-")),
        /** 检查字符是否为常规字符
         * ```javascript
         * /[a-zA-Z0-9_]/
         * ```
         * @type {(char:String) => Boolean}
         */
        isWordPart: Set.prototype.has.bind(new Set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"))
    }
};

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
     *
     * @param {(value:Number)=>any} callback
     * @param {Number} [step]
     */
    for(callback, step = 1) {
        for (let i = this.min; i <= this.max; i += step) callback(i);
    }
}

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
class AABB {
    /**
     *
     * @param {Number} width
     * @param {Number} height
     */
    constructor(width, height) {
        /** @type {Number} */
        this.width = width;
        /** @type {Number} */
        this.height = height;
    }
    toString() {
        return this.width + "×" + this.height;
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
            resolve(db.transaction(["Base64URL"], mode).objectStore("Base64URL"));
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

    // Base64缓存状态获取
    static {
        const { promise, reject, resolve } = Promise.withResolvers();
        /** @type {Promise<Boolean>} */
        this.hasCache = promise;
        const requset = indexedDB.open("noitaLib", 1);
        /** @param {IDBDatabase} db */
        const createStroe = db => {
            db.createObjectStore("Base64URL", { autoIncrement: true });
            resolve(false);
        };
        requset.addEventListener(
            "success",
            ({ target }) => {
                /** @type {IDBDatabase} */
                const db = target.result;
                if (db.objectStoreNames.contains("Base64URL")) {
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
     * @param {String} name 解析线程名称
     * @param {String} url 精灵图路径/Base64URL
     * @param {Number} [width] 图标宽度
     */
    /**
     * @overload 自定义类型
     * @param {String} name 解析线程名称
     * @param {()=>void} workerFn Web Worker 函数
     * @param {[message:any,transfer:Array<Transferable>]} postData Web Worker 所需参数
     */
    constructor(name, a, b) {
        name = "Noita:" + name;
        const { promise, resolve } = Promise.withResolvers();
        /** @type {Promise<Array<String>>} */
        this.results = promise;
        SpriteSpliter.hasCache.then(async hasCache => {
            // 缓存优先
            if (hasCache) return resolve(await SpriteSpliter.get(name));
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
                ({ data }) => {
                    resolve(data);
                    SpriteSpliter.set(name, data);
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

        static $defineElement(name) {
            customElements.define("noita-" + name, this, { extends: "img" });
        }
    }
    return (size, altTag) => {
        altTag = altTag + "图标:";
        return class extends Icon {
            #alt;
            constructor() {
                super(size);
            }
            /** @param {Promise<String>} url */
            set src(url) {
                url.then(v => {
                    if (v) {
                        this.decoding = "async";
                        // this.loading = "lazy";
                        this.style.imageRendering = "pixelated";
                        super.alt = this.#alt;
                        super.src = v;
                    } else this.hidden = true;
                });
            }
            set alt(value) {
                this.#alt = altTag + value;
            }
        };
    };
})();

const math = {
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
        if (param.length === 1) {
            if (param[0]) return Math.round(Math.random() * param[0]);
            else return 0;
        } else {
            let min, max;
            if (param[0] > param[1]) {
                max = param[0];
                min = param[1];
            } else if (param[0] < param[1]) {
                max = param[1];
                min = param[0];
            } else return param[0];
            return Math.round(Math.random() * (max - min) + min);
        }
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

const $symbols = {
    initStyle: Symbol("init-style")
};

/**
 * @template {String} V
 * @typedef $ValueOption 访问/设置器配置
 * @prop {String} name HTML 属性名 `<E name="">`
 * @prop {V} [$default] 默认属性值
 * @prop {Boolean} [needObserve=true] 需要监控变化
 * @prop {V} [$type] 合法值(仅作为泛型参数 不需要传入)
 */

/**
 * ### 为构造器创建子类构造器并返回
 * ---
 * * 为子类的`prototype`添加`getter`, `setter`并绑定到html属性
 * * * `setter`调用 {@linkcode HTMLElement#setAttribute}
 * * * `getter`调用 {@linkcode HTMLElement#getAttribute}
 * * 将属性添加到被观察列表中 `observedAttributes`
 * @template {{ [key:string]: $ValueOption }} T
 * @template {{prototype: HTMLElement,new(): HTMLElement}} C
 * @param {C} constructor 构造器
 * @param {T} propAttrMap objectProp与HTMLAttribute的映射表
 * @returns {{
 * prototype: C["prototype"] & {[K in keyof T]: T[K]["$type"]},
 * new(): C["prototype"] & {[K in keyof T]: T[K]["$type"]};
 * observedAttributes: Array<keyof T>
 *}}
 */
//prettier-ignore
const $class = (constructor = HTMLElement, propAttrMap = {}) => class extends constructor {
    static observedAttributes = [];
    static {
        for (const prop in propAttrMap) {
            const { name, $default, needObserve = true, converter } = propAttrMap[prop];
            if (needObserve) this.observedAttributes.push(name);
            Reflect.defineProperty(this.prototype, prop, {
                get() {
                    return this.hasAttribute(name) ? this.getAttribute(name) : $default;
                },
                set(value = null) {
                    if (value === null) return this.removeAttribute(name);
                    //防止首次设置属性不能自动更新内容
                    if (!this.hasAttribute(name)) this.setAttribute(name, "");
                    this.setAttribute(name, value);
                },
                enumerable: false
            });
        }
        freeze(this.observedAttributes);
        freeze(this);
    }
};

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
    static #toTypes(name) {
        return name.replace(/[a-z]([A-Z])/g, ",$1").toLowerCase();
    }
    /** @type {Map<String,Function>} */
    #fnMap = new Map();
    /** @type {Function} */
    #defaultFn;

    /**
     * @overload
     * @param {...Function} overloads 重载函数表(具名函数的函数名表示类型(大驼峰) 匿名函数表示默认函数)
     */
    /**
     * @overload
     * @param {{[key: String]: Function}} [overloads] 重载函数表(成员名表示类型(大驼峰))
     * @param {Function} [defaultFn] 默认函数
     */
    constructor(...args) {
        super((...args) => {
            const types = args.map(arg => typeof arg);
            const fn = this.#fnMap.get(types.join()) ?? this.#defaultFn;
            if (fn) return fn(...args);
            else this.#error(types);
        });
        if (args[0] instanceof Function) {
            for (let i = 0; i < args.length; i++) {
                if (args[i].name) this.#fnMap.set(OverloadFunction.#toTypes(args[i].name), args[i]);
                else this.#defaultFn = args[i];
            }
        } else {
            let overloads;
            [overloads, this.#defaultFn] = args;
            for (const name in overloads) this.#fnMap.set(OverloadFunction.#toTypes(name), overloads[name]);
        }
    }
    /**
     * @param {Array<"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function">} types
     */
    #error(types) {
        const args = [];
        const msg = [`未实现的重载形式\nfn(`];
        for (let i = 0; i < types.length; i++) {
            msg.push("%c", types[i], "%c,");
            args.push("background:#1f1f1f80;color:#3ac9b0;padding:1px 3px;margin:1px;border-radius:3px;font-weight:800", "background:none");
        }
        msg[msg.length - 1] = "%c)";
        console.error(msg.join(""), ...args, "\n", this.#fnMap);
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

const promptMsg = {
    symbol: Symbol("promptMessage"),
    box: (() => {
        const box = h.dialog({
            style: {
                background: "none",
                border: "none",
                display: "block",
                width: "max-content",
                height: "max-content",
                position: "fixed",
                zIndex: 1024
            }
        });
        DOMContentLoaded.then(() => document.body.append(box));
        box.addEventListener("click", () => promptMsg.hide());
        return box;
    })(),
    /**
     * ### 显示提示窗口
     * @param {Node} node
     * @param {HTMLElement} targetElement
     */
    show(node, targetElement) {
        const { box } = this;
        const { style } = box;
        const { innerHeight, innerWidth } = window;

        const { top, bottom, right, left } = targetElement.getBoundingClientRect();
        box.append(node);
        style.display = "block";
        // 立刻获取尺寸是不准确的 这里需要用一个宏任务
        requestAnimationFrame(() => {
            const { height, width } = box.getBoundingClientRect();

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
        });
    },
    /**
     * ### 隐藏提示窗口
     */
    hide() {
        this.box.style.display = "none";
        this.box.innerHTML = "";
    },
    /**
     * 创建消息盒子
     * @template {HTMLElement} T
     * @param {T} target 附加悬浮提示的目标元素
     * @param {Array<Node>} nodes 内容
     * @param {"common"|"white"} style 盒子样式
     * @returns {T}
     */
    attach(target, nodes, style = "common") {
        const panel = createElement("noita-panel");
        panel.borderStyle = style;
        panel.append(h.div(...nodes));
        target[this.symbol] = panel;
        h.$(target, { Event: this.event });
        return target;
    },
    event: {
        /**
         * @param {MouseEvent}
         */
        mouseenter({ currentTarget }) {
            promptMsg.show(currentTarget[promptMsg.symbol], currentTarget);
        },
        mouseleave() {
            promptMsg.hide();
        }
    }
};
