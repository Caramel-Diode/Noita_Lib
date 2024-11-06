/**
 * @typedef {Object} SpellRecipeItem
 * @prop {"固定法术"|"可替换法术"} type 类型
 * @prop {Array<import("@spell").SpellData>} datas 法术数据
 * @prop {{remain:Number}} instanceData 实例数据(剩余次数)
 * @prop {Number} min (最小数量)
 * @prop {Number} max (最大数量)
 */
const { Token, isWordPart, isNumberPart, isBlank } = util.parse;

/** @type {typeof Token.prototype} */
let currentToken;
const err = ([info]) => {
    console.error(currentToken.index, new SyntaxError(`${info} index:${currentToken.index}`));
    return util.parse.errRestult;
};

const tokenEnum = {
    /** 法术ID */
    SI: new Token.Enum("SPELL_ID", "#8080FF", "#8080FF40", 700, "string", true),
    /** 重复次数1 */
    TR1: new Token.Enum("TIME_OF_REPETITION1", "#7FB717", void 0, 700, "number"),
    /** 重复次数2 */
    TR2: new Token.Enum("TIME_OF_REPETITION2", "#7FB717", void 0, 700, "number"),
    /** 剩余次数 */
    REMAIN: new Token.Enum("REMAIN", "#DD001B", void 0, 400, "number"),
    BRACKET_SL: new Token.Enum("BRACKET_SQUARE_LEFT", "CE9178", void 0, 700, "string", true, "["),
    BRACKET_SR: new Token.Enum("BRACKET_SQUARE_RIGHT", "CE9178", void 0, 700, "string", true, "]"),
    /**  剩余次数声明符 */
    CARET: new Token.Enum("CARET", "#CE9178", void 0, 700, "string", false, "^"),
    /**  重复次数1声明符 */
    COLON: new Token.Enum("COLON", "#CE9178", void 0, 700, "string", false, ":"),
    /**  重复次数2声明符 */
    WAVE: new Token.Enum("WAVE", "#CE9178", void 0, 700, "string", false, "~"),
    /** 可替换法术表达式 */
    RSE: new Token.Enum("REPLACEABLE_SPELL_EXPRESSION", "AC71F1", "AC71F140", 400),
    /** 未定义 */
    UND: new Token.Enum("UND")
};

/**
 * 法术序列解析
 * @param {String} exp 表达式
 * @returns {Array<SpellData>}
 */
