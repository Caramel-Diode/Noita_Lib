const DOMContentLoaded = new Promise(resolve => window.addEventListener("DOMContentLoaded", resolve, { once: true }));
/** @type {typeof Document.prototype.createElement} */
const createElement = Document.prototype.createElement.bind(document);
/** @type {typeof Document.prototype.createElementNS} */
const createElementNS = Document.prototype.createElementNS.bind(document);
const { freeze } = Object;

/**
 * 将字符串、画布元素、图像元素、`Blob`或`File`、`ArrayBuffer`或类型化数组、对象(转为JSON字符串)等下载为文件
 * @param {HTMLCanvasElement|HTMLMediaElement|HTMLImageElement|HTMLSourceElement|HTMLTrackElement|HTMLEmbedElement|HTMLObjectElement|File|Blob|ArrayBuffer|URL|String} content 下载内容/下载链接
 * @param {String} [filename] 文件名 默认使用页面标题
 * @param {Boolean} [isURL] 传入的字符串是否为下载链接。(否则将作为文本内容下载) 默认为`false`
 */
const download = (content, filename = document.title, isURL) => {
    if (content === void 0 || content === null) throw new TypeError("无下载内容！");
    const anchor = document.createElement("a");
    // 将数值类型与布尔类型转为字符串
    if (typeof content === "number" || typeof content === "bigint" || typeof content === "boolean") return download(String(content), filename);
    if (typeof content === "string") {
        if (isURL) anchor.href = content;
        // 下载为文本内容
        else return download(new Blob([content]), filename);
    }
    // 对象类型
    else if (typeof content === "object") {
        // 画布元素转为base64作为下载链接
        if (content instanceof HTMLCanvasElement) anchor.href = content.toDataURL("image/png");
        // 包含src属性的元素直接使用src属性作为下载链接
        else if (content instanceof HTMLImageElement || content instanceof HTMLMediaElement || content instanceof HTMLSourceElement || content instanceof HTMLTrackElement || content instanceof HTMLEmbedElement) anchor.href = content.src;
        // object元素使用data属性作为下载链接
        else if (content instanceof HTMLObjectElement) anchor.href = content.data;
        // File和Blob类型转为url作为下载链接
        else if (content instanceof Blob) anchor.href = URL.createObjectURL(content);
        // ArrayBuffer将转为Blob进行下载
        else if (content instanceof ArrayBuffer) return download(new Blob([content]), filename);
        // URL对象转为字符串形式
        else if (content instanceof URL) anchor.href = content.href;
        // 类型化数组与DataView 将转为ArrayBuffer
        else if (ArrayBuffer.isView(content)) return download(content.buffer, filename);
        else {
            // 尝试转为JSON字符串
            try {
                return download(new Blob([JSON.stringify(content)]), filename);
            } catch {
                throw new TypeError("对象可能包含循环引用。");
            }
        }
    } else throw new TypeError("无法处理的类型");
    // 设置文件名
    anchor.download = filename;
    anchor.click();
};

const langData = (() => {
    // const url_csvDev = `/public/tool/lang/common_dev.csv`;
    const url_csvDev = `/public/tool/lang/common_base.csv`; // 现在已经不需要用dev版本了
    const url_csvBase = `/public/tool/lang/common_base.csv`;
    let data_dev = null;
    let data_base = null;

    return {
        ready: (async () => {
            data_dev = CSV.parse(await (await fetch(url_csvDev)).text());
            data_dev.useWarn = false;
            data_base = CSV.parse(await (await fetch(url_csvBase)).text());
            return "ok";
        })(),
        /**
         * 获取中文翻译
         * @param {String} id
         * @returns {String}
         */
        getZH_CN(id) {
            let log = `%c查询 %c[${id}]%c`;
            let result = data_dev.get(id, "zh-cn");
            if (result) log += ` → '${result}' from ${url_csvDev}`;
            else {
                result = data_dev.get(id, "en");
                if (result) log += ` → '${result}' from ${url_csvDev} 回退en`;
                else {
                    result = data_base.get(id, "zh-cn");
                    log += ` → '${result}' from ${url_csvBase}`;
                }
            }
            console.log(log, "padding:2px", "color:#33b563;border:1px solid #ffffff;padding:2px", "");
            return result;
        },
        getEN(id) {
            let log = `%c查询 %c[${id}]%c`;
            let result = data_dev.get(id, "en");
            if (result) log += ` → '${result}' from ${url_csvDev}`;
            else {
                result = data_dev.get(id, "en");
                if (result) log += ` → '${result}' from ${url_csvDev} 回退en`;
                else {
                    result = data_base.get(id, "en");
                    log += ` → '${result}' from ${url_csvBase}`;
                }
            }
            console.log(log, "padding:2px", "color:#33b563;border:1px solid #ffffff;padding:2px", "");
            return result;
        }
    };
})();

