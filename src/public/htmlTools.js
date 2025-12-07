/**
 * @typedef {{[K in keyof GlobalEventHandlersEventMap as `on${K}`]: (event:GlobalEventHandlersEventMap[K]) => void}} $onEvents
 */

/**
 * @typedef {Object} ElementBaseInitOption
 * @prop {string} id
 * @prop {string|Array<string>} class 类名
 * @prop {string} title
 * @prop {string} part
 * @prop {string} exportparts
 * @prop {string} lang
 * @prop {string} popover
 * @prop {string} popovertarget
 * @prop {string} role
 * @prop {string} slot
 * @prop {boolean} draggable
 * @prop {string|{[K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends string ? K :never]: string}} style 样式
 * @prop {{[key: string]: string}} dataset 自定义属性
 * @prop {Boolean} hidden 隐藏
 * @prop {number} tabindex
 * @prop {{[K in keyof GlobalEventHandlersEventMap]: (event:GlobalEventHandlersEventMap[K]) => void}} Event 事件监听器
 * @prop {Array} shadowRoot 开启shadowRoot并添加元素
 * @prop {string|Array<string>} HTML innerHTML
 * @prop {Object} $ 挂载到元素对象上的属性
 */

/**
 * @typedef {ElementBaseInitOption & $onEvents} ElementInitOption
 */

/**
 * @typedef {{[K in keyof HTMLElementTagNameMap as K extends (keyof H_BaseType_special) ? never : K]:{
 *      (option:ElementInitOption,...nodes:Array<Node|String>):HTMLElementTagNameMap[K],
 *      (...nodes:Array<Node|string>):HTMLElementTagNameMap[K],
 *      [key:String]: {
 *          (option:ElementInitOption,...nodes:Array<Node|String>):HTMLElementTagNameMap[K],
 *          (...nodes:Array<Node|string>):HTMLElementTagNameMap[K],
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
 *         (option:ElementInitOption & {width:number, height:number, src: string}):HTMLImageElement,
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
 *          (option:ElementInitOption & {width:number, height:number},...nodes:Array<Node>):HTMLCanvasElement,
 *          (...nodes:Array<Node>):HTMLCanvasElement,
 *          [key:String]: {
 *              (option:ElementInitOption & {width:number, height:number},...nodes:Array<Node>):HTMLCanvasElement,
 *              (...nodes:Array<Node>):HTMLCanvasElement,
 *          }
 *     },
 *     option: {
 *          (option:ElementInitOption & { value: string; label: string; selected: boolean },textContent:String):HTMLOptionElement,
 *          (textContent:String):HTMLOptionElement,
 *          [key:String]: {
 *              (option:ElementInitOption & { value: string; label: string; selected: boolean },textContent:String):HTMLOptionElement,
 *              (textContent:String):HTMLOptionElement,
 *          }
 *     },
 *     script: {
 *          (option:ElementInitOption & {src:string, type:string},textContent:String):HTMLScriptElement,
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
 *   new (...nodes:Array<Node>): () => DocumentFragment,
 *   (...nodes:Array<Node>): DocumentFragment,
 *   (template: { raw: readonly string[] | ArrayLike<string>; }, ...substitutions: any[]): {
 *     (option:ElementInitOption,...nodes:Array<Node>):HTMLElement,
 *     (...nodes:Array<Node>):HTMLElement,
 *     [key:String]: {
 *         (option:ElementInitOption,...nodes:Array<Node>):HTMLElement,
 *         (...nodes:Array<Node>):HTMLElement,
 *     }
 *   },
 *   $(element:HTMLElement): HTMLElement,
 *   $comment(content:Array<String>): Comment,
 * } & H_BaseType & H_BaseType_special & { [Tag in Uppercase<keyof HTMLElementTagNameMap>]: HTMLElementTagNameMap[Lowercase<Tag>] }}
 */
