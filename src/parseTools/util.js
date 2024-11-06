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
                const hex = Number.isInteger(value) ? "0x" + value.toString(16) : { length: Infinity }; // 十六进制;
                const decimal = value.toString().replace("0.", "."); // 十进制
                let shortest = hex;
                if (shortest.length > decimal.length) shortest = decimal;
                if (shortest.length > exponential.length) shortest = exponential;
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
 * 将 bit 数组转为数字
 * @param {Array<0|1>} bits
 * @returns {Number}
 */
const bitsToNum = bits => {
    let num = 0;
    let length = bits.length;
    if (length > 8) {
        if (length > 16) length = 32;
        else length = 16;
    } else length = 8;
    for (let i = 0; i < length; i++) num += Boolean(bits[i]) * 2 ** i;
    return num;
};

/** @type {typeof document.createElement} */
const createElement = document.createElement.bind(document);
const freeze = Object.freeze;

/**
 * @typedef {Object} ElementInitOption
 * @prop {String|Array<String>} class 类名
 * @prop {String|CSSStyleDeclaration} style 样式
 * @prop {Boolean} hidden 隐藏
 * @prop {0} tabindex
 * @prop {Object} Event 事件监听器
 * @prop {Array} shadowRoot 开启shadowRoot并添加元素
 * @prop {String|Array<String>} HTML innerHTML
 * @prop {Object} $ 挂载到元素对象上的属性
 */

