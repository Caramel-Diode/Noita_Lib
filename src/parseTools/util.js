/**
 * 下载为文件
 * @param {HTMLCanvasElement|String} content
 * @param {String} filename
 */
const download = (content, filename) => {
    let blob = null;
    const a = createElement("a");
    if (typeof content === "string") {
        const blob = new File([content], filename);
        a.href = URL.createObjectURL(blob);
    } else if (typeof content === "object") {
        if (content instanceof HTMLCanvasElement) {
            a.href = content.toDataURL("image/png");
        }
    }
    a.download = filename;
    a.click();
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
     * @param {Boolean} [option.booleanToNumber] 布尔值转为数字表示
     * @param {Boolean} [option.useExp] 使用表达式缩短字面量表示
     * @param {any} [option.default] null/undefined 默认值
     * @returns {String}
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
                    after = after + str.length - 1 - str.indexOf(".");
                    before = str.replace(".", "");
                }
                const exponential = before + "e" + sign + after; // 科学计数法
                let shortest = Number.isInteger(value) ? "0x" + value.toString(16) : { length: Infinity }; // 十六进制;
                for (const exp of [exponential, value.toString().replace("0.", ".") /* 十进制 */]) {
                    if (exp.length < shortest.length) shortest = exp;
                }
                return shortest;
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
        for (const key in value) cache.push(key + ":" + JSON5.stringify(value[key], option));
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
 * 将 bit 数组转为数字
 * @param {[0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1]} bits
 * @returns {Number}
 */
const bitsToNum = bits => {
    let num = 0;
    for (let i = 0; i < 8; i++) num += Boolean(bits[i]) * 2 ** i;
    return num;
};

/** @type {typeof document.createElement} */
const createElement = document.createElement.bind(document);
const freeze = Object.freeze;