const h = (() => {
    /** @type {typeof Document.prototype.createElement} */
    const createElement = Document.prototype.createElement.bind(document);
    /** @param {String} selectorText */
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

    /** 判断是否为创建元素的配置对象 */
    const isOption = value => typeof value === "object" && !(value instanceof Node) && !Array.isArray(value);

    /** 展平所有节点 移除null/undefined
     * @type {(nodes:Array<Node|string|Array<Node|string>>) => Array<Node|string>}
     */
    const flat = (
        filter => nodes =>
            nodes.flat(Infinity).filter(filter)
    )(node => node !== null && node !== void 0);

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
                    case "is": // 忽略这个属性
                        continue;
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
            if (isOption(attr)) {
                args.shift();
                attach(element, attr);
            }
            element.append(...flat(args));
            return element;
        },
        $comment: (...args) => new Comment(String.raw(...args)),
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
        TEMPLATE: HTMLTemplateElement,
        template: (() => {
            const f = (...args) => {
                /** @type {HTMLTemplateElement} */
                let $;
                const attr = args[0];
                if (isOption(attr)) {
                    args.shift();
                    if (attr.is) $ = createElement("template", { is: attr.is });
                    else $ = createElement("template");
                    attach($, attr);
                } else $ = createElement("template");

                $.content.append(...flat(args));
                return $;
            };
            return new Proxy(f, {
                get(target, p, receiver) {
                    if (typeof p === "string") {
                        const r = parseSelector(p);
                        return (...args) => {
                            /** @type {HTMLElement} */
                            let $;
                            let attr = args[0];
                            if (isOption(attr)) {
                                args.shift();
                                attr = { ...r, ...attr };
                                if (attr.is) $ = createElement("template", { is: attr.is });
                                else $ = createElement("template");
                                attach($, attr);
                            } else {
                                $ = createElement("template");
                                attach($, r);
                            }
                            $.append(...flat(args));
                            return $;
                        };
                    }
                },
                set(target, p, newValue, receiver) {
                    if (typeof p === "string") customElements.define(p, newValue, { extends: "template" });
                    return true;
                }
            });
        })()
    };
    /**
     * @type {Map<String,Function>} 自定义元素创建器缓存
     */
    const customElementCreatorCache = new Map();

    ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "blockquote", "body", "button", "canvas", "caption", "cite", "code", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "html", "i", "iframe", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "menu", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "slot", "small", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "time", "tr", "u", "ul", "var", "video"].forEach(tag => {
        fnMap[tag.toLocaleUpperCase()] = createElement(tag).constructor;
        fnMap[tag] = (() => {
            const f = (...args) => {
                /** @type {HTMLElement} */
                let $;
                const attr = args[0];
                if (isOption(attr)) {
                    args.shift();
                    if (attr.is) $ = createElement(tag, { is: attr.is });
                    else $ = createElement(tag);
                    attach($, attr);
                } else $ = createElement(tag);
                $.append(...flat(args));
                return $;
            };
            return new Proxy(f, {
                get(target, p, receiver) {
                    if (typeof p === "string") {
                        const r = parseSelector(p);
                        return (...args) => {
                            /** @type {HTMLElement} */
                            let $;
                            let attr = args[0];
                            if (isOption(attr)) {
                                args.shift();
                                attr = { ...r, ...attr };
                                if (attr.is) $ = createElement(tag, { is: attr.is });
                                else $ = createElement(tag);
                                attach($, attr);
                            } else {
                                $ = createElement(tag);
                                attach($, r);
                            }
                            $.append(...flat(args));
                            return $;
                        };
                    }
                },
                set(target, p, newValue, receiver) {
                    if (typeof p === "string") customElements.define(p, newValue, { extends: tag });
                    return true;
                }
            });
        })();
    });

    // 空元素
    ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"].forEach(tag => {
        fnMap[tag] = (() => {
            fnMap[tag.toLocaleUpperCase()] = createElement(tag).constructor;
            const f = attr => {
                /** @type {HTMLElement} */
                let $;
                if (attr?.is) $ = createElement(tag, { is: attr.is });
                else $ = createElement(tag);
                if (attr) attach($, attr);
                return $;
            };
            return new Proxy(f, {
                get(target, p, receiver) {
                    if (typeof p === "string") {
                        const r = parseSelector(p);
                        return (attr = {}) => {
                            /** @type {HTMLElement} */
                            let $;
                            attr = { ...attr, ...r };
                            if (attr?.is) $ = createElement(tag, { is: attr.is });
                            else $ = createElement(tag);
                            attach($, r);
                            return $;
                        };
                    }
                },
                set(target, p, newValue, receiver) {
                    if (typeof p === "string") customElements.define(p, newValue, { extends: tag });
                    return true;
                }
            });
        })();
    });

    // 只接受文本内容的元素
    ["option", "script", "style", "title", "textarea"].forEach(tag => {
        fnMap[tag.toLocaleUpperCase()] = createElement(tag).constructor;
        fnMap[tag] = (() => {
            const f = (...args) => {
                let $;
                const attr = args[0];
                if (typeof attr === "object") {
                    args.shift();
                    if (attr.is) $ = createElement(tag, { is: attr.is });
                    else $ = createElement(tag);
                    attach($, attr);
                } else $ = createElement(tag);
                $.textContent = flat(args).join("");
                return $;
            };
            return new Proxy(f, {
                get(target, p, receiver) {
                    if (typeof p === "string") {
                        const r = parseSelector(p);
                        return (...args) => {
                            let $;
                            let attr = args[0];
                            if (typeof attr === "object") {
                                args.shift();
                                attr = { ...attr, ...r };
                                if (attr.is) $ = createElement(tag, { is: attr.is });
                                else $ = createElement(tag);
                                attach($, attr);
                            } else {
                                $ = createElement(tag);
                                attach($, r);
                            }
                            $.innerHTML = flat(args).join("");
                            return $;
                        };
                    }
                },
                set(target, p, newValue, receiver) {
                    if (typeof p === "string") customElements.define(p, newValue, { extends: tag });
                    return true;
                }
            });
        })();
    });

    // input类
    ["inputButton", "inputCheckbox", "inputColor", "inputDate", "inputEmail", "inputFile", "inputHidden", "inputImage", "inputMonth", "inputnumber", "inputPassword", "inputRadio", "inputRange", "inputReset", "inputSearch", "inputSubmit", "inputTel", "inputText", "inputTime", "inputUrl", "inputWeek"].forEach(e => {
        const type = e.slice(5).toLowerCase();
        fnMap[e] = attr => {
            /** @type {HTMLInputElement} */
            let $;
            if (attr) {
                if (attr.is) $ = createElement("input", { is: attr.is });
                else $ = createElement("input");
                attach($, attr);
            }
            $.type = type;
            return $;
        };
    });

    return new Proxy(
        Object.assign(function (...args) {
            // 通过字符串模板标签方式调用 - 支持自定义元素创建
            if (Array.isArray(args[0]) && Array.isArray(args[0].raw)) {
                const tag = String.raw(...args);
                return (
                    customElementCreatorCache.get(tag) ??
                    (() => {
                        const f = (...args) => {
                            const $ = createElement(tag);
                            const attr = args[0];
                            if (isOption(attr)) {
                                args.shift();
                                attach($, attr);
                            }
                            $.append(...flat(args));
                            return $;
                        };
                        const _ = new Proxy(f, {
                            get(target, p, receiver) {
                                if (typeof p === "string") {
                                    const r = parseSelector(p);
                                    return (...args) => {
                                        /** @type {HTMLElement} */
                                        const $ = createElement(tag);
                                        let attr = args[0];
                                        if (isOption(attr)) {
                                            args.shift();
                                            attr = { ...r, ...attr };
                                            attach($, attr);
                                        } else attach($, r);
                                        $.append(...flat(args));
                                        return $;
                                    };
                                }
                            }
                        });
                        // 设置缓存
                        customElementCreatorCache.set(tag, _);
                        return _;
                    })()
                );
            }
            const $ = new DocumentFragment();
            $.append(...flat(args));
            return $;
        }, fnMap),
        {
            construct(target, args, newTarget) {
                return Node.prototype.cloneNode.bind(h(args), true);
            },
            set(target, p, newValue, receiver) {
                if (typeof p === "string") customElements.define(p, newValue);
                return true;
            }
        }
    );
})();
window.h = h;