/**
 * ## 创建`HTML`节点
 * @type {{
 *   (option:ElementInitOption): DocumentFragment;
 *   "[]"(option:ElementInitOption): Array<Node>;
 *   $attach(element:HTMLElement): HTMLElement;
 *   $comment(option:ElementInitOption): Comment;
 *   a(option:ElementInitOption): HTMLAnchorElement;
 *   abbr(option:ElementInitOption): HTMLElement;
 *   address(option:ElementInitOption): HTMLElement;
 *   area(option:ElementInitOption): HTMLAreaElement;
 *   article(option:ElementInitOption): HTMLElement;
 *   aside(option:ElementInitOption): HTMLElement;
 *   audio(option:ElementInitOption): HTMLAudioElement;
 *   b(option:ElementInitOption): HTMLElement;
 *   base(option:ElementInitOption): HTMLBaseElement;
 *   bdi(option:ElementInitOption): HTMLElement;
 *   bdo(option:ElementInitOption): HTMLElement;
 *   blockquote(option:ElementInitOption): HTMLQuoteElement;
 *   body(option:ElementInitOption): HTMLBodyElement;
 *   br(option:ElementInitOption): HTMLBRElement;
 *   button(option:ElementInitOption): HTMLButtonElement;
 *   canvas(option:ElementInitOption): HTMLCanvasElement;
 *   caption(option:ElementInitOption): HTMLTableCaptionElement;
 *   cite(option:ElementInitOption): HTMLElement;
 *   code(option:ElementInitOption): HTMLElement;
 *   col(option:ElementInitOption): HTMLTableColElement;
 *   colgroup(option:ElementInitOption): HTMLTableColElement;
 *   data(option:ElementInitOption): HTMLDataElement;
 *   datalist(option:ElementInitOption): HTMLDataListElement;
 *   dd(option:ElementInitOption): HTMLElement;
 *   del(option:ElementInitOption): HTMLModElement;
 *   details(option:ElementInitOption): HTMLDetailsElement;
 *   dfn(option:ElementInitOption): HTMLElement;
 *   dialog(option:ElementInitOption): HTMLDialogElement;
 *   div(option:ElementInitOption): HTMLDivElement;
 *   dl(option:ElementInitOption): HTMLDListElement;
 *   dt(option:ElementInitOption): HTMLElement;
 *   em(option:ElementInitOption): HTMLElement;
 *   embed(option:ElementInitOption): HTMLEmbedElement;
 *   fieldset(option:ElementInitOption): HTMLFieldSetElement;
 *   figcaption(option:ElementInitOption): HTMLElement;
 *   figure(option:ElementInitOption): HTMLElement;
 *   footer(option:ElementInitOption): HTMLElement;
 *   form(option:ElementInitOption): HTMLFormElement;
 *   h1(option:ElementInitOption): HTMLHeadingElement;
 *   h2(option:ElementInitOption): HTMLHeadingElement;
 *   h3(option:ElementInitOption): HTMLHeadingElement;
 *   h4(option:ElementInitOption): HTMLHeadingElement;
 *   h5(option:ElementInitOption): HTMLHeadingElement;
 *   h6(option:ElementInitOption): HTMLHeadingElement;
 *   head(option:ElementInitOption): HTMLHeadElement;
 *   header(option:ElementInitOption): HTMLElement;
 *   hgroup(option:ElementInitOption): HTMLElement;
 *   hr(option:ElementInitOption): HTMLHRElement;
 *   html(option:ElementInitOption): HTMLHtmlElement;
 *   i(option:ElementInitOption): HTMLElement;
 *   iframe(option:ElementInitOption): HTMLIFrameElement;
 *   img(option:ElementInitOption): HTMLImageElement;
 *   input(option:ElementInitOption): HTMLInputElement;
 *   inputButton(option:ElementInitOption): HTMLInputElement;
 *   inputCheckbox(option:ElementInitOption): HTMLInputElement;
 *   inputColor(option:ElementInitOption): HTMLInputElement;
 *   inputDate(option:ElementInitOption): HTMLInputElement;
 *   inputEmail(option:ElementInitOption): HTMLInputElement;
 *   inputFile(option:ElementInitOption): HTMLInputElement;
 *   inputHidden(option:ElementInitOption): HTMLInputElement;
 *   inputImage(option:ElementInitOption): HTMLInputElement;
 *   inputMonth(option:ElementInitOption): HTMLInputElement;
 *   inputNumber(option:ElementInitOption): HTMLInputElement;
 *   inputPassword(option:ElementInitOption): HTMLInputElement;
 *   inputRadio(option:ElementInitOption): HTMLInputElement;
 *   inputRange(option:ElementInitOption): HTMLInputElement;
 *   inputReset(option:ElementInitOption): HTMLInputElement;
 *   inputSearch(option:ElementInitOption): HTMLInputElement;
 *   inputSubmit(option:ElementInitOption): HTMLInputElement;
 *   inputTel(option:ElementInitOption): HTMLInputElement;
 *   inputText(option:ElementInitOption): HTMLInputElement;
 *   inputTime(option:ElementInitOption): HTMLInputElement;
 *   inputUrl(option:ElementInitOption): HTMLInputElement;
 *   inputWeek(option:ElementInitOption): HTMLInputElement;
 *   ins(option:ElementInitOption): HTMLModElement;
 *   kbd(option:ElementInitOption): HTMLElement;
 *   label(option:ElementInitOption): HTMLLabelElement;
 *   legend(option:ElementInitOption): HTMLLegendElement;
 *   li(option:ElementInitOption): HTMLLIElement;
 *   link(option:ElementInitOption): HTMLLinkElement;
 *   main(option:ElementInitOption): HTMLElement;
 *   map(option:ElementInitOption): HTMLMapElement;
 *   mark(option:ElementInitOption): HTMLElement;
 *   menu(option:ElementInitOption): HTMLMenuElement;
 *   meta(option:ElementInitOption): HTMLMetaElement;
 *   meter(option:ElementInitOption): HTMLMeterElement;
 *   nav(option:ElementInitOption): HTMLElement;
 *   noscript(option:ElementInitOption): HTMLElement;
 *   object(option:ElementInitOption): HTMLObjectElement;
 *   ol(option:ElementInitOption): HTMLOListElement;
 *   optgroup(option:ElementInitOption): HTMLOptGroupElement;
 *   option(option:ElementInitOption): HTMLOptionElement;
 *   output(option:ElementInitOption): HTMLOutputElement;
 *   p(option:ElementInitOption): HTMLParagraphElement;
 *   picture(option:ElementInitOption): HTMLPictureElement;
 *   pre(option:ElementInitOption): HTMLPreElement;
 *   progress(option:ElementInitOption): HTMLProgressElement;
 *   q(option:ElementInitOption): HTMLQuoteElement;
 *   rp(option:ElementInitOption): HTMLElement;
 *   rt(option:ElementInitOption): HTMLElement;
 *   ruby(option:ElementInitOption): HTMLElement;
 *   s(option:ElementInitOption): HTMLElement;
 *   samp(option:ElementInitOption): HTMLElement;
 *   script(option:ElementInitOption): HTMLScriptElement;
 *   search(option:ElementInitOption): HTMLElement;
 *   section(option:ElementInitOption): HTMLElement;
 *   select(option:ElementInitOption): HTMLSelectElement;
 *   slot(option:ElementInitOption): HTMLSlotElement;
 *   small(option:ElementInitOption): HTMLElement;
 *   source(option:ElementInitOption): HTMLSourceElement;
 *   span(option:ElementInitOption): HTMLSpanElement;
 *   strong(option:ElementInitOption): HTMLElement;
 *   style(option:ElementInitOption): HTMLStyleElement;
 *   sub(option:ElementInitOption): HTMLElement;
 *   summary(option:ElementInitOption): HTMLElement;
 *   sup(option:ElementInitOption): HTMLElement;
 *   table(option:ElementInitOption): HTMLTableElement;
 *   tbody(option:ElementInitOption): HTMLTableSectionElement;
 *   td(option:ElementInitOption): HTMLTableCellElement;
 *   template(option:ElementInitOption): HTMLTemplateElement;
 *   textarea(option:ElementInitOption): HTMLTextAreaElement;
 *   tfoot(option:ElementInitOption): HTMLTableSectionElement;
 *   th(option:ElementInitOption): HTMLTableCellElement;
 *   thead(option:ElementInitOption): HTMLTableSectionElement;
 *   time(option:ElementInitOption): HTMLTimeElement;
 *   title(option:ElementInitOption): HTMLTitleElement;
 *   tr(option:ElementInitOption): HTMLTableRowElement;
 *   track(option:ElementInitOption): HTMLTrackElement;
 *   u(option:ElementInitOption): HTMLElement;
 *   ul(option:ElementInitOption): HTMLUListElement;
 *   var(option:ElementInitOption): HTMLElement;
 *   video(option:ElementInitOption): HTMLVideoElement;
 *   wbr(option:ElementInitOption): HTMLElement;
 * }}
 */