class Canvas extends HTMLCanvasElement {
    static {
        customElements.define("util-canvas", this, { extends: "canvas" });
    }
    constructor(width = 300, height = 150) {
        super();
        this.width = width;
        this.height = height;
    }
}

/** @param {Array<String>} urls */
Image.from = async urls => {
    /** @type {Array<Promise<HTMLImageElement>>} */
    const promiseList = [];
    for (const url of urls) {
        const { promise, reject, resolve } = Promise.withResolvers();
        const img = new Image();
        const callback = () => resolve(img);
        img.addEventListener("load", callback);
        img.addEventListener("error", callback);
        img.src = url;
        promiseList.push(promise);
    }
    return await Promise.all(promiseList);
};

/**
 * ### 生成精灵图
 * ---
 * @param {Array<String|CanvasImageSource>} urlsOrImgs 图像或图像链接
 * @param {Object} option 配置
 * @param {Object} option.clip 裁剪参数
 * @param {Number} option.clip.sx
 * @param {Number} option.clip.sy
 * @param {Number|{width:Number,height:Number}} option.size 图像尺寸(裁剪后)
 * @returns {Promise<HTMLCanvasElement>}
 */
const createSprite = async (urlsOrImgs, option) => {
    if (typeof option.size === "number")
        option.size = {
            height: option.size,
            width: option.size
        };
    const canvas = createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.height = option.size.height;
    canvas.width = urlsOrImgs.length * option.size.width;
    /** @type {Array<HTMLImageElement>} */
    let imgs;
    const type = typeof urlsOrImgs[0];
    if (type === "string") imgs = Image.from(urlsOrImgs);
    else if (type === "object") imgs = urlsOrImgs;

    const { sx = 0, sy = 0 } = option.clip ?? {};
    const { width, height } = option.size;
    for (let i = 0; i < imgs.length; i++) {
        const e = imgs[i];
        if (e instanceof Error) {
            console.warn(e);
            continue;
        }
        ctx.drawImage(e, sx, sy, width, width, i * width, 0, width, height);
    }
    return canvas;
};
/**
 * ### url转为Base64
 * @param {String|CanvasImageSource} urlOrImg
 * @param {Number} scale 缩放系数
 */
const urlToBase64 = async (urlOrImg, scale) => {
    const type = typeof urlOrImg;
    /** @type {HTMLImageElement} */
    let img = null;
    if (type === "string") {
        img = new Image();
        const { promise, reject, resolve } = Promise.withResolvers();
        img.addEventListener("load", () => resolve());
        await promise;
    } else if (type === "object") img = urlOrImg;
    const canvas = createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
};

/**
 * ### 临时实现的JSON5转化为字符串的功能
 */
const JSON5 = {
    /**
     * @param {*} value
     * @param {Object} [option] symbol作为键可以将 value中的symbol类型值替换为 option的symbol对应的值 否则将使用symbol.description
     * @param {boolean} [option.booleanToNumber] 布尔值转为数字表示
     * @param {boolean} [option.useExp] 使用表达式缩短字面量表示
     * @param {any} [option.default] null/undefined 默认值
     * @returns {string}
     */
    stringify(value, option) {
        let $true = "true";
        let $false = "false";
        if (option?.booleanToNumber) {
            $true = 1;
            $false = 0;
        }
        const useExp = option?.useExp ?? true;
        value ??= option?.default ?? null;
        if (value === null) return null;
        switch (typeof value) {
            case "string":
                return JSON.stringify(value);
            case "number": // 获取最短表示形式
                if (Number.isNaN(value)) return "NaN";
                if (value === Infinity) return useExp ? "1/0" : "Infinity";
                if (value === -Infinity) return useExp ? "-1/0" : "-Infinity";

                let [before, after] = value.toExponential().split("e").map(Number);
                let sign = "";
                if (after < 0) {
                    after = -after;
                    sign = "-";
                }
                if (!Number.isInteger(before)) {
                    // 移除小数点
                    const str = before.toString();
                    after -= str.split(".").at(-1).length;
                    before = str.replace(".", "");
                }
                const exponential = before + "e" + sign + after; // 科学计数法
                const hex = Number.isInteger(value) ? "0x" + value.toString(16) : { length: Infinity }; // 十六进制;
                const decimal = value.toString().replace("0.", "."); // 十进制
                let shortest = hex;
                if (shortest.length > decimal.length) shortest = decimal;
                if (shortest.length > exponential.length) shortest = exponential;
                return shortest;
            case "bigint": {
                if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
                    const decimal = value.toString() + "n";
                    const hex = `0x${value.toString(16)}n`; // 十六进制;
                    if (decimal.length > hex.length) return hex;
                    return decimal;
                }
                return this.stringify(Number(value));
            }
            case "boolean":
                return value ? $true : $false;
            case "symbol":
                return option?.[value] ?? value.description;
            case "undefined":
                return null;
        }
        const cache = [];
        if (Array.isArray(value)) {
            for (const e of value) cache.push(JSON5.stringify(e, option));
            return `[${cache.join(",")}]`;
        }
        for (const key in value) {
            let legalKey = key;
            for (const char of [...key]) {
                if ("!@#%^&*()-+=`~[]{}|;':\",./<>?".includes(char)) {
                    legalKey = JSON.stringify(key);
                    break;
                }
            }
            if (legalKey === "") legalKey = `""`;
            cache.push(legalKey + ":" + JSON5.stringify(value[key], option));
        }
        return `{${cache.join(",")}}`;
    }
};