/**
 * 使用说明
 * 使用 `h.小写标签名()` 创建元素
 * 首个参数支持传入配置对象来初始化元素的属性
 * 示例:
 * ```js
 * h.hgroup(
 *     h.h3("三级标题"),
 *     h.p({class:"abc"},"描述")
 * )
 * ```
 * 使用 `new h()` 创建可复用的节点生成器
 * ```
 * const createNodes = new h(h.div("Hello"),h.div("World"));
 * console.log(createNodes()); //#document-fragment { <div>Hellow</div> <div>World</div> }
 * ```
 * 使用 `h.小写标签名["#id.class"]()` 的简便语法创建具有id和类型的元素
 *
 * 使用 `h["小写标签名"] = 自定义元素构造器` 注册自定义元素
 * 使用 `h.小写标签名["内建元素名"] = 自定义内建元素构造器`  注册内建自定义元素
 * 使用 `h.大写标签名` 获取其构造器 以便用于继承 `class extends h.DIV`
 */

/**
 * @template {string} V
 * @typedef $ValueOption 访问/设置器配置
 * @prop {string} name HTML 属性名 `<E name="">`
 * @prop {V} [$default] 默认属性值
 * @prop {boolean} [needObserve=true] 需要监控变化
 * @prop {V} [$type] 合法值(仅作为泛型参数 不需要传入)
 * @prop {boolean} [resetContent] 需要重置内容
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
 * prototype: C["prototype"] & {[K in keyof T]: T[K]["$type"]} & {contentUpdate:()=>void},
 * new(): C["prototype"] & {[K in keyof T]: T[K]["$type"]} & {contentUpdate:()=>void};
 * observedAttributes: Array<keyof T>
 *}}
 */

