const DOMContentLoaded = new Promise((resolve, reject) => window.addEventListener("DOMContentLoaded", resolve));
/** @type {typeof document.createElement} */
const createElement = document.createElement.bind(document);
/** @type {typeof document.createElementNS} */
const createElementNS = document.createElementNS.bind(document);
const freeze = Object.freeze;
// /**
//  * 从html字符串生成元素
//  * * 带有id 的元素可从返回值的成员中获取 成员名为`#id`
//  * * 允许插入Node类型
//  * * `on-event` 属性绑定事件
//  * * `style` 属性可用对象形式样式
//  */
// const $html = (() => {
//     const parser = new DOMParser();
//     /** @returns {Node} */
//     return (strings, ...values) => {
//         const valueMap = {};
//         for (let i = 0; i < values.length; i++) {
//             const value = values[i];
//             if (typeof value === "object") {
//                 valueMap[i] = value;
//                 if (value instanceof Node || Array.isArray(value)) values[i] = `<!--${i}-->`;
//                 else values[i] = i;
//             }
//         }
//         const doc = parser.parseFromString(`<template>${String.raw(strings, ...values)}</template>`, "text/html");

//         /** @type {DocumentFragment} */
//         const content = document.adoptNode(doc.head.children[0].content);
//         /** @type {Node} */
//         let root;
//         // 大于一个元素时返回文档片段
//         if (content.childNodes.length > 1) root = content;
//         else root = content.childNodes[0];
//         const iterator = document.createNodeIterator(root);
//         let node;
//         while ((node = iterator.nextNode()))
//             switch (node.nodeType) {
//                 case node.COMMENT_NODE:
//                     const target = valueMap[node.data];
//                     if (target) {
//                         if (Array.isArray(target)) node.replaceWith(...target);
//                         else node.replaceWith(target);
//                     }
//                     break;
//                 case node.ELEMENT_NODE:
//                     if (node.id) {
//                         root["#" + node.id] = node;
//                         node.toggleAttribute("id");
//                     }
//                     if (node.hasAttribute("on-event")) {
//                         const listener = valueMap[node.getAttribute("on-event")];
//                         if (listener) util.addFeatureTo(node, listener);
//                         node.toggleAttribute("on-event");
//                     }
//                     if (node.hasAttribute("style")) {
//                         const style = valueMap[node.getAttribute("style")];
//                         if (style) {
//                             for (const key in style) {
//                                 const value = style[key];
//                                 if (key.startsWith("--")) node.style.setProperty(key, value);
//                                 else node.style[key] = value;
//                             }
//                         }
//                     }
//             }

//         return root;
//     };
// })();

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
 * @param {Number} num
 * @param {Boolean} toBoolean
 * @returns {[0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1]}
 */
const toBits = (num, toBoolean = false) => {
    const bits = [];
    if (toBoolean) {
        for (let i = 7; i >= 0; i--) bits.unshift((num >> i) & 1) === 1;
    } else {
        for (let i = 7; i >= 0; i--) bits.unshift((num >> i) & 1);
    }
    return bits;
};