const PNG = {
    /**
     * ### 解析PNG图片文件
     * @param {ArrayBuffer} buffer
     */
    parse: (() => {
        /**
         * 将多个u8array中的连续4个ui8合并为一个数字
         * @param {Uint8Array} u8a
         * @param {Number} offset
         */
        const u8ToU32 = (u8a, offset) => new DataView(u8a.buffer, offset, 4).getUint32(0);

        class Chunk {
            /** chunk长度 */
            length = 0;
            /** chunk名称 */
            name = "";
            /** @type {Uint8Array} 数据段 修改会同步到构造函数中的u8array */
            data;
            /** @type {Number} CRC校验 */
            crc;
            /** chunk 起始位置 */
            startIndex;
            /** chunk 结束位置 */
            endIndex;
            /**
             * @param {Uint8Array} u8array
             * @param {Number} start
             */
            constructor(u8array, start) {
                this.startIndex = start;
                const dataLength = u8ToU32(u8array, start);
                this.length = 12 + dataLength;
                this.name = String.fromCharCode(u8array[start + 4], u8array[start + 5], u8array[start + 6], u8array[start + 7]);
                const dataStart = start + 8; // (数据段长度4字节 + chunk名4字节)
                const dataEnd = dataStart + dataLength;
                this.data = new Proxy(u8array.slice(dataStart, dataEnd), {
                    get(target, p, receiver) {
                        const $return = target[p];
                        if (typeof $return === "function") return $return.bind(target);
                        else return $return;
                    },
                    set(target, p, newValue, receiver) {
                        if (p in target) {
                            const n = Number(p);
                            if (Number.isNaN(n)) target[p] = newValue;
                            else {
                                target[p] = newValue;
                                u8array[dataStart + n] = newValue;
                            }
                        } else target[p] = newValue;
                        return true;
                    }
                });
                this.crc = u8ToU32(u8array, dataEnd);
                this.endIndex = dataEnd + 3;
            }
        }

        class PNGData {
            /** @type {Uint8Array} */
            #u8array;
            /**
             * |data|length(byte)|
             * |:---|:----------:|
             * |Width             |4|
             * |Height            |4|
             * |Bit depth         |1|
             * |Colour type       |1|
             * |Compression method|1|
             * |Filter method     |1|
             * |Interlace method  |1|
             * @type {{
             * width: Number,
             * height: Number,
             * bitDepth: Number,
             * colourType: Number,
             * compressionMethod: Number,
             * filterMethod: Number,
             * interlaceMethod: Number
             * }}
             */
            chunk_IHDR = {};

            /**
             * |data|length(byte)|
             * |:---|:----------:|
             * |value|4|
             * @type {{value:Number}}
             */
            chunk_gAMA = {};
            /** @param {ArrayBuffer} buffer */
            constructor(buffer) {
                const data = (this.#u8array = new Uint8Array(buffer));
                //#region 格式校验
                /**
                 * ### PNG 签名字节(文件头) (8byte)
                 * The first eight bytes of a PNG datastream always contain the following hexadecimal values:
                 * `89 50 4E 47 0D 0A 1A 0A`
                 * ---
                 * | 序号 | HEX |  U8  | 描述 |
                 * | :-: | :-: | :--: | :--: |
                 * | 1   | `89`| `137` | A byte with its most significant bit set (``8-bit character'') |
                 * | 2   | `50`| `80`  | **P** |
                 * | 3   | `4E`| `78`  | **N** |
                 * | 4   | `47`| `71`  | **G** |
                 * | 5   | `0D`| `13`  | Carriage-return `CR` character, a.k.a. `CTRL-M` or `^M` |
                 * | 6   | `0A`| `10`  | Line-feed `LF` character, a.k.a. `CTRL-J` or `^J` |
                 * | 7   | `1A`| `26`  | `CTRL-Z` or `^Z` |
                 * | 8   | `0A`| `10`  | Line-feed `LF` character, a.k.a. `CTRL-J` or `^J` |
                 * @typedef {*} $COMMENT
                 */

                //prettier-ignore
                if (
                    data[0] !== 137 || data[1] !== 80 || data[2] !== 78 || data[3] !== 71 ||
                    data[4] !== 13 || data[5] !== 10 || data[6] !== 26 || data[7] !== 10
                ) throw new TypeError("不是合法的PNG图片");
                //#endregion

                //#region 解析chunk
                /** @type {Array<Chunk>} */
                const chunks = [];
                let i = 8;
                do {
                    const chunk = new Chunk(data, i);
                    i = chunk.endIndex + 1;
                    if (Number.isNaN(i)) throw new Error("图片损坏");
                    chunks.push(chunk);
                } while (i !== data.length);
                //#endregion

                if (chunks.at(0).name !== "IHDR" || chunks.at(-1).name !== "IEND") throw new TypeError("不是合法的PNG图片");

                const chunk_IHDR = chunks[0];
                const chunk_IHDR_data = chunk_IHDR.data;
                this.chunk_IHDR.width = u8ToU32(chunk_IHDR_data, 0);
                this.chunk_IHDR.height = u8ToU32(chunk_IHDR_data, 4);
                this.chunk_IHDR.bitDepth = chunk_IHDR_data[8];
                this.chunk_IHDR.colourType = chunk_IHDR_data[9];
                this.chunk_IHDR.compressionMethod = chunk_IHDR_data[10];
                this.chunk_IHDR.filterMethod = chunk_IHDR_data[11];
                this.chunk_IHDR.interlaceMethod = chunk_IHDR_data[12];
                Object.freeze(this.chunk_IHDR);

                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    if (chunk.name === "gAMA") {
                        const chunk_gAMA_data = chunk.data;
                        Object.defineProperty(this.chunk_gAMA, "value", {
                            get() {
                                return u8ToU32(chunk_gAMA_data, 0);
                            },
                            /** @param {Number} value */
                            set(value) {
                                // 位运算看起来有些抽象 等效下面注释的代码
                                chunk_gAMA_data[3] = value & 255; // (value >> 0) & 255
                                chunk_gAMA_data[2] = (value >> 8) & 255;
                                chunk_gAMA_data[1] = (value >> 16) & 255;
                                chunk_gAMA_data[0] = (value >> 24) & 255;
                                // const temp = String(parseInt(value, 16)).padStart(8, "0");
                                // chunk_gAMA_data[0] = Number(temp.slice(0, 2));
                                // chunk_gAMA_data[1] = Number(temp.slice(2, 4));
                                // chunk_gAMA_data[2] = Number(temp.slice(4, 6));
                                // chunk_gAMA_data[3] = Number(temp.slice(6, 8));
                            }
                        });
                    }
                }
            }
        }
        /** @param {ArrayBuffer} buffer */
        return buffer => new PNGData(buffer);
    })(),
    /**
     * ### 置零png图片的gamaz值
     * @param {String} url
     * @returns {Promise<HTMLImageElement>}
     */
    removeGAMA(url) {
        const { promise, reject, resolve } = Promise.withResolvers();
        fetch(url).then(response =>
            response.arrayBuffer().then(buffer => {
                const pngData = this.parse(buffer);
                if (pngData.chunk_gAMA.value) {
                    pngData.chunk_gAMA.value = 0; //清除 gAMA 值
                    console.warn(url, "gama置零");
                }
                const newUrl = URL.createObjectURL(new Blob([buffer], { type: "image/png" }));
                const img = new Image();
                img.width = pngData.chunk_IHDR.width;
                img.height = pngData.chunk_IHDR.height;
                img.addEventListener("load", () => resolve(img));
                img.src = newUrl;
                img.title = `from: ${url}`;
            })
        );
        return promise;
    }
};

