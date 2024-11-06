/** @typedef {ElementNode|TextNode|CommentNode|CDataSectionNode|ProcessingInstructionNode|DocumentTypeNode} AnyNode 任意类型节点 */

/**
 * @typedef {Object} Condition 查询选项对象
 * @prop {String} tagName 标签名
 * @prop {Object} attr 属性
 */

/**
 * @typedef {((type:"text"|"comment"|"document") => Array<String>|Array<XMLObject>) & { [key: String]: String|Array<XMLObject> }} XMLObject
 */

const XML = (() => {
    /**
     * @param {ElementNode|DocumentNode} node
     * @returns {XMLObject}
     */
    const toXMLObject = node => {
        /** @type {Array<String>} */
        const texts = [];
        /** @type {Array<String>} */
        const comments = [];
        /** @type {Array<XMLObject>} */
        const documents = [];
        const obj = (type = "text") => {
            if (type === "text") return texts;
            if (type === "comment") return comments;
            if (type === "document") return documents;
        };
        Reflect.setPrototypeOf(obj, null);

        const { childNodes, attr } = node;
        if (attr) {
            for (const [key, value] of attr) Reflect.defineProperty(obj, key, { value, enumerable: true });
        }

        for (let i = 0; i < childNodes.length; i++) {
            const child = childNodes[i];
            switch (child.type) {
                case "#document":
                    documents.push(toXMLObject(child));
                    break;
                case "#element":
                    const { tagName } = child;
                    if (!obj[tagName]) obj[tagName] = [];
                    obj[tagName].push(toXMLObject(child));
                    break;
                case "#text":
                    texts.push(child.content);
                    break;
                case "#comment":
                    comments.push(child.content);
                    break;
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
        constructor(data, converter) {
            super();
            if (converter) this.#converter = converter;
            if (_Attr.Cover) for (let i = 0; i < data.length; i++) this.set(data[i].key, data[i].value);
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
            return toXMLObject(this);
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
     * <element attr="">
     * </element>
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
                if (this.attr.size) attrString = ` ${this.attr}`;
                if (this.childNodes.length) return `<${this.tagName}${attrString}>${content}</${this.tagName}>`;
                else return `<${this.tagName}${attrString}/>`;
            } else if (format === "RAW") return this.#rawData.value;
            else return content;
        }
        #rawData = { value: null };

        get xmlObject() {
            return toXMLObject(this);
        }

        /** @param {T} tagName */
        constructor(tagName = "", attrData, converter, rawData) {
            super("#element");
            /** @type {_Attr} */ this.attr = new _Attr(attrData, converter);
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
            return this.#converter.toChars(this.#content);
        }
        set content(value) {
            this.#content = this.#converter.toEntitise(value);
        }
        /** @param {"XML"|"PlainText"} format */
        toString(format = "XML") {
            if (format === "XML") return this.#content; //不要转换实体字符
            else return this.content;
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
            else return this.content;
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
            else return this.content;
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
                else return `<?${this.target}?>`;
            } else return "";
        }
        constructor(target = "", attrData, converter) {
            super("#processingInstruction");
            /** @type {_Attr} */ this.attr = new _Attr(attrData, converter);
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

    /** 令牌位置数据 */
    class TokenPos {
        /** @param {String} char */
        update(char) {
            if (char === "\n") {
                this.line++;
                this.index = 0;
            } else this.index++;
            this.$i++;
        }
        toString() {
            return `at :${this.line}:${this.index}`;
        }
        constructor(line = 1, index = 0, $i = 0) {
            /** 第`?`行 */
            this.line = line;
            /** 第`?`个字符 */
            this.index = index;
            /** 总索引 */
            this.$i = $i;
        }
    }

    /** @typedef {"<"|">"|"?"|"!"|"/"|"="|"-"|`"`|`'`|"["|"]"|"WORD"|"BLANK"} Token$1 */
    /** @typedef {Token$1|"</E>"|"<!--"|"-->"|"<![CDATA["|"]]>"|"/>"|"<!"|"<?"|"?>"} Token$2 */
    /** @typedef {Token$2|"ATTR"|"<!---->"|"<![CDATA[]]>"} Token$3 */
    /** @typedef {Token$3|"<E>"|"<? ?>"|"<!DOCTYPE>"} Token$4 */

    /**
     * @template {Token$1|Token$2|Token$3} T
     * @template D
     */
    class Token {
        static _NULL = { type: "#null", data: "" };
        /** * `1` `WORD`/`BLANK` 匹配中 */
        state = 0;
        /** @type {Array<String>} */
        #cache = [];
        /**
         *  @param {T} type
         *  @param {TokenPos|[TokenPos,TokenPos]} [pos]
         *  @param {D} [data]
         */
        constructor(type, pos, data) {
            /** @type {T} */
            this.type = type;
            /** @type {D} */
            this.data = data ?? type; //数据默认使用类型作为填充
            if (pos) {
                if (Array.isArray(pos)) {
                    const [start, end] = pos;
                    /** @type {TokenPos?} pos  */
                    this.posStart = new TokenPos(start.line, start.index, start.$i);
                    this.posEnd = new TokenPos(end.line, end.index, end.$i);
                } else {
                    /** @type {TokenPos?} pos  */
                    this.pos = new TokenPos(pos.line, pos.index, pos.$i);
                }
            }
        }
        cache(char) {
            this.state = 1;
            this.#cache.push(char);
        }
        finish() {
            this.data = this.#cache.join("");
            this.#cache = null;
            this.state = 0;
        }
        get length() {
            return this.data.length;
        }
    }

    /**
     * 令牌化 第一阶段
     * @param {Array<String>} data
     * @returns {Array<Token<Token$1>>}
     */
    const tokenise1 = data => {
        /** @type {Array<Token<Token$1>>} 一级令牌 */
        const tokens = [];
        const pos = new TokenPos();
        for (let i = 0, char = data[i]; i < data.length; char = data[++i]) {
            pos.update(char);
            const lastToken = tokens.at(-1);
            if (/\s/.test(char)) {
                if (lastToken) {
                    if (lastToken.type === "BLANK") lastToken.cache(char);
                    else {
                        if (lastToken.type === "WORD") lastToken.finish();
                        tokens.push(new Token("BLANK", pos));
                        tokens.at(-1).cache(char);
                    }
                } else {
                    tokens.push(new Token("BLANK", pos));
                    tokens.at(-1).cache(char);
                }
            } else if (`<>?!/-=[]"'`.includes(char)) {
                if (lastToken) {
                    if (lastToken.type === "WORD") lastToken.finish();
                    else if (lastToken.type === "BLANK") lastToken.finish();
                }
                tokens.push(new Token(char, pos));
            }
            // 其它字符
            else if (lastToken) {
                if (lastToken.type !== "WORD") {
                    if (lastToken.type === "BLANK") lastToken.finish();
                    tokens.push(new Token("WORD", pos));
                }
                tokens.at(-1).cache(char);
            } else {
                tokens.push(new Token("WORD", pos));
                tokens.at(-1).cache(char);
            }
        }
        //处理最后一个token
        if (tokens.at(-1)?.state === 1) tokens.at(-1).finish();
        return tokens;
    };

    /**
     * 令牌化 第二阶段
     * @param {Array<String>} data
     * @param {Array<Token<Token$1>>} tokens1
     *  * @returns {Array<Token<Token$2>>}
     */
    const tokenise2 = (data, tokens1) => {
        /** @type {Array<Token<Token$2>>} 二级令牌 */
        const tokens = [];
        for (let i = 0; i < tokens1.length; i++) {
            const $1 = tokens1[i];
            const $2 = tokens1[i + 1] ?? Token._NULL;
            const $3 = tokens1[i + 2] ?? Token._NULL;
            const $4 = tokens1[i + 3] ?? Token._NULL;
            const $5 = tokens1[i + 4] ?? Token._NULL;
            if ($1.type === "<") {
                if ($2.type === "!") {
                    if ($3.type === "-" && $4.type === "-") {
                        tokens.push(new Token("<!--", [$1.pos, $4.pos]));
                        i += 3;
                        continue;
                    } else if ($3.type === "[" && $4.data.toLocaleUpperCase() === "CDATA" && $5.type === "[") {
                        tokens.push(new Token("<![CDATA[", [$1.pos, $5.pos]));
                        i += 4;
                        continue;
                    } else {
                        tokens.push(new Token("<!", [$1.pos, $2.pos]));
                        i += 1;
                        continue;
                    }
                } else if ($2.type === "?") {
                    tokens.push(new Token("<?", [$1.pos, $2.pos]));
                    i += 1;
                    continue;
                }
            } else if ($1.type === "-" && $2.type === "-" && $3.type === ">") {
                tokens.push(new Token("-->", [$1.pos, $3.pos]));
                i += 2;
                continue;
            } else if ($1.type === "]" && $2.type === "]" && $3.type === ">") {
                tokens.push(new Token("]]>", [$1.pos, $3.pos]));
                i += 2;
                continue;
            } else if ($1.type === "/" && $2.type === ">") {
                tokens.push(new Token("/>", [$1.pos, $2.pos]));
                i += 1;
                continue;
            } else if ($1.type === "?" && $2.type === ">") {
                tokens.push(new Token("?>", [$1.pos, $2.pos]));
                i += 1;
                continue;
            }
            if ($1.type === "-") $1.type = "WORD";
            if ($1.type === "WORD") {
                /** @type {Token<Token$2>} */
                const lastToken = tokens.at(-1);
                if (lastToken?.type === "WORD") lastToken.data += $1.data; //合并连续的文本节点
                else tokens.push($1);
            } else tokens.push($1);
        }
        const tokens_ = [];
        // 结束标签
        for (let i = 0; i < tokens.length; i++) {
            const $1 = tokens[i];
            const $2 = tokens[i + 1] ?? Token._NULL;
            const $3 = tokens[i + 2] ?? Token._NULL;
            const $4 = tokens[i + 3] ?? Token._NULL;
            const $5 = tokens[i + 4] ?? Token._NULL;
            if ($1.type === "<" && $2.type === "/" && $3.type === "WORD") {
                if ($4.type === ">") {
                    const endTagToken = new Token("</E>", [$1.pos, $4.pos]);
                    endTagToken.data = $3.data;
                    tokens_.push(endTagToken);
                    i += 3;
                    continue;
                }
                // > 闭合前允许出现空白
                else if ($4.type === "BLANK" && $5.type === ">") {
                    const endTagToken = new Token("</E>", [$1.pos, $5.pos]);
                    endTagToken.data = $3.data;
                    tokens_.push(endTagToken);
                    i += 4;
                    continue;
                }
            }
            tokens_.push($1);
        }
        return tokens_;
    };

    /**
     * 令牌化 第三阶段
     * @param {Array<String>} data
     * @param {Array<Token<Token$2>>} tokens2
     * @returns {Array<Token<Token$3>>}
     */
    const tokenise3 = (data, tokens2) => {
        /** @type {Array<Token<Token$3>>} 三级令牌 */
        const tokens = [];
        /**
         * ### 属性键值对状态机 @type {0|1|2|3|-3}
         * * `0` 未开始
         * * `1` 等待等号 `key`
         * * `2` 等待引号/属性值 `key=`
         * * `3` 等待属性值(双引号模式) `key="`
         * * `-3` 等待属性值(单引号模式) `key="`
         */
        let attrState = 0;
        let attrKey = "";
        /** @type {Array<Token>} */
        let tokenCache = [];
        out: for (let i = 0, token = tokens2[i]; i < tokens2.length; token = tokens2[++i]) {
            tokenCache.push(token);
            if (token.type === "<!--") {
                tokenCache.pop();
                tokens.push(...tokenCache);
                tokenCache = [];
                for (let j = i + 1, t = tokens2[j]; j < tokens2.length; t = tokens2[++j]) {
                    if (t.type === "-->") {
                        tokens.push(new Token("<!---->", [token.posStart, t.posEnd], data.slice(token.posEnd.$i, t.posStart.$i - 1).join("")));
                        i = j;
                        continue out;
                    }
                }
                token.type = "OTHER";
                tokens.push(token);
                tokenCache = [];
            } else if (token.type === "<![CDATA[") {
                tokenCache.pop();
                if (attrState !== 0) {
                    attrKey = "";
                    attrValueStart = -1;
                    attrState = 0; // 格式非法
                    tokens.push(...tokenCache);
                    tokenCache = [];
                }
                for (let j = i + 1, t = tokens2[j]; j < tokens2.length; t = tokens2[++j]) {
                    if (t.type === "]]>") {
                        tokens.push(new Token("<![CDATA[]]>", [token.posStart, t.posEnd], data.slice(token.posEnd.$i, t.posStart.$i - 1).join("")));
                        i = j;
                        continue out;
                    }
                }
                token.type = "OTHER";
                tokens.push(token);
                tokenCache = [];
            } else if (token.type === "=") {
                if (attrState === 1) attrState = 2;
                else {
                    attrState = 0; // 格式非法
                    tokens.push(...tokenCache);
                    tokenCache = [];
                }
            } else if (token.type === `"`) {
                if (attrState === 2) {
                    attrState = 0;
                    for (let j = i + 1, t = tokens2[j]; j < tokens2.length; t = tokens2[++j]) {
                        if (t.type === `"`) {
                            tokens.push(new Token("ATTR", token.pos, { key: attrKey, value: data.slice(token.pos.$i, t.pos.$i - 1).join("") }));
                            i = j;
                            tokenCache = [];
                            continue out;
                        }
                    }
                }
                attrState = 0;
                tokens.push(...tokenCache);
                tokenCache = [];
            } else if (token.type === `'`) {
                if (attrState === 2) {
                    attrState = 0;
                    for (let j = i + 1, t = tokens2[j]; j < tokens2.length; t = tokens2[++j]) {
                        if (t.type === `'`) {
                            tokens.push(new Token("ATTR", token.pos, { key: attrKey, value: data.slice(token.pos.$i, t.pos.$i - 1).join("") }));
                            i = j;
                            tokenCache = [];
                            continue out;
                        }
                    }
                }
                attrState = 0;
                tokens.push(...tokenCache);
                tokenCache = [];
            } else if (token.type === "WORD") {
                if (attrState === 0) {
                    attrState = 1;
                    attrKey = token.data;
                } else if (attrState === 2) {
                    tokens.push(new Token("ATTR", token.pos, { key: attrKey, value: token.data })); // 无引号属性值
                    attrKey = "";
                    attrState = 0;
                    tokenCache = [];
                } else {
                    attrState = 1; //此处应该更新为1 格式非法
                    attrKey = token.data;
                    tokens.push(tokenCache[0]);
                    tokenCache = [token]; //☆
                }
            } else if (token.type !== "BLANK") {
                attrKey = "";
                attrState = 0; // 格式非法
                tokens.push(...tokenCache);
                tokenCache = [];
            } else if (attrState === 0) {
                tokens.push(...tokenCache);
                tokenCache = [];
            }
        }
        tokens.push(...tokenCache);
        return tokens;
    };

    /**
     * 令牌化 第四阶段
     * @param {Array<String>} data
     * @param {Array<Token<Token$3>>} tokens3
     * @returns {Array<Token<Token$4>>}
     */
    const tokenise4 = (data, tokens3) => {
        /** @type {Array<Token<Token$4>>} */
        const tokens = [];
        let tokenCache = [];
        /** @type {Array<{key:String,value?:String}>} */
        let attrs = [];
        const elementStartTag = {
            /**
             * ### 元素起始标签/单标签状态机 @type {0|1|2}
             * * `0` 未开始
             * * `1` 等待标签名 `<`
             * * `2` 等待属性/结束 `<tagName`
             */
            state: 0,
            tagName: "",
            posStart: null,
            posEnd: null,
            finish(single = false) {
                tokens.push(new Token("<E>", [this.posStart, this.posEnd], { tagName: this.tagName, attrs }));
                if (single) tokens.push(new Token("</E>", [this.posEnd, this.posEnd], this.tagName));
                this.state = 0;
                this.tagName = "";
                attrs = [];
                tokenCache = [];
            },
            reset() {
                this.state = 0;
                this.tagName = "";
                this.posStart = null;
                this.posEnd = null;
                attrs = [];
                tokens.push(...tokenCache);
                tokenCache = [];
            }
        };

        const processingInstruction = {
            /**
             * ### 文档处理指令状态机 @type {0|1|2}
             * * `0` 未开始
             * * `1` 等待目标名 `<?`
             * * `2` 等待属性/结束 `<?target` (`?>`结束)
             */
            state: 0,
            target: "",
            posStart: null,
            posEnd: null,
            finish() {
                tokens.push(new Token("<? ?>", [this.posStart, this.posEnd], { target: this.target, attrs }));
                this.state = 0;
                this.target = "";
                attrs = [];
                tokenCache = [];
            },
            reset() {
                this.state = 0;
                this.target = "";
                this.posStart = null;
                this.posEnd = null;
                attrs = [];
                tokens.push(...tokenCache);
                tokenCache = [];
            }
        };

        const documentType = {
            /**
             * ### 文档类型状态机 @type {0|1|3|4|-4}
             * * `0` 未开始
             * * `1` 准备阶段 `<!`
             * * `2` 等待文档类型名 `<!DOCTYPE`
             * * `3` 等待结束/数据 `<!DOCTYPE name`
             * * `4` 等待数据 `<!DOCTYPE name "`
             * * `-4` 等待数据 `<!DOCTYPE name '`
             */
            state: 0,
            name: "",
            datas: [],
            start: -1,
            posStart: null,
            posEnd: null,
            finish() {
                tokens.push(new Token("<!DOCTYPE>", [this.posStart, this.posEnd], { name: this.name, datas: this.datas }));
                this.state = 0;
                this.name = "";
                this.datas = [];
                tokenCache = [];
            },
            reset() {
                this.state = 0;
                this.name = "";
                this.datas = [];
                this.posStart = null;
                this.posEnd = null;
                tokens.push(...tokenCache);
                tokenCache = [];
            }
        };

        out: for (let i = 0, token = tokens3[i]; i < tokens3.length; token = tokens3[++i]) {
            tokenCache.push(token);
            switch (token.type) {
                case "<":
                    if (elementStartTag.state !== 0) elementStartTag.reset();
                    else if (processingInstruction.state) processingInstruction.reset();
                    else if (documentType.state) documentType.reset();
                    elementStartTag.state = 1;
                    elementStartTag.posStart = token.pos;
                    break;
                case ">":
                    if (elementStartTag.state === 2) {
                        elementStartTag.posEnd = token.pos;
                        elementStartTag.finish();
                    } else if (documentType.state === 3) {
                        documentType.posEnd = token.pos;
                        documentType.finish();
                    } else if (processingInstruction.state) processingInstruction.reset();
                    else elementStartTag.reset();
                    break;
                case "<?":
                    if (processingInstruction.state !== 0) processingInstruction.reset();
                    else if (elementStartTag.state) elementStartTag.reset();
                    else if (documentType.state) documentType.reset();
                    processingInstruction.state = 1;
                    processingInstruction.posStart = token.posStart;
                    break;
                case "?>":
                    if (processingInstruction.state === 2) {
                        processingInstruction.posEnd = token.posEnd;
                        processingInstruction.finish();
                    } else if (elementStartTag.state) elementStartTag.reset();
                    else if (documentType.state) documentType.reset();
                    else processingInstruction.reset();
                    break;
                case "/>":
                    if (elementStartTag.state === 2) {
                        elementStartTag.posEnd = token.posEnd;
                        elementStartTag.finish(true);
                    } else if (documentType.state === 3) {
                        elementStartTag.posEnd = token.posEnd;
                        documentType.finish();
                    } else if (processingInstruction.state) processingInstruction.reset();
                    else elementStartTag.reset();
                    break;
                case "<!":
                    if (documentType.state !== 0) documentType.reset();
                    else if (elementStartTag.state) elementStartTag.reset();
                    else if (processingInstruction.state) processingInstruction.reset();
                    documentType.state = 1;
                    documentType.posStart = token.posStart;
                    break;
                case "ATTR":
                    if (elementStartTag.state === 2) attrs.push(token.data);
                    else if (processingInstruction.state === 2) attrs.push(token.data);
                    else if (documentType.state) documentType.reset();
                    else if (elementStartTag.state) elementStartTag.reset();
                    else if (processingInstruction.state) processingInstruction.reset();
                    break;
                case "WORD":
                    if (documentType.state === 1) {
                        if (token.data.toLocaleUpperCase() === "DOCTYPE") documentType.state = 2;
                        else documentType.reset();
                    } else if (documentType.state === 2) {
                        documentType.state = 3;
                        documentType.name = token.data;
                    } else if (elementStartTag.state === 1) {
                        elementStartTag.state = 2;
                        elementStartTag.tagName = token.data;
                    } else if (elementStartTag.state === 2) attrs.push({ key: token.data });
                    else if (processingInstruction.state === 1) {
                        processingInstruction.state = 2;
                        processingInstruction.target = token.data;
                    } else if (processingInstruction.state === 2) attrs.push({ key: token.data });
                    else tokens.push(tokenCache.pop());
                    break;
                case "BLANK":
                    if (elementStartTag.state + processingInstruction.state + documentType.state === 0) tokens.push(tokenCache.pop());
                    break;
                case "<!---->":
                    tokens.push(tokenCache.pop());
                    break;
                case `"`:
                    if (documentType.state === 3) {
                        for (let j = i + 1, t = tokens3[j]; j < tokens3.length; t = tokens3[++j]) {
                            tokenCache.push(t);
                            if (t.type === `"`) {
                                documentType.datas.push(data.slice(token.pos.$i, t.pos.$i - 1).join(""));
                                i = j;
                                continue out;
                            }
                        }
                        documentType.reset();
                    } else if (elementStartTag.state) elementStartTag.reset();
                    else if (processingInstruction.state) processingInstruction.reset();
                    else documentType.reset();
                    break;
                case `'`:
                    if (documentType.state === 3) {
                        for (let j = i + 1, t = tokens3[j]; j < tokens3.length; t = tokens3[++j]) {
                            tokenCache.push(t);
                            if (t.type === `'`) {
                                documentType.datas.push(data.slice(token.pos.$i, t.pos.$i - 1).join(""));
                                i = j;
                                continue out;
                            }
                        }
                        documentType.reset();
                    } else if (elementStartTag.state) elementStartTag.reset();
                    else if (processingInstruction.state) processingInstruction.reset();
                    else documentType.reset();
                    break;
                default:
                    if (elementStartTag.state !== 0) elementStartTag.reset();
                    else if (processingInstruction.state !== 0) processingInstruction.reset();
                    else if (documentType.state !== 0) documentType.reset();
                    else tokens.push(tokenCache.pop());
            }
        }
        //#region 自动修正
        if (documentType.state) documentType.reset();
        if (processingInstruction.state) processingInstruction.reset();
        if (elementStartTag.state) elementStartTag.reset();
        //#endregion
        return tokens;
    };

    /**
     * ```js
     *  //实体映射格式
     *  const default = { [`'`]: "&apos;", [`"`]: "&quot;", [`&`]: "&amp;", [`<`]: "&lt;", [`>`]: "&gt;" }
     * ```
     * @typedef {Object} EntityMap 实体映射表
     * @prop {[`&_;`]} `char`
     */

    /**
     * 解析XML字符串
     * @param {String} data XML字符串
     * @param {Object} [option] 解析配置
     * @param {Boolean} [option.attrCover] 重复声明的属性是否覆盖之前的声明
     * @param {EntityMap} [option.entityMap] 实体映射表
     * @param {Array<"#element"|"#text"|"#comment"|"#cDataSection"|"#processingInstruction"|"#documentType">} [option.ignore] 忽略的节点类型
     * @returns {DocumentNode} 根节点
     */
    const parseXML = (data, option) => {
        let converter = Converter.default_;
        if (option) {
            if (option.attrCover) Attr.Cover = option.attrCover;
            if (option.entityMap) converter = new Converter(option.entityMap);
        }
        const root = new DocumentNode();
        const chars = [...data]; // 兼容unicode字符, 用码点拆分为合法字符
        const tokens = tokenise4(chars, tokenise3(chars, tokenise2(chars, tokenise1(chars))));
        const stack = [];

        for (let i = 0, token = tokens[i]; i < tokens.length; token = tokens[++i]) {
            stack.push(token);
            switch (token.type) {
                case "<E>":
                    token.rawData = { value: "" };
                    token.$node = new ElementNode(token.data.tagName, token.data.attrs, converter, token.rawData);
                    continue;
                case "</E>":
                    const cache = [];
                    //向前查找起始标签
                    for (let j = stack.length - 2, e = stack[j]; j >= 0; e = stack[--j]) {
                        // 成功找到起始标签
                        if (e.data.tagName === token.data && e.hasEnd !== true) {
                            e.rawData.value = chars.slice(e.posEnd.$i, token.posStart.$i - 1).join("");
                            stack.pop();
                            e.hasEnd = true;
                            const cacheChildNodes = [];
                            for (let k = 0, t_ = cache[k]; k < cache.length; t_ = cache[++k]) {
                                if (t_.$node) cacheChildNodes.unshift(t_.$node);
                                else if (t_.type === "</E>") cacheChildNodes.unshift(new TextNode(`</${t_.data}>`, converter));
                                else cacheChildNodes.unshift(new TextNode(t_.data, converter));
                                stack.pop();
                            }
                            e.$node.childNodes.init(cacheChildNodes);
                            break;
                        } else cache.push(e);
                    }
                    continue;
                case "<!---->":
                    token.$node = new CommentNode(token.data);
                    continue;
                case "<![CDATA[]]>":
                    token.$node = new CDataSectionNode(token.data);
                    continue;
                case "<? ?>":
                    token.$node = new ProcessingInstructionNode(token.data.target, token.data.attrs, converter);
                    continue;
                case "<!DOCTYPE>":
                    token.$node = new DocumentTypeNode(token.data.name, token.data.datas);
            }
        }
        const rootChildNodes = root.childNodes;
        for (let i = 0, t = stack[i]; i < stack.length; t = stack[++i]) {
            const tData = t.data;
            if (t.$node) rootChildNodes.push(t.$node);
            else if (t.type === "</E>") rootChildNodes.push(new TextNode(`</${tData}>`, converter));
            else if (t.type === "ATTR") rootChildNodes.push(new TextNode(`${tData.key}=${tData.value}`));
            else rootChildNodes.push(new TextNode(tData, converter));
        }
        if (option?.ignore) root.childNodes.query(node => option.ignore.includes(node.type)).forEach(node => node.remove());
        //恢复默认值
        _Attr.Cover = false;
        return root;
    };
    return {
        parse: parseXML,
        Attr: _Attr,
        DocumentNode,
        ElementNode,
        TextNode,
        CommentNode,
        CDataSectionNode,
        ProcessingInstructionNode,
        DocumentNode
    };
})();
