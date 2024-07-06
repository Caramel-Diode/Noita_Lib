/**
 * @typedef {Object} SpellRecipeItem
 * @prop {"固定法术"|"可替换法术"} type 类型
 * @prop {Array<import("@spell").SpellData>} datas 法术数据
 * @prop {{remain:Number}} instanceData 实例数据(剩余次数)
 * @prop {Number} min (最小数量)
 * @prop {Number} max (最大数量)
 */
const Token = util.parse.Token;

/** @type {util.parse.Token} */ let currentToken = void 0;
const err = ([info]) => {
    console.error(currentToken.index, new SyntaxError(`${info} index:${currentToken.index}`));
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
    /** 重复次数1 */
    TR1: {
        id: "TIME_OF_REPETITION1",
        type: "number",
        color: "#7FB717",
        bgColor: "#00000000",
        fontWeight: "400"
    },
    /** 重复次数2 */
    TR2: {
        id: "TIME_OF_REPETITION2",
        type: "number",
        color: "#7FB717",
        bgColor: "#00000000",
        fontWeight: "400"
    },
    /** 剩余次数 */
    REMAIN: {
        id: "REMAIN",
        type: "number",
        color: "#DD001B",
        bgColor: "#00000000",
        fontWeight: "400"
    },
    BRACKET_SL: {
        id: "BRACKET_SQUARE_LEFT",
        data: "[",
        color: "#CE9178",
        bgColor: "#00000000",
        fontWeight: "700",
        needBlank: true
    },
    BRACKET_SR: {
        id: "BRACKET_SQUARE_RIGHT",
        data: "]",
        color: "#CE9178",
        bgColor: "#00000000",
        fontWeight: "700"
    },
    /**  剩余次数声明符 */
    CARET: {
        id: "CARET",
        data: "^",
        color: "#CE9178",
        bgColor: "#00000000",
        fontWeight: "700"
    },
    /**  重复次数1声明符 */
    COLON: {
        id: "COLON",
        data: ":",
        color: "#CE9178",
        bgColor: "#00000000",
        fontWeight: "700"
    },
    /**  重复次数2声明符 */
    WAVE: {
        id: "WAVE",
        data: "~",
        color: "#CE9178",
        bgColor: "#00000000",
        fontWeight: "700"
    },
    /** 可替换法术表达式 */
    RSE: {
        id: "REPLACEABLE_SPELL_EXPRESSION",
        color: "#AC71F1",
        bgColor: "#AC71F140",
        fontWeight: "400"
    },
    UND: {
        id: "UND"
    }
};

/**
 * 法术序列解析
 * @param {String} expressionStr 表达式
 * @returns {Array<SpellData>}
 */
const parse = expressionStr => {
    if (expressionStr.length > 0) {
        console.groupCollapsed("法术序列表达式解析: %c`%s`", "color:#25AFF3", expressionStr);
        currentToken = void 0;
        console.groupCollapsed("🏷️ Tokenization");
        //#region 令牌化 Tokenization
        /** @type {Array<util.parse.Token>} */
        const tokens = [];
        Token.logData.init();
        const EL = expressionStr.length;
        for (let i = 0; i < EL; i++) {
            const char = expressionStr[i];
            if (`0123456789+-`.includes(char)) {
                // 数字开头的token为重复次数
                if (currentToken === void 0) {
                    const lastToken = tokens.at(-1);
                    if (lastToken.type === "COLON") {
                        //上个token是":" 则该数字表示重复次数1
                        currentToken = new Token(tokenEnum.TR1, i);
                    } else if (lastToken.type === "WAVE") {
                        //上个token是"~" 则该数字表示重复次数2
                        currentToken = new Token(tokenEnum.TR2, i);
                    } else if (lastToken.type === "CARET") {
                        //上个token是"^" 则该数字表示剩余次数
                        currentToken = new Token(tokenEnum.REMAIN, i);
                    } else {
                        currentToken = new Token(tokenEnum.UND, i);
                        return err`法术ID不允许数字开头 数字必须用于表示法术重复次数或法术剩余次数`;
                    }
                    currentToken.push(char);
                } else currentToken.push(char);
            } else if (`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_`.includes(char)) {
                // 字母开头的token为法术ID或可替换法术表达式
                if (currentToken === void 0) {
                    if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT") currentToken = new Token(tokenEnum.RSE, i);
                    else currentToken = new Token(tokenEnum.SI, i);
                }
                currentToken.push(char);
            } else if (`(|&!)`.includes(char)) {
                if (currentToken === void 0) {
                    if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT") {
                        currentToken = new Token(tokenEnum.RSE);
                    }
                    currentToken.push(char);
                } else if (currentToken.type === "REPLACEABLE_SPELL_EXPRESSION") {
                    currentToken.push(char);
                } else return console.log("该运算符必须出现在法术查询表达式中"), err([`不合法的字符: "${char}"`]);
            } else if (/\s/.test(char)) {
                if (currentToken) {
                    if (currentToken?.type !== "REPLACEABLE_SPELL_EXPRESSION") {
                        currentToken.finish();
                        tokens.push(currentToken);
                        currentToken = void 0;
                    }
                }
            } else if (char === "#") {
                if (currentToken === void 0) {
                    if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT") {
                        currentToken = new Token(tokenEnum.RSE);
                    }
                    currentToken.push(char);
                } else if (currentToken.type === "REPLACEABLE_SPELL_EXPRESSION") {
                    currentToken.push(char);
                } else return console.log("法术标签必须出现在法术查询表达式中"), err([`不合法的字符: "${char}"`]);
            } else {
                // 遇到以下字符需要结束当前token
                if (currentToken) {
                    currentToken.finish();
                    tokens.push(currentToken);
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
        if (currentToken) {
            currentToken.finish();
            tokens.push(currentToken);
            currentToken = void 0;
        }
        Token.log();
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
                        // attrStr: `spell.id="${currentToken.data}"`,
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
                    if (currentSpellResult) {
                        if (currentSpellResult.flag_REMAIN) err`重复声明剩余次数`; // 非严重错误
                        else {
                            currentSpellResult.instanceData.remain = currentToken.data;
                            currentSpellResult.flag_REMAIN = true;
                        }
                    } else return err`未指定目标法术`;
                    break;
                case "TIME_OF_REPETITION1":
                    if (currentSpellResult) {
                        if (currentSpellResult.flag_TIME_OF_REPETITION === 0) {
                            const data = currentToken.data;
                            if (data >= 0) {
                                //次数允许为0 用于配合~表示范围
                                currentSpellResult.min = data;
                                currentSpellResult.max = data;
                            } else return err`重复次数不可为负数`;
                            currentSpellResult.flag_TIME_OF_REPETITION = 1;
                        } else err`重复声明重复次数`; // 非严重错误
                    } else return err`未指定目标法术`;

                    break;
                case "TIME_OF_REPETITION2":
                    if (currentSpellResult) {
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
                    } else return err`未指定目标法术`;
                    break;
            }
        }
        console.table(result, ["type", "min", "max", "instanceData"]);
        console.groupEnd();
        //#endregion
        console.groupEnd();

        return result;
    } else return [];
};