const h = (() => {
    /** @type {typeof Document.prototype.createElement} */
    const createElement = window.document.createElement.bind(window.document);
    /**
     * @param {String} selectorText
     */
    const parseSelector = selectorText => {
        const result = { id: "", class: [] };
        let cache = [];
        /** @type {"id"|"class"} */
        let type;
        for (let i = 0; i < selectorText.length; i++) {
            const char = selectorText[i];
            const charPre = selectorText[i - 1];
            if (charPre !== "\\") {
                if (char === ".") {
                    if (cache.length) {
                        if (type === "class") result.class.push(cache.join(""));
                        else if (type === "id") result.id = cache.join("");
                    }
                    type = "class";
                    cache = [];
                    continue;
                } else if (char === "#") {
                    if (cache.length) {
                        if (type === "class") result.class.push(cache.join(""));
                        else if (type === "id") result.id = cache.join("");
                    }
                    type = "id";
                    cache = [];
                    continue;
                }
            }
            cache.push(char);
        }
        if (cache.length) {
            if (type === "class") result.class.push(cache.join(""));
            else if (type === "id") result.id = cache.join("");
        }
        return result;
    };
    /** @param {HTMLElement} $ */
    const attach = ($, attr) => {
        for (const key in attr) {
            const value = attr[key];
            /** 尝试事件绑定 */
            if (key.startsWith("on")) {
                if (key in $) {
                    let fn, option, useCapture;
                    if (typeof value === "function") fn = value;
                    else [fn, option = {}, useCapture = false] = value;
                    $.addEventListener(key.slice(2), fn, option, useCapture);
                }
            } else
                switch (key) {
                    case "class": //类名
                        if (Array.isArray(value)) $.className = value.join(" ");
                        else $.className = value;
                        continue;
                    case "style": //样式
                        if (typeof value === "string") $.style = value;
                        else
                            for (const prop in value)
                                if (prop.includes("-")) $.style.setProperty(prop, value[prop]);
                                else $.style[prop] = value[prop];
                        continue;
                    case "dataset": //自定义属性
                        for (const key in value) $.dataset[key] = value[key];
                        continue;
                    case "hidden": //隐藏
                        $.hidden = value;
                        continue;
                    case "Event": //绑定事件
                        for (const eventType in value) {
                            $.addEventListener(eventType, value[eventType]);
                            if (eventType === "keydown") $.setAttribute("tabindex", "0"); // 无障碍 允许tab聚焦
                        }
                        continue;
                    case "shadowRoot": //想shadowRoot中添加元素
                        const shadowRoot = $.attachShadow({ mode: value.mode ?? "open" });
                        const styleSheets = [];
                        const fragment = h();
                        for (let i = 0; i < value.length; i++) {
                            const e = value[i];
                            if (e instanceof CSSStyleSheet) styleSheets.push(e);
                            else fragment.append(e);
                        }
                        shadowRoot.adoptedStyleSheets = styleSheets;
                        shadowRoot.append(fragment);
                        continue;
                    case "HTML":
                        if (Array.isArray(value)) $.innerHTML = value.join("");
                        else $.innerHTML = value;
                        continue;
                    case "$":
                        Object.assign($, value);
                        continue;
                    default:
                        if (typeof value === "boolean") {
                            if (value !== $.hasAttribute(key)) $.toggleAttribute(key);
                        } else $.setAttribute(key, value);
                }
        }
    };
    const fnMap = {
        $attach(element, ...args) {
            const attr = args[0];
            if (typeof attr === "object" && !(attr instanceof Node)) {
                args.shift();
                attach(element, attr);
            }
            element.append(...args.flat(Infinity));
            return element;
        },
        $comment: (...args) => new Comment(String.raw(...args)),
        "[]": (...args) => [...h(...args).childNodes],
        template(...args) {
            const $ = createElement("template");
            const attr = args[0];
            if (typeof attr === "object" && !(attr instanceof Node)) {
                args.shift();
                attach($, attr);
            }
            $.content.append(...args.flat(Infinity));
            return $;
        }
    };

    ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "bgckquote", "body", "button", "canvas", "caption", "cite", "code", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "html", "i", "iframe", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "menu", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "slot", "small", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "tr", "u", "ul", "var", "video"].forEach(
        e =>
            (fnMap[e] = (() => {
                const f = (...args) => {
                    const $ = createElement(e);
                    const attr = args[0];
                    if (typeof attr === "object" && !(attr instanceof Node)) {
                        args.shift();
                        attach($, attr);
                    }
                    $.append(...args.flat(Infinity));
                    return $;
                };
                const _ = new Proxy(f, {
                    get(target, p, receiver) {
                        if (typeof p === "string") {
                            const r = parseSelector(p);
                            return (...args) => {
                                const $ = createElement(e);
                                const attr = args[0];
                                if (typeof attr === "object" && !(attr instanceof Node)) {
                                    args.shift();
                                    attach($, { ...r, ...attr });
                                } else attach($, r);
                                $.append(...args.flat(Infinity));
                                return $;
                            };
                        }
                    }
                });
                return _;
            })())
    );

    // 空元素
    ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"].forEach(
        e =>
            (fnMap[e] = (() => {
                const f = attr => {
                    const $ = createElement(e);
                    if (attr) attach($, attr);
                    return $;
                };
                const _ = new Proxy(f, {
                    get(target, p, receiver) {
                        if (typeof p === "string") {
                            const r = parseSelector(p);
                            return attr => {
                                const $ = createElement(e);
                                if (typeof attr === "object" && !(attr instanceof Node)) attach($, { ...r, ...attr });
                                else attach($, r);
                                return $;
                            };
                        }
                    }
                });
                return _;
            })())
    );

    // 字符串直接嵌入
    ["script", "style", "title"].forEach(
        e =>
            (fnMap[e] = (() => {
                const f = (...args) => {
                    const $ = createElement(e);
                    const attr = args[0];
                    if (typeof attr === "object" && !(attr instanceof Node)) {
                        args.shift();
                        attach($, attr);
                    }
                    $.innerHTML = args.flat(Infinity).join("");
                    return $;
                };
                const _ = new Proxy(f, {
                    get(target, p, receiver) {
                        if (typeof p === "string") {
                            const r = parseSelector(p);
                            return (...args) => {
                                const $ = createElement(e);
                                const attr = args[0];
                                if (typeof attr === "object" && !(attr instanceof Node)) {
                                    args.shift();
                                    attach($, { ...r, ...attr });
                                } else attach($, r);
                                $.innerHTML = args.flat(Infinity).join("");
                                return $;
                            };
                        }
                    }
                });
                return _;
            })())
    );

    // input类
    ["inputButton", "inputCheckbox", "inputColor", "inputDate", "inputEmail", "inputFile", "inputHidden", "inputImage", "inputMonth", "inputNumber", "inputPassword", "inputRadio", "inputRange", "inputReset", "inputSearch", "inputSubmit", "inputTel", "inputText", "inputTime", "inputUrl", "inputWeek"].forEach(e => {
        const type = e.slice(5).toLowerCase();
        fnMap[e] = attr => {
            /** @type {HTMLInputElement} */
            const $ = createElement("input");
            $.type = type;
            if (attr) attach($, attr);
            return $;
        };
    });

    return Object.assign((...args) => {
        const $ = new DocumentFragment();
        $.append(...args.flat(Infinity));
        return $;
    }, fnMap);
})();

