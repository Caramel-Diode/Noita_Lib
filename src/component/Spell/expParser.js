/** @type {util.parse.Token} */
let currentToken;
/** @type {SpellGroup|undefined} 当前表达式 */
let currentExp;

const err = ([info]) => {
    console.error(currentToken.index, new SyntaxError(`${info} index:${currentToken.index}`), currentExp ?? "");
    return util.parse.errRestult;
};
const { Token, isBlank, isWordPart } = util.parse;

const tokenEnum = {
    /** 法术ID */
    SI: new Token.Enum("SPELL_ID", "#8080FF", "8080FF40", 700, "string", true),
    /** 法术标签 */
    ST: new Token.Enum("SPELL_TAG", "#FFFF80", "FFFF8040", 700, "string", true),
    BRACKET_SL: new Token.Enum("BRACKET_SMALL_LEFT", "#CE9178", void 0, 700, "string", true, "("),
    BRACKET_SR: new Token.Enum("BRACKET_SMALL_RIGHT", "#CE9178", void 0, 700, "string", true, ")"),
    /** 逻辑非 */
    NOT: new Token.Enum("NOT", "#CE9178", void 0, 700, "string", true, "!"),
    /** 逻辑与 */
    OR: new Token.Enum("OR", "#CE9178", void 0, 700, "string", true, "|"),
    /** 逻辑与 */
    AND: new Token.Enum("AND", "#CE9178", void 0, 700, "string", true, "&"),
    /** 未定义 */
    UND: new Token.Enum("UND")
};

