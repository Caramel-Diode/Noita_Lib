/**
 * @typedef {Object} Condition 查询选项对象
 * @prop {String} tagName 标签名
 * @prop {Object} attr 属性
 */

/**
 * 一级令牌类型(终结符)
 * @typedef {`<`|`>`|`</`|`/>`|`<?`|`?>`|`<!--`|`-->`|`<!DOCTYPE`|`<![CDATA[`|`]]>`|`=`|'"'|"'"|"TEXT"|"BLANK"|"EOF"} TokenTier1Type
 */

/**
 * 二级令牌类型(包含不可嵌套类型节点)
 * @typedef {"<E>"|"<E/>"|"</E>"|"<!---->"|"<![CDATA[]]>"|"<?T?>"|"<!DOCTYPE>"} TokenTier2Type
 */

/**
 * 令牌类型
 * @typedef {TokenTier1Type|TokenTier2Type} TokenType
 */

/**
 * @typedef { {
 *  <T extends keyof XMLObjectParamMap>(type:T) : XMLObjectParamMap[T],
 *  [key: String]: Array<XMLObject> }
 * } XMLObject
 */

/**
 * @typedef { Object } XMLObjectParamMap
 * @prop {Array<string>} text 文本节点
 * @prop {Array<string>} comment 注释节点
 * @prop {Array<string>} document 文档节点
 * @prop {{[key: string]: string}} attr 属性
 */

