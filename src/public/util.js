const DOMContentLoaded = new Promise((resolve, reject) => window.addEventListener("DOMContentLoaded", resolve));
/** @type {typeof document.createElement} */
const createElement = document.createElement.bind(document);
/** @type {typeof document.createElementNS} */
const createElementNS = document.createElementNS.bind(document);

/**
 * 从html字符串生成元素
 * * 带有id 的元素可从返回值的成员中获取 成员名为`#id`
 * * 允许插入Node类型
 * * `on-event` 属性绑定事件
 * * `style` 属性可用对象形式样式
 */
const $html = (() => {
    const parser = new DOMParser();
    /** @returns {Node} */
    return (strings, ...values) => {
        const valueMap = {};
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            if (typeof value === "object") {
                valueMap[i] = value;
                if (value instanceof Node || Array.isArray(value)) values[i] = `<!--${i}-->`;
                else values[i] = i;
            }
        }
        const doc = parser.parseFromString(`<template>${String.raw(strings, ...values)}</template>`, "text/html");

        /** @type {DocumentFragment} */
        const content = document.adoptNode(doc.head.children[0].content);
        /** @type {Node} */
        let root;
        // 大于一个元素时返回文档片段
        if (content.childNodes.length > 1) root = content;
        else root = content.childNodes[0];
        const iterator = document.createNodeIterator(root);
        let node;
        while ((node = iterator.nextNode()))
            switch (node.nodeType) {
                case node.COMMENT_NODE:
                    const target = valueMap[node.data];
                    if (target) {
                        if (Array.isArray(target)) node.replaceWith(...target);
                        else node.replaceWith(target);
                    }
                    break;
                case node.ELEMENT_NODE:
                    if (node.id) {
                        root["#" + node.id] = node;
                        node.toggleAttribute("id");
                    }
                    if (node.hasAttribute("on-event")) {
                        const listener = valueMap[node.getAttribute("on-event")];
                        if (listener) util.addFeatureTo(node, listener);
                        node.toggleAttribute("on-event");
                    }
                    if (node.hasAttribute("style")) {
                        const style = valueMap[node.getAttribute("style")];
                        if (style) {
                            for (const key in style) {
                                const value = style[key];
                                if (key.startsWith("--")) node.style.setProperty(key, value);
                                else node.style[key] = value;
                            }
                        }
                    }
            }

        return root;
    };
})();

const freeze = Object.freeze;

/** `🔧 工具包` */
const util = {
    /**
     * 向元素添加指定交互功能
     * @param {Node} target 目标节点
     * @param {Listeners} listeners 监听器
     */
    addFeatureTo(target, listeners) {
        if (listeners.click) target.addEventListener("click", listeners.click);
        if (listeners.keydown) {
            target.setAttribute("tabindex", "0"); // 无障碍 允许tab聚焦
            target.addEventListener("keydown", listeners.keydown);
        }
    },
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
    const canvas = document.createElement("canvas");
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
            const canvas = document.createElement("canvas");
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