class SpellGroup {
    static {
        this.prototype.type = "SPELL_GROUP";
    }
    /**
     * @type {0|1|2|-1}
     * ### 匹配状态
     * * 0:未开始
     * * 1:等待匹配逻辑运算符
     * * 2:等待匹配法术标签/ID/组
     * * -1:完成
     */
    dataState = 0;
    /**
     * @type {0|1|-1}
     * ### 匹配状态
     * * 0: 无需括号
     * * 1: 等待右括号
     * * -1: 括号已成对
     */
    bracketState = 0;
    #data1;
    #data2;
    #operator;
    set data1(value) {
        if (!this.#data1) this.dataState = 1;
        this.#data1 = value;
    }

    get data1() {
        return this.#data1;
    }

    set data2(value) {
        if (!this.#data2) this.dataState = -1;
        this.#data2 = value;
    }

    get data2() {
        return this.#data2;
    }

    /** @param {"OR"|"AND"|"NOT"} value */
    set operator(value) {
        if (!this.#operator) this.dataState = 2;
        this.#operator = value;
    }

    /** @returns {"OR"|"AND"|"NOT"} */
    get operator() {
        return this.#operator;
    }

    constructor(data1, data2, operator) {
        if (data1) this.data1 = data1;
        if (data2) this.data2 = data2;
        if (operator) this.operator = operator;
    }
}
/**
 * 根据AST获取法术数据数组
 * @param {{type: String, data: String, data1: String?, data2: String?}} exp
 * @returns {Set<SpellData>}
 */
const getSpellDatas = exp => {
    switch (exp.type) {
        case "SPELL_ID":
            return new Set([SpellData.query(exp.data)]);
        case "SPELL_TAG":
            const result = SpellData.tagSets[exp.data];
            if (result) return result;
            else {
                console.warn("暂不支持的法术法术标签", exp);
                return new Set();
            }

        case "SPELL_GROUP":
            switch (exp.operator) {
                case "AND":
                    return getSpellDatas(exp.data1).intersection(getSpellDatas(exp.data2)); //取交集 采用polyfill函数
                case "OR":
                    return getSpellDatas(exp.data1).union(getSpellDatas(exp.data2)); //取并集 采用polyfill函数
                case "NOT":
                    return SpellData.tagSets.all.difference(getSpellDatas(exp.data2)); //取补集 采用polyfill函数
            }
    }
};

/** @type {Map<String,Set<SpellData>>} */
const resultCache = new Map();

/**
 * 通过 `表达式` 获取法术数据
 * @param {String} exp 查询表达式
 * @returns {Array<SpellData>} 法术数据
 */
const parse = exp => {
    // 优先从缓存中获取
    let result = resultCache.get(exp);
    if (result) {
        console.groupCollapsed("法术查询表达式缓存命中: %c`%s`", "color:#44cf8e", exp);
        console.log(result);
        console.groupEnd();
        return Object.assign([...result], { exp });
    }

    console.groupCollapsed("法术查询表达式解析: %c`%s`", "color:#25AFF3", exp);
    exp += " "; //增加终结符
    currentToken = null;
    console.groupCollapsed("🏷️ Tokenization");
    //#region 令牌化 Tokenization
    const tokens = [];
    for (let i = 0, { length } = exp; i < length; i++) {
        const char = exp[i];
        if (isWordPart(char)) {
            //属于单词成分
            //作为token开头字符
            currentToken ??= new Token(tokenEnum.SI, i);
            currentToken.push(char);
        } /*遇到其他字符需要结束当前token*/ else {
            if (currentToken) {
                currentToken.finish();
                tokens.push(currentToken);
                currentToken = null;
            }
            // 跳过空白符
            if (isBlank(char)) continue;
            switch (char) {
                case "#":
                    currentToken = new Token(tokenEnum.ST, i);
                    currentToken.push(char);
                    continue;
                case "(":
                    tokens.push(new Token(tokenEnum.BRACKET_SL, i));
                    continue;
                case ")":
                    tokens.push(new Token(tokenEnum.BRACKET_SR, i));
                    continue;
                case "!":
                    tokens.push(new Token(tokenEnum.NOT, i));
                    continue;
                case "|":
                    tokens.push(new Token(tokenEnum.OR, i));
                    continue;
                case "&":
                    tokens.push(new Token(tokenEnum.AND, i));
                    continue;
                default:
                    currentToken = new Token(tokenEnum.UND, i);
                    currentToken.data = char;
                    return err([`不合法的字符: "${char}"`]);
            }
        }
    }
    //#endregion
    Token.log(tokens);
    console.groupEnd();

    console.groupCollapsed("🍁 AST");
    //#region 生成AST
    /** @type {Array<Object>} 表达式栈 */
    const exps = [];

    currentExp = null;
    /** @type {SpellGroup|null} 根表达式 */
    let rootExp = null;
    for (let j = 0, { length } = tokens; j < length; j++) {
        currentToken = tokens[j];
        currentExp = exps.at(-1);
        switch (currentToken.type) {
            case "SPELL_ID": {
                const id = { type: "SPELL_ID", data: currentToken.data };
                if (currentExp) {
                    if (currentExp.dataState === 0) currentExp.data1 = id;
                    else if (currentExp.dataState === 2) exps.push((currentExp.data2 = new SpellGroup(id)));
                    else return err`缺少运算符连接`;
                } else exps.push((rootExp = new SpellGroup(id)));
                break;
            }
            case "SPELL_TAG": {
                const tag = { type: "SPELL_TAG", data: currentToken.data.slice(1) };
                if (currentExp) {
                    if (currentExp.dataState === 0) currentExp.data1 = tag;
                    else if (currentExp.dataState === 2) exps.push((currentExp.data2 = new SpellGroup(tag)));
                    else return err`缺少运算符连接`;
                } else exps.push((rootExp = new SpellGroup(tag)));
                break;
            }
            case "BRACKET_SMALL_LEFT": {
                const subExp = new SpellGroup();
                subExp.bracketState = 1;
                if (currentExp) {
                    if (currentExp.dataState === 0) exps.push((currentExp.data1 = subExp));
                    else if (currentExp.dataState === 2) exps.push((currentExp.data2 = subExp));
                    else return err`缺少运算符连接`;
                }
                // 根表达式不存在时 左括号开头 这里应该默认多一层表达式 否则右括号完成该表达式匹配后仍然有后续逻辑运算符会导致匹配出错
                else exps.push((rootExp = new SpellGroup(subExp)), subExp);
                break;
            }
            case "BRACKET_SMALL_RIGHT":
                if (currentExp) {
                    if (currentExp.dataState === 2) return err([`${currentToken.data} 缺少法术标签或法术ID连接`]);
                    else {
                        let pairedBracket = false; //取消无意义法术组时可能会丢失需要匹配的左括号 这里需要记录是否在取消无意义法术组中已经完成了括号配对
                        if (currentExp.dataState === 1) {
                            pairedBracket = currentExp.bracketState === 1;
                            const parentExp = exps.at(-2);
                            if (parentExp.dataState === 1) parentExp.data1 = currentExp.data1;
                            else if (parentExp.dataState === -1) parentExp.data2 = currentExp.data1;
                            exps.pop();
                            currentExp = exps.at(-1);
                        }
                        if (!pairedBracket) {
                            while (currentExp.bracketState !== 1) {
                                if (exps.length > 1) {
                                    exps.pop();
                                    currentExp = exps.at(-1);
                                } else return err`不成对的括号`;
                            }
                            currentExp.bracketState = -1;
                        }
                        // 你永远也等不到运算符了 所以你应该是一个法术标签/ID 而不是法术标签组
                        if (currentExp.dataState === 1) {
                            const parentExp = exps.at(-2);
                            if (parentExp.dataState === 1) parentExp.data1 = currentExp.data1;
                            else if (parentExp.dataState === -1) parentExp.data2 = currentExp.data1;
                            exps.pop();
                            currentExp = exps.at(-1);
                        }
                        //防止根表达式弹出
                        if (exps.length > 1) exps.pop();
                    }
                } else return err`不成对的括号`;
                break;
            case "NOT": {
                const subExp = new SpellGroup(null, null, "NOT");
                if (currentExp) {
                    if (currentExp.dataState === 0) exps.push((currentExp.data1 = subExp));
                    else if (currentExp.dataState === 2) exps.push((currentExp.data2 = subExp));
                    else if (currentExp.dataState === 1) return err`不可以用于连接两个法术标签或法术ID !`;
                } else exps.push((rootExp = subExp));
                break;
            }
            case "OR":
                if (currentExp) {
                    if (currentExp.dataState === 1) currentExp.operator = "OR";
                    else if (currentExp.dataState === 2) return err`已存在逻辑运算符`;
                } else return err`缺少被连接的法术标签或ID`;
                break;
            case "AND":
                if (currentExp) {
                    if (currentExp.dataState === 1) currentExp.operator = "AND";
                    else if (currentExp.dataState === 2) return err`已存在逻辑运算符`;
                } else return err`缺少被连接的法术标签或ID`;
                break;
        }
    }
    currentExp = exps[exps.length - 1];
    // 你永远也等不到运算符了 所以你应该是一个法术标签/ID 而不是法术标签组
    if (currentExp.dataState === 1) {
        const parentExp = exps.at(-2);
        if (parentExp) {
            if (parentExp.dataState === 1) parentExp.data1 = currentExp.data1;
            else if (parentExp.dataState === -1) parentExp.data2 = currentExp.data1;
            exps.pop();
            currentExp = exps.at(-1);
        } else rootExp = currentExp.data1;
    }
    if (rootExp.data2 === null) return err`缺少连接的法术标签或ID`;

    //#endregion
    console.log(rootExp);
    //#region 解析AST
    result = getSpellDatas(rootExp);
    console.log(result);
    //#endregion
    console.groupEnd();
    console.groupEnd();
    // 缓存结果
    resultCache.set(exp.slice(0, -1), result);
    return Object.assign([...result], { exp });
};