/**
 * 生成构造样式表
 */
const css = (() => {
    /**
     * @param {CSSStyleDeclaration} declaration
     */
    const cssText = declaration => {
        const { style } = document.createElement("html");
        const nestData = [];
        const cssTexts_important = [];
        for (const prop in declaration) {
            const data = declaration[prop];
            if (typeof data === "object") nestData.push(`${prop}{${cssText(data)}}`);
            else if (prop.startsWith("--")) style.setProperty(prop, data);
            //允许使用$简化自定义css属性的"--"前缀
            else if (prop.startsWith("$")) style.setProperty("--" + prop.slice(1), data);
            else if (prop in style) {
                // 修复带有 `!important` 的属性值无法正常设置的问题
                if (String(data).includes("!important")) {
                    /** @type {String} */
                    const text = cssText({ [prop]: data.replace("!important", "").trim() });
                    cssTexts_important.push(text.replace(";", " !important;"));
                } else style[prop] = data;
            }
        }
        return style.cssText + cssTexts_important.join("") + nestData.join("");
    };
    /**
     * @typedef {{
     * a:CSSStyleDeclaration;
     * abbr:CSSStyleDeclaration;
     * address:CSSStyleDeclaration;
     * area:CSSStyleDeclaration;
     * article:CSSStyleDeclaration;
     * aside:CSSStyleDeclaration;
     * audio:CSSStyleDeclaration;
     * b:CSSStyleDeclaration;
     * base:CSSStyleDeclaration;
     * bdi:CSSStyleDeclaration;
     * bdo:CSSStyleDeclaration;
     * blockquote:CSSStyleDeclaration;
     * body:CSSStyleDeclaration;
     * br:CSSStyleDeclaration;
     * button:CSSStyleDeclaration;
     * canvas:CSSStyleDeclaration;
     * caption:CSSStyleDeclaration;
     * cite:CSSStyleDeclaration;
     * code:CSSStyleDeclaration;
     * col:CSSStyleDeclaration;
     * colgroup:CSSStyleDeclaration;
     * data:CSSStyleDeclaration;
     * datalist:CSSStyleDeclaration;
     * dd:CSSStyleDeclaration;
     * del:CSSStyleDeclaration;
     * details:CSSStyleDeclaration;
     * dfn:CSSStyleDeclaration;
     * dialog:CSSStyleDeclaration;
     * div:CSSStyleDeclaration;
     * dl:CSSStyleDeclaration;
     * dt:CSSStyleDeclaration;
     * em:CSSStyleDeclaration;
     * embed:CSSStyleDeclaration;
     * fieldset:CSSStyleDeclaration;
     * figcaption:CSSStyleDeclaration;
     * figure:CSSStyleDeclaration;
     * footer:CSSStyleDeclaration;
     * form:CSSStyleDeclaration;
     * h1:CSSStyleDeclaration;
     * h2:CSSStyleDeclaration;
     * h3:CSSStyleDeclaration;
     * h4:CSSStyleDeclaration;
     * h5:CSSStyleDeclaration;
     * h6:CSSStyleDeclaration;
     * head:CSSStyleDeclaration;
     * header:CSSStyleDeclaration;
     * hgroup:CSSStyleDeclaration;
     * hr:CSSStyleDeclaration;
     * html:CSSStyleDeclaration;
     * i:CSSStyleDeclaration;
     * iframe:CSSStyleDeclaration;
     * img:CSSStyleDeclaration;
     * input:CSSStyleDeclaration;
     * ins:CSSStyleDeclaration;
     * kbd:CSSStyleDeclaration;
     * label:CSSStyleDeclaration;
     * legend:CSSStyleDeclaration;
     * li:CSSStyleDeclaration;
     * link:CSSStyleDeclaration;
     * main:CSSStyleDeclaration;
     * map:CSSStyleDeclaration;
     * mark:CSSStyleDeclaration;
     * menu:CSSStyleDeclaration;
     * meta:CSSStyleDeclaration;
     * meter:CSSStyleDeclaration;
     * nav:CSSStyleDeclaration;
     * noscript:CSSStyleDeclaration;
     * object:CSSStyleDeclaration;
     * ol:CSSStyleDeclaration;
     * optgroup:CSSStyleDeclaration;
     * option:CSSStyleDeclaration;
     * output:CSSStyleDeclaration;
     * p:CSSStyleDeclaration;
     * picture:CSSStyleDeclaration;
     * pre:CSSStyleDeclaration;
     * progress:CSSStyleDeclaration;
     * q:CSSStyleDeclaration;
     * rp:CSSStyleDeclaration;
     * rt:CSSStyleDeclaration;
     * ruby:CSSStyleDeclaration;
     * s:CSSStyleDeclaration;
     * samp:CSSStyleDeclaration;
     * script:CSSStyleDeclaration;
     * search:CSSStyleDeclaration;
     * section:CSSStyleDeclaration;
     * select:CSSStyleDeclaration;
     * slot:CSSStyleDeclaration;
     * small:CSSStyleDeclaration;
     * source:CSSStyleDeclaration;
     * span:CSSStyleDeclaration;
     * strong:CSSStyleDeclaration;
     * style:CSSStyleDeclaration;
     * sub:CSSStyleDeclaration;
     * summary:CSSStyleDeclaration;
     * sup:CSSStyleDeclaration;
     * table:CSSStyleDeclaration;
     * tbody:CSSStyleDeclaration;
     * td:CSSStyleDeclaration;
     * template:CSSStyleDeclaration;
     * textarea:CSSStyleDeclaration;
     * tfoot:CSSStyleDeclaration;
     * th:CSSStyleDeclaration;
     * thead:CSSStyleDeclaration;
     * time:CSSStyleDeclaration;
     * title:CSSStyleDeclaration;
     * tr:CSSStyleDeclaration;
     * track:CSSStyleDeclaration;
     * u:CSSStyleDeclaration;
     * ul:CSSStyleDeclaration;
     * var:CSSStyleDeclaration;
     * video:CSSStyleDeclaration;
     * wbr:CSSStyleDeclaration;
     * ":host":CSSStyleDeclaration;
     * "*":CSSStyleDeclaration;
     * }} CSSStyleMap
     */

    /**
     * @param {String | CSSStyleMap & { [key: string]:CSSStyleDeclaration }|NodeListOf<HTMLStyleElement>|HTMLStyleElement} datas
     * @param {CSSStyleSheetInit} init
     * @returns {CSSStyleSheet}
     */
    const fn = (datas, init) => {
        const styleSheet = new CSSStyleSheet(init);
        const cache = [];
        const _type = typeof datas;
        if (_type === "object") {
            for (const key in datas) {
                const data = datas[key];
                if (key.startsWith("@keyframes")) {
                    const _cache = [];
                    for (const frame in data) {
                        let frameName = frame;
                        if (!isNaN(frame)) frameName += "%";
                        _cache.push(`${frameName}{${cssText(data[frame])}}`);
                    }
                    cache.push(`${key}{${_cache.join("")}}`);
                } else if (key.startsWith("@property")) {
                    const _cache = [];
                    if (data.syntax) _cache.push(`syntax:${data.syntax}`);
                    if (data.inherits) _cache.push(`inherits:${data.syntax}`);
                    if (data.initialValue) _cache.push(`initial-value:${data.initialValue}`);
                    cache.push(`${key}{${_cache.join(";")}}`);
                } else cache.push(`${key}{${cssText(data)}}`);
            }
            styleSheet.replaceSync(cache.join(""));
        } else if (_type === "string") styleSheet.replaceSync(datas);
        return styleSheet;
    };
    return fn;
})();

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