const parse = exp => {
    if (!exp) return [];
    currentToken = void 0;
    console.groupCollapsed("法术序列表达式解析: %c`%s`", "color:#25AFF3", exp);
    console.groupCollapsed("🏷️ Tokenization");
    //#region 令牌化 Tokenization
    /** @type {Array<typeof Token.prototype>} */
    const tokens = [];
    exp += " "; // 增加终结符
    const EL = exp.length;
    for (let i = 0; i < EL; i++) {
        const char = exp[i];
        if (isNumberPart(char)) {
            // 数字开头的token为重复次数
            if (!currentToken) {
                const lastToken = tokens.at(-1);
                if (lastToken.type === "COLON")
                    //上个token是":" 则该数字表示重复次数1
                    currentToken = new Token(tokenEnum.TR1, i);
                else if (lastToken.type === "WAVE")
                    //上个token是"~" 则该数字表示重复次数2
                    currentToken = new Token(tokenEnum.TR2, i);
                else if (lastToken.type === "CARET")
                    //上个token是"^" 则该数字表示剩余次数
                    currentToken = new Token(tokenEnum.REMAIN, i);
                else {
                    currentToken = new Token(tokenEnum.UND, i);
                    return err`法术ID不允许数字开头 数字必须用于表示法术重复次数或法术剩余次数`;
                }
                currentToken.push(char);
            } else currentToken.push(char);
        } else if (isWordPart(char)) {
            // 字母开头的token为法术ID或可替换法术表达式
            if (!currentToken) {
                if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT") currentToken = new Token(tokenEnum.RSE, i);
                else currentToken = new Token(tokenEnum.SI, i);
            }
            currentToken.push(char);
        } else if (`(|&!)`.includes(char)) {
            if (!currentToken) {
                if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT") currentToken = new Token(tokenEnum.RSE);
                currentToken.push(char);
            } else if (currentToken.type === "REPLACEABLE_SPELL_EXPRESSION") currentToken.push(char);
            else return console.log("该运算符必须出现在法术查询表达式中"), err([`不合法的字符: "${char}"`]);
        } else if (isBlank(char)) {
            if (currentToken) {
                if (currentToken.type === "REPLACEABLE_SPELL_EXPRESSION") {
                    // 如果是不使用 `[]` 包裹的法术系列表达式会被空白符中断
                    if (tokens.at(-1)?.type !== "BRACKET_SL") {
                        tokens.push(currentToken.finish());
                        currentToken = void 0;
                    }
                } else {
                    tokens.push(currentToken.finish());
                    currentToken = void 0;
                }
            }
        } else if (char === "#") {
            if (!currentToken) {
                // 现在允许单个法术标签省略`[]`直接构成可替换法术表达式
                currentToken = new Token(tokenEnum.RSE).push(char);
                // if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT") currentToken = new Token(tokenEnum.RSE).push(char);
            } else if (currentToken.type === "REPLACEABLE_SPELL_EXPRESSION") currentToken.push(char);
            else {
                // 现在允许单个法术标签省略`[]`直接构成可替换法术表达式
                tokens.push(currentToken.finish());
                currentToken = new Token(tokenEnum.RSE).push(char);
            }

            // else return console.log("法术标签必须出现在法术查询表达式中"), err([`不合法的字符: "${char}"`]);
        } else {
            // 遇到以下字符需要结束当前token
            if (currentToken) {
                tokens.push(currentToken.finish());
                currentToken = void 0;
            }
            switch (char) {
                case ":":
                    tokens.push(new Token(tokenEnum.COLON, i));
                    break;
                case "~":
                    tokens.push(new Token(tokenEnum.WAVE, i));
                    break;
                case "[":
                    tokens.push(new Token(tokenEnum.BRACKET_SL, i));
                    break;
                case "]":
                    tokens.push(new Token(tokenEnum.BRACKET_SR, i));
                    break;
                case "^":
                    tokens.push(new Token(tokenEnum.CARET, i));
                    break;
                default:
                    currentToken = new Token(tokenEnum.UND, i);
                    currentToken.data = char;
                    return err([`不合法的字符: "${char}"`]);
            }
        }
    }
    Token.log(tokens);
    console.groupEnd();
    //#endregion
    console.groupCollapsed("🍁 AST");
    //#region 生成AST

    /** @type {Array<SpellRecipeItem>} */
    const result = [];
    let currentSpellResult = result[0];
    const TL = tokens.length;
    for (let i = 0; i < TL; i++) {
        currentToken = tokens[i];
        currentSpellResult = result.at(-1);
        switch (currentToken.type) {
            case "SPELL_ID":
                result.push({
                    type: "固定法术",
                    datas: [Spell.query(currentToken.data)],
                    instanceData: { remain: Infinity },
                    min: 1,
                    max: 1,
                    flag_REMAIN: false,
                    flag_TIME_OF_REPETITION: 0
                });
                break;
            case "REPLACEABLE_SPELL_EXPRESSION":
                result.push({
                    type: "可替换法术",
                    datas: Spell.queryByExp(currentToken.data),
                    instanceData: { remain: Infinity },
                    min: 1,
                    max: 1,
                    flag_REMAIN: false,
                    flag_TIME_OF_REPETITION: 0
                });
                break;
            case "REMAIN":
                if (!currentSpellResult) return err`未指定目标法术`;
                if (currentSpellResult.flag_REMAIN) err`重复声明剩余次数`; // 非严重错误
                else {
                    currentSpellResult.instanceData.remain = currentToken.data;
                    currentSpellResult.flag_REMAIN = true;
                }
                break;
            case "TIME_OF_REPETITION1":
                if (!currentSpellResult) return err`未指定目标法术`;
                if (currentSpellResult.flag_TIME_OF_REPETITION === 0) {
                    const data = currentToken.data;
                    //次数允许为0 用于配合~表示范围
                    if (data >= 0) currentSpellResult.min = currentSpellResult.max = data;
                    else return err`重复次数不可为负数`;
                    currentSpellResult.flag_TIME_OF_REPETITION = 1;
                } else err`重复声明重复次数`; // 非严重错误
                break;
            case "TIME_OF_REPETITION2":
                if (!currentSpellResult) return err`未指定目标法术`;
                if (currentToken.data > 0) {
                    if (currentSpellResult.flag_TIME_OF_REPETITION === 0) {
                        currentSpellResult.min = 0;
                        currentSpellResult.max = currentToken.data;
                        currentSpellResult.flag_TIME_OF_REPETITION === 2;
                    } else if (currentSpellResult.flag_TIME_OF_REPETITION === 1) {
                        if (currentToken.data > currentSpellResult.max) currentSpellResult.max = currentToken.data;
                        else currentSpellResult.min = currentToken.data;
                        currentSpellResult.flag_TIME_OF_REPETITION === 2;
                    } else return err`重复次数声明格式非法`;
                } else return err`重复次数必须为正整数`;
                break;
        }
    }
    console.table(result, ["type", "min", "max", "instanceData"]);
    console.groupEnd();
    //#endregion
    console.groupEnd();
    return result;
};
