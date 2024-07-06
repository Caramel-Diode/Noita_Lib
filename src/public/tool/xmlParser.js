/** @typedef {ElementNode|TextNode|CommentNode|CDataSectionNode|ProcessingInstructionNode|DocumentTypeNode} AnyNode 任意类型节点 */
/** @typedef {"elementNode"|"textNode"|"commentNode"|"cDataSectionNode"|"processingInstructionNode"|"documentTypeNode"|"node"} NodeType 节点类型 */

/**
 * @typedef {Object} Condition 查询选项对象
 * @prop {String} tagName 标签名
 * @prop {Object} attr 属性
 */

class Node {
    /** @type {Map<Symbol,Symbol>} */
    static #commonEntityMap = new Map([
        [Symbol("&apos;"), Symbol(`'`)],
        [Symbol("&quot;"), Symbol(`"`)],
        [Symbol("&amp;"), Symbol("&")],
        [Symbol("&lt;"), Symbol("<")],
        [Symbol("&gt;"), Symbol(">")]
    ]);
    /** @type {Map<Symbol,Symbol>} */
    static #entityMap = new Map([...this.#commonEntityMap]);
    /**
     * 注册实体
     * @param {String} char 实体字符
     * @param {String} entity 实体表示名 (&与;之间的内容)
     */
    static registerEntity(char, entity) {
        this.#entityMap.set(Symbol(`&${entity};`), Symbol(char));
    }
    /** 清空非标准实体 */
    static clearEntity() {
        this.#entityMap = new Map([...this.#commonEntityMap]);
    }
    /** @param {String} data */
    static charsToEntities(data) {
        /** @type {Array<String|Symbol>} */
        let parts = [data];
        for (const [entity, char] of this.#entityMap) {
            /** @type {Array<String|Symbol>} */
            const newParts = [];
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (typeof part === "string") {
                    const parts_ = part.split(char.description);
                    for (let i = 0; i < parts_.length; i++) newParts.push(parts_[i], entity);
                    newParts.pop();
                } else newParts.push(part);
            }
            parts = newParts;
        }
        for (let i = 0; i < parts.length; i++) {
            if (typeof parts[i] === "symbol") parts[i] = parts[i].description;
        }
        return parts.join("");
    }
    /** @param {String} data */
    static entitiesToChars(data) {
        /** @type {Array<String|Symbol>} */
        let parts = [data];
        for (const [entity, char] of this.#entityMap) {
            /** @type {Array<String|Symbol>} */
            const newParts = [];
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (typeof part === "string") {
                    const parts_ = part.split(entity.description);
                    for (let i = 0; i < parts_.length; i++) newParts.push(parts_[i], char);
                    newParts.pop();
                } else newParts.push(part);
            }
            parts = newParts;
        }
        for (let i = 0; i < parts.length; i++) {
            if (typeof parts[i] === "symbol") parts[i] = parts[i].description;
        }
        return parts.join("");
    }
    parentElement = null;
    constructor(type = "node") {
        /** @type {NodeType} 节点类型 */
        this.type = type;
    }
    remove() {
        if (this.parentElement) {
            const childNodes = this.parentElement.childNodes;
            for (let i = 0; i < childNodes.length; i++) {
                if (childNodes[i] === this) {
                    childNodes.splice(i, 1);
                    break;
                }
            }
        }
    }
}

/** 节点属性 */
class Attr extends Map {
    static Cover = false;
    /** @param {Array<{key:String,value:String}>} data */
    constructor(data) {
        super();
        for (let i = 0; i < data.length; i++) this.set(data[i].key, data[i].value);
    }
    /**
     * 获取属性
     * @param {String} key 属性名
     */
    get(key) {
        return Node.entitiesToChars(super.get(key));
    }
    /**
     * 设置属性
     * @param {String} key 属性名
     * @param {String} [value] 属性值
     */
    set(key, value = "") {
        value = Node.charsToEntities(value);
        if (Attr.Cover) {
            super.set(key, value);
            return true;
        } else if (super.get(key) === undefined) {
            super.set(key, value);
            return true;
        } else return false;
    }
    toString() {
        const cache = [];
        for (const [key, value] of this) cache.push(`${key}="${value}"`);
        return cache.join(" ");
    }
}

