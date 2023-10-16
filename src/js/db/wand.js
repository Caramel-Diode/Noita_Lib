/** [法杖数据库](wand.js) */
DB.wand = class {
    /** @type {Promise<HTMLImageElement>} 图标精灵图 */
    static iconImage = utilities.base64ToImg("wandIcon.png");

    static #wandIconData = class {
        /** @type {Number} 辅助变量 用于记录法杖图标起始位置 */ static #currentOrigin = 1;
        /** @type {Array<DB.#wandIconData>} 模板数据表 用于匹配图标 */ static dataList = [];

        /** @param {Array} datas */
        constructor(datas) {
            const _ = this.constructor;
            /** @type {String} 名称 */ this.name = datas[0];
            /** @type {Number} 图标起点 */ this.iconOrigin = _.#currentOrigin;
            /** @type {Number} 图标宽度 */ this.iconWidth = datas[1];
            _.#currentOrigin += this.iconWidth;
            /** @type {Number} 容量 */ this.capacity = datas[2];
            /** @type {Number} 抽取数 */ this.draw = datas[3];
            /** @type {Number} 施放延迟 */ this.fireRateWait = datas[4];
            /** @type {Number} 充能时间 */ this.reloadTime = datas[5];
            /** @type {Boolean} 乱序 */ this.shuffle = datas[6] === 1;
            /** @type {Number} 散射 */ this.spreadDegrees = datas[7];
        }

        static init = () => {
            // data : 嵌入法杖模板数据
            /** @type {Array} */
            const datas = "db/data/wandTemplate.js";
            for (let i = 0; i < datas.length; i++) {
                this.dataList.push(Object.freeze(new this(datas[i])));
            }
        };
    };

    static #spellRecipeParse = (() => {
        const consoleError = (info, index, obj) => {
            const e = new SyntaxError(`${info} index:${index}`);
            console.error(e, obj);
        };
        const regs = {
            word: /[^\s :;^<>{}\[\]()*/]/,
            number: /[0-9]/
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
            /** 重复次数 */
            TR: {
                id: "TIME_OF_REPETITION",
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
            /**  重复次数声明符 */
            COLON: {
                id: "COLON",
                data: ":",
                color: "#CE9178",
                bgColor: "#00000000",
                fontWeight: "700"
            },
            /** 可替换法术表达式 */
            RSE: {
                id: "REPLACEABLE_SPELL_EXPRESSION",
                color: "#AC71F1",
                bgColor: "#AC71F140",
                fontWeight: "400",
                reg: / [^\s :;^<>{ }\[\]()*/#]/
            },
            UND: {
                id: "UND"
            }
        };
        const Token = utilities.parse.token;
        /**
         * 法术序列解析
         * @param {String} expressionStr 表达式
         * @returns {Array<DB.spell>}
         */
        return expressionStr => {
            if (expressionStr.length > 0) {
                console.groupCollapsed("法术序列表达式解析: %c`%s`", "color:#25AFF3", expressionStr);
                let currentToken = undefined;
                console.groupCollapsed("🏷️ Tokenization");
                //#region 令牌化 Tokenization
                /** @type {Array<Token>} */
                const tokens = [];
                Token.logData.init();
                const EL = expressionStr.length;
                for (let i = 0; i < EL; i++) {
                    const char = expressionStr[i];
                    if (Token.regs.number.test(char)) {
                        // 数字开头的token为重复次数
                        if (currentToken === undefined) {
                            const lastToken = tokens.at(-1);
                            if (lastToken.type === "COLON") {
                                //上个token是":" 则该数字表示重复次数
                                currentToken = new Token(tokenEnum.TR, i);
                            } else if (lastToken.type === "CARET") {
                                //上个token是"^" 则该数字表示剩余次数
                                currentToken = new Token(tokenEnum.REMAIN, i);
                            } else {
                                currentToken = new Token(tokenEnum.UND, i);
                                consoleError("法术ID不允许数字开头 数字必须用于表示法术重复次数或法术剩余次数", i, currentToken);
                                return [];
                            }
                            currentToken.push(char);
                        } else currentToken.push(char);
                    } else if (Token.regs.word.test(char)) {
                        // 字母开头的token为法术ID或可替换法术表达式
                        if (currentToken === undefined) {
                            if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT") currentToken = new Token(tokenEnum.RSE, i);
                            else currentToken = new Token(tokenEnum.SI, i);
                        }
                        currentToken.push(char);
                    } else if (Token.regs.logicalOperator.test(char)) {
                        if (currentToken === undefined) {
                            if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT") {
                                currentToken = new Token(tokenEnum.RSE);
                            }
                            currentToken.push(char);
                        } else if (currentToken.type === "REPLACEABLE_SPELL_EXPRESSION") {
                            currentToken.push(char);
                        } else {
                            consoleError(`不合法的字符: "${char}"`, i, currentToken);
                            console.log("集合运算符必须出现在法术查询表达式中");
                            return [];
                        }
                    } else if (Token.regs.blank.test(char)) {
                        if (currentToken) {
                            if (currentToken?.type !== "REPLACEABLE_SPELL_EXPRESSION") {
                                currentToken.finish();
                                tokens.push(currentToken);
                                currentToken = undefined;
                            }
                        }
                    } else if (char === "#") {
                        if (currentToken === undefined) {
                            if (tokens.at(-1)?.type === "BRACKET_SQUARE_LEFT") {
                                currentToken = new Token(tokenEnum.RSE);
                            }
                            currentToken.push(char);
                        } else if (currentToken.type === "REPLACEABLE_SPELL_EXPRESSION") {
                            currentToken.push(char);
                        } else {
                            consoleError(`不合法的字符: "${char}"`, i, currentToken);
                            console.log("法术标签必须出现在法术查询表达式中");
                            return [];
                        }
                    } else {
                        // 遇到以下字符需要结束当前token
                        if (currentToken) {
                            currentToken.finish();
                            tokens.push(currentToken);
                            currentToken = undefined;
                        }
                        switch (char) {
                            case ":":
                                tokens.push(new Token(tokenEnum.COLON, i));
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
                                let und = new Token(tokenEnum.UND, i);
                                und.data = char;
                                consoleError(`不合法的字符: "${char}"`, i, und);
                                return [];
                        }
                    }
                }
                if (currentToken) {
                    currentToken.finish();
                    tokens.push(currentToken);
                    currentToken = undefined;
                }
                Token.log();
                console.groupEnd();
                //#endregion
                console.groupCollapsed("🍁 AST");
                //#region 生成AST
                const result = [];
                const TL = tokens.length;
                for (let i = 0; i < TL; i++) {
                    currentToken = tokens[i];
                    switch (currentToken.type) {
                        case "SPELL_ID": {
                            result.push({
                                type: "STATIC",
                                spellDatas: [DB.spell.queryById(currentToken.data)],
                                amount: 1,
                                instanceData: {
                                    remain: Infinity
                                }
                            });
                            break;
                        }
                        case "REMAIN": {
                            const lastToken = result.at(-1);
                            if (lastToken) lastToken.instanceData.remain = currentToken.data;
                            else {
                                consoleError("未指定目标法术", currentToken.index, currentToken);
                                return [];
                            }
                            break;
                        }
                        case "TIME_OF_REPETITION": {
                            const lastToken = result.at(-1);
                            if (lastToken) lastToken.amount = currentToken.data;
                            else {
                                consoleError("未指定目标法术", currentToken.index, currentToken);
                                return [];
                            }
                            break;
                        }
                        case "REPLACEABLE_SPELL_EXPRESSION": {
                            result.push({
                                type: "REPLACEABLE",
                                spellDatas: DB.spell.queryByExpression(currentToken.data),
                                amount: 1,
                                instanceData: {
                                    remain: Infinity
                                }
                            });
                            break;
                        }
                    }
                }
                console.table(result, ["type", "spellData", "amount", "instanceData"]);
                console.groupEnd();
                //#endregion
                console.groupEnd();

                return result;
            } else return [];
        };
    })();

    /** @typedef {Number|{min:Number,max:Number}} $Num 固定值或范围值 */

    /**
     * 范围值取中位数
     * @param {$Num} value
     * @returns {Number}
     */
    static #getMedian(value) {
        if (typeof value === "number") return value;
        else return (value.min + value.max) / 2;
    }

    /** @param {Array} datas */
    constructor(datas) {
        /** @type {typeof DB.wand} */
        const _ = this.constructor;

        /** @type {String} 名称 */ this.name = datas[0];
        /** @type {$Num} 容量 */ this.capacity = datas[2];
        /** @type {$Num} 抽取数 */ this.draw = datas[3];
        /** @type {$Num} 施放延迟 */ this.fireRateWait = datas[4];
        /** @type {$Num} 充能时间 */ this.reloadTime = datas[5];
        /** @type {Boolean} 乱序 */ this.shuffle = datas[6];
        /** @type {$Num} 投射物速度 */ this.spreadDegrees = datas[7];
        /** @type {$Num} 投射物速度 */ this.speedMultiplier = datas[8];
        /** @type {$Num} 法力恢复速度 */ this.manaChargeSpeed = datas[9];
        /** @type {$Num} 法力上限 */ this.manaMax = datas[10];
        /** @type {Array<DB.spell>} 始终施放 */ this.staticSpells = new.target.#spellRecipeParse(datas[11]);
        /** @type {Array<DB.spell>} 活动施放 */ this.dynamicSpells = new.target.#spellRecipeParse(datas[12]);
        // 决定法杖图标
        if (datas[1] === "AUTO") {
            // 根据属性自动决定
            const getMedian = _.#getMedian;
            const fireRateWait = getMedian(this.fireRateWait),
                draw = getMedian(this.draw),
                capacity = getMedian(this.capacity),
                spreadDegrees = getMedian(this.spreadDegrees),
                reloadTime = getMedian(this.reloadTime);

            const limit_fireRateWait = utilities.clamp((fireRateWait + 5) / 7, 0, 4),
                limit_draw = utilities.clamp(draw - 1, 0, 2),
                limit_capacity = utilities.clamp(capacity / 3 - 1, 0, 7),
                limit_spreadDegrees = utilities.clamp(spreadDegrees / 5 - 1, 0, 2),
                limit_reloadTime = utilities.clamp(reloadTime / 25 + 0.8, 0, 2);

            let bestScore = 1000;
            let score;
            let wandName;
            const wid = _.#wandIconData.dataList;
            const len = wid.length;
            for (let i = 0; i < len; i++) {
                const e = wid[i];
                score = Math.abs(limit_fireRateWait - e.fireRateWait) * 2 /* 施放延迟 权重2 */;
                score += Math.abs(limit_draw - e.draw) * 20 /* 施放数 权重 20 */;
                score += Math.abs(this.shuffle - e.shuffle) * 30 /* 乱序 权重 30 */;
                score += Math.abs(limit_capacity - e.capacity) * 5 /* 容量 权重 5 */;
                score += Math.abs(limit_spreadDegrees - e.spreadDegrees) /* 散射 权重 1 */;
                score += Math.abs(limit_reloadTime - e.reloadTime) /* 充能时间 权重 1 */;
                score = Math.floor(score);
                if (score <= bestScore) {
                    bestScore = score;
                    /** @type {Number} 图标起点 */ this.iconOrigin = e.iconOrigin;
                    /** @type {Number} 图标宽度 */ this.iconWidth = e.iconWidth;
                    wandName = e.name;
                    if (score === 0 && utilities.draw(0.33)) break;
                }
            }
            if (this.name === "AUTO") /** @type {String} 名称 */ this.name = wandName;
        } else if (datas[1] !== "NONE") {
        }
    }
    static init() {
        this.#wandIconData.init();
    }
};