/** `🔧 工具包` */
const util = {
    /**
     * 将图像中的白色像素切换为指定颜色
     * @param {ImageData} imageData
     * @param {String} hexColor_str 16进制色值
     */
    setImageDataColor: (imageData, hexColor_str) => {
        console.log(hexColor_str);
        const hexColor_num = parseInt(hexColor_str, 16);
        const R = hexColor_num & 0xff,
            G = (hexColor_num >> 8) & 0xff,
            B = (hexColor_num >> 16) & 0xff,
            A = (hexColor_num >> 24) & 0xff;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] !== 0) {
                imageData.data[i] = R;
                imageData.data[i + 1] = G;
                imageData.data[i + 2] = B;
                imageData.data[i + 3] = A;
            }
        }
    },
    /**
     * 修改指定像素颜色
     * @param {ImageData} imageData 图像数据
     * @param {Number} x X坐标
     * @param {Number} y Y坐标
     * @param {String} hexColor_str 16进制色值
     */
    setImageDataPixelColor: (imageData, x, y, hexColor_str) => {
        const colorDataIndex = imageData.width * 4 * y + 4 * x;
        const hexColor_num = parseInt(hexColor_str, 16);
        imageData.data[colorDataIndex] = hexColor_num & 0xff; //R
        imageData.data[colorDataIndex + 1] = (hexColor_num >> 8) & 0xff; //G
        imageData.data[colorDataIndex + 2] = (hexColor_num >> 16) & 0xff; //B
        imageData.data[colorDataIndex + 3] = (hexColor_num >> 24) & 0xff; //A
    },
    /** 解析相关工具 */
    parse: {
        errRestult: Object.freeze([]),
        /** 🏷️ 令牌类 */
        Token: class {
            static logData = {
                tokens: [],
                main: [],
                styles: [],
                baseStyle: "border-radius: 2px;padding: 1px 1px;line-height: 20px;",
                init() {
                    this.tokens = [];
                    this.main = [];
                    this.styles = [];
                }
            };
            static log() {
                console.debug(this.logData.main.join(""), ...this.logData.styles);
                console.table(this.logData.tokens, ["type", "index", "data"]);
            }
            /** @type { String } */
            type = "";
            /** @type { String|Number } */
            data = "";
            /** @type { Array < String >} */
            #tempData = [];
            /** @type { String } */
            index = -1;
            /** @type { Object } */
            #enum;
            finish() {
                this.constructor.logData.tokens.push(this);
                if (this.#tempData.length > 0) {
                    let tempData = this.#tempData.join("");
                    if (this.#enum.type === "number") {
                        this.data = Number(tempData);
                    } else {
                        this.data = tempData;
                    }
                    this.#tempData = [];
                }
                const logData = this.constructor.logData;
                if (this.#enum.needBlank) {
                    logData.main.push("%c ");
                    logData.styles.push("line-height: 20px;");
                }
                logData.main.push(`%c${this.data}`);
                logData.styles.push(`${logData.baseStyle}color:${this.#enum.color};font-weight:${this.#enum.fontWeight};background-color:${this.#enum.bgColor};`);
            }
            push(char) {
                this.#tempData.push(char);
            }

            constructor(tokenEnum, index) {
                if (tokenEnum) {
                    this.#enum = tokenEnum;
                    this.type = tokenEnum.id;
                    if (tokenEnum.data) {
                        this.data = tokenEnum.data;
                        this.finish();
                    }
                }
                if (index !== undefined) {
                    this.index = index;
                }
            }
        }
    }
};

embed(`#XML.js`);
embed(`#CSV.js`);

