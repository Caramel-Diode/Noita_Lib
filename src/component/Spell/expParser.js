/** @type {util.parse.Token} */
let currentToken = undefined;
/** @type {SpellGroup|undefined} 当前表达式 */
let currentExp = undefined;

const err = ([info]) => {
    console.error(currentToken.index, new SyntaxError(`${info} index:${currentToken.index}`), currentExp ?? "");
    return util.parse.errRestult;
};

const tokenEnum = {
    /** 法术ID */
    SI: {
        id: "SPELL_ID",
        color: "#8080FF",
        bgColor: "#8080FF40",
        fontWeight: "700",
        needBlank: true
    },
    /** 法术标签 */
    ST: {
        id: "SPELL_TAG",
        color: "#FFFF80",
        bgColor: "#FFFF8040",
        fontWeight: "700",
        needBlank: true
    },
    BRACKET_SL: {
        id: "BRACKET_SMALL_LEFT",
        data: "(",
        color: "#CE9178",
        bgColor: "#00000000",
        fontWeight: "700",
        needBlank: true
    },
    BRACKET_SR: {
        id: "BRACKET_SMALL_RIGHT",
        data: ")",
        color: "#CE9178",
        bgColor: "#00000000",
        fontWeight: "700",
        needBlank: true
    },
    /** 逻辑非 */
    NOT: {
        id: "NOT",
        data: "!",
        color: "#CE9178",
        bgColor: "#00000000",
        fontWeight: "700",
        needBlank: true
    },
    /** 逻辑或 */
    OR: {
        id: "OR",
        data: "|",
        color: "#CE9178",
        bgColor: "#00000000",
        fontWeight: "700",
        needBlank: true
    },
    /** 逻辑与 */
    AND: {
        id: "AND",
        data: "&",
        color: "#CE9178",
        bgColor: "#00000000",
        fontWeight: "700",
        needBlank: true
    },
    UND: { id: "UND" }
};
const Token = util.parse.Token;
class SpellGroup {
    type = "SPELL_GROUP";
    /** @type {String} 逻辑运算符 */
    operator = "";
    data1 = null;
    data2 = null;
    /**
     * @type {Number}
     * ### 匹配状态
     * * 0:未开始
     * * 1:等待匹配逻辑运算符
     * * 2:等待匹配法术标签/ID/组
     * * -1:完成
     * @memberof SpellGroup
     */
    dataState = 0;
    /**
     * @type {Number}
     * ### 匹配状态
     * * 0: 无需括号
     * * 1: 等待右括号
     * * -1: 括号已成对
     * @memberof SpellGroup
     */
    bracketState = 0;
    constructor() {}
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
            const result = SpellData.data[exp.data];
            if (result) return result;
            else {
                console.warn("暂不支持的法术法术标签", exp);
                return new Set();
            }

        case "SPELL_GROUP":
            switch (exp.operator) {
                case "AND":
                    //取交集
                    return getSpellDatas(exp.data1).intersection(getSpellDatas(exp.data2)); // 采用polyfill函数
                case "OR":
                    //取并集
                    return getSpellDatas(exp.data1).union(getSpellDatas(exp.data2)); // 采用polyfill函数
                case "NOT": {
                    //取补集
                    return SpellData.data.all.difference(getSpellDatas(exp.data2)); // 采用polyfill函数
                }
            }
    }
};

/**
 * 通过 `表达式` 获取法术数据
 * @param {SpellQueryExp} exp 查询表达式
 * @returns {Array<SpellData>} 法术数据
 */
