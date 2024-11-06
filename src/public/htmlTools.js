/**
 * @typedef {{[K in keyof GlobalEventHandlersEventMap as `on${K}`]: (event:GlobalEventHandlersEventMap[K]) => void}} $onEvents
 */

/**
 * @typedef {Object} ElementBaseInitOption
 * @prop {String} id
 * @prop {String|Array<String>} class 类名
 * @prop {String|{[K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends String ? K :never]: String}} style 样式
 * @prop {{[key: String]: String}} dataset 自定义属性
 * @prop {Boolean} hidden 隐藏
 * @prop {Number} tabindex
 * @prop {{[K in keyof GlobalEventHandlersEventMap]: (event:GlobalEventHandlersEventMap[K]) => void}} Event 事件监听器
 * @prop {Array} shadowRoot 开启shadowRoot并添加元素
 * @prop {String|Array<String>} HTML innerHTML
 * @prop {Object} $ 挂载到元素对象上的属性
 */

/**
 * @typedef {ElementBaseInitOption & $onEvents} ElementInitOption
 */

/**
 * @typedef {{[K in keyof HTMLElementTagNameMap as K extends (keyof H_BaseType_special) ? never : K]:{
 *      (option:ElementInitOption,...nodes:Array<Node>):HTMLElementTagNameMap[K],
 *      (...nodes:Array<Node>):HTMLElementTagNameMap[K],
 *      [key:String]: {
 *          (option:ElementInitOption,...nodes:Array<Node>):HTMLElementTagNameMap[K],
 *          (...nodes:Array<Node>):HTMLElementTagNameMap[K],
 *      }
 * }}} H_BaseType
 */