//prettier-ignore
const $extends = (constructor = HTMLElement, propAttrMap = {}) => class extends constructor {
    static observedAttributes = [];
    static {
        /** 需要重置内容的属性 */
        const needResetContentAttr = new Set();
        for (const prop in propAttrMap) {
            const { name, $default = false, needObserve = true, resetContent = true } = propAttrMap[prop];
            if (needObserve) this.observedAttributes.push(name);
            if(resetContent) needResetContentAttr.add(name);
            Reflect.defineProperty(this.prototype, prop, {
                get() {
                    return this.hasAttribute(name) ? (this.getAttribute(name) || true) : $default;
                },
                set(value = null) {
                    if (value === null || value === false) return this.removeAttribute(name);
                    //防止首次设置属性不能自动更新内容
                    if (!this.hasAttribute(name)) this.setAttribute(name, "");
                    if (this.getAttribute(name) !== value) this.setAttribute(name, value);
                },
                enumerable: false
            });
        }
        Reflect.defineProperty( this.prototype, "attributeChangedCallback", {
            value(name, oldValue, newValue) {
                if (oldValue === null || oldValue === void 0) return;
                if (newValue !== oldValue && this.isConnected) {
                    // 决定是否需要重置内容
                    if (needResetContentAttr.has(name)) {
                        if (this.shadowRoot) this.shadowRoot.innerHTML = "";
                        else this.innerHTML = ""
                    }
                    // 调用子类重写的版本 若子类中不存在contentUpdate 则抛出错误
                    if(!this.contentUpdate) throw new Error("contentUpdate() is not implemented in " + this.constructor.name);
                    this.contentUpdate(name, oldValue, newValue); //contentUpdate 会优先调用子类重写的版本
                }
            },
            writable: false,
            enumerable: false
        });
        freeze(this.observedAttributes);
        freeze(this);
    }
    /**
     * @abstract
     * #### 内容更新函数 子类需要重写此函数以供属性变化时自动更新内容
     * ---
     * * **添加到文档时** 被 {@linkcode connectedCallback} 调用
     * * **关联属性更新时** 被 {@linkcode attributeChangedCallback} 调用
     */
    // contentUpdate() {
    //     console.warn(`contentUpdate() is not implemented in ${this.constructor.name}`);
    // }
};

window.$extends = $extends;