/** 范围值 */
class RangeValue {
    /** 是否为固定值 */
    isFixed = false;
    /**
     * @overload
     * @param {String} exp 范围表达式
     * 支持以下三种表示
     * * `>=min`
     * * `<=max`
     * * `min~max`
     * * `value`
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
            if (Number.isFinite(v1)) this.median = v2;
            else if (Number.isFinite(v2)) this.median = v1;
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
                this.median = this.min = Number(exp.slice(2));
                this.max = Infinity;
            } else if (exp.startsWith("<=")) {
                this.median = this.max = Number(exp.slice(2));
                this.min = -Infinity;
            } else if (exp.includes("~")) {
                const [min, max] = exp.split("~");
                this.min = Number(min);
                this.max = Number(max);
                if (this.max < this.min) [this.min, this.max] = [this.max, this.min];
                this.median = (this.min + this.max) / 2;
            } else {
                this.min = this.max = this.median = Number(exp);
                this.isFixed = true;
            }
        } else if (typeof args[0] === "number") {
            this.median = this.min = this.max = args[0];
            this.isFixed = true;
        }
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

/**
 * ### 异步获取图像
 * @param {String} url 可以是base64或者路径
 * @returns {Promise<HTMLImageElement>}
 */
const asyncImg = async url => {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
};

/** 空白 1px * 1px 图片 */
const $blankImg = new Promise(resolve => {
    const canvas = createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    canvas.toBlob(blob => resolve(URL.createObjectURL(blob)));
});

/**
 * ### 异步获取精灵图的拆分图标url
 * @param {String} url 可以是base64或者路径
 * @returns {Promise<Array<String>>} url数组
 */
const asyncSpriteUrls = async url => {
    const img = await asyncImg(url);
    /** @type {ImageEncodeOptions} */
    const options = { type: "image/webp", quality: 1 };
    // 图标为正方形
    const iconSize = img.height;
    // 图标是水平排列的
    const iconAmount = img.width / iconSize;
    const canvas = new OffscreenCanvas(iconSize, iconSize);
    const ctx = canvas.getContext("2d");
    /** @type {Array<String>} */
    const urls = new Array(iconAmount);
    // urls["null"] = await $blankImg;
    for (let i = 0; i < iconAmount; i++) {
        ctx.drawImage(img, -i * iconSize, 0);
        urls[i] = URL.createObjectURL(await canvas.convertToBlob(options));
        ctx.clearRect(0, 0, iconSize, iconSize);
    }
    return urls;
};

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
            const ctx = canvas.getContext("2d");
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

// const base64 = {
//     /**
//      * 将Base64转为File对象
//      * @param {String} data base64数据文本
//      * @param {String} fileName
//      * @returns {File}
//      */
//     toFile(data, fileName) {
//         const arr = data.split(",");
//         const type = arr[0].match(/:(.*?);/)[1];
//         const StringData = atob(arr[1]);
//         let i = StringData.length;
//         const U8ArrayData = new Uint8Array(i);
//         while (i--) U8ArrayData[i] = StringData.charCodeAt(i);
//         return new File([U8ArrayData], fileName, { type });
//     },
//     /**
//      * 将Base64转为URL
//      * @param {String} data base64数据文本
//      * @param {String} fileName 文件名
//      * @returns {String}
//      */
//     toObjectURL(data, fileName = "") {
//         return URL.createObjectURL(this.toFile(data, fileName));
//     }
// };

const math_ = {
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
     * 获取以 **度**`°`**分**`′`**秒**`″` 表示的精确角度
     * @param {Number} deg 角度
     * @param {Boolean} [needSign=false] 是否需要前缀`+`
     * @returns {String} 结果
     */
    getExactDegree(deg, needSign = false) {
        let temp1 = 0;
        let temp2 = 0;
        const temp3 = [];
        const value_temp = Math.abs(deg);
        const _d = Math.trunc(value_temp);
        temp1 = value_temp - _d;
        temp2 = temp1 * 60;
        const _m = Math.trunc(temp2);
        temp1 = temp2 - _m;
        const _s = Math.trunc(temp1 * 60);

        if (_d !== 0) temp3.push(_d, "°");
        if (_m !== 0) temp3.push(_m, "′");
        if (_s !== 0) temp3.push(_s, "″");
        let temp4 = temp3.join("");
        if (deg < 0) temp4 = "-".concat(temp4);
        else if (needSign) temp4 = "+".concat(temp4);

        return temp4;
    },
    /**
     * 以帧为单位转换为以秒为单位 60帧每秒 结果保留两位小数
     * @param {Number} frame 帧
     * @returns {Number} 秒
     */
    frameToSecond: frame => Math.round(frame / 0.6) / 100,
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
     * @param  {...Number} param 单个参数时返回 0到改参数之间的随机值 两个参数时返回两个参数之间的值
     * @returns {Number} 随机整数
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

/**
 * 生成样式表
 * *generateCSSStyleSheet*
 * @param {String} rules CSS规则表字符串
 * @returns {CSSStyleSheet} CSS样式表
 */
const gss = rules => {
    const css = new CSSStyleSheet();
    css.replaceSync(rules);
    return css;
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
 * 为构造器创建子类构造器并返回
 * * 将子类的`prototype`添加`getter`, `setter`
 * * 将属性添加到被观察列表中 `observedAttributes`
 * @template {{ [key:string]: $ValueOption }} T
 * @template {Function} C
 * @param {C} constructor 构造器
 * @param {T} propAttrMap objectProp与HTMLAttribute的映射表
 * @returns {C & {
 *     observedAttributes: Readonly<[keyof T]>
 * }}
 */
//prettier-ignore
const $class = (constructor, propAttrMap) => class extends constructor {
    static observedAttributes = [];
    static {
        for (const prop in propAttrMap) {
            const { name, $default, needObserve = true } = propAttrMap[prop];
            if (needObserve) this.observedAttributes.push(name);
            Object.defineProperty(this.prototype, prop, {
                //prettier-ignore
                get() { return this.hasAttribute(name) ? this.getAttribute(name) : $default; },
                set(value = null) {
                    if (value === null) this.removeAttribute(name);
                    else {
                        //防止首次设置属性不能自动更新内容
                        if (!this.hasAttribute(name)) this.setAttribute(name, "");
                        this.setAttribute(name, value);
                    }
                }
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

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<String>}
 */
const canvasToUrl = canvas => new Promise(res => canvas.toBlob(blob => res(URL.createObjectURL(blob)), "image/png"));

/** @typedef {"a"|"abbr"|"address"|"area"|"article"|"aside"|"audio"|"b"|"base"|"bdi"|"bdo"|"blockquote"|"body"|"br"|"button"|"canvas"|"caption"|"cite"|"code"|"col"|"colgroup"|"data"|"datalist"|"dd"|"del"|"details"|"dfn"|"dialog"|"div"|"dl"|"dt"|"em"|"embed"|"fieldset"|"figcaption"|"figure"|"footer"|"form"|"h1"|"h2"|"h3"|"h4"|"h5"|"h6"|"head"|"header"|"hgroup"|"hr"|"html"|"i"|"iframe"|"img"|"input"|"ins"|"kbd"|"label"|"legend"|"li"|"link"|"main"|"map"|"mark"|"menu"|"meta"|"meter"|"nav"|"noscript"|"object"|"ol"|"optgroup"|"option"|"output"|"p"|"picture"|"pre"|"progress"|"q"|"rp"|"rt"|"ruby"|"s"|"samp"|"script"|"search"|"section"|"select"|"slot"|"small"|"source"|"span"|"strong"|"style"|"sub"|"summary"|"sup"|"table"|"tbody"|"td"|"template"|"textarea"|"tfoot"|"th"|"thead"|"time"|"title"|"tr"|"track"|"u"|"ul"|"var"|"video"|"wbr"} HTML_TAG */

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
    const doc = window.document;
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
                    case "hidden": //隐藏
                        $.hidden = value;
                        continue;
                    case "Event": //绑定事件
                        if (value.click) $.addEventListener("click", value.click);
                        if (value.keydown) {
                            $.setAttribute("tabindex", "0"); // 无障碍 允许tab聚焦
                            $.addEventListener("keydown", value.keydown);
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
                        $.setAttribute(key, value);
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
            const $ = doc.createElement("template");
            const attr = args[0];
            if (typeof attr === "object" && !(attr instanceof Node)) {
                args.shift();
                attach($, attr);
            }
            $.content.append(...args.flat(Infinity));
            return $;
        }
    };

    //prettier-ignore
    ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "bgckquote", "body", "button", "canvas", "caption", "cite", "code", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "html", "i", "iframe", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "menu", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "slot", "small", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "tr", "u", "ul", "var", "video"].forEach(e =>
       fnMap[e] = function (...args) {
           const $ = doc.createElement(e);
           const attr = args[0];
           if (typeof attr === "object" && !(attr instanceof Node)) {
               args.shift();
               attach($, attr);
           }
           $.append(...args.flat(Infinity));
           return $;
       }
   );

    // 空元素
    //prettier-ignore
    ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"].forEach(e =>
       fnMap[e] = function (attr) {
           const $ = doc.createElement(e);
           if (attr) attach($, attr);
           return $;
       }
   );

    // 字符串直接嵌入
    //prettier-ignore
    ["script", "style", "title"].forEach(e =>
       fnMap[e] = function (...args) {
           const $ = doc.createElement(e);
           const attr = args[0];
           if (typeof attr === "object" && !(attr instanceof Node)) {
               args.shift();
               attach($, attr);
           }
           $.innerHTML = args.flat(Infinity).join("");
           return $;
       }
   );

    // input类
    ["inputButton", "inputCheckbox", "inputColor", "inputDate", "inputEmail", "inputFile", "inputHidden", "inputImage", "inputMonth", "inputNumber", "inputPassword", "inputRadio", "inputRange", "inputReset", "inputSearch", "inputSubmit", "inputTel", "inputText", "inputTime", "inputUrl", "inputWeek"].forEach(e => {
        const type = e.slice(5).toLowerCase();
        fnMap[e] = function (attr) {
            /** @type {HTMLInputElement} */
            const $ = doc.createElement("input");
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
 * 生成样式表
 */
const css = (() => {
    /**
     * @param {CSSStyleDeclaration} declaration
     */
    const cssText = declaration => {
        const style = document.createElement("html").style;
        const nestData = [];
        for (const prop in declaration) {
            const data = declaration[prop];
            if (typeof data === "object") nestData.push(`${prop}{${cssText(data)}}`);
            else if (prop.startsWith("--")) style.setProperty(prop, data);
            //允许使用$简化自定义css属性的"--"前缀
            else if (prop.startsWith("$")) style.setProperty("--" + prop.slice(1), data);
            else if (prop in style) style[prop] = data;
        }
        return style.cssText + nestData.join("");
    };
    /**
     * @param {{
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
     * [key: string]:CSSStyleDeclaration;
     * }} datas
     * @param {CSSStyleSheetInit} init
     */
    const fn = (datas, init) => {
        const styleSheet = new CSSStyleSheet(init);
        const cache = [];
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
        return styleSheet;
    };
    return fn;
})();

window.h = h;
window.css = css;