const parse = exp => {
    console.groupCollapsed("法术查询表达式解析: %c`%s`", "color:#25AFF3", exp);
    currentToken = undefined;
    console.groupCollapsed("🏷️ Tokenization");
    //#region 令牌化 Tokenization
    const tokens = [];
    Token.logData.init();
    const EL = exp.length;
    for (let i = 0; i < EL; i++) {
        const char = exp[i];
        if (`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_`.includes(char)) {
            //属于单词成分
            //作为token开头字符
            if (currentToken === undefined) currentToken = new Token(tokenEnum.SI, i);
            currentToken.push(char);
        } else {
            //遇到以下字符需要结束当前token
            if (currentToken) {
                currentToken.finish();
                tokens.push(currentToken);
                currentToken = undefined;
            }
            // 跳过空白符
            if (!/\s/.test(char))
                switch (char) {
                    case "#":
                        currentToken = new Token(tokenEnum.ST, i);
                        currentToken.push(char);
                        break;
                    case "(":
                        tokens.push(new Token(tokenEnum.BRACKET_SL, i));
                        break;
                    case ")":
                        tokens.push(new Token(tokenEnum.BRACKET_SR, i));
                        break;
                    case "!":
                        tokens.push(new Token(tokenEnum.NOT, i));
                        break;
                    case "|":
                        tokens.push(new Token(tokenEnum.OR, i));
                        break;
                    case "&":
                        tokens.push(new Token(tokenEnum.AND, i));
                        break;
                    default:
                        currentToken = new Token(tokenEnum.UND, i);
                        und.data = char;
                        return err([`不合法的字符: "${char}"`]);
                }
        }
    }
    if (currentToken) {
        currentToken.finish();
        tokens.push(currentToken);
        currentToken = undefined;
    }
    //#endregion
    Token.log();
    console.groupEnd();

    console.groupCollapsed("🍁 AST");
    //#region 生成AST
    const TL = tokens.length;
    /** @type {Array<Object>} 表达式栈 */
    const exps = [];

    currentExp = undefined;
    /** @type {SpellGroup|undefined} 根表达式 */
    let rootExp = undefined;
    for (let j = 0; j < TL; j++) {
        currentToken = tokens[j];
        currentExp = exps.at(-1);
        switch (currentToken.type) {
            case "SPELL_ID": {
                const spellId = { type: "SPELL_ID", data: currentToken.data };
                if (currentExp) {
                    if (currentExp.dataState === 0) {
                        currentExp.data1 = spellId;
                        currentExp.dataState = 1;
                    } else if (currentExp.dataState === 2) {
                        const subExp = new SpellGroup();
                        subExp.data1 = spellId;
                        // 子表达式更新匹配状态 已匹配第一个法术ID
                        subExp.dataState = 1;
                        currentExp.data2 = subExp;
                        //更新匹配状态 完成匹配!
                        currentExp.dataState = -1;
                        exps.push(subExp);
                    } else return err`缺少运算符连接`;
                } else {
                    rootExp = new SpellGroup();
                    rootExp.data1 = spellId;
                    rootExp.dataState = 1;
                    exps.push(rootExp);
                }
                break;
            }
            case "SPELL_TAG":
                if (currentExp) {
                    if (currentExp.dataState === 0) {
                        currentExp.data1 = { type: "SPELL_TAG", data: currentToken.data.slice(1) };
                        currentExp.dataState = 1;
                    } else if (currentExp.dataState === 2) {
                        const subExp = new SpellGroup();
                        subExp.data1 = { type: "SPELL_TAG", data: currentToken.data.slice(1) };
                        // 子表达式更新匹配状态 已匹配第一个法术标签
                        subExp.dataState = 1;
                        currentExp.data2 = subExp;
                        //更新匹配状态 完成匹配!
                        currentExp.dataState = -1;
                        exps.push(subExp);
                    } else return err`缺少运算符连接`;
                } else {
                    rootExp = new SpellGroup();
                    rootExp.data1 = { type: "SPELL_TAG", data: currentToken.data.slice(1) };
                    rootExp.dataState = 1;
                    exps.push(rootExp);
                }
                break;
            case "BRACKET_SMALL_LEFT": {
                const subExp = new SpellGroup();
                subExp.dataState = 0;
                subExp.bracketState = 1;
                if (currentExp) {
                    if (currentExp.dataState === 0) {
                        currentExp.data1 = subExp;
                        exps.push(subExp);
                        currentExp.dataState = 1;
                    } else if (currentExp.dataState === 2) {
                        currentExp.data2 = subExp;
                        exps.push(subExp);
                        currentExp.dataState = -1; //完成匹配
                    } else return err`缺少运算符连接`;
                } else {
                    // 根表达式不存在时 左括号开头 这里应该默认多一层表达式 否则右括号完成该表达式匹配后仍然有后续逻辑运算符会导致匹配出错
                    rootExp = new SpellGroup();
                    rootExp.data1 = subExp;
                    rootExp.dataState = 1;
                    exps.push(rootExp, subExp);
                }
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
                const subExp = new SpellGroup();
                subExp.dataState = 2;
                subExp.data1 = null;
                subExp.operator = "NOT";
                if (currentExp) {
                    if (currentExp.dataState === 0) {
                        currentExp.data1 = subExp;
                        currentExp.dataState = 1;
                        exps.push(subExp);
                    } else if (currentExp.dataState === 2) {
                        currentExp.data2 = subExp;
                        currentExp.dataState = -1;
                        exps.push(subExp);
                    } else if (currentExp.dataState === 1) return err`! 不可以用于连接两个法术标签或法术ID`;
                } else {
                    rootExp = subExp;
                    exps.push(subExp);
                }
                break;
            }
            case "OR":
                if (currentExp) {
                    if (currentExp.dataState === 1) {
                        currentExp.dataState = 2;
                        currentExp.operator = "OR";
                    } else if (currentExp.dataState === 2) return err`已存在逻辑运算符`;
                } else return err`缺少被连接的法术标签或ID`;
                break;
            case "AND":
                if (currentExp) {
                    if (currentExp.dataState === 1) {
                        currentExp.dataState = 2;
                        currentExp.operator = "AND";
                    } else if (currentExp.dataState === 2) return err`已存在逻辑运算符`;
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
    const result = getSpellDatas(rootExp);
    console.table(result, ["id", "name", "description"]);
    //#endregion
    console.groupEnd();
    console.groupEnd();
    return [...result];
};