/** 带有属性的节点 */
class NodeWithAttr extends Node {
    constructor(type, attrData = []) {
        super(type);
        /** @type {Attr} 属性 */
        this.attr = new Attr(attrData);
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
class ElementNode extends NodeWithAttr {
    /** @type {Array<Node>} */
    childNodes = [];
    /**
     * 查询子节点
     * @param {Condition|String|(node:AnyNode)=>Boolean} condition 查询条件
     * @param {Boolean} [recursive] 递归查询(默认为true)
     */
    query(condition, recursive = true) {
        let result = [];
        const type = typeof condition;
        if (type === "function") {
            for (let i = 0; i < this.childNodes.length; i++) {
                const node = this.childNodes[i];
                if (condition(node)) result.push(node);
                if (recursive && node instanceof ElementNode) result.push(...node.query(condition, recursive));
            }
        } else if (type === "string") return this.query({ tagName: condition }, recursive);
        else if (type === "object") {
            for (let i = 0; i < this.childNodes.length; i++) {
                const node = this.childNodes[i];
                if (node instanceof ElementNode) {
                    if (node.tagName === condition.tagName) {
                        const _attr = condition.attr ?? {};
                        const nodeAttr = node.attr;
                        let flag = true;
                        for (const key in _attr)
                            if (nodeAttr.get(key) !== _attr[key]) {
                                flag = false;
                                break;
                            }
                        if (flag) result.push(node);
                    }
                    if (recursive) result.push(...node.query(condition, recursive));
                }
            }
        } else throw new TypeError("查询条件参数类型不符");
        return result;
    }
    /**
     * 向末尾添加子节点
     * @param  {...Node} nodes
     */
    append(...nodes) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            node.parentElement = this;
        }
        this.childNodes.unshift(...nodes);
    }
    /**
     * 向开头添加子节点
     * @param  {...Node} nodes
     */
    prepend(...nodes) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            node.parentElement = this;
        }
        this.childNodes.push(...nodes);
    }

    /**
     * @param {"XML"|"PlainText"} format
     */
    toString(format) {
        const contentCache = [];
        for (let i = 0; i < this.childNodes.length; i++) {
            const node = this.childNodes[i];
            contentCache.push(node.toString(format));
        }
        if (format === "XML") {
            let attrString = "";
            if (this.attr.size) attrString = ` ${this.attr}`;
            if (this.childNodes.length) return `<${this.tagName}${attrString}>${contentCache.join("")}</${this.tagName}>`;
            else return `<${this.tagName}${attrString}/>`;
        } else return contentCache.join("");
    }
    /** @param {T} tagName */
    constructor(tagName = "", attrData) {
        super("elementNode", attrData);
        /** @type {T} 标签名 */ this.tagName = tagName;
    }
}

/**
 * 文本节点
 * ```xml
 * 文本
 * ```
 */