/**
 * @typedef {{
 *      inputButton: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "button"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "button"}
 *      },
 *      inputCheckbox: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "checkbox"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "checkbox"}
 *      },
 *      inputColor: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "color"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "color"}
 *      },
 *      inputDate: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "date"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "date"}
 *      },
 *      inputEmail: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "email"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "email"}
 *      },
 *      inputFile: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "file"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "file"}
 *      },
 *      inputHidden: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "hidden"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "hidden"}
 *      },
 *      inputImage: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "image"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "image"}
 *      },
 *      inputMonth: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "month"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "month"}
 *      },
 *      inputNumber: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "number"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "number"}
 *      },
 *      inputPassword: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "password"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "password"}
 *      },
 *      inputRadio: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "radio"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "radio"}
 *      },
 *      inputRange: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "range"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "range"}
 *      },
 *      inputReset: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "reset"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "reset"}
 *      },
 *      inputSearch: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "search"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "search"}
 *      },
 *      inputSubmit: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "submit"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "submit"}
 *      },
 *      inputTel: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "tel"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "tel"}
 *      },
 *      inputText: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "text"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "text"}
 *      },
 *      inputTime: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "time"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "time"}
 *      },
 *      inputUrl: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "url"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "url"}
 *      },
 *      inputWeek: {
 *          (option:ElementInitOption):HTMLInputElement & {type: "week"},
 *          [key:String]: (option:ElementInitOption) => HTMLInputElement & {type: "week"}
 *      },
 *     area: {
 *         (option:ElementInitOption):HTMLAreaElement,
 *         [key:String]: (option:ElementInitOption) => HTMLAreaElement
 *     },
 *     base:{
 *         (option:ElementInitOption):HTMLBaseElement,
 *         [key:String]: (option:ElementInitOption) => HTMLBaseElement
 *     },
 *     br:{
 *         (option:ElementInitOption):HTMLBRElement,
 *         [key:String]: (option:ElementInitOption) => HTMLBRElement
 *     },
 *     col:{
 *         (option:ElementInitOption):HTMLTableColElement,
 *         [key:String]: (option:ElementInitOption) => HTMLTableColElement
 *     },
 *     embed:{
 *         (option:ElementInitOption):HTMLEmbedElement,
 *         [key:String]: (option:ElementInitOption) => HTMLEmbedElement
 *     },
 *     hr:{
 *         (option:ElementInitOption):HTMLHRElement,
 *         [key:String]: (option:ElementInitOption) => HTMLHRElement
 *     },
 *     img:{
 *         (option:ElementInitOption & {width:Number, height:Number}):HTMLImageElement,
 *         [key:String]: (option:ElementInitOption) => HTMLImageElement
 *     },
 *     input:{
 *         (option:ElementInitOption & {type: "button"|"checkbox"|"color"|"date"|"email"|"file"|"hidden"|"image"|"month"|"number"|"password"|"radio"|"range"|"reset"|"search"|"submit"|"tel"|"text"|"time"|"url"|"week"}):HTMLInputElement,
 *         [key:String]: (option:ElementInitOption & {type: "button"|"checkbox"|"color"|"date"|"email"|"file"|"hidden"|"image"|"month"|"number"|"password"|"radio"|"range"|"reset"|"search"|"submit"|"tel"|"text"|"time"|"url"|"week"}) => HTMLInputElement
 *     },
 *     link:{
 *         (option:ElementInitOption):HTMLLinkElement,
 *         [key:String]: (option:ElementInitOption) => HTMLLinkElement
 *     },
 *     meta:{
 *         (option:ElementInitOption):HTMLMetaElement,
 *         [key:String]: (option:ElementInitOption) => HTMLMetaElement
 *     },
 *     source:{
 *         (option:ElementInitOption):HTMLSourceElement,
 *         [key:String]: (option:ElementInitOption) => HTMLSourceElement
 *     },
 *     track:{
 *         (option:ElementInitOption):HTMLTrackElement,
 *         [key:String]: (option:ElementInitOption) => HTMLTrackElement
 *     },
 *     wbr:{
 *         (option:ElementInitOption):HTMLElement,
 *         [key:String]: (option:ElementInitOption) => HTMLElement
 *     },
 *     canvas: {
 *          (option:ElementInitOption & {width:Number, height:Number},...nodes:Array<Node>):HTMLCanvasElement,
 *          (...nodes:Array<Node>):HTMLCanvasElement,
 *          [key:String]: {
 *              (option:ElementInitOption & {width:Number, height:Number},...nodes:Array<Node>):HTMLCanvasElement,
 *              (...nodes:Array<Node>):HTMLCanvasElement,
 *          }
 *     },
 *     script: {
 *          (option:ElementInitOption & {src:String,},textContent:String):HTMLScriptElement,
 *          (textContent:String):HTMLScriptElement,
 *          [key:String]: {
 *              (option:ElementInitOption,textContent:String):HTMLScriptElement,
 *              (textContent:String):HTMLScriptElement,
 *          }
 *     },
 *     style: {
 *          (option:ElementInitOption & {media:String},textContent:String):HTMLStyleElement,
 *          (textContent:String):HTMLStyleElement,
 *          [key:String]: {
 *              (option:ElementInitOption & {media:String},textContent:String):HTMLStyleElement,
 *              (textContent:String):HTMLStyleElement,
 *          }
 *     },
 *     title: {
 *          (option:ElementInitOption,textContent:String):HTMLTitleElement,
 *          (textContent:String):HTMLTitleElement,
 *          [key:String]: {
 *              (option:ElementInitOption,textContent:String):HTMLTitleElement,
 *              (textContent:String):HTMLTitleElement,
 *          }
 *     }
 * }} H_BaseType_special
 */

/**
 * ## 创建`HTML`节点
 * @type {{
 *   (option:ElementInitOption): DocumentFragment,
 *   $(element:HTMLElement): HTMLElement,
 *   $comment(content:Array<String>): Comment
 * } & H_BaseType & H_BaseType_special}
 */
const h = (() => {
    /** @type {typeof Document.prototype.createElement} */
    const createElement = Document.prototype.createElement.bind(document);
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
                    case "shadowRoot": //向shadowRoot中添加元素
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
        $(element, ...args) {
            const attr = args[0];
            if (typeof attr === "object" && !(attr instanceof Node)) {
                args.shift();
                attach(element, attr);
            }
            element.append(...args.flat(Infinity));
            return element;
        },
        $comment: (...args) => new Comment(String.raw(...args)),
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
window.h = h;

/**
 * 使用说明  
 * 使用 `h.标签名()` 创建元素  
 * 首个参数支持传入配置对象来初始化元素的属性  
 * 示例:
 * ```js
 * h.hgroup(
 *     h.h3("三级标题"),
 *     h.p({class:"abc"},"描述")
 * )
 * ```
 */