const XML = (() => {
    /**
     * 获得一个以简洁语法访问xml的对象
     * @param {ElementNode|DocumentNode} node
     * @returns {XMLObject}
     */
    const toXMLObject = ({ childNodes, attr = [] }, identifier) => {
        const $ = {
            attr: Object.create(null),
            /** @type {Array<string>} */
            text: [],
            /** @type {Array<string>} */
            comment: [],
            /** @type {Array<XMLObject>} */
            document: []
        };

        const obj = (type = "text") => $[type];
        delete obj.name;
        delete obj.length;
        const proto = Object.create(null);
        Reflect.defineProperty(proto, "name", { value: identifier });
        Reflect.setPrototypeOf(obj, proto);
        proto[Symbol.iterator] = function* () {
            for (const e of attr) yield e;
        };
        for (const [key, value] of attr) {
            Reflect.defineProperty($.attr, key, { value, enumerable: true });
            Reflect.defineProperty(obj, Symbol(key), { value });
        }
        if ($.text.length) Reflect.defineProperty(obj, Symbol("<text>"), { value: $.text });
        if ($.comment.length) Reflect.defineProperty(obj, Symbol("<comment>"), { value: $.comment });
        if ($.document.length) Reflect.defineProperty(obj, Symbol("<document>"), { value: $.comment });

        for (const child of childNodes) {
            const { tagName, type, content } = child;
            switch (type) {
                case "#document":
                    $.document.push(child.xmlObject);
                    continue;
                case "#element":
                    const elements = (obj[tagName] ??= []);
                    Reflect.defineProperty(elements, elements.length, {
                        get: () => child.xmlObject, //使用getter 避免非必要的递归生成
                        enumerable: true
                    });
                    continue;
                case "#text":
                    $.text.push(content);
                    continue;
                case "#comment":
                    $.comment.push(content);
                    continue;
            }
        }
        return obj;
    };

    class Converter {
        /** @type {Map<Symbol,Symbol>} 标准实体映射表 */
        static #commonEntityMap = new Map([
            [Symbol("&apos;"), Symbol(`'`)],
            [Symbol("&quot;"), Symbol(`"`)],
            [Symbol("&amp;"), Symbol("&")],
            [Symbol("&lt;"), Symbol("<")],
            [Symbol("&gt;"), Symbol(">")]
        ]);
        static default_ = new this();
        /** @param {object} map */
        constructor(map = {}) {
            /** @type {Map<Symbol,Symbol>} */
            this.entityMap = new Map(Converter.#commonEntityMap);
            for (const char in map) this.entityMap.set(Symbol(`&${map[char]};`), Symbol(char));
        }
        toChars(data) {
            /** @type {Array<String|Symbol>} */
            let parts = [data];
            for (const [entity, char] of this.entityMap) {
                /** @type {Array<String|Symbol>} */
                const newParts = [];
                for (let i = 0, part = parts[i]; i < parts.length; part = parts[++i]) {
                    if (typeof part === "string") {
                        const parts_ = part.split(entity.description);
                        const len = parts_.length - 1;
                        for (let i = 0; i < len; i++) newParts.push(parts_[i], char);
                        newParts.push(parts_[len]);
                    } else newParts.push(part);
                }
                parts = newParts;
            }
            for (let i = 0; i < parts.length; i++) {
                if (typeof parts[i] === "symbol") parts[i] = parts[i].description;
            }
            return parts.join("");
        }
        toEntitise(data) {
            /** @type {Array<String|Symbol>} */
            let parts = [data];
            for (const [entity, char] of this.entityMap) {
                /** @type {Array<String|Symbol>} */
                const newParts = [];
                for (let i = 0, part = parts[i]; i < parts.length; part = parts[++i]) {
                    if (typeof part === "string") {
                        const parts_ = part.split(char.description);
                        const len = parts_.length - 1;
                        for (let i = 0; i < len; i++) newParts.push(parts_[i], entity);
                        newParts.push(parts_[len]);
                    } else newParts.push(part);
                }
                parts = newParts;
            }
            for (let i = 0; i < parts.length; i++) {
                if (typeof parts[i] === "symbol") parts[i] = parts[i].description;
            }
            return parts.join("");
        }
    }

    class _Node extends EventTarget {
        #type = "node";
        get type() {
            return this.#type;
        }
        parent = null;
        /** @param {"#document"|"#element"|"#text"|"#comment"|"#cDataSection"|"#processingInstruction"|"#documentType"|"node"} type 节点类型 */
        constructor(type = "node") {
            super();
            /** @type {NodeType} 节点类型 */ this.#type = type;
        }
        remove() {
            if (this.parent) {
                /** @type {_NodeList} */ const childNodes = this.parent.childNodes;
                childNodes.splice(childNodes.indexOf(this), 1);
            } else throw new Error("游离的节点, 不存在父级");
        }
    }

    /** 节点属性 @extends {Map<String,String>} */
    class _Attr extends Map {
        static Cover = false;
        #converter = Converter.default_;
        /** @param {Array<{key:String,value:String}>} data */
        constructor(data, converter, cover = false) {
            super();
            if (converter) this.#converter = converter;
            if (cover) for (let i = 0; i < data.length; i++) this.set(data[i].key, data[i].value);
            else
                for (let i = 0; i < data.length; i++) {
                    if (super.has(data[i].key)) continue;
                    this.set(data[i].key, data[i].value);
                }
        }
        /**
         * 获取属性
         * @param {String} key 属性名
         */
        get(key) {
            if (super.has(key)) return this.#converter.toChars(super.get(key));
        }
        /**
         * 设置属性
         * @param {String} key 属性名
         * @param {String} [value] 属性值
         */
        set(key, value = "") {
            super.set(key, this.#converter.toEntitise(value));
        }
        toString() {
            const cache = [];
            for (const [key, value] of this) cache.push(`${key}="${value}"`);
            return cache.join(" ");
        }
    }

    /** @extends Array<_Node> */
    class _NodeList extends Array {
        #parent = null;
        constructor(parent, data) {
            super();
            if (parent) this.#parent = parent;
        }

        #changeParent(nodes) {
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                const parent = node.parent;
                // 先从当前父元素中移除
                if (parent) {
                    const childNodes = parent.childNodes;
                    childNodes.splice(childNodes.indexOf(node), 1);
                }
                node.parent = this.#parent;
            }
        }
        /**
         * @template {Condition|String|(node:ElementNode|TextNode|CommentNode|CDataSectionNode|ProcessingInstructionNode|DocumentTypeNode)=>Boolean} Q
         * @param {Q} condition 查询条件
         * @param {Boolean} [recursive] 递归查询(默认为true)
         * @returns {Q extends String ? Array<ElementNode<Q>> : Q extends Condition ? Array<Q["tagName"]> : Array<_Node>}
         */
        query(condition, recursive = true) {
            const result = [];
            const type = typeof condition;
            if (type === "function") {
                for (let i = 0, node = this[i]; i < this.length; node = this[++i]) {
                    if (condition(node)) result.push(node);
                    if (recursive && node.type === "#element") result.push(...node.childNodes.query(condition, recursive));
                }
            } else if (type === "string") return this.query({ tagName: condition }, recursive);
            else if (type === "object") {
                const _attr = condition.attr ?? {};
                for (let i = 0, node = this[i]; i < this.length; node = this[++i]) {
                    if (node.type === "#element") {
                        if (node.tagName === condition.tagName) {
                            const nodeAttr = node.attr;
                            let flag = true;
                            for (const key in _attr) {
                                if (nodeAttr.get(key) !== _attr[key]) {
                                    flag = false;
                                    break;
                                }
                            }
                            if (flag) result.push(node);
                        }
                        if (recursive) result.push(...node.childNodes.query(condition, recursive));
                    }
                }
            }
            return result;
        }

        init(data) {
            if (data) {
                this.#changeParent(data);
                super.push(...data);
            }
        }

        unshift(...nodes) {
            this.#changeParent(nodes);
            super.unshift(...nodes);
        }
        push(...nodes) {
            this.#changeParent(nodes);
            super.push(...nodes);
        }
        shift() {
            const r = super.shift();
            r.parent = null;
            return r;
        }
        pop() {
            const r = super.pop();
            r.parent = null;
            return r;
        }
        splice(start, deleteCount, ...nodes) {
            const r = super.splice(start, deleteCount, ...nodes);
            this.#changeParent(nodes);
            for (let i = 0; i < r.length; i++) {
                r[i].parent = null;
            }
            return r;
        }
        /**
         * @param {"XML"|"PlainText"} format
         */
        toString(format) {
            const cache = [];
            for (let i = 0; i < this.length; i++) {
                cache.push(this[i].toString(format));
            }
            return cache.join("");
        }
    }

    class DocumentNode extends _Node {
        /** @type {_NodeList} */
        childNodes = new _NodeList(this);

        get xmlObject() {
            return toXMLObject(this, "#document");
        }

        constructor() {
            super("#document");
        }
        /** @param {"XML"|"PlainText"} format */
        toString(format = "XML") {
            return this.childNodes.toString(format);
        }
    }

    /**
     * 元素节点
     * ```xml
     * <element attr=""></element>
     * ```
     * @template T
     */
    class ElementNode extends _Node {
        /** @type {_NodeList} */
        childNodes = new _NodeList(this);
        /** @param {"XML"|"PlainText"|"RAW"} format */
        toString(format = "XML") {
            const content = this.childNodes.toString(format);
            if (format === "XML") {
                let attrString = "";
                if (this.attr.size) attrString = ` ${this.attr.toString("")}`;
                if (this.childNodes.length) return `<${this.tagName}${attrString}>${content}</${this.tagName}>`;
                return `<${this.tagName}${attrString}/>`;
            } else if (format === "RAW") return this.#rawData;
            return content;
        }
        #rawData = null;

        get xmlObject() {
            return toXMLObject(this, this.tagName);
        }

        /** @param {T} tagName */
        constructor(tagName = "", attrData, converter, rawData, cover) {
            super("#element");
            /** @type {_Attr} */ this.attr = new _Attr(attrData, converter, cover);
            /** @type {T} 标签名 */ this.tagName = tagName;
            this.#rawData = rawData;
        }
    }

    /**
     * 文本节点
     * ```xml
     * 文本
     * ```
     */
    class TextNode extends _Node {
        #content;
        #converter = Converter.default_;
        get content() {
            return this.#converter.toEntitise(this.#content);
        }
        set content(value) {
            this.#content = this.#converter.toChars(value);
        }
        /** @param {"XML"|"PlainText"} format */
        toString(format = "XML") {
            return this.content;
        }
        constructor(content = "", converter) {
            super("#text");
            /** @type {String} 内容 */ this.content = content;
            if (converter) this.#converter = converter;
        }
    }

    /**
     * 注释节点
     *  ```xml
     *  <!-- 注释 -->
     *  ```
     */
    class CommentNode extends _Node {
        content = "";
        /** @param {"XML"|"PlainText"} format */
        toString(format = "XML") {
            if (format === "XML") return `<!--${this.content}-->`;
            return this.content;
        }
        constructor(content = "") {
            super("#comment");
            /** @type {String} 内容 */ this.content = content;
        }
    }

    /**
     * CDATA数据块节点
     * ```xml
     * <![CDATA[ … ]]>
     * ```
     */
    class CDataSectionNode extends _Node {
        /** @param {"XML"|"PlainText"} format */
        toString(format = "XML") {
            if (format === "XML") return `<![CDATA[${this.content}]]>`;
            return this.content;
        }
        constructor(content = "") {
            super("#cDataSection");
            /** @type {String} 内容 */ this.content = content;
        }
    }

    /**
     * 文档处理指令节点
     * ```xml
     * <?xml version="1.0"?>
     * ```
     */
    class ProcessingInstructionNode extends _Node {
        /** @param {"XML"|"PlainText"} format */
        toString(format = "XML") {
            if (format === "XML") {
                if (this.attr.size) return `<?${this.target} ${this.attr}?>`;
                return `<?${this.target}?>`;
            }
            return "";
        }
        constructor(target = "", attrData, converter, cover) {
            super("#processingInstruction");
            /** @type {_Attr} */ this.attr = new _Attr(attrData, converter, cover);
            /** @type {String} 目标名 */ this.target = target;
        }
    }

    /**
     * 文档类型节点
     * ```xml
     * <!DOCTYPE html>
     * ```
     */
    class DocumentTypeNode extends _Node {
        /** @param {"XML"|"PlainText"} format */
        toString(format = "XML") {
            if (format === "XML") {
                if (this.data.length) return `<!DOCTYPE ${this.name} "${this.data.join(`" "`)}">`;
                else return `<!DOCTYPE ${this.name}>`;
            } else return "";
        }
        constructor(name = "", data) {
            super("#documentType");
            /** @type {String} 文档类型名 */ this.name = name;
            /** @type {Array<String>} */ this.data = data ?? [];
        }
    }

    /** 判断是否为空白字符 */
    const isBlank = (() => {
        const table = new Uint8Array(64).fill(0);
        for (const c of `\t\n\v\f\r `) table[c.charCodeAt(0)] = 1;
        return char => {
            const code = char.charCodeAt(0);
            return code < 64 ? table[code] : 0;
        };
    })();

    /** 判断特殊字符 "'-<=>? */
    const isSpecial = (() => {
        const table = new Uint8Array(64).fill(0);
        for (const c of `"'-<=>?`) table[c.charCodeAt(0)] = 1;
        return char => {
            const code = char.charCodeAt(0);
            return code < 64 ? table[code] : 0;
        };
    })();
    class Token {
        /** @type {TokenType} */
        type = "EOF";
        data = "";
        /** @type {Array<string>} */
        #cache = null;
        #index = -1;
        /**
         * @param {TokenType} type
         * @param {number} index
         * @param {string|undefined} data
         */
        constructor(type = "EOF", index, data) {
            this.type = type;
            if (type !== "TEXT" && type !== "BLANK") this.data = type;
            else this.#cache = [];
            this.#index = index;
            if (data) this.data = data;
        }
        /**
         * @param {string} char
         */
        push(char) {
            this.#cache.push(char);
        }
        finish() {
            this.data = this.#cache.join("");
            this.#cache = null;
        }
        /**
         * @param {"raw"|undefined} type
         * @returns
         */
        toString() {
            return this.data ?? this.type;
        }
        /**
         * 输出调试信息
         * @param {*} msg
         */
        debug(msg) {
            console.log(msg);
        }
        get index() {
            return this.#index;
        }
        get length() {
            return (this.#cache ?? this.data).length;
        }
    }

    /**
     * 分词 阶段一
     * @param {string} str
     */
    const tokenise1 = str => {
        const data = [...str, "EOF"];

        const pos = {
            _index: 0,
            get index() {
                return this._index;
            },
            set index(value) {
                this.lineIndex += value - this._index;
                this._index = value;
                return true;
            },
            line: 1,
            lineIndex: 1
        };
        class _Token extends Token {
            #posInfo = "";
            /**
             * @param {TokenType} type
             * @param {string|undefined} data
             */
            constructor(type, data) {
                super(type, pos.index, data);
                this.#posInfo = `at ${pos.line}:${pos.lineIndex}`;
            }
            toString(type) {
                if (type === "raw") return str.slice(this.index, this.index + this.length);
                return super.toString();
            }
            debug(msg) {
                console.log(this.#posInfo, msg);
            }
        }
        /** @type {Array<Token>} */
        const tokens = [];
        /** @type {typeof tokens.push} */
        const push = tokens.push.bind(tokens);
        $: while (pos.index < data.length) {
            const $0 = data[pos.index];
            if ($0 === "<") {
                const $1 = data[pos.index + 1];
                if ($1 === "/") {
                    push(new _Token("</"));
                    pos.index += 2;
                    continue;
                }
                if ($1 === "?") {
                    push(new _Token("<?"));
                    pos.index += 2;
                    continue;
                }
                if ($1 === "!") {
                    if (str.slice(pos.index, pos.index + 4) === "<!--") {
                        push(new _Token("<!--"));
                        pos.index += 4;
                        continue;
                    }
                    const part = str.slice(pos.index, pos.index + 9).toLocaleUpperCase();
                    if (part === "<!DOCTYPE") {
                        push(new _Token("<!DOCTYPE"));
                        pos.index += 9;
                        continue;
                    }
                    if (part === "<![CDATA[") {
                        push(new _Token("<![CDATA["));
                        pos.index += 9;
                        continue;
                    }
                    pos.index += 2;
                    push(new _Token("TEXT", "<!"));
                    continue;
                }
                push(new _Token("<"));
                pos.index++;
                continue;
            }
            if ($0 === ">") {
                push(new _Token(">"));
                pos.index++;
                continue;
            }
            if ($0 === "/") {
                if (data[pos.index + 1] === ">") {
                    push(new _Token("/>"));
                    pos.index += 2;
                    continue;
                }
                push(new _Token("TEXT", "/"));
                pos.index++;
                continue;
            }
            if ($0 === "?") {
                if (data[pos.index + 1] === ">") {
                    push(new _Token("?>"));
                    pos.index += 2;
                    continue;
                }
                push(new _Token("TEXT", "?"));
                pos.index++;
                continue;
            }
            if ($0 === "-") {
                if (str.slice(pos.index, pos.index + 3) === "-->") {
                    push(new _Token("-->"));
                    pos.index += 3;
                    continue;
                }
                if (tokens.at(-1).type === "TEXT") tokens.at(-1).data += "-";
                else push(new _Token("TEXT", "-"));
                pos.index++;
                continue;
            }
            if ($0 === "]") {
                if (str.slice(pos.index, pos.index + 3) === "]]>") {
                    push(new _Token("]]>"));
                    pos.index += 3;
                    continue;
                }
                push(new _Token("TEXT", "]"));
                pos.index++;
                continue;
            }
            if ($0 === "=") {
                push(new _Token("="));
                pos.index++;
                continue;
            }
            if ($0 === '"') {
                push(new _Token('"'));
                pos.index++;
                continue;
            }
            if ($0 === "'") {
                push(new _Token("'"));
                pos.index++;
                continue;
            }
            if (isBlank($0)) {
                const blankToken = new _Token("BLANK");
                push(blankToken);
                blankToken.push($0);
                pos.index++;
                if ($0 === "\n") {
                    pos.line++;
                    pos.lineIndex = 1;
                }
                while (pos.index < data.length) {
                    const nextChar = data[pos.index];

                    if (!isBlank(nextChar)) {
                        blankToken.finish();
                        continue $;
                    }
                    blankToken.push(nextChar);
                    pos.index++;
                    if (nextChar === "\n") {
                        pos.line++;
                        pos.lineIndex = 1;
                    }
                }
            }
            if ($0 === "EOF") {
                push(new _Token());
                break;
            }
            const textToken = new _Token("TEXT");
            if (tokens.at(-1).type === "TEXT") textToken.push(tokens.pop().data);
            push(textToken);
            textToken.push($0);
            pos.index++;
            while (pos.index < data.length) {
                const nextChar = data[pos.index];
                if (isSpecial(nextChar) || nextChar === "EOF" || isBlank(nextChar)) {
                    textToken.finish();
                    continue $;
                }
                textToken.push(nextChar);
                pos.index++;
            }
        }
        return tokens;
    };

    /**
     * 分词 阶段二
     * @param {Array<Token>} tokens
     */
    const tokenise2 = (() => {
        class _Token extends Token {
            static ["<E>"] = class TokenStartTag extends _Token {
                constructor({ tagName, attrs, tokens }) {
                    super("<E>", tokens);
                    this.tagName = tagName;
                    this.attrs = attrs;
                }
            };
            static ["<E/>"] = class TokenEmptyTag extends _Token {
                constructor({ tagName, attrs, tokens }) {
                    super("<E/>", tokens);
                    this.tagName = tagName;
                    this.attrs = attrs;
                }
            };
            static ["</E>"] = class TokenEndTag extends _Token {
                constructor({ tagName, tokens }) {
                    super("</E>", tokens);
                    this.tagName = tagName;
                }
            };
            static ["<?T?>"] = class TokenProcessing extends _Token {
                constructor({ target, attrs, tokens }) {
                    super("<?T?>", tokens);
                    this.target = attrs;
                    this.attrs = attrs;
                }
            };
            static ["<!DOCTYPE>"] = class TokenProcessing extends _Token {
                constructor({ name, tokens }) {
                    super("<!DOCTYPE>", tokens);
                    this.name = name;
                }
            };
            static ["<!---->"] = class TokenComment extends _Token {
                constructor({ content, tokens }) {
                    super("<!---->", tokens);
                    this.content = content;
                }
            };
            static ["<![CDATA[]]>"] = class TokenCdata extends _Token {
                constructor({ content, tokens }) {
                    super("<![CDATA[]]>", tokens);
                    this.content = content;
                }
            };
            /** @type {Array<Token>} */
            #tokens = null;
            /**
             * @param {TokenType} type
             * @param {Array<Token>} tokens
             */
            constructor(type, tokens) {
                super(type, tokens[0].index);
                this.#tokens = tokens;
                const datas = [];
                for (let i = 0; i < this.#tokens.length; i++) {
                    datas[i] = this.#tokens[i].data;
                }
                this.data = datas.join("");
            }
            get length() {
                let length = 0;
                for (let i = 0; i < this.#tokens.length; i++) {
                    length += this.#tokens[i].length;
                }
                return length;
            }
        }
        const isLegal = str => !(str.includes("<") || str.includes(">") || str.includes("=") || str.includes("'") || str.includes('"') || str.includes("?") || str.includes("!"));
        const build = {
            get tag() {
                return {
                    /**
                     * 状态机
                     * * `0` : `<`
                     * * `1` : `<E`
                     * * `2` : `<E `
                     * * `3` : `<E key` 值缺省模式
                     * * `3?` : `<E key `
                     * * `4` : `<E key=` 无引号模式 终结符 非`TEXT` => 状态2
                     * * `A5` : `<E key="` 双引号模式 终结符  `"`  => 状态2
                     * * `B5` : `<E key='` 单引号模式 终结符  `'`  => 状态2
                     * * `D6` : `<E attr>` 起始标签
                     * * `E6` : `<E attr/>` 自闭合标签
                     * @type {"_"|"0"|"1"|"2"|"3"|"3?"|"4"|"A5"|"B5"|"D6"|"E6"}
                     */
                    state: "_",
                    /** @type {Array<Token>} */
                    tokens: [],
                    /** @type {Array<{key:string,value:string}>} */
                    attrs: [],
                    tagName: "",
                    /** @param {Token} token */
                    update(token) {
                        const { type } = token;
                        switch (this.state) {
                            case "_":
                                this.state = "0";
                                this.tokens.push(token);
                                return true;
                            case "0":
                                if (type === "TEXT" && isLegal(token.data)) {
                                    this.state = "1";
                                    this.tagName = token.data;
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                            case "1":
                                if (token.type === "BLANK") {
                                    this.state = "2";
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (token.type === ">") {
                                    this.state = "D6";
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (token.type === "/>") {
                                    this.state = "E6";
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                            case "2":
                                if (type === "TEXT" && isLegal(token.data)) {
                                    this.state = "3";
                                    this.attrs.push({ key: token.data, value: token.data });
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (token.type === "BLANK") {
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (token.type === ">") {
                                    this.state = "D6";
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (token.type === "/>") {
                                    this.state = "E6";
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                            case "3":
                                if (type === "BLANK") {
                                    this.state = "3?";
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (type === "=") {
                                    this.state = "4";
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (token.type === ">") {
                                    this.state = "D6";
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (token.type === "/>") {
                                    this.state = "E6";
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                            case "3?":
                                if (token.type === "=") {
                                    this.state = "4";
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (token.type === "BLANK") {
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (type === "TEXT" && isLegal(token.data)) {
                                    this.state = "3";
                                    this.attrs.push({ key: token.data, value: token.data });
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                            case "4":
                                if (token.type === "BLANK") {
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (type === "TEXT" && isLegal(token.data)) {
                                    this.state = "2";
                                    this.tokens.push(token);
                                    this.attrs.at(-1).value = token.data;
                                    return true;
                                }
                                if (type === '"') {
                                    this.state = "A5";
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (type === "'") {
                                    this.state = "B5";
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                            case "A5":
                                if (type === '"') {
                                    this.state = "2";
                                    let i = this.tokens.length - 1;
                                    const attrValueCache = [];
                                    while (true) {
                                        if (this.tokens[i].type === '"') break;
                                        attrValueCache.unshift(this.tokens[i].data);
                                        i--;
                                    }
                                    this.tokens.push(token);
                                    this.attrs.at(-1).value = attrValueCache.join("");
                                    return true;
                                }
                                this.tokens.push(token);
                                return true;
                            case "B5":
                                if (type === "'") {
                                    this.state = "2";
                                    let i = this.tokens.length - 1;
                                    const attrValueCache = [];
                                    while (true) {
                                        if (this.tokens[i].type === "'") break;
                                        attrValueCache.unshift(this.tokens[i].data);
                                        i--;
                                    }
                                    this.tokens.push(token);
                                    this.attrs.at(-1).value = attrValueCache.join("");
                                    return true;
                                }
                                this.tokens.push(token);
                                return true;
                        }
                    }
                };
            },
            get tagEnd() {
                return {
                    /**
                     * 状态机
                     * * `0` : `</`
                     * * `1` : `</E`
                     * * `2` : `</E>`
                     * @type {"_"|"0"|"1"|"2"}
                     */
                    state: "_",
                    /** @type {Array<Token>} */
                    tokens: [],
                    tagName: "",
                    /** @param {Token} token */
                    update(token) {
                        const { type } = token;
                        switch (this.state) {
                            case "_":
                                this.tokens.push(token);
                                this.state = "0";
                                return true;
                            case "0":
                                if (type === "TEXT" && isLegal(token.data)) {
                                    this.tokens.push(token);
                                    this.state = "1";
                                    this.tagName = token.data;
                                    return true;
                                }
                                return false;
                            case "1":
                                if (type === ">") {
                                    this.tokens.push(token);
                                    this.state = "2";
                                    return true;
                                }
                                if (type === "BLANK") {
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                        }
                    }
                };
            },
            get comment() {
                return {
                    /**
                     * 状态机
                     * * `0`: `<!--`
                     * * `1`: `<!-- -->`
                     * @type {"_"|"0"|"1"}
                     */
                    state: "_",
                    /** @type {Array<Token>} */
                    tokens: [],
                    content: "",
                    /** @param {Token} token */
                    update(token) {
                        if (this.state === "_") {
                            this.tokens.push(token);
                            this.state = "0";
                            return true;
                        }
                        if (this.state === "0") {
                            this.tokens.push(token);
                            if (token.type === "-->") {
                                this.content = this.tokens.slice(1, -1).join("");
                                this.state = "1";
                            }
                            return true;
                        }
                    }
                };
            },
            get cdata() {
                return {
                    /**
                     * 状态机
                     * * `0` : `<![CDATA[`
                     * * `1` : `<![CDATA[ ]]>`
                     * @type {"_"|"0"|"1"}
                     */
                    state: "_",
                    /** @type {Array<Token>} */
                    tokens: [],
                    content: "",
                    /** @param {Token} token */
                    update(token) {
                        if (this.state === "_") {
                            this.state = "0";
                            this.tokens.push(token);
                            return true;
                        }
                        if ((this.state = "0")) {
                            this.tokens.push(token);
                            if (token.type === "]]>") {
                                this.state = "1";
                                this.content = this.tokens.slice(1, -1).join("");
                            }
                            return true;
                        }
                    }
                };
            },
            get processing() {
                return {
                    /**
                     * 状态机
                     * * `0` : `<?`
                     * * `1` : `<?T`
                     * * `2` : `<?T `
                     * * `3` : `<?T key` 值缺省模式
                     * * `3?` : `<?T key ` 值缺省模式
                     * * `4` : `<?T key=` 无引号模式 终结符 非`TEXT` => 状态2
                     * * `A5` : `<?T key="` 双引号模式 终结符  `"`  => 状态2
                     * * `B5` : `<?T key='` 单引号模式 终结符  `'`  => 状态2
                     * * `6` : `<?T attr ?>`
                     * @type {"_"|"0"|"1"|"2"|"3"|"3?"|"4"|"A5"|"B5"|"6"}
                     */
                    state: "_",
                    tokens: [],
                    /** @type {Array<{key:string,value:string}>} */
                    attrs: [],
                    target: "",
                    /** @param {Token} token */
                    update(token) {
                        const { type } = token;
                        switch (this.state) {
                            case "_":
                                this.state = "0";
                                this.tokens.push(token);
                                return true;
                            case "0":
                                if (type === "TEXT" && isLegal(token.data)) {
                                    this.state = "1";
                                    this.target = token.data;
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                            case "1":
                                if (token.type === "BLANK") {
                                    this.state = "2";
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (token.type === "?>") {
                                    this.state = "6";
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                            case "2":
                                if (type === "TEXT" && isLegal(token.data)) {
                                    this.state = "3";
                                    this.attrs.push({ key: token.data, value: token.data });
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (token.type === "BLANK") {
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (token.type === "?>") {
                                    this.state = "6";
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                            case "3":
                                if (type === "BLANK") {
                                    this.state = "3?";
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (type === "=") {
                                    this.state = "4";
                                    this.tokens.push(token);
                                    this.attrs.at(-1).value = token.data;
                                    return true;
                                }
                                if (token.type === ">") {
                                    this.state = "6";
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                            case "3?":
                                if (token.type === "=") {
                                    this.state = "4";
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (token.type === "BLANK") {
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (type === "TEXT" && isLegal(token.data)) {
                                    this.state = "3";
                                    this.attrs.push({ key: token.data, value: token.data });
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                            case "4":
                                if (token.type === "BLANK") {
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (type === "TEXT" && isLegal(token.data)) {
                                    this.state = "2";
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (type === '"') {
                                    this.state = "A5";
                                    this.tokens.push(token);
                                    return true;
                                }
                                if (type === "'") {
                                    this.state = "B5";
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                            case "A5":
                                if (type === '"') {
                                    this.state = "2";
                                    let i = this.tokens.length - 1;
                                    const attrValueCache = [];
                                    while (true) {
                                        if (this.tokens[i].type === '"') break;
                                        attrValueCache.unshift(this.tokens[i].data);
                                        i--;
                                    }
                                    this.tokens.push(token);
                                    this.attrs.at(-1).value = attrValueCache.join("");
                                    return true;
                                }
                                this.tokens.push(token);
                                return true;
                            case "B5":
                                if (type === "'") {
                                    this.state = "2";
                                    let i = this.tokens.length - 1;
                                    const attrValueCache = [];
                                    while (true) {
                                        if (this.tokens[i].type === "'") break;
                                        attrValueCache.unshift(this.tokens[i].data);
                                        i--;
                                    }
                                    this.tokens.push(token);
                                    this.attrs.at(-1).value = attrValueCache.join("");
                                    return true;
                                }
                                this.tokens.push(token);
                                return true;
                        }
                    }
                };
            },
            get doctype() {
                return {
                    /**
                     * 状态机(未完善)
                     * * `0` `<!DOCTYPE`
                     * * `1` `<!DOCTYPE `
                     * * `2` `<!DOCTYPE name`
                     * * `3` `<!DOCTYPE name>`
                     * @type {"_"|"0"|"1"|"2"|"3"}
                     */
                    state: "_",
                    name: "",
                    /** @type {Array<Token>} */
                    tokens: [],
                    /** @param {Token} token */
                    update(token) {
                        switch (this.state) {
                            case "_":
                                this.tokens.push(token);
                                this.state = "0";
                                return true;
                            case "0":
                                if (token.type === "BLANK") {
                                    this.tokens.push(token);
                                    this.state = "1";
                                    return true;
                                }
                                return false;
                            case "1":
                                if (token.type === "TEXT" && isLegal(token.data)) {
                                    this.name = token.data;
                                    this.tokens.push(token);
                                    this.state = "2";
                                    return true;
                                }
                                if (token.type === "BLANK") {
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                            case "2":
                                if (token.type === ">") {
                                    this.state = "3";
                                    this.tokens.push(token);
                                    return true;
                                }
                                return false;
                        }
                    }
                };
            }
        };

        /**
         * @param {Array<Token>} tokens
         */
        return tokens => {
            /** @type {Array<Token>} */
            const newTokens = [];
            $out: for (let i = 0; i < tokens.length; i++) {
                const t = tokens[i];
                if (t.type === "<") {
                    const cBuild = build.tag;
                    const comments = [];
                    $: for (let j = i; j < tokens.length; j++) {
                        const token = tokens[j];
                        if (token.type === "EOF") {
                            tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                            newTokens.push(tokens[i]);
                            continue $out;
                        }
                        if (token.type === "<!--" && cBuild.state !== "D6" && cBuild.state !== "E6" && cBuild.state !== "A5" && cBuild.state !== "B5") {
                            const cBuildComment = build.comment;
                            for (let k = j; k < tokens.length; k++) {
                                const _token = tokens[k];
                                if (_token.type === "EOF") {
                                    tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                                    newTokens.push(tokens[i]);
                                    continue $out;
                                }
                                const result = cBuildComment.update(_token);
                                if (!result) {
                                    tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                                    newTokens.push(tokens[i]);
                                    continue $out;
                                }
                                if (cBuildComment.state === "1") {
                                    // 完成匹配
                                    comments.push(new _Token["<!---->"](cBuildComment));
                                    j = k;
                                    continue $;
                                }
                            }
                        }
                        const result = cBuild.update(token);
                        if (!result) {
                            console.error(cBuild, token);

                            tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                            newTokens.push(tokens[i]);
                            continue $out;
                        }
                        if (cBuild.state === "D6") {
                            // 完成匹配
                            const rToken = new _Token["<E>"](cBuild);
                            rToken.$comments = comments;
                            newTokens.push(rToken);
                            i = j;
                            continue $out;
                        }
                        if (cBuild.state === "E6") {
                            // 完成匹配
                            const rToken = new _Token["<E/>"](cBuild);
                            rToken.$comments = comments;
                            newTokens.push(rToken);
                            i = j;
                            continue $out;
                        }
                    }
                }
                if (t.type === "</") {
                    const cBuild = build.tagEnd;
                    const comments = [];
                    $: for (let j = i; j < tokens.length; j++) {
                        const token = tokens[j];
                        if (token.type === "EOF") {
                            tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                            newTokens.push(tokens[i]);
                            continue $out;
                        }
                        if (token.type === "<!--" && cBuild.state !== "2") {
                            const cBuildComment = build.comment;
                            for (let k = j; k < tokens.length; k++) {
                                const _token = tokens[k];
                                if (_token.type === "EOF") {
                                    tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                                    newTokens.push(tokens[i]);
                                    continue $out;
                                }
                                const result = cBuildComment.update(_token);
                                if (!result) {
                                    tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                                    newTokens.push(tokens[i]);
                                    continue $out;
                                }
                                if (cBuildComment.state === "1") {
                                    // 完成匹配
                                    comments.push(new _Token["<!---->"](cBuildComment));
                                    j = k;
                                    continue $;
                                }
                            }
                        }
                        const result = cBuild.update(token);
                        if (!result) {
                            tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                            newTokens.push(tokens[i]);
                            continue $out;
                        }
                        if (cBuild.state === "2") {
                            // 完成匹配
                            const rToken = new _Token["</E>"](cBuild);
                            rToken.$comments = comments;
                            newTokens.push(rToken);
                            i = j;
                            continue $out;
                        }
                    }
                }
                if (t.type === "<?") {
                    const cBuild = build.processing;
                    const comments = [];
                    $: for (let j = i; j < tokens.length; j++) {
                        const token = tokens[j];
                        if (token.type === "EOF") {
                            tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                            newTokens.push(tokens[i]);
                            continue $out;
                        }
                        if (token.type === "<!--" && cBuild.state !== "6" && cBuild.state !== "A5" && cBuild.state !== "B5") {
                            const cBuildComment = build.comment;
                            for (let k = j; k < tokens.length; k++) {
                                const _token = tokens[k];
                                if (_token.type === "EOF") {
                                    tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                                    newTokens.push(tokens[i]);
                                    continue $out;
                                }
                                const result = cBuildComment.update(_token);
                                if (!result) {
                                    tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                                    newTokens.push(tokens[i]);
                                    continue $out;
                                }
                                if (cBuildComment.state === "1") {
                                    // 完成匹配
                                    comments.push(new _Token["<!---->"](cBuildComment));
                                    j = k;
                                    continue $;
                                }
                            }
                        }
                        const result = cBuild.update(token);
                        if (!result) {
                            tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                            newTokens.push(tokens[i]);
                            continue $out;
                        }
                        if (cBuild.state === "6") {
                            // 完成匹配
                            const rToken = new _Token["<?T?>"](cBuild);
                            rToken.$comment = comments;
                            newTokens.push(rToken);
                            i = j;
                            continue $out;
                        }
                    }
                }
                if (t.type === "<!DOCTYPE") {
                    const cBuild = build.doctype;
                    const comments = [];
                    $: for (let j = i; j < tokens.length; j++) {
                        const token = tokens[j];
                        if (token.type === "EOF") {
                            tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                            newTokens.push(tokens[i]);
                            continue $out;
                        }
                        if (token.type === "<!--" && cBuild.state !== "3") {
                            const cBuildComment = build.comment;
                            for (let k = j; k < tokens.length; k++) {
                                const _token = tokens[k];
                                if (_token.type === "EOF") {
                                    tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                                    newTokens.push(tokens[i]);
                                    continue $out;
                                }
                                const result = cBuildComment.update(_token);
                                if (!result) {
                                    tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                                    newTokens.push(tokens[i]);
                                    continue $out;
                                }
                                if (cBuildComment.state === "1") {
                                    // 完成匹配
                                    comments.push(new _Token["<!---->"](cBuildComment));
                                    j = k;
                                    continue $;
                                }
                            }
                        }
                        const result = cBuild.update(token);
                        if (!result) {
                            tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                            newTokens.push(tokens[i]);
                            continue $out;
                        }
                        if (cBuild.state === "3") {
                            // 完成匹配
                            const rToken = new _Token["<!DOCTYPE>"](cBuild);
                            rToken.$comments = comments;
                            newTokens.push(rToken);
                            i = j;
                            continue $out;
                        }
                    }
                }
                if (t.type === "<![CDATA[") {
                    const cBuild = build.cdata;
                    for (let j = i; j < tokens.length; j++) {
                        const token = tokens[j];
                        if (token.type === "EOF") {
                            tokens[i].type = "TEXT"; //tag结构不合法 token更正为`TEXT`
                            newTokens.push(tokens[i]);
                            continue $out;
                        }
                        const result = cBuild.update(token);
                        if (!result) {
                            tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                            newTokens.push(tokens[i]);
                            continue $out;
                        }
                        if (cBuild.state === "1") {
                            // 完成匹配
                            newTokens.push(new _Token["<![CDATA[]]>"](cBuild));
                            i = j;
                            continue $out;
                        }
                    }
                }
                if (t.type === "<!--") {
                    const cBuild = build.comment;
                    for (let j = i; j < tokens.length; j++) {
                        const token = tokens[j];
                        if (token.type === "EOF") {
                            tokens[i].type = "TEXT"; //tag结构不合法 token更正为`TEXT`
                            newTokens.push(tokens[i]);
                            continue $out;
                        }
                        const result = cBuild.update(token);
                        if (!result) {
                            tokens[i].type = "TEXT"; //结构不合法 token更正为`TEXT`
                            newTokens.push(tokens[i]);
                            continue $out;
                        }
                        if (cBuild.state === "1") {
                            // 完成匹配
                            newTokens.push(new _Token["<!---->"](cBuild));
                            i = j;
                            continue $out;
                        }
                    }
                }
                newTokens.push(t);
            }
            return newTokens;
        };
    })();

    /**
     * 解析XML字符串
     * @param {String} data XML字符串
     * @param {Object} [option] 解析配置
     * @param {Boolean} [option.attrCover] 重复声明的属性是否覆盖之前的声明
     * @param {EntityMap} [option.entityMap] 实体映射表
     * @param {Array<"#element"|"#text"|"#comment"|"#cDataSection"|"#processingInstruction"|"#documentType">} [option.ignore] 忽略的节点类型
     * @returns {DocumentNode} 根节点
     */
    const parse = (data, option = {}) => {
        let converter = Converter.default_;
        if (option) {
            option.attrCover ??= false;
            if (option.entityMap) converter = new Converter(option.entityMap);
        }

        const root = new DocumentNode();
        const tokens = tokenise2(tokenise1(data));
        /** @type {Array<Token>} */
        const stack = [];
        $: for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            stack.push(token);
            if (token.$comments) {
                for (let i = 0; i < token.$comments.length; i++) token.$comments[i].$node = new CommentNode(token.$comments[i].content);
            }
            switch (token.type) {
                case "<E>":
                    token.$node = new ElementNode(token.tagName, token.attrs, converter, data.slice(token.index, token.index + token.length), option.attrCover);
                    token.$hasEnd = false;
                    stack.unshift(...token.$comments);
                    continue;
                case "<E/>":
                    token.$node = new ElementNode(token.tagName, token.attrs, converter, data.slice(token.index, token.index + token.length), option.attrCover);
                    token.$hasEnd = true;
                    stack.unshift(...token.$comments);
                    continue;
                case "</E>":
                    /** @type {Array<Token} */
                    const cache = [];
                    // 向前查找起始标签
                    for (let j = stack.length - 2; j >= 0; j--) {
                        const t = stack[j];
                        // 成功匹配到起始标签
                        if (t.type === "<E>" && t.tagName === token.tagName && !t.$hasEnd) {
                            t.$hasEnd = true;
                            stack.pop();
                            stack.unshift(...token.$comments);
                            const childNodes = [];
                            for (let k = 0; k < cache.length; k++) {
                                const _t = cache[k];
                                if (_t.$node) childNodes.unshift(_t.$node);
                                else if (_t.type === "</E>") childNodes.unshift(new TextNode(_t.data, converter));
                                else childNodes.unshift(new TextNode(_t.data, converter));
                                stack.pop();
                            }
                            t.$node = new ElementNode(t.tagName, t.attrs, converter, data.slice(t.index, token.index + token.length), option.attrCover);
                            t.$node.childNodes.init(childNodes);
                            continue $;
                        } else cache.push(t);
                    }
                    continue;
                case "<!---->":
                    token.$node = new CommentNode(token.content);
                    continue;
                case "<![CDATA[]]>":
                    token.$node = new CDataSectionNode(token.content);
                    continue;
                case "<?T?>":
                    token.$node = new ProcessingInstructionNode(token.target, token.attrs, converter, option.attrCover);
                    stack.unshift(...token.$comments);
                    continue;
                case "<!DOCTYPE>":
                    token.$node = new DocumentTypeNode(token.name);
                    stack.unshift(...token.$comments);
                    continue;
                case "EOF": {
                    const rootChildNodes = root.childNodes;
                    for (let i = 0; i < stack.length - 1; i++) {
                        const t = stack[i];
                        if (t.$node) rootChildNodes.push(t.$node);
                        // 忽略未成对的结束标签
                        else if (t.type === "</E>") continue;
                        else rootChildNodes.push(new TextNode(t.data, converter));
                    }
                }
            }
        }
        if (option?.ignore) root.childNodes.query(node => option.ignore.includes(node.type)).forEach(node => node.remove());
        return root;
    };
    return { Attr: _Attr, parse, DocumentNode, ElementNode, TextNode, CommentNode, CDataSectionNode, ProcessingInstructionNode, DocumentNode };
})();