/**
 * 从url解析csv
 * @param {String} url
 */
const parseCSVFromUrl = async url => CSV.parse(await (await fetch(url)).text());

/**
 * 从url解析xml
 * @param {String} url
 */
const parseXMLFromUrl = async url => XML.parse(await (await fetch(url)).text());

class StringBuffer {
    #cache = [];
    constructor(...strings) {
        this.#cache = strings;
    }
    append(...strings) {
        this.#cache.push(...strings);
    }
    prepend(...strings) {
        this.#cache.unshift(...strings);
    }
    toString() {
        return this.#cache.join("");
    }
}

/**
 * ### 将 bit 数组转为数字
 * *注意 bit 数组最高支持 53 位*
 * @param {Array<0|1>} bits
 * @returns {Number}
 */
const bitsToNum = bits => {
    let num = 0;
    for (let i = 0; i < bits.length; i++) num += Boolean(bits[i]) * 2 ** i;
    return num;
};

class Bits {
    /** @type {Array<boolean>} */
    #bits = [];

    /**
     * @param {Array<0|1|true|false>|number|bigint} data (不支持负值)
     * @param {boolean?} toBoolean
     */
    constructor(data) {
        if (Array.isArray(data)) {
            for (const v of data) this.#bits.push(!!v);
        } else {
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
 * #### 将蛇形命名法字符串转换为驼峰命名字符串
 * @param {String} rawString 蛇形命名法字符串
 * @returns {String}
 */
const toHumpNaming = (() => {
    /**
     * @param {String} _
     * @param {String} $1
     */
    const fn = (_, $1) => $1.toLocaleUpperCase();
    return rawString => rawString.replace(/_([a-z])/g, fn);
})();

const Color = (() => {
    const clamp = (n, min = 0, max = 255) => Math.max(min, Math.min(max, n));
    const clamp1 = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
    const round = n => Math.round(n * 100) / 100;

    const CSS_COLOR_NAMES = {
        aliceblue: "#f0f8ff",
        antiquewhite: "#faebd7",
        aqua: "#00ffff",
        aquamarine: "#7fffd4",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        bisque: "#ffe4c4",
        black: "#000000",
        blanchedalmond: "#ffebcd",
        blue: "#0000ff",
        blueviolet: "#8a2be2",
        brown: "#a52a2a",
        burlywood: "#deb887",
        cadetblue: "#5f9ea0",
        chartreuse: "#7fff00",
        chocolate: "#d2691e",
        coral: "#ff7f50",
        cornflowerblue: "#6495ed",
        cornsilk: "#fff8dc",
        crimson: "#dc143c",
        cyan: "#00ffff",
        darkblue: "#00008b",
        darkcyan: "#008b8b",
        darkgoldenrod: "#b8860b",
        darkgray: "#a9a9a9",
        darkgreen: "#006400",
        darkgrey: "#a9a9a9",
        darkkhaki: "#bdb76b",
        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkorchid: "#9932cc",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkseagreen: "#8fbc8f",
        darkslateblue: "#483d8b",
        darkslategray: "#2f4f4f",
        darkslategrey: "#2f4f4f",
        darkturquoise: "#00ced1",
        darkviolet: "#9400d3",
        deeppink: "#ff1493",
        deepskyblue: "#00bfff",
        dimgray: "#696969",
        dimgrey: "#696969",
        dodgerblue: "#1e90ff",
        firebrick: "#b22222",
        floralwhite: "#fffaf0",
        forestgreen: "#228b22",
        fuchsia: "#ff00ff",
        gainsboro: "#dcdcdc",
        ghostwhite: "#f8f8ff",
        gold: "#ffd700",
        goldenrod: "#daa520",
        gray: "#808080",
        green: "#008000",
        greenyellow: "#adff2f",
        grey: "#808080",
        honeydew: "#f0fff0",
        hotpink: "#ff69b4",
        indianred: "#cd5c5c",
        indigo: "#4b0082",
        ivory: "#fffff0",
        khaki: "#f0e68c",
        lavender: "#e6e6fa",
        lavenderblush: "#fff0f5",
        lawngreen: "#7cfc00",
        lemonchiffon: "#fffacd",
        lightblue: "#add8e6",
        lightcoral: "#f08080",
        lightcyan: "#e0ffff",
        lightgoldenrodyellow: "#fafad2",
        lightgray: "#d3d3d3",
        lightgreen: "#90ee90",
        lightgrey: "#d3d3d3",
        lightpink: "#ffb6c1",
        lightsalmon: "#ffa07a",
        lightseagreen: "#20b2aa",
        lightskyblue: "#87cefa",
        lightslategray: "#778899",
        lightslategrey: "#778899",
        lightsteelblue: "#b0c4de",
        lightyellow: "#ffffe0",
        lime: "#00ff00",
        limegreen: "#32cd32",
        linen: "#faf0e6",
        magenta: "#ff00ff",
        maroon: "#800000",
        mediumaquamarine: "#66cdaa",
        mediumblue: "#0000cd",
        mediumorchid: "#ba55d3",
        mediumpurple: "#9370db",
        mediumseagreen: "#3cb371",
        mediumslateblue: "#7b68ee",
        mediumspringgreen: "#00fa9a",
        mediumturquoise: "#48d1cc",
        mediumvioletred: "#c71585",
        midnightblue: "#191970",
        mintcream: "#f5fffa",
        mistyrose: "#ffe4e1",
        moccasin: "#ffe4b5",
        navajowhite: "#ffdead",
        navy: "#000080",
        oldlace: "#fdf5e6",
        olive: "#808000",
        olivedrab: "#6b8e23",
        orange: "#ffa500",
        orangered: "#ff4500",
        orchid: "#da70d6",
        palegoldenrod: "#eee8aa",
        palegreen: "#98fb98",
        paleturquoise: "#afeeee",
        palevioletred: "#db7093",
        papayawhip: "#ffefd5",
        peachpuff: "#ffdab9",
        peru: "#cd853f",
        pink: "#ffc0cb",
        plum: "#dda0dd",
        powderblue: "#b0e0e6",
        purple: "#800080",
        rebeccapurple: "#663399",
        red: "#ff0000",
        rosybrown: "#bc8f8f",
        royalblue: "#4169e1",
        saddlebrown: "#8b4513",
        salmon: "#fa8072",
        sandybrown: "#f4a460",
        seagreen: "#2e8b57",
        seashell: "#fff5ee",
        sienna: "#a0522d",
        silver: "#c0c0c0",
        skyblue: "#87ceeb",
        slateblue: "#6a5acd",
        slategray: "#708090",
        slategrey: "#708090",
        snow: "#fffafa",
        springgreen: "#00ff7f",
        steelblue: "#4682b4",
        tan: "#d2b48c",
        teal: "#008080",
        thistle: "#d8bfd8",
        tomato: "#ff6347",
        turquoise: "#40e0d0",
        violet: "#ee82ee",
        wheat: "#f5deb3",
        white: "#ffffff",
        whitesmoke: "#f5f5f5",
        yellow: "#ffff00",
        yellowgreen: "#9acd32"
    };

    class HEX {
        constructor(r, g, b, a = 1) {
            this.r = clamp(Math.round(r));
            this.g = clamp(Math.round(g));
            this.b = clamp(Math.round(b));
            this.a = clamp1(a);
            Object.freeze(this);
        }
        static fromRGBA(r, g, b, a) {
            return new HEX(r, g, b, a);
        }
        [Symbol.toPrimitive]() {
            const toHex = v => clamp(v).toString(16).padStart(2, "0");
            let out = toHex(this.r) + toHex(this.g) + toHex(this.b);
            if (this.a !== 1) out += toHex(Math.round(this.a * 255));
            return "#" + out;
        }
    }

    class RGB {
        constructor(r, g, b, a = 1) {
            this.r = clamp(Math.round(r));
            this.g = clamp(Math.round(g));
            this.b = clamp(Math.round(b));
            this.a = clamp1(a);
            Object.freeze(this);
        }
        static fromRGBA(r, g, b, a) {
            return new RGB(r, g, b, a);
        }
        [Symbol.toPrimitive]() {
            const { r, g, b, a } = this;
            return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
        }
    }

    class HSL {
        constructor(h, s, l, a = 1) {
            this.h = round(h);
            this.s = round(s);
            this.l = round(l);
            this.a = clamp1(a);
            Object.freeze(this);
        }
        static fromRGBA(r, g, b, a) {
            r /= 255;
            g /= 255;
            b /= 255;
            const max = Math.max(r, g, b),
                min = Math.min(r, g, b),
                d = max - min;
            const l = (max + min) / 2;
            const s = d === 0 ? 0 : l > 0.5 ? d / (2 - max - min) : d / (max + min);
            const h = d === 0 ? 0 : (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4) / 6;
            return new HSL(round(h * 360), round(s * 100), round(l * 100), a);
        }
        static toRGB(h, s, l) {
            h = (h % 360) / 360;
            s = clamp1(s / 100);
            l = clamp1(l / 100);

            let r, g, b;

            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };

                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;

                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
        [Symbol.toPrimitive]() {
            const { h, s, l, a } = this;
            return a === 1 ? `hsl(${h}, ${s}%, ${l}%)` : `hsla(${h}, ${s}%, ${l}%, ${a})`;
        }
    }

    class HSV {
        constructor(h, s, v, a = 1) {
            this.h = round(h);
            this.s = round(s);
            this.v = round(v);
            this.a = clamp1(a);
            Object.freeze(this);
        }
        static fromRGBA(r, g, b, a) {
            r /= 255;
            g /= 255;
            b /= 255;
            const max = Math.max(r, g, b),
                min = Math.min(r, g, b),
                d = max - min;
            const s = max === 0 ? 0 : d / max;
            const h = d === 0 ? 0 : (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4) / 6;
            return new HSV(round(h * 360), round(s * 100), round(max * 100), a);
        }
        static toRGB(h, s, v) {
            h = (h % 360) / 360;
            s = clamp1(s / 100);
            v = clamp1(v / 100);

            let r, g, b;
            const i = Math.floor(h * 6);
            const f = h * 6 - i;
            const p = v * (1 - s);
            const q = v * (1 - f * s);
            const t = v * (1 - (1 - f) * s);

            switch (i % 6) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;
                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;
                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;
                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;
                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = p;
                    b = q;
                    break;
            }

            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
        [Symbol.toPrimitive]() {
            const { h, s, v, a } = this;
            return a === 1 ? `hsv(${h}, ${s}%, ${v}%)` : `hsva(${h}, ${s}%, ${v}%, ${a})`;
        }
    }
    /** @typedef { {[key in keyof (typeof CSS_COLOR_NAMES)]:Color}} ColorList */

    class Color {
        hex;
        rgb;
        hsl;
        hsv;
        constructor(value, name) {
            if (value in CSS_COLOR_NAMES) value = CSS_COLOR_NAMES[value];
            if (typeof value === "number") value = "#" + value.toString(16).padStart(6, "0");
            if (name) this.name = name;
            value = value.trim();
            let r, g, b, a;
            const hexMatch = value.match(/^#?([0-9a-fA-F]{3,8})$/);
            if (hexMatch) {
                let hex = hexMatch[1];

                if (hex.length === 3 || hex.length === 4) {
                    // Expand short hex format
                    hex = hex
                        .split("")
                        .map(c => c + c)
                        .join("");
                }

                if (hex.length === 6 || hex.length === 8) {
                    r = parseInt(hex.slice(0, 2), 16);
                    g = parseInt(hex.slice(2, 4), 16);
                    b = parseInt(hex.slice(4, 6), 16);
                    if (hex.length === 8) {
                        a = parseInt(hex.slice(6, 8), 16) / 255;
                    }
                }
            } else if (value.startsWith("rgb")) {
                const rgbaMatch = value.match(/rgba?\(([^)]+)\)/);
                if (rgbaMatch) {
                    const parts = rgbaMatch[1].split(",").map(p => p.trim());
                    if (parts.length >= 3) {
                        r = parseInt(parts[0]);
                        g = parseInt(parts[1]);
                        b = parseInt(parts[2]);
                        if (parts.length >= 4) {
                            a = parseFloat(parts[3]);
                        }
                    }
                }
            } else if (value.startsWith("hsl")) {
                const hslaMatch = value.match(/hsla?\(([^)]+)\)/);
                if (hslaMatch) {
                    const parts = hslaMatch[1].split(",").map(p => p.trim());
                    if (parts.length >= 3) {
                        const h = parseFloat(parts[0]);
                        const s = parseFloat(parts[1].replace("%", ""));
                        const l = parseFloat(parts[2].replace("%", ""));
                        if (parts.length >= 4) {
                            a = parseFloat(parts[3]);
                        }
                        [r, g, b] = HSL.toRGB(h, s, l);
                        this.hsl = new HSL(h, s, l, a);
                    }
                }
            } else if (value.startsWith("hsv")) {
                const hsvaMatch = value.match(/hsva?\(([^)]+)\)/);
                if (hsvaMatch) {
                    const parts = hsvaMatch[1].split(",").map(p => p.trim());
                    if (parts.length >= 3) {
                        const h = parseFloat(parts[0]);
                        const s = parseFloat(parts[1].replace("%", ""));
                        const v = parseFloat(parts[2].replace("%", ""));
                        if (parts.length >= 4) {
                            a = parseFloat(parts[3]);
                        }
                        [r, g, b] = HSV.toRGB(h, s, v);
                        this.hsv = new HSV(h, s, v, a);
                    }
                }
            }

            if (r === undefined || g === undefined || b === undefined) {
                throw new Error("Invalid color format");
            }
            this.hex ??= new HEX(r, g, b, a);
            this.rgb ??= new RGB(r, g, b, a);
            this.hsl ??= HSL.fromRGBA(r, g, b, a);
            this.hsv ??= HSV.fromRGBA(r, g, b, a);
            Object.freeze(this);
        }
    }
    const cacheMap = new Map();
    const keywordMap = Object.create(null);
    for (const name in CSS_COLOR_NAMES) {
        const color = new Color(CSS_COLOR_NAMES[name], name);
        cacheMap.set("" + color.hex, color);
        Reflect.defineProperty(keywordMap, name, { value: color, enumerable: true });
    }
    Object.freeze(Color);

    /** @type {{new(value: keyof ColorList | number ):Color} & ColorList} */
    const result = new Proxy(Color, {
        construct(target, args, newTarget) {
            // 拦截构造器 保证单例模式
            const color = new Color(...args);
            const key = "" + color.hex;
            let cache = cacheMap.get(key);
            if (cache) return cache;
            cacheMap.set(key, color);
            return color;
        },
        get(target, p, rec) {
            if (p in keywordMap) return keywordMap[p];
        }
    });
    return result;
})();

/**
 * ### 生成枚举对象
 * @type {{
 * <T extends Array<string>>(desc:symbol,...enums:T): {[K in T[number]]:symbol}
 * <T extends Array<string>>(...enums:T): {[K in T[number]]:symbol}
 * }}
 */
const $enum = (() => {
    const prototype = Object.create(null);
    prototype[Symbol.iterator] = function* () {
        for (key in this) yield [key, this[key]];
    };
    freeze(prototype);
    const f = (desc, enums) => {
        const enumsSet = new Set(enums);
        const thisProto = Object.create(prototype);
        let toStringTag = desc;
        // 在控制台显示描述 toStringTag {...} 便于调试
        thisProto[Symbol.toStringTag] = toStringTag = desc;
        // 使用匿名类添加私有属性#kinds (仅在控制台可见以用于调试目的 而无法被js代码使用)
        const result = new (class {
            #kinds = enumsSet.size;
        })();
        for (const e of enumsSet) {
            const symbol = Symbol(`${toStringTag} <${e}>`);
            result[e] = symbol;
            // 将symbol键写入原型中 防止对象展开过于复杂 无论使用值还是键均可以使用 in 判断枚举是否存在于此枚举对象中
            thisProto[symbol] = e;
        }
        Reflect.setPrototypeOf(result, freeze(thisProto));
        return freeze(result);
    };
    /** @param {Array<string|symbol>} args */
    return (...args) => {
        const [args0, ...args_] = args;
        if (typeof args0 === "symbol") return f("Enum:" + args0.description, args_);
        return f("Enum", args);
    };
})();

/**
 * 用于创建重复字面量缩写的映射表
 * key表示全写 value表示重复次数
 */
class AbbrList {
    /** @type {Map<string,number>} key 为全写 value 为重复次数 */
    #map = new Map();
    /** @type {Array<string>} 降序排列的key数组 仅在需要使用时初始化 */
    #sortedKeys = null;
    /** 初始化#sortedKeys 移除仅重复一次的key */
    #initSortedKeys() {
        this.#sortedKeys = [...this.#map]
            .filter(([, count]) => count > 1)
            .sort(([, a], [, b]) => b - a)
            .map(([key]) => key);

        for (let i = 0; i < this.#sortedKeys.length; i++) {
            this[Symbol(`${i} -> ${this.#map.get(this.#sortedKeys[i])}`)] = this.#sortedKeys[i];
        }
    }
    constructor() {}
    /** @returns {symbol} */
    abbr(key) {
        if (!this.#sortedKeys) this.#initSortedKeys();
        const str = JSON5.stringify(key);
        const index = this.#sortedKeys.indexOf(str);
        if (index === -1) return key; // 仅重复一次则不需要缩写
        return Symbol("$" + index.toString(36));
    }
    add(key) {
        if (this.#sortedKeys) throw new Error("已完成的缩写表,不允许变动。");
        const str = JSON5.stringify(key);
        const count = this.#map.get(str) ?? 0;
        this.#map.set(str, count + 1);
    }
    // 缩写映射
    toString() {
        if (!this.#sortedKeys) this.#initSortedKeys();
        return this.#sortedKeys.map((key, index) => `$${index.toString(36)}=${key}`).join(",");
    }
}