class TextNode extends Node {
    #content = "";
    get content() {
        return Node.entitiesToChars(this.#content);
    }
    set content(value) {
        this.#content = Node.charsToEntities(value);
    }
    /**
     * @param {"XML"|"PlainText"} format
     */
    toString(format) {
        if (format === "XML") return this.#content; //不要转换实体字符
        else return this.content;
    }
    constructor(content = "") {
        super("textNode");
        /** @type {String} 内容 */
        this.content = content;
    }
}

/**
 * 注释节点
 *  ```xml
 *  <!-- 注释 -->
 *  ```
 */
class CommentNode extends Node {
    content = "";
    /**
     * @param {"XML"|"PlainText"} format
     */
    toString(format) {
        if (format === "XML") return `<!--${this.content}-->`;
        else return this.content;
    }
    constructor(content = "") {
        super("commentNode");
        /** @type {String} 内容 */ this.content = content;
    }
}

/**
 * CDATA数据块节点
 * ```xml
 * <![CDATA[ … ]]>
 * ```
 */
class CDataSectionNode extends Node {
    /** @param {"XML"|"PlainText"} format */
    toString(format) {
        if (format === "XML") return `<![CDATA[${this.content}]]>`;
        else return this.content;
    }
    constructor(content = "") {
        super("cDataSectionNode");
        /** @type {String} 内容 */ this.content = content;
    }
}

/**
 * 文档处理指令节点
 * ```xml
 * <?xml version="1.0"?>
 * ```
 */
class ProcessingInstructionNode extends NodeWithAttr {
    /** @param {"XML"|"PlainText"} format */
    toString(format) {
        if (format === "XML") {
            if (this.attr.size) return `<?${this.target} ${this.attr}?>`;
            else return `<?${this.target}?>`;
        } else return "";
    }
    constructor(target = "", attrData) {
        super("processingInstructionNode", attrData);
        /** @type {String} 目标名 */ this.target = target;
    }
}

/**
 * 文档类型节点
 * ```xml
 * <!DOCTYPE html>
 * ```
 */
class DocumentTypeNode extends Node {
    /** @param {"XML"|"PlainText"} format */
    toString(format) {
        if (format === "XML") {
            if (this.data.length) return `<!DOCTYPE ${this.name} "${this.data.join(`" "`)}">`;
            else return `<!DOCTYPE ${this.name}>`;
        } else return "";
    }
    constructor(name = "", data) {
        super("documentTypeNode");
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
    /** * `1` `WORD`/`BLANK` 匹配中 */
    state = 0;
    /** @type {Array<String>} */
    #cache = [];
    /**
     *  @param {T} type
     *  @param {TokenPos} [pos]
     *  @param {D} [data]
     */
    constructor(type, pos, data) {
        /** @type {T} */
        this.type = type;
        /** @type {D} */
        this.data = data ?? type; //数据默认使用类型作为填充
        /** @type {TokenPos?} pos  */
        if (pos) this.pos = new TokenPos(pos.line, pos.index, pos.$i);
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
 * @param {String} data
 * @returns {Array<Token<Token$1>>}
 */
const tokenise1 = data => {
    /** @type {Array<Token<Token$1>>} 一级令牌 */
    const tokens = [];
    const pos = new TokenPos();
    for (let i = 0; i < data.length; i++) {
        /** @type {$Sign} */
        const char = data[i];
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
 * @param {String} data
 * @param {Array<Token<Token$1>>} tokens1
 *  * @returns {Array<Token<Token$2>>}
 */
const tokenise2 = (data, tokens1) => {
    /** @type {Array<Token<Token$2>>} 二级令牌 */
    const tokens = [];
    const nullToken = { type: "#null", data: "" };
    const c = tokens1.length;
    tokens1.push(nullToken, nullToken, nullToken, nullToken); //向后填充4个空白token 避免undefined
    for (let i = 0; i < c; i++) {
        const $1 = tokens1[i];
        const $2 = tokens1[i + 1];
        const $3 = tokens1[i + 2];
        const $4 = tokens1[i + 3];
        const $5 = tokens1[i + 4];
        if ($1.type === "<") {
            if ($2.type === "!") {
                if ($3.type === "-" && $4.type === "-") {
                    tokens.push(new Token("<!--", $4.pos));
                    i += 3;
                    continue;
                } else if ($3.type === "[" && $4.data === "CDATA" && $5.type === "[") {
                    tokens.push(new Token("<![CDATA[", $5.pos));
                    i += 4;
                    continue;
                } else {
                    tokens.push(new Token("<!", $2.pos));
                    i += 1;
                    continue;
                }
            } else if ($2.type === "?") {
                tokens.push(new Token("<?", $2.pos));
                i += 1;
                continue;
            } else if ($2.type === `/` && $3.type === "WORD" && $4.type === ">") {
                const endTagToken = new Token("</E>", $1.pos);
                endTagToken.data = $3.data;
                tokens.push(endTagToken);
                i += 3;
                continue;
            }
        } else if ($1.type === "-" && $2.type === "-" && $3.type === ">") {
            tokens.push(new Token("-->", $1.pos));
            i += 2;
            continue;
        } else if ($1.type === "]" && $2.type === "]" && $3.type === ">") {
            tokens.push(new Token("]]>", $1.pos));
            i += 2;
            continue;
        } else if ($1.type === "/" && $2.type === ">") {
            tokens.push(new Token("/>", $1.pos));
            i += 1;
            continue;
        } else if ($1.type === "?" && $2.type === ">") {
            tokens.push(new Token("?>", $1.pos));
            i += 1;
            continue;
        }
        tokens.push($1);
    }
    return tokens;
};

/**
 * 令牌化 第三阶段
 * @param {String} data
 * @param {Array<Token<Token$2>>} tokens2
 * @returns {Array<Token<Token$3>>}
 */
const tokenise3 = (data, tokens2) => {
    /** @type {Array<Token<Token$3>>} 三级令牌 */
    const tokens = [];
    /**
     * ### 注释状态机 @type {0|1}
     * `0` 未开始
     * `1` 开始 `<!--` (`-->` 结束)
     */
    let commentState = 0;
    let commentStart = -1;
    /**
     * ### 数据块状态机 @type {0|1}
     * `0` 未开始
     * `1` 开始 `<![CDATA[` (`]]>` 结束)
     */
    let cDataSectionState = 0;
    let cDataSectionStart = -1;
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
    let attrValue = "";
    let attrValueStart = -1;

    let tokenCache = [];
    for (let i = 0; i < tokens2.length; i++) {
        const token = tokens2[i];
        tokenCache.push(token);

        if (commentState === 1) {
            if (token.type === "-->") {
                tokens.push(new Token("<!---->", null, data.slice(commentStart, token.pos.$i - 1)));
                commentState = 0;
                commentStart = -1;
                while (tokenCache.pop().type !== "<!--");
            }
        } else if (cDataSectionState === 1) {
            if (token.type === "]]>") {
                tokens.push(new Token("<![CDATA[]]>", null, data.slice(cDataSectionStart, token.pos.$i - 1)));
                cDataSectionState = 0;
                cDataSectionStart = -1;
                tokenCache = [];
            }
        } else if (attrState === 3) {
            if (token.type === `"`) {
                if (attrValue === "") attrValue = data.slice(attrValueStart, token.pos.$i - 1);
                tokens.push(new Token("ATTR", token.pos, { key: attrKey, value: attrValue }));
                attrKey = "";
                attrValue = "";
                attrValueStart = -1;
                attrState = 0;
                tokenCache = [];
            }
        } else if (attrState === -3) {
            if (token.type === `'`) {
                if (attrValue === "") attrValue = data.slice(attrValueStart, token.pos.$i - 1);
                tokens.push(new Token("ATTR", token.pos, { key: attrKey, value: attrValue }));
                attrKey = "";
                attrValue = "";
                attrValueStart = -1;
                attrState = 0;
                tokenCache = [];
            }
        } else {
            if (token.type === "<!--") {
                commentState = 1;
                commentStart = token.pos.$i;
            } else if (token.type === "<![CDATA[") {
                if (attrState !== 0) {
                    attrKey = "";
                    attrValue = "";
                    attrValueStart = -1;
                    attrState = 0; // 格式非法
                    tokens.push(...tokenCache);
                    tokenCache = [];
                }
                cDataSectionState = 1;
                cDataSectionStart = token.pos.$i;
            } else if (token.type === "=") {
                if (attrState === 1) attrState = 2;
                else {
                    attrState = 0; // 格式非法
                    tokens.push(...tokenCache);
                    tokenCache = [];
                }
            } else if (token.type === `"`) {
                if (attrState === 2) {
                    attrState = 3;
                    attrValueStart = token.pos.$i;
                } else {
                    attrState = 0; // 格式非法
                    tokens.push(...tokenCache);
                    tokenCache = [];
                }
            } else if (token.type === `'`) {
                if (attrState === 2) attrState = -3;
                else {
                    attrState = 0; // 格式非法
                    tokens.push(...tokenCache);
                    tokenCache = [];
                }
            } else if (token.type === "WORD") {
                if (attrState === 0) {
                    attrState = 1;
                    attrKey = token.data;
                } else if (attrState === 2) {
                    tokens.push(new Token("ATTR", token.pos, { key: attrKey, value: token.data })); // 无引号属性值
                    attrKey = "";
                    attrValue = "";
                    attrValueStart = -1;
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
                attrValue = "";
                attrValueStart = -1;
                attrState = 0; // 格式非法
                tokens.push(...tokenCache);
                tokenCache = [];
            } else if (attrState === 0) {
                tokens.push(...tokenCache);
                tokenCache = [];
            }
        }
    }
    //#region 自动修正
    if (attrState !== 0) {
        if (attrState === 1) {
            tokens.push(...tokenCache);
        } else if (attrState === 2) {
            tokenCache.at(-1).type = "OTHER";
            tokens.push(...tokenCache);
        } else if (attrState === 3) {
            while (true) {
                const token = tokenCache.pop();
                if (token.type === `"`) {
                    token.type = "OTHER";
                    return tokenise3(data, tokens2); //重试!
                }
            }
        } else if (attrState === -3) {
            while (true) {
                const token = tokenCache.pop();
                if (token.type === `'`) {
                    token.type = "OTHER";
                    return tokenise3(data, tokens2); //重试!
                }
            }
        }
    }
    if (commentState) {
        while (true) {
            const token = tokenCache.pop();
            if (token.type === "<!--") {
                token.type = "WORD";
                return tokenise3(data, tokens2); //重试!
            }
        }
    }
    if (cDataSectionState) {
        while (true) {
            const token = tokenCache.pop();
            if (token.type === "<![CDATA[") {
                token.type = "OTHER";
                return tokenise3(data, tokens2); //重试!
            }
        }
    }
    //#endregion
    return tokens;
};

/**
 * 令牌化 第四阶段
 * @param {String} data
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
        finish(single = false) {
            tokens.push(new Token("<E>", null, { tagName: this.tagName, attrs }));
            if (single) tokens.push(new Token("</E>", null, this.tagName));
            this.state = 0;
            this.tagName = "";
            attrs = [];
            tokenCache = [];
        },
        reset() {
            this.state = 0;
            this.tagName = "";
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
        finish() {
            tokens.push(new Token("<? ?>", null, { target: this.target, attrs }));
            this.state = 0;
            this.target = "";
            attrs = [];
            tokenCache = [];
        },
        reset() {
            this.state = 0;
            this.target = "";
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
        finish() {
            tokens.push(new Token("<!DOCTYPE>", null, { name: this.name, datas: this.datas }));
            this.state = 0;
            this.name = "";
            this.datas = [];
            this.start = -1;
            tokenCache = [];
        },
        reset() {
            this.state = 0;
            this.name = "";
            this.datas = [];
            this.start = -1;
            tokens.push(...tokenCache);
            tokenCache = [];
        }
    };

    for (let i = 0; i < tokens3.length; i++) {
        const token = tokens3[i];
        tokenCache.push(token);
        if (documentType.state === 4) {
            if (token.type === `"`) documentType.datas.push(documentType.start, token.pos.$i - 1);
        } else if (documentType.state === -4) {
            if (token.type === `'`) documentType.datas.push(documentType.start, token.pos.$i - 1);
        } else
            switch (token.type) {
                case "<":
                    if (elementStartTag.state !== 0) elementStartTag.reset();
                    else if (processingInstruction.state) processingInstruction.reset();
                    else if (documentType.state) documentType.reset();
                    elementStartTag.state = 1;
                    break;
                case ">":
                    if (elementStartTag.state === 2) elementStartTag.finish();
                    else if (documentType.state === 3) documentType.finish();
                    else if (processingInstruction.state) processingInstruction.reset();
                    else elementStartTag.reset();
                    break;
                case "<?":
                    if (processingInstruction.state !== 0) processingInstruction.reset();
                    else if (elementStartTag.state) elementStartTag.reset();
                    else if (documentType.state) documentType.reset();
                    processingInstruction.state = 1;
                    break;
                case "?>":
                    if (processingInstruction.state === 2) processingInstruction.finish();
                    else if (elementStartTag.state) elementStartTag.reset();
                    else if (documentType.state) documentType.reset();
                    else processingInstruction.reset();
                    break;
                case "/>":
                    if (elementStartTag.state === 2) elementStartTag.finish(true);
                    else if (documentType.state === 3) documentType.finish();
                    else if (processingInstruction.state) processingInstruction.reset();
                    else elementStartTag.reset();
                    break;
                case "<!":
                    if (documentType.state !== 0) documentType.reset();
                    else if (elementStartTag.state) elementStartTag.reset();
                    else if (processingInstruction.state) processingInstruction.reset();
                    documentType.state = 1;
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
                        if (token.data === "DOCTYPE") documentType.state = 2;
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
                    if (documentType.state === 3) documentType.state === 4;
                    else if (elementStartTag.state) elementStartTag.reset();
                    else if (processingInstruction.state) processingInstruction.reset();
                    else documentType.reset();
                    break;
                case `'`:
                    if (documentType.state === 3) documentType.state === -4;
                    else if (elementStartTag.state) elementStartTag.reset();
                    else if (processingInstruction.state) processingInstruction.reset();
                    else documentType.reset();
                    break;
                default:
                    if (elementStartTag.state !== 0) elementStartTag.reset();
                    else if (processingInstruction.state !== 0) processingInstruction.reset();
                    else if (documentType.state !== 0) documentType.reset();
            }
    }
    //#region 自动修正
    if (documentType.state) {
        tokenCache[0].type = "OTHER";
        return tokenise4(data, tokens3);
    }
    if (processingInstruction.state) processingInstruction.reset();
    if (elementStartTag.state) elementStartTag.reset();
    //#endregion
    return tokens;
};

/**
 * ```js
 *  //实体映射格式
 *  const default = {
 *     `'`: "&apos;",
 *     `"`: "&quot;",
 *     `&`: "&amp;",
 *     `<`: "&lt;",
 *     `>`: "&gt;"
 * }
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
 * @returns {ElementNode} 根节点
 */
const parserXML = (data, option) => {
    if (option) {
        if (option.attrCover) Attr.Cover = option.attrCover;
        if (option.entityMap) {
            for (const char in option.entityMap) Node.registerEntity(char, option.entityMap[char]);
        }
    }
    const root = new ElementNode("#root");
    const tokens = tokenise4(data, tokenise3(data, tokenise2(data, tokenise1(data))));
    const stack = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        stack.push(token);
        switch (token.type) {
            case "<E>":
                token.$node = new ElementNode(token.data.tagName, token.data.attrs);
                break;
            case "</E>":
                const cache = [];
                //向前查找起始标签
                // console.time("5");
                for (let j = stack.length - 2; j >= 0; j--) {
                    const e = stack[j];
                    // 成功找到起始标签
                    if (e.data.tagName === token.data && e.hasEnd !== true) {
                        stack.pop();
                        e.hasEnd = true;
                        for (let k = 0; k < cache.length; k++) {
                            const t_ = cache[k];
                            if (t_.$node) e.$node.append(t_.$node);
                            else if (t_.type === "</E>") e.$node.append(new TextNode(`</${t_.data}>`));
                            else e.$node.append(new TextNode(t_.data));
                            stack.pop();
                        }
                        break;
                    } else cache.push(e);
                }
                // console.timeEnd("5");
                break;
            case "<!---->":
                token.$node = new CommentNode(token.data);
                break;
            case "<![CDATA[]]>":
                token.$node = new CDataSectionNode(token.data);
                break;
            case "<? ?>":
                token.$node = new ProcessingInstructionNode(token.data.target, token.data.attrs);
                break;
            case "<!DOCTYPE>":
                token.$node = new DocumentTypeNode(token.data.name, token.data.datas);
        }
    }
    for (let i = 0; i < stack.length; i++) {
        const t = stack[i];
        if (t.$node) root.prepend(t.$node);
        else root.prepend(new TextNode(t.data));
    }
    //恢复默认值
    Attr.Cover = false;
    Node.clearEntity();
    return root;
};